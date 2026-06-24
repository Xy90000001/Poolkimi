import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Sun, Sunrise, Sunset, Moon, Square, Circle, Waves, Sparkles, RefreshCw } from 'lucide-react';
import PoolViewer from '@/components/PoolViewer';
import { SHAPES, SIZES, FINISHES, WATER_COLORS, DECK_OPTIONS, COPING_COLORS, FEATURE_OPTIONS, TIME_OF_DAY_OPTIONS, PRESETS, calculatePrice } from '@/data/poolData';
import { DEFAULT_CONFIG } from '@/types/pool';
import type { PoolConfiguration, PoolShape, PoolSize } from '@/types/pool';

function ConfigSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-pool-border-light">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-base font-medium text-pool-text">{title}</span>
        <ChevronDown size={18} className={`text-pool-text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-250 ${open ? 'max-h-[800px] pb-5' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
}

function ShapeIcon({ shape, size = 24 }: { shape: PoolShape; size?: number }) {
  switch (shape) {
    case 'rectangle': return <Square size={size} />;
    case 'roman': return <Waves size={size} />;
    case 'oval': return <Circle size={size} />;
    case 'freeform': return <Sparkles size={size} />;
  }
}

function TimeIcon({ time }: { time: string }) {
  switch (time) {
    case 'morning': return <Sunrise size={20} />;
    case 'midday': return <Sun size={20} />;
    case 'evening': return <Sunset size={20} />;
    case 'night': return <Moon size={20} />;
    default: return <Sun size={20} />;
  }
}

function formatPrice(n: number) {
  return '$' + n.toLocaleString('en-US');
}

export default function Configurator() {
  const [config, setConfig] = useState<PoolConfiguration>({ ...DEFAULT_CONFIG });
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(true);
  const priceRef = useRef<HTMLSpanElement>(null);
  const prevPriceRef = useRef<number>(0);
  const navigate = useNavigate();

  const priceData = calculatePrice(config.shape, config.size, config.interiorFinish, config.deckMaterial, config.features as unknown as Record<string, boolean>);

  useEffect(() => {
    if (priceRef.current && prevPriceRef.current !== priceData.total) {
      const start = prevPriceRef.current;
      const end = priceData.total;
      const duration = 400;
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * eased);
        if (priceRef.current) priceRef.current.textContent = formatPrice(current);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      prevPriceRef.current = end;
    }
  }, [priceData.total]);

  const updateConfig = useCallback(<K extends keyof PoolConfiguration>(key: K, value: PoolConfiguration[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFeature = useCallback((feature: keyof PoolConfiguration['features'], value: boolean) => {
    setConfig(prev => ({ ...prev, features: { ...prev.features, [feature]: value } }));
  }, []);

  const loadPreset = useCallback((presetConfig: Partial<PoolConfiguration>) => {
    setConfig(prev => ({ ...prev, ...presetConfig }));
  }, []);

  const resetDefaults = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG });
  }, []);

  return (
    <div className="h-[100dvh] pt-[72px] flex flex-col lg:flex-row bg-pool-bg">
      <div className="flex-1 relative min-h-[45vh] lg:min-h-0">
        <PoolViewer config={config} className="absolute inset-0" />
        <button onClick={() => setMobilePanelOpen(!mobilePanelOpen)} className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-6 py-2.5 bg-pool-surface/90 backdrop-blur-md rounded-full shadow-card text-sm font-medium text-pool-text border border-pool-border-warm">
          {mobilePanelOpen ? 'Hide Options' : 'Configure Pool'}
        </button>
      </div>

      <div className={`lg:w-[400px] lg:flex-shrink-0 bg-pool-surface border-l border-pool-border-warm overflow-y-auto scrollbar-thin transition-transform duration-300 ${mobilePanelOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} fixed lg:relative bottom-0 left-0 right-0 z-20 max-h-[55vh] lg:max-h-none rounded-t-[24px] lg:rounded-none shadow-[0_-4px_24px_rgba(0,0,0,0.08)] lg:shadow-none`}>
        <div className="lg:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-pool-border-warm" />
        </div>

        <div className="p-6 lg:p-7 pb-4 lg:pb-4">
          <h2 className="text-xl lg:text-2xl font-medium text-pool-text tracking-[-0.02em]">Configure Your Pool</h2>
          <p className="mt-1 text-sm text-pool-text-muted">Customize every detail</p>
        </div>

        <div className="px-6 lg:px-7 pb-4">
          <ConfigSection title="Shape" defaultOpen>
            <div className="grid grid-cols-2 gap-3">
              {SHAPES.map((s) => (
                <button key={s.id} onClick={() => updateConfig('shape', s.id)}
                  className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-[1.5px] transition-all duration-200 ${config.shape === s.id ? 'border-pool-teal bg-pool-teal-light text-pool-teal' : 'border-pool-border-warm text-pool-text-secondary hover:border-pool-teal/50'}`}>
                  <ShapeIcon shape={s.id} size={24} />
                  <span className="text-xs font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title="Size" defaultOpen>
            <div className="flex bg-pool-border-warm rounded-xl p-1">
              {(Object.keys(SIZES) as PoolSize[]).map((size) => (
                <button key={size} onClick={() => updateConfig('size', size)}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${config.size === size ? 'bg-pool-teal text-white' : 'text-pool-text-secondary hover:text-pool-text'}`}>
                  {SIZES[size].label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-pool-text-muted text-center">{SIZES[config.size].dimensions}</p>
          </ConfigSection>

          <ConfigSection title="Interior Finish" defaultOpen>
            <div className="flex gap-3 flex-wrap">
              {FINISHES.map((f) => (
                <button key={f.id} onClick={() => updateConfig('interiorFinish', f.id)} title={`${f.name} — $${f.pricePerSqft}/sqft`}
                  className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-white transition-all duration-150 hover:scale-110 ${config.interiorFinish === f.id ? 'shadow-[0_0_0_3px_#1A7A7A]' : 'shadow-[0_0_0_2px_#E8E5E0]'}`}
                  style={{ backgroundColor: f.color }} />
              ))}
            </div>
            <div className="mt-3 p-3 bg-pool-surface-elevated rounded-xl border border-pool-border-light">
              <p className="text-xs font-semibold text-pool-text">{FINISHES.find(f => f.id === config.interiorFinish)?.name}</p>
              <p className="text-xs text-pool-text-muted mt-0.5">{FINISHES.find(f => f.id === config.interiorFinish)?.description}</p>
              <p className="text-xs text-pool-text-muted mt-1">from ${FINISHES.find(f => f.id === config.interiorFinish)?.pricePerSqft}/sqft</p>
            </div>
          </ConfigSection>

          <ConfigSection title="Water Color">
            <div className="flex gap-3">
              {WATER_COLORS.map((w) => (
                <button key={w.id} onClick={() => updateConfig('waterColor', w.id)} title={w.name}
                  className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white transition-all duration-150 hover:scale-110 ${config.waterColor === w.id ? 'shadow-[0_0_0_3px_#1A7A7A]' : 'shadow-[0_0_0_2px_#E8E5E0]'}`}
                  style={{ background: `linear-gradient(135deg, ${w.colorShallow}, ${w.colorDeep})` }} />
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title="Deck Material">
            <div className="grid grid-cols-2 gap-3">
              {DECK_OPTIONS.map((d) => (
                <button key={d.id} onClick={() => updateConfig('deckMaterial', d.id)}
                  className={`flex flex-col gap-1.5 p-3 rounded-xl border-[1.5px] transition-all duration-200 ${config.deckMaterial === d.id ? 'border-pool-teal bg-pool-teal-light' : 'border-pool-border-warm hover:border-pool-teal/50'}`}>
                  <div className="h-10 rounded-lg w-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs font-medium text-pool-text">{d.name}</span>
                  <span className="text-xs text-pool-text-muted">${d.pricePerSqft}/sqft</span>
                </button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title="Coping Color">
            <div className="flex gap-2.5">
              {COPING_COLORS.map((c) => (
                <button key={c.id} onClick={() => updateConfig('copingColor', c.id)} title={c.label}
                  className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full border-2 border-white transition-all duration-150 hover:scale-110 ${config.copingColor === c.id ? 'shadow-[0_0_0_2px_#1A7A7A]' : 'shadow-[0_0_0_1.5px_#E8E5E0]'}`}
                  style={{ backgroundColor: c.color }} />
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title="Features">
            <div className="space-y-1">
              {FEATURE_OPTIONS.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-3 border-b border-pool-border-light last:border-0">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm text-pool-text font-medium">{f.name}</p>
                    <p className="text-xs text-pool-text-muted">{f.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-pool-price-green font-medium">+{formatPrice(f.price)}</span>
                    <button onClick={() => updateFeature(f.id, !config.features[f.id])}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${config.features[f.id] ? 'bg-pool-teal' : 'bg-pool-border-warm'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${config.features[f.id] ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title="Time of Day">
            <div className="flex gap-2">
              {TIME_OF_DAY_OPTIONS.map((t) => (
                <button key={t.id} onClick={() => updateConfig('timeOfDay', t.id)} title={t.label}
                  className={`w-11 h-11 lg:w-12 lg:h-12 rounded-xl border-[1.5px] flex items-center justify-center transition-all duration-200 ${config.timeOfDay === t.id ? 'bg-pool-teal border-pool-teal text-white' : 'border-pool-border-warm text-pool-text-secondary hover:border-pool-teal/50'}`}>
                  <TimeIcon time={t.id} />
                </button>
              ))}
            </div>
          </ConfigSection>

          <div className="mt-4 pt-4 border-t border-pool-border-light">
            <h4 className="text-sm font-medium text-pool-text mb-3">Quick Presets</h4>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {PRESETS.map((preset, i) => (
                <button key={i} onClick={() => loadPreset(preset.config)}
                  className="flex-shrink-0 w-[140px] p-2.5 rounded-xl border border-pool-border-warm hover:border-pool-teal transition-all duration-200 hover:-translate-y-0.5 text-left">
                  <div className="h-14 rounded-lg mb-2 bg-gradient-to-br from-pool-teal-light to-pool-bg" />
                  <span className="text-xs font-medium text-pool-text">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-pool-surface border-t-2 border-pool-border-warm p-5 lg:p-6">
          {showBreakdown && (
            <div className="mb-4 pb-3 border-b border-pool-border-light space-y-1.5">
              {priceData.breakdown.map((item) => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span className="text-pool-text-muted">{item.label}</span>
                  <span className="text-pool-text-muted">{formatPrice(item.value)}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setShowBreakdown(!showBreakdown)} className="text-xs text-pool-teal font-medium mb-3 hover:underline">
            {showBreakdown ? 'Hide Breakdown' : 'View Breakdown'}
          </button>
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xs text-pool-text-muted">Estimated Total</span>
            <span ref={priceRef} className="text-2xl lg:text-3xl font-semibold text-pool-text tracking-[-0.02em]">{formatPrice(priceData.total)}</span>
          </div>
          <button onClick={() => navigate('/configure')} className="w-full py-3.5 bg-pool-teal text-white font-medium text-sm rounded-full hover:bg-pool-teal-hover transition-all duration-300 hover:scale-[1.02]">
            Get My Free Quote
          </button>
          <button onClick={resetDefaults} className="w-full mt-2.5 py-2 text-xs text-pool-teal font-medium hover:underline flex items-center justify-center gap-1">
            <RefreshCw size={12} /> Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
