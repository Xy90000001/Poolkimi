import type {
  PoolShape, PoolSize, FinishOption, WaterOption, DeckOption,
  FeatureOption, SizeDimensions, GalleryItem, CopingColor, TimeOfDay
} from '@/types/pool';

export const SHAPES: { id: PoolShape; label: string }[] = [
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'roman', label: 'Roman' },
  { id: 'oval', label: 'Oval' },
  { id: 'freeform', label: 'Freeform' },
];

export const SIZES: Record<PoolSize, SizeDimensions> = {
  small: { label: 'Small', dimensions: "12' × 24'", poolArea: 288, deckArea: 720 },
  medium: { label: 'Medium', dimensions: "16' × 32'", poolArea: 512, deckArea: 1104 },
  large: { label: 'Large', dimensions: "20' × 40'", poolArea: 800, deckArea: 1584 },
};

export const FINISHES: FinishOption[] = [
  { id: 'white-plaster', name: 'White Plaster', color: '#F5F0E8', roughness: 0.85, pricePerSqft: 6.50, description: 'Traditional smooth white plaster finish' },
  { id: 'aqua-white', name: 'Aqua White', color: '#E8F4F0', roughness: 0.80, pricePerSqft: 7.25, description: 'Slightly tinted white with cool aqua undertone' },
  { id: 'pebble-tec', name: 'Pebble Tec', color: '#B8A99A', roughness: 0.95, pricePerSqft: 12.00, description: 'Natural pebble aggregate, textured surface' },
  { id: 'quartzscapes', name: 'QuartzScapes', color: '#C4B8A8', roughness: 0.70, pricePerSqft: 10.50, description: 'Polished quartz aggregate, smooth with sparkle' },
  { id: 'glass-tile', name: 'Glass Tile', color: '#1A3A4A', roughness: 0.15, pricePerSqft: 28.00, description: 'Iridescent glass mosaic tile, highly reflective' },
  { id: 'dark-plaster', name: 'Dark Plaster', color: '#3D3630', roughness: 0.80, pricePerSqft: 8.50, description: 'Modern dark grey plaster, dramatic look' },
];

export const WATER_COLORS: WaterOption[] = [
  { id: 'aqua-blue', name: 'Aqua Blue', colorShallow: '#40E0D0', colorDeep: '#008B8B' },
  { id: 'caribbean', name: 'Caribbean', colorShallow: '#48D1CC', colorDeep: '#0E7490' },
  { id: 'midnight', name: 'Midnight', colorShallow: '#1A6B7A', colorDeep: '#0B3D4C' },
  { id: 'crystal', name: 'Crystal', colorShallow: '#A0E8E8', colorDeep: '#5CB8B8' },
];

export const DECK_OPTIONS: DeckOption[] = [
  { id: 'travertine', name: 'Travertine', color: '#D4C5B0', pricePerSqft: 18.00, borderWidth: 6 },
  { id: 'concrete-pavers', name: 'Concrete Pavers', color: '#A09890', pricePerSqft: 12.00, borderWidth: 5 },
  { id: 'natural-stone', name: 'Natural Stone', color: '#8B7D6B', pricePerSqft: 22.00, borderWidth: 7 },
  { id: 'wood-composite', name: 'Wood Composite', color: '#A07850', pricePerSqft: 16.00, borderWidth: 4 },
];

export const COPING_COLORS: { id: CopingColor; color: string; label: string }[] = [
  { id: 'white', color: '#FFFFFF', label: 'White' },
  { id: 'sand', color: '#D4C5B0', label: 'Sand' },
  { id: 'grey', color: '#A09890', label: 'Grey' },
  { id: 'teal', color: '#1A7A7A', label: 'Teal' },
  { id: 'black', color: '#1A1A1A', label: 'Black' },
];

export const FEATURE_OPTIONS: FeatureOption[] = [
  { id: 'spa', name: 'Attached Spa', description: "7' diameter spa with 6 jets", price: 15000 },
  { id: 'waterfall', name: 'Waterfall Feature', description: 'Natural stone waterfall with splash', price: 8500 },
  { id: 'ledLighting', name: 'LED Pool Lighting', description: 'Color-changeable underwater lights', price: 3200 },
  { id: 'heating', name: 'Pool Heating', description: 'Energy-efficient heat pump system', price: 5500 },
  { id: 'autoCover', name: 'Auto Safety Cover', description: 'Track-mounted retractable cover', price: 7000 },
];

