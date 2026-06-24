import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FINISHES, WATER_COLORS, DECK_OPTIONS, COPING_COLORS } from '@/data/poolData';
import type { PoolConfiguration } from '@/types/pool';

// Water vertex shader
const waterVertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    vec3 pos = position;
    float ripple1 = sin(pos.x * 2.0 + uTime * 0.8) * 0.012;
    float ripple2 = sin(pos.y * 1.5 + uTime * 0.6) * 0.008;
    float ripple3 = cos((pos.x + pos.y) * 1.8 + uTime * 0.5) * 0.010;
    pos.z += ripple1 + ripple2 + ripple3;
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Water fragment shader
const waterFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorShallow;
  uniform vec3 uColorDeep;
  uniform vec3 uSunPosition;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float caustics(vec2 p, float t) {
    float c = 0.0;
    c += noise(p * 3.0 + t * 0.3) * 0.5;
    c += noise(p * 5.0 - t * 0.2) * 0.3;
    c += noise(p * 8.0 + t * 0.15) * 0.2;
    return c;
  }

  void main() {
    float causticPattern = caustics(vWorldPosition.xy * 0.5, uTime);
    float depthFactor = smoothstep(-1.5, -0.5, vPosition.z);
    vec3 baseColor = mix(uColorShallow, uColorDeep, depthFactor);
    float causticIntensity = smoothstep(0.3, 0.8, causticPattern) * 0.4;
    baseColor += vec3(causticIntensity * 0.3, causticIntensity * 0.35, causticIntensity * 0.25);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = vec3(0.0, 0.0, 1.0);
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
    baseColor = mix(baseColor, vec3(0.9, 0.95, 1.0), fresnel * 0.3);
    vec3 lightDir = normalize(uSunPosition - vWorldPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specular = pow(max(dot(normal, halfDir), 0.0), 120.0);
    baseColor += vec3(1.0, 0.98, 0.95) * specular * 0.6;
    float alpha = mix(0.85, 0.95, 1.0 - fresnel * 0.5);
    gl_FragColor = vec4(baseColor, alpha);
  }
`;

function getPoolDimensions(shape: string, size: string) {
  const sizeMultipliers: Record<string, number> = { small: 0.75, medium: 1.0, large: 1.25 };
  const m = sizeMultipliers[size] || 1.0;
  switch (shape) {
    case 'rectangle': return { width: 4.8 * m, length: 9.6 * m, depth: 1.8, radius: 0 };
    case 'roman': return { width: 4.8 * m, length: 9.6 * m, depth: 1.8, radius: 2.4 * m };
    case 'oval': return { width: 4.8 * m, length: 9.6 * m, depth: 1.8, radius: 2.4 * m };
    case 'freeform': return { width: 4.2 * m, length: 9.0 * m, depth: 1.8, radius: 0 };
    default: return { width: 4.8 * m, length: 9.6 * m, depth: 1.8, radius: 0 };
  }
}

function createPoolGeometry(shape: string, size: string): THREE.BufferGeometry {
  const dims = getPoolDimensions(shape, size);
  const { width, length, depth, radius } = dims;
  const shape2d = new THREE.Shape();

  switch (shape) {
    case 'rectangle':
      shape2d.moveTo(-width / 2, -length / 2);
      shape2d.lineTo(width / 2, -length / 2);
      shape2d.lineTo(width / 2, length / 2);
      shape2d.lineTo(-width / 2, length / 2);
      shape2d.closePath();
      break;
    case 'roman': {
      const r = Math.min(radius, width / 2);
      shape2d.moveTo(-width / 2, -length / 2 + r);
      shape2d.lineTo(-width / 2, length / 2 - r);
      shape2d.quadraticCurveTo(-width / 2, length / 2, -width / 2 + r, length / 2);
      shape2d.lineTo(width / 2 - r, length / 2);
      shape2d.quadraticCurveTo(width / 2, length / 2, width / 2, length / 2 - r);
      shape2d.lineTo(width / 2, -length / 2 + r);
      shape2d.quadraticCurveTo(width / 2, -length / 2, width / 2 - r, -length / 2);
      shape2d.lineTo(-width / 2 + r, -length / 2);
      shape2d.quadraticCurveTo(-width / 2, -length / 2, -width / 2, -length / 2 + r);
      break;
    }
    case 'oval': {
      shape2d.absellipse(0, 0, width / 2, length / 2, 0, Math.PI * 2, false, 0);
      break;
    }
    case 'freeform': {
      const w = width / 2;
      const l = length / 2;
      shape2d.moveTo(-w * 0.8, -l * 0.9);
      shape2d.bezierCurveTo(-w * 0.3, -l * 1.1, w * 0.4, -l * 0.8, w * 0.9, -l * 0.5);
      shape2d.bezierCurveTo(w * 1.1, -l * 0.1, w * 0.95, l * 0.3, w * 0.7, l * 0.7);
      shape2d.bezierCurveTo(w * 0.3, l * 1.05, -w * 0.4, l * 0.9, -w * 0.9, l * 0.5);
      shape2d.bezierCurveTo(-w * 1.05, l * 0.1, -w * 1.0, -l * 0.4, -w * 0.8, -l * 0.9);
      break;
    }
  }

  const geo = new THREE.ExtrudeGeometry(shape2d, {
    depth: depth, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2,
  });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, depth / 2, 0);
  return geo;
}

function createDeckGeometry(shape: string, size: string): THREE.BufferGeometry {
  const dims = getPoolDimensions(shape, size);
  const { width, length } = dims;
  const border = 2.0;

  const outerShape = new THREE.Shape();
  outerShape.moveTo(-width / 2 - border, -length / 2 - border);
  outerShape.lineTo(width / 2 + border, -length / 2 - border);
  outerShape.lineTo(width / 2 + border, length / 2 + border);
  outerShape.lineTo(-width / 2 - border, length / 2 + border);
  outerShape.closePath();

  const innerShape = new THREE.Shape();
  switch (shape) {
    case 'rectangle':
      innerShape.moveTo(-width / 2, -length / 2);
      innerShape.lineTo(width / 2, -length / 2);
      innerShape.lineTo(width / 2, length / 2);
      innerShape.lineTo(-width / 2, length / 2);
      innerShape.closePath();
      break;
    case 'roman': {
      const r = Math.min(dims.radius, width / 2);
      innerShape.moveTo(-width / 2, -length / 2 + r);
      innerShape.lineTo(-width / 2, length / 2 - r);
      innerShape.quadraticCurveTo(-width / 2, length / 2, -width / 2 + r, length / 2);
      innerShape.lineTo(width / 2 - r, length / 2);
      innerShape.quadraticCurveTo(width / 2, length / 2, width / 2, length / 2 - r);
      innerShape.lineTo(width / 2, -length / 2 + r);
      innerShape.quadraticCurveTo(width / 2, -length / 2, width / 2 - r, -length / 2);
      innerShape.lineTo(-width / 2 + r, -length / 2);
      innerShape.quadraticCurveTo(-width / 2, -length / 2, -width / 2, -length / 2 + r);
      break;
    }
    case 'oval':
      innerShape.absellipse(0, 0, width / 2, length / 2, 0, Math.PI * 2, false, 0);
      break;
    case 'freeform': {
      const w = width / 2;
      const l = length / 2;
      innerShape.moveTo(-w * 0.8, -l * 0.9);
      innerShape.bezierCurveTo(-w * 0.3, -l * 1.05, w * 0.4, -l * 0.75, w * 0.85, -l * 0.45);
      innerShape.bezierCurveTo(w * 1.0, -l * 0.05, w * 0.9, l * 0.25, w * 0.65, l * 0.65);
      innerShape.bezierCurveTo(w * 0.25, l * 0.95, -w * 0.35, l * 0.8, -w * 0.85, l * 0.4);
      innerShape.bezierCurveTo(-w * 0.95, l * 0.05, -w * 0.95, -l * 0.35, -w * 0.8, -l * 0.9);
      break;
    }
  }

  outerShape.holes.push(innerShape);
  const geo = new THREE.ExtrudeGeometry(outerShape, { depth: 0.15, bevelEnabled: false });
  geo.rotateX(Math.PI / 2);
  return geo;
}

function PoolBasin({ config }: { config: PoolConfiguration }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const finish = FINISHES.find(f => f.id === config.interiorFinish) || FINISHES[0];
  const geometry = useMemo(() => createPoolGeometry(config.shape, config.size), [config.shape, config.size]);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={finish.color} roughness={finish.roughness} metalness={finish.id === 'glass-tile' ? 0.3 : 0.0} side={THREE.DoubleSide} />
    </mesh>
  );
}

function WaterSurface({ config }: { config: PoolConfiguration }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const waterColor = WATER_COLORS.find(w => w.id === config.waterColor) || WATER_COLORS[0];
  const dims = useMemo(() => getPoolDimensions(config.shape, config.size), [config.shape, config.size]);

  const geometry = useMemo(() => {
    const { width, length, radius } = dims;
    switch (config.shape) {
      case 'rectangle':
        return new THREE.PlaneGeometry(width - 0.1, length - 0.1);
      case 'roman': {
        const r = Math.min(radius, width / 2) - 0.05;
        const shape = new THREE.Shape();
        shape.moveTo(-width / 2 + 0.05, -length / 2 + r + 0.05);
        shape.lineTo(-width / 2 + 0.05, length / 2 - r - 0.05);
        shape.quadraticCurveTo(-width / 2 + 0.05, length / 2 - 0.05, -width / 2 + r + 0.05, length / 2 - 0.05);
        shape.lineTo(width / 2 - r - 0.05, length / 2 - 0.05);
        shape.quadraticCurveTo(width / 2 - 0.05, length / 2 - 0.05, width / 2 - 0.05, length / 2 - r - 0.05);
        shape.lineTo(width / 2 - 0.05, -length / 2 + r + 0.05);
        shape.quadraticCurveTo(width / 2 - 0.05, -length / 2 + 0.05, width / 2 - r - 0.05, -length / 2 + 0.05);
        shape.lineTo(-width / 2 + r + 0.05, -length / 2 + 0.05);
        shape.quadraticCurveTo(-width / 2 + 0.05, -length / 2 + 0.05, -width / 2 + 0.05, -length / 2 + r + 0.05);
        return new THREE.ShapeGeometry(shape);
      }
      case 'oval':
        return new THREE.CircleGeometry(Math.min(width, length) / 2 - 0.05, 64);
      case 'freeform': {
        const w = width / 2 - 0.05;
        const l = length / 2 - 0.05;
        const shape = new THREE.Shape();
        shape.moveTo(-w * 0.8, -l * 0.9);
        shape.bezierCurveTo(-w * 0.3, -l * 1.05, w * 0.4, -l * 0.75, w * 0.85, -l * 0.45);
        shape.bezierCurveTo(w * 1.0, -l * 0.05, w * 0.9, l * 0.25, w * 0.65, l * 0.65);
        shape.bezierCurveTo(w * 0.25, l * 0.95, -w * 0.35, l * 0.8, -w * 0.85, l * 0.4);
        shape.bezierCurveTo(-w * 0.95, l * 0.05, -w * 0.95, -l * 0.35, -w * 0.8, -l * 0.9);
        return new THREE.ShapeGeometry(shape);
      }
      default:
        return new THREE.PlaneGeometry(width - 0.1, length - 0.1);
    }
  }, [config.shape, dims]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorShallow: { value: new THREE.Color(waterColor.colorShallow) },
    uColorDeep: { value: new THREE.Color(waterColor.colorDeep) },
    uSunPosition: { value: new THREE.Vector3(10, 15, 5) },
  }), [waterColor]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh geometry={geometry} position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <shaderMaterial ref={materialRef} vertexShader={waterVertexShader} fragmentShader={waterFragmentShader} uniforms={uniforms} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

function DeckSurface({ config }: { config: PoolConfiguration }) {
  const deck = DECK_OPTIONS.find(d => d.id === config.deckMaterial) || DECK_OPTIONS[0];
  const geometry = useMemo(() => createDeckGeometry(config.shape, config.size), [config.shape, config.size]);

  return (
    <mesh geometry={geometry} receiveShadow position={[0, -0.08, 0]}>
      <meshStandardMaterial color={deck.color} roughness={0.85} metalness={0.0} />
    </mesh>
  );
}

function Coping({ config }: { config: PoolConfiguration }) {
  const coping = COPING_COLORS.find(c => c.id === config.copingColor) || COPING_COLORS[0];

  const geometry = useMemo(() => {
    const dims = getPoolDimensions(config.shape, config.size);
    const { width, length } = dims;
    const shape = new THREE.Shape();
    const t = 0.15;

    shape.moveTo(-width / 2 - t, -length / 2 - t);
    shape.lineTo(width / 2 + t, -length / 2 - t);
    shape.lineTo(width / 2 + t, length / 2 + t);
    shape.lineTo(-width / 2 - t, length / 2 + t);
    shape.closePath();

    const hole = new THREE.Shape();
    hole.moveTo(-width / 2, -length / 2);
    hole.lineTo(width / 2, -length / 2);
    hole.lineTo(width / 2, length / 2);
    hole.lineTo(-width / 2, length / 2);
    hole.closePath();
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
    geo.rotateX(Math.PI / 2);
    return geo;
  }, [config.shape, config.size]);

  return (
    <mesh geometry={geometry} position={[0, 0.02, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={coping.color} roughness={0.7} />
    </mesh>
  );
}

function SpaFeature({ config }: { config: PoolConfiguration }) {
  if (!config.features.spa) return null;
  const dims = getPoolDimensions(config.shape, config.size);
  const spaRadius = 1.1;
  const spaHeight = 0.5;
  const spaX = dims.width / 2 + spaRadius - 0.3;
  const spaZ = -dims.length / 4;

  return (
    <group position={[spaX, 0, spaZ]}>
      <mesh position={[0, spaHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[spaRadius, spaRadius, spaHeight, 32]} />
        <meshStandardMaterial color="#D4C5B0" roughness={0.8} />
      </mesh>
      <mesh position={[0, spaHeight - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[spaRadius - 0.08, 32]} />
        <meshStandardMaterial color="#20B2AA" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0, spaHeight * 0.7, -spaRadius + 0.1]}>
        <boxGeometry args={[0.6, 0.02, 0.3]} />
        <meshStandardMaterial color="#D4C5B0" roughness={0.7} />
      </mesh>
    </group>
  );
}

function WaterfallFeature({ config }: { config: PoolConfiguration }) {
  if (!config.features.waterfall) return null;
  const dims = getPoolDimensions(config.shape, config.size);
  const wfZ = -dims.length / 2 - 0.5;

  return (
    <group position={[0, 0.5, wfZ]}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1.2, 1.6, 0.6]} />
        <meshStandardMaterial color="#8B7D6B" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.3, 0.35]}>
        <boxGeometry args={[0.8, 1.0, 0.05]} />
        <meshStandardMaterial color="#7DD3D8" roughness={0.1} metalness={0.3} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function LEDLights({ config }: { config: PoolConfiguration }) {
  if (!config.features.ledLighting) return null;
  const dims = getPoolDimensions(config.shape, config.size);
  const { width, length } = dims;
  const lightY = -0.8;
  const positions = [
    [-width / 3, lightY, -length / 3],
    [width / 3, lightY, -length / 3],
    [-width / 3, lightY, length / 3],
    [width / 3, lightY, length / 3],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <pointLight key={i} position={[pos[0], pos[1], pos[2]]} color="#40E0D0" intensity={0.5} distance={3} decay={2} />
      ))}
    </group>
  );
}

function AutoCover({ config }: { config: PoolConfiguration }) {
  if (!config.features.autoCover) return null;
  const dims = getPoolDimensions(config.shape, config.size);
  return (
    <group>
      <mesh position={[-dims.width / 2 - 0.3, 0.05, 0]} castShadow>
        <boxGeometry args={[0.08, 0.06, dims.length + 0.5]} />
        <meshStandardMaterial color="#A09890" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  );
}

function SceneLighting({ timeOfDay }: { timeOfDay: string }) {
  const { scene } = useThree();

  const lightConfig = useMemo(() => {
    switch (timeOfDay) {
      case 'morning':
        return { sunPosition: [15, 5, 10] as [number, number, number], sunColor: '#FFD4A0', sunIntensity: 1.2, ambientIntensity: 0.4, ambientColor: '#FFE8D0' };
      case 'midday':
        return { sunPosition: [5, 20, 5] as [number, number, number], sunColor: '#FFFFFF', sunIntensity: 1.5, ambientIntensity: 0.5, ambientColor: '#F0F4FF' };
      case 'evening':
        return { sunPosition: [-15, 3, 10] as [number, number, number], sunColor: '#FF8844', sunIntensity: 0.9, ambientIntensity: 0.3, ambientColor: '#FFD0B0' };
      case 'night':
        return { sunPosition: [5, 15, -10] as [number, number, number], sunColor: '#6688CC', sunIntensity: 0.3, ambientIntensity: 0.15, ambientColor: '#445588' };
      default:
        return { sunPosition: [5, 20, 5] as [number, number, number], sunColor: '#FFFFFF', sunIntensity: 1.5, ambientIntensity: 0.5, ambientColor: '#F0F4FF' };
    }
  }, [timeOfDay]);

  useEffect(() => {
    scene.background = new THREE.Color(
      timeOfDay === 'night' ? '#0A1525' : timeOfDay === 'evening' ? '#2A1A0A' : timeOfDay === 'morning' ? '#F5EDE0' : '#E8F0FF'
    );
  }, [timeOfDay, scene]);

  return (
    <>
      <ambientLight color={lightConfig.ambientColor} intensity={lightConfig.ambientIntensity} />
      <directionalLight position={lightConfig.sunPosition} color={lightConfig.sunColor} intensity={lightConfig.sunIntensity} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-far={50} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} />
      <hemisphereLight color={timeOfDay === 'night' ? '#223355' : '#87CEEB'} groundColor={timeOfDay === 'night' ? '#112233' : '#8B7355'} intensity={timeOfDay === 'night' ? 0.1 : 0.3} />
    </>
  );
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#C8C4BC" roughness={1.0} />
    </mesh>
  );
}

function PoolScene({ config }: { config: PoolConfiguration }) {
  return (
    <>
      <SceneLighting timeOfDay={config.timeOfDay} />
      <GroundPlane />
      <PoolBasin config={config} />
      <WaterSurface config={config} />
      <DeckSurface config={config} />
      <Coping config={config} />
      <SpaFeature config={config} />
      <WaterfallFeature config={config} />
      <LEDLights config={config} />
      <AutoCover config={config} />
    </>
  );
}

interface PoolViewerProps {
  config: PoolConfiguration;
  className?: string;
}

export default function PoolViewer({ config, className = '' }: PoolViewerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [10, 8, 10], fov: 45, near: 0.1, far: 100 }} shadows gl={{ antialias: true, alpha: false }}>
        <PoolScene config={config} />
        <OrbitControls autoRotate autoRotateSpeed={0.9} enablePan={true} minPolarAngle={Math.PI * 0.08} maxPolarAngle={Math.PI * 0.45} minDistance={6} maxDistance={25} target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}
