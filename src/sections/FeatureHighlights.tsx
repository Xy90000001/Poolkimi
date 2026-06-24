import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    eyebrow: 'REALISTIC 3D VISUALIZATION',
    title: 'See Every Detail Before You Build',
    description: "Our advanced 3D rendering engine creates photorealistic pool models with accurate materials, water physics, and dynamic lighting. See exactly how your choices look together — from pebble finishes catching sunlight to Caribbean water shimmering at dusk.",
    bullets: ['Physically-based material rendering', 'Dynamic water caustics and reflections', 'Time-of-day lighting simulation'],
    cta: { text: 'Try the Configurator', link: '/configure' },
    image: '/images/feature-3d-render.jpg',
    imageAlt: 'Close-up of pool interior with pebble finish and water caustics',
    reverse: false,
  },
  {
    eyebrow: 'REAL MARKET PRICING',
    title: 'Accurate Estimates, No Guesswork',
    description: "Our pricing engine aggregates data from thousands of pool installations across the US, updated quarterly. Get a reliable estimate that reflects actual 2025 construction costs in your region.",
    bullets: ['Based on 2025 national market data', 'Regional cost adjustments available', 'Itemized breakdown of every feature'],
    cta: { text: 'See Pricing Details', link: '/configure' },
    image: '/images/pricing-ui-mockup.jpg',
    imageAlt: 'Pool configurator price calculator interface',
    reverse: true,
  },
];

export default function FeatureHighlights() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = sectionRef.current?.querySelectorAll('.feature-row');
      rows?.forEach((row) => {
        const text = row.querySelector('.feature-text');
        const image = row.querySelector('.feature-image');
        const elements = row.querySelectorAll('.animate-in');
        if (text) {
          gsap.fromTo(text, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 80%' } });
        }
        if (image) {
          gsap.fromTo(image, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 80%' } });
        }
        if (elements.length > 0) {
          gsap.fromTo(elements, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: row, start: 'top 75%' } });
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 lg:py-40 bg-pool-surface">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {features.map((feature, idx) => (
          <div key={idx} className={`feature-row flex flex-col ${feature.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20 ${idx > 0 ? 'mt-24 lg:mt-32' : ''}`}>
            <div className="feature-text flex-1 max-w-[520px]">
              <span className="animate-in block text-xs font-semibold tracking-[0.08em] text-pool-teal uppercase mb-3">{feature.eyebrow}</span>
              <h2 className="animate-in text-[28px] lg:text-[40px] font-normal leading-[1.05] tracking-[-0.03em] text-pool-text">{feature.title}</h2>
              <p className="animate-in mt-5 text-lg text-pool-text-secondary leading-relaxed">{feature.description}</p>
              <ul className="animate-in mt-8 space-y-4">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-pool-price-green mt-0.5 flex-shrink-0" />
                    <span className="text-base text-pool-text-secondary">{bullet}</span>
                  </li>
                ))}
              </ul>
              <Link to={feature.cta.link} className="animate-in inline-flex items-center gap-1.5 mt-8 text-sm font-medium text-pool-teal hover:gap-2.5 transition-all duration-300">
                {feature.cta.text} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="feature-image flex-1 w-full">
              <div className="rounded-[20px] overflow-hidden shadow-card">
                <img src={feature.image} alt={feature.imageAlt} className="w-full h-[280px] sm:h-[350px] lg:h-[420px] object-cover" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
