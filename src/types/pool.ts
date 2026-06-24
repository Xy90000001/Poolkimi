export type PoolShape = 'rectangle' | 'roman' | 'oval' | 'freeform';
export type PoolSize = 'small' | 'medium' | 'large';
export type InteriorFinish = 'white-plaster' | 'aqua-white' | 'pebble-tec' | 'quartzscapes' | 'glass-tile' | 'dark-plaster';
export type WaterColor = 'aqua-blue' | 'caribbean' | 'midnight' | 'crystal';
export type DeckMaterial = 'travertine' | 'concrete-pavers' | 'natural-stone' | 'wood-composite';
export type CopingColor = 'white' | 'sand' | 'grey' | 'teal' | 'black';
export type TimeOfDay = 'morning' | 'midday' | 'evening' | 'night';

export interface PoolFeatures {
  spa: boolean;
  waterfall: boolean;
  ledLighting: boolean;
  heating: boolean;
  autoCover: boolean;
}

export interface PoolConfiguration {
  shape: PoolShape;
  size: PoolSize;
  interiorFinish: InteriorFinish;
  waterColor: WaterColor;
  deckMaterial: DeckMaterial;
  copingColor: CopingColor;
  features: PoolFeatures;
  timeOfDay: TimeOfDay;
}

export interface FinishOption {
  id: InteriorFinish;
  name: string;
  color: string;
  roughness: number;
  pricePerSqft: number;
  description: string;
}

export interface WaterOption {
  id: WaterColor;
  name: string;
  colorDeep: string;
  colorShallow: string;
}

export interface DeckOption {
  id: DeckMaterial;
  name: string;
  color: string;
  pricePerSqft: number;
  borderWidth: number;
}

export interface FeatureOption {
  id: keyof PoolFeatures;
  name: string;
  description: string;
  price: number;
}

export interface GalleryItem {
  id: number;
  name: string;
  image: string;
  shape: PoolShape;
  size: PoolSize;
  interiorFinish: InteriorFinish;
  waterColor: WaterColor;
  deckMaterial: DeckMaterial;
  copingColor: CopingColor;
  features: Partial<PoolFeatures>;
  price: number;
}

export interface SizeDimensions {
  label: string;
  dimensions: string;
  poolArea: number;
  deckArea: number;
}

export const DEFAULT_CONFIG: PoolConfiguration = {
  shape: 'rectangle',
  size: 'medium',
  interiorFinish: 'white-plaster',
  waterColor: 'aqua-blue',
  deckMaterial: 'travertine',
  copingColor: 'white',
  features: {
    spa: false,
    waterfall: false,
    ledLighting: false,
    heating: false,
    autoCover: false,
  },
  timeOfDay: 'midday',
};
