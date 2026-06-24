import { useEffect, useRef } from 'react';
import { Compass, Eye, Calculator } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { num: '01', icon: Compass, title: 'Choose Your Design', description: 'Select from 4 pool shapes, 6 interior finishes, and 4 deck materials. Mix and match to find your perfect combination.' },
  { num: '02', icon: Eye, title: 'See It in 3D', description: 'Watch your pool come to life in real-time with our hyper-realistic 3D viewer. Rotate, zoom, and explore every detail.' },
  { num: '03', icon: Calculator, title: 'Get Your Price', description: 'Receive an instant, accurate price estimate based on real 2025 market data. No surprises, no hidden fees.' },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heading = sectionRef.current?.querySelector('.section-heading');
      const cards = sectionRef.current?.querySelectorAll('.step-card');
      if (heading) {
        gsap.fromTo(heading, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: heading, start: 'top 85%' } });
      }
      if (cards) {
        gsap.fromTo(cards, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: cards[0], start: 'top 85%' } });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 lg:py-40 bg-pool-bg">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        <h2 className="section-heading text-center text-[32px] lg:text-[48px] font-normal leading-[1.05] tracking-[-0.03em] text-pool-text mb-12 lg:mb-16">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step) => (
            <div key={step.num} className="step-card group bg-pool-surface border border-pool-border-warm rounded-[20px] p-10 lg:p-12 text-center relative transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover">
              <span className="absolute top-6 left-6 text-[48px] lg:text-[64px] font-light text-pool-teal opacity-15 leading-none">{step.num}</span>
              <div className="w-16 h-16 rounded-full bg-pool-teal-light flex items-center justify-center mx-auto mb-6 group-hover:bg-pool-teal transition-colors duration-300">
                <step.icon size={28} className="text-pool-teal group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-medium text-pool-text mb-3">{step.title}</h3>
              <p className="text-base text-pool-text-secondary leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
