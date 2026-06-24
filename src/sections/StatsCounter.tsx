import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 50000, prefix: '', suffix: '+', label: 'Pool Designs Created', format: true },
  { value: 2.4, prefix: '$', suffix: 'B', label: 'Total Project Value Estimated', format: false },
  { value: 4.9, prefix: '', suffix: '', label: 'Average Customer Rating', format: false },
];

export default function StatsCounter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const statEls = sectionRef.current?.querySelectorAll('.stat-item');
      statEls?.forEach((el, i) => {
        const stat = stats[i];
        const counterEl = countersRef.current[i];
        gsap.fromTo(el, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onStart: () => {
            if (counterEl) {
              const obj = { val: 0 };
              gsap.to(obj, {
                val: stat.value,
                duration: 2,
                ease: 'power2.out',
                onUpdate: () => {
                  if (stat.format && stat.value >= 1000) {
                    counterEl.textContent = stat.prefix + Math.round(obj.val).toLocaleString() + stat.suffix;
                  } else {
                    counterEl.textContent = stat.prefix + obj.val.toFixed(stat.value < 10 ? 1 : 0) + stat.suffix;
                  }
                },
              });
            }
          }
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32" style={{ background: 'linear-gradient(135deg, #E6F5F5 0%, #F9F8F6 100%)' }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={stat.label} className="stat-item">
              <span ref={(el) => { countersRef.current[i] = el; }} className="block text-[48px] lg:text-[72px] xl:text-[96px] font-light text-pool-teal leading-none tracking-[-0.03em]">
                {stat.prefix}0{stat.suffix}
              </span>
              <p className="mt-3 text-base text-pool-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