export const TIME_OF_DAY_OPTIONS: { id: TimeOfDay; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'midday', label: 'Midday' },
  { id: 'evening', label: 'Evening' },
  { id: 'night', label: 'Night' },
];

// Base shell costs by size
const SHELL_COSTS: Record<PoolSize, number> = {
  small: 18000,
  medium: 25000,
  large: 38000,
};

// Plumbing/system costs by size
const SYSTEM_COSTS: Record<PoolSize, number> = {
  small: 5500,
  medium: 8500,
  large: 12000,
};

// Coping cost per linear foot
const COPING_COST_PER_LF = 15;

// Linear feet by size (approximate perimeter)
const LINEAR_FEET: Record<PoolSize, number> = {
  small: 96,
  medium: 128,
  large: 160,
};

export function calculatePrice(
  _shape: PoolShape,
  size: PoolSize,
  interiorFinish: string,
  deckMaterial: string,
  features: Record<string, boolean>
): { total: number; breakdown: { label: string; value: number }[] } {
  const sizeData = SIZES[size];
  const finish = FINISHES.find(f => f.id === interiorFinish)!;
  const deck = DECK_OPTIONS.find(d => d.id === deckMaterial)!;

  const shellCost = SHELL_COSTS[size];
  const finishCost = sizeData.poolArea * finish.pricePerSqft;
  const systemCost = SYSTEM_COSTS[size];
  const deckCost = sizeData.deckArea * deck.pricePerSqft;
  const copingCost = LINEAR_FEET[size] * COPING_COST_PER_LF;

  let featuresCost = 0;
  const featureBreakdown: { label: string; value: number }[] = [];
  FEATURE_OPTIONS.forEach(f => {
    if (features[f.id]) {
      featuresCost += f.price;
      featureBreakdown.push({ label: f.name, value: f.price });
    }
  });

  const subtotal = shellCost + finishCost + systemCost + deckCost + copingCost + featuresCost;

  return {
    total: Math.round(subtotal),
    breakdown: [
      { label: 'Pool Shell', value: shellCost },
      { label: 'Interior Finish', value: Math.round(finishCost) },
      { label: 'Water System', value: systemCost },
      { label: 'Deck', value: Math.round(deckCost) },
      { label: 'Coping & Tile', value: copingCost },
      ...featureBreakdown,
    ],
  };
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1, name: 'The Classic', image: '/images/gallery/pool-01-classic.jpg',
    shape: 'rectangle', size: 'medium', interiorFinish: 'white-plaster',
    waterColor: 'aqua-blue', deckMaterial: 'travertine', copingColor: 'white', features: {}, price: 59580,
  },
  {
    id: 2, name: 'Midnight Modern', image: '/images/gallery/pool-02-midnight.jpg',
    shape: 'rectangle', size: 'medium', interiorFinish: 'dark-plaster',
    waterColor: 'midnight', deckMaterial: 'concrete-pavers', copingColor: 'grey', features: { ledLighting: true }, price: 72280,
  },
  {
    id: 3, name: 'Tropical Oasis', image: '/images/gallery/pool-03-tropical.jpg',
    shape: 'freeform', size: 'medium', interiorFinish: 'pebble-tec',
    waterColor: 'caribbean', deckMaterial: 'natural-stone', copingColor: 'sand', features: { waterfall: true, ledLighting: true }, price: 98080,
  },
  {
    id: 4, name: 'Roman Elegance', image: '/images/gallery/pool-04-roman.jpg',
    shape: 'roman', size: 'large', interiorFinish: 'glass-tile',
    waterColor: 'aqua-blue', deckMaterial: 'travertine', copingColor: 'white', features: { spa: true }, price: 112780,
  },
  {
    id: 5, name: 'Desert Minimal', image: '/images/gallery/pool-05-desert.jpg',
    shape: 'rectangle', size: 'small', interiorFinish: 'quartzscapes',
    waterColor: 'crystal', deckMaterial: 'wood-composite', copingColor: 'sand', features: {}, price: 68380,
  },
  {
    id: 6, name: 'Coastal Living', image: '/images/gallery/pool-06-coastal.jpg',
    shape: 'oval', size: 'large', interiorFinish: 'pebble-tec',
    waterColor: 'caribbean', deckMaterial: 'travertine', copingColor: 'white', features: { spa: true, ledLighting: true }, price: 108580,
  },
  {
    id: 7, name: 'Urban Retreat', image: '/images/gallery/pool-07-urban.jpg',
    shape: 'rectangle', size: 'medium', interiorFinish: 'dark-plaster',
    waterColor: 'aqua-blue', deckMaterial: 'concrete-pavers', copingColor: 'grey', features: { heating: true, autoCover: true }, price: 88780,
  },
  {
    id: 8, name: 'Lagoon Dream', image: '/images/gallery/pool-08-lagoon.jpg',
    shape: 'freeform', size: 'large', interiorFinish: 'pebble-tec',
    waterColor: 'midnight', deckMaterial: 'natural-stone', copingColor: 'black', features: { waterfall: true, spa: true, ledLighting: true }, price: 124580,
  },
  {
    id: 9, name: 'Resort Villa', image: '/images/gallery/pool-09-resort.jpg',
    shape: 'roman', size: 'large', interiorFinish: 'glass-tile',
    waterColor: 'caribbean', deckMaterial: 'travertine', copingColor: 'white', features: { spa: true, waterfall: true, ledLighting: true, heating: true }, price: 139280,
  },
  {
    id: 10, name: 'Scandinavian', image: '/images/gallery/pool-10-scandinavian.jpg',
    shape: 'rectangle', size: 'small', interiorFinish: 'aqua-white',
    waterColor: 'crystal', deckMaterial: 'wood-composite', copingColor: 'white', features: {}, price: 65880,
  },
  {
    id: 11, name: 'Garden Paradise', image: '/images/gallery/pool-11-garden.jpg',
    shape: 'oval', size: 'medium', interiorFinish: 'white-plaster',
    waterColor: 'aqua-blue', deckMaterial: 'natural-stone', copingColor: 'sand', features: { ledLighting: true }, price: 78280,
  },
  {
    id: 12, name: 'Executive', image: '/images/gallery/pool-12-executive.jpg',
    shape: 'rectangle', size: 'large', interiorFinish: 'quartzscapes',
    waterColor: 'caribbean', deckMaterial: 'travertine', copingColor: 'white', features: { spa: true, heating: true, autoCover: true }, price: 106380,
  },
];

