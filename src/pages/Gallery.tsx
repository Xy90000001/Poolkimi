import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { X, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GALLERY_ITEMS } from '@/data/poolData';
import type { PoolShape, GalleryItem } from '@/types/pool';

gsap.registerPlugin(ScrollTrigger);

const FILTERS: { id: PoolShape | 'all'; label: string }[] = [
  { id: 'all', label: 'All Designs' },
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'roman', label: 'Roman' },
  { id: 'oval', label: 'Oval' },
  { id: 'freeform', label: 'Freeform' },
];

function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const featureLabels: string[] = [];
  if (item.features.spa) featureLabels.push('Attached Spa');
  if (item.features.waterfall) featureLabels.push('Waterfall Feature');
  if (item.features.ledLighting) featureLabels.push('LED Lighting');
  if (item.features.heating) featureLabels.push('Pool Heating');
  if (item.features.autoCover) featureLabels.push('Auto Safety Cover');

  const formatFeatureName = (str: string) => str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-pool-text/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-pool-surface rounded-3xl max-w-[900px] w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-[55%] flex-shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-[250px] sm:h-[300px] lg:h-full lg:min-h-[500px] object-cover rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none" />
          </div>
          <div className="lg:w-[45%] p-6 lg:p-10 flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 lg:top-6 lg:right-6 w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white hover:bg-white/25 transition-colors z-10">
              <X size={20} />
            </button>
            <h3 className="text-2xl lg:text-3xl font-medium text-pool-text tracking-[-0.02em] mt-2 lg:mt-4">{item.name}</h3>
            <p className="mt-2 text-2xl font-semibold text-pool-text">${item.price.toLocaleString()}</p>
            <div className="my-6 border-b border-pool-border-warm" />
            <div className="space-y-3 flex-1">
              {[
                { label: 'Shape', value: formatFeatureName(item.shape) },
                { label: 'Size', value: item.size.charAt(0).toUpperCase() + item.size.slice(1) },
                { label: 'Interior Finish', value: formatFeatureName(item.interiorFinish) },
                { label: 'Water Color', value: formatFeatureName(item.waterColor) },
                { label: 'Deck Material', value: formatFeatureName(item.deckMaterial) },
                ...(featureLabels.length > 0 ? [{ label: 'Features', value: featureLabels.join(', ') }] : []),
              ].map((spec) => (
                <div key={spec.label} className="flex justify-between">
                  <span className="text-xs text-pool-text-muted uppercase tracking-wide">{spec.label}</span>
                  <span className="text-sm text-pool-text font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-3">
              <button onClick={() => { navigate('/configure'); }}
                className="w-full py-3.5 bg-pool-teal text-white font-medium text-sm rounded-full hover:bg-pool-teal-hover transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2">
                Configure This Design <ArrowRight size={16} />
              </button>
              <button onClick={onClose} className="w-full py-2 text-xs text-pool-text-muted hover:text-pool-text transition-colors">
                Back to Gallery
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState<PoolShape | 'all'>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() =>
    activeFilter === 'all' ? GALLERY_ITEMS : GALLERY_ITEMS.filter(item => item.shape === activeFilter),
    [activeFilter]
  );

  const [colCount, setColCount] = useState(3);
  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth < 640) setColCount(1);
      else if (window.innerWidth < 1024) setColCount(2);
      else setColCount(3);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const columns = useMemo(() => {
    const cols: GalleryItem[][] = Array.from({ length: colCount }, () => []);
    const heights = Array(colCount).fill(0);
    filteredItems.forEach((item, i) => {
      const isTall = i % 3 === 1 || i % 5 === 3;
      const minCol = heights.indexOf(Math.min(...heights));
      cols[minCol].push(item);
      heights[minCol] += isTall ? 1.3 : 1;
    });
    return cols;
  }, [filteredItems, colCount]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const headerEls = sectionRef.current?.querySelectorAll('.header-animate');
      headerEls?.forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: i * 0.12 });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.gallery-card');
    gsap.fromTo(cards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.04 });
  }, [activeFilter]);

  const formatFeatureName = (str: string) => str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const isItemTall = (item: GalleryItem) => {
    const globalIdx = filteredItems.findIndex(i => i.id === item.id);
    return globalIdx % 3 === 1 || globalIdx % 5 === 3;
  };

  return (
    <div ref={sectionRef} className="min-h-screen bg-pool-bg">
      <div className="pt-[140px] pb-12 lg:pb-16 text-center">
        <span className="header-animate block text-xs font-semibold tracking-[0.08em] text-pool-teal uppercase mb-3">INSPIRATION GALLERY</span>
        <h1 className="header-animate text-[36px] lg:text-[48px] font-normal leading-[1.05] tracking-[-0.03em] text-pool-text">Designed for Every Lifestyle</h1>
        <p className="header-animate mt-4 text-lg text-pool-text-secondary max-w-[600px] mx-auto px-6">
          Browse stunning pool designs created with PoolKimi. Click any design to see the full configuration and load it into the configurator.
        </p>
      </div>

      <div className="sticky top-[72px] z-40 bg-pool-bg/90 backdrop-blur-xl border-b border-pool-border-light">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-4">
          <div className="flex gap-2.5 overflow-x-auto scrollbar-thin pb-1">
            {FILTERS.map((filter) => (
              <button key={filter.id} onClick={() => setActiveFilter(filter.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-medium transition-all duration-200 ${activeFilter === filter.id ? 'bg-pool-teal text-white' : 'border-[1.5px] border-pool-border-warm text-pool-text-secondary hover:border-pool-teal hover:text-pool-teal'}`}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-10 lg:py-16 pb-24">
        <div ref={gridRef} className="flex gap-5 lg:gap-6">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex-1 flex flex-col gap-5 lg:gap-6">
              {col.map((item) => (
                <div key={item.id} className="gallery-card group bg-pool-surface rounded-[20px] overflow-hidden shadow-card cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                  onClick={() => setLightboxItem(item)}>
                  <div className="relative overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ height: isItemTall(item) ? '380px' : '260px' }} />
                    <div className="absolute inset-0 bg-pool-text/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold tracking-wide">View Configuration</span>
                    </div>
                  </div>
                  <div className="p-5 lg:p-6">
                    <h3 className="text-lg font-medium text-pool-text">{item.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-pool-teal-light text-pool-teal font-medium">{formatFeatureName(item.shape)}</span>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-pool-teal-light text-pool-teal font-medium">{formatFeatureName(item.interiorFinish)}</span>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-pool-teal-light text-pool-teal font-medium">{formatFeatureName(item.deckMaterial)}</span>
                    </div>
                    <p className="mt-3 text-xl font-semibold text-pool-text">${item.price.toLocaleString()}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-pool-teal flex items-center gap-1 group-hover:gap-1.5 transition-all">Configure This Pool <ArrowRight size={12} /></span>
                      <span className="text-xs text-pool-text-muted">View Details</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-pool-teal-light py-16 lg:py-20 text-center">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-[28px] lg:text-[36px] font-normal leading-[1.05] tracking-[-0.03em] text-pool-text">Find Your Perfect Design?</h2>
          <p className="mt-3 text-lg text-pool-text-secondary max-w-[500px] mx-auto">
            Load any design into the configurator and customize it to match your vision.
          </p>
          <button onClick={() => { window.location.href = '/configure'; }}
            className="mt-8 inline-flex items-center px-8 py-3.5 bg-pool-teal text-white font-medium rounded-full hover:bg-pool-teal-hover transition-all duration-300 hover:scale-[1.03]">
            Start Customizing
          </button>
        </div>
      </div>

      {lightboxItem && <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />}
    </div>
  );
}