export const PRESETS = [
  { name: 'Classic Retreat', config: { shape: 'rectangle' as PoolShape, size: 'medium' as PoolSize, interiorFinish: 'white-plaster' as const, waterColor: 'aqua-blue' as const, deckMaterial: 'travertine' as const } },
  { name: 'Modern Oasis', config: { shape: 'rectangle' as PoolShape, size: 'large' as PoolSize, interiorFinish: 'dark-plaster' as const, waterColor: 'midnight' as const, deckMaterial: 'concrete-pavers' as const } },
  { name: 'Tropical Paradise', config: { shape: 'freeform' as PoolShape, size: 'medium' as PoolSize, interiorFinish: 'pebble-tec' as const, waterColor: 'caribbean' as const, deckMaterial: 'natural-stone' as const } },
  { name: 'Roman Luxury', config: { shape: 'roman' as PoolShape, size: 'large' as PoolSize, interiorFinish: 'glass-tile' as const, waterColor: 'aqua-blue' as const, deckMaterial: 'travertine' as const } },
  { name: 'Minimalist Edge', config: { shape: 'rectangle' as PoolShape, size: 'small' as PoolSize, interiorFinish: 'quartzscapes' as const, waterColor: 'crystal' as const, deckMaterial: 'wood-composite' as const } },
  { name: 'Resort Living', config: { shape: 'oval' as PoolShape, size: 'large' as PoolSize, interiorFinish: 'pebble-tec' as const, waterColor: 'caribbean' as const, deckMaterial: 'travertine' as const } },
];
