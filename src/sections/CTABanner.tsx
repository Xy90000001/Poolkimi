import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CTABanner() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const elements = sectionRef.current?.querySelectorAll('.animate-in');
      if (elements) {
        gsap.fromTo(elements, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-24 bg-pool-text">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 text-center">
        <h2 className="animate-in text-[28px] lg:text-[40px] font-normal leading-[1.05] tracking-[-0.03em] text-white">Ready to Design Your Pool?</h2>
        <p className="animate-in mt-4 text-lg text-white/70 max-w-[480px] mx-auto">Start configuring now and get your instant price estimate.</p>
        <div className="animate-in mt-10">
          <Link to="/configure" className="inline-flex items-center px-10 py-4 bg-pool-teal text-white font-medium text-lg rounded-full hover:bg-pool-teal-hover transition-all duration-300 hover:scale-[1.03] animate-pulse-glow">
            Start Building Your Pool
          </Link>
        </div>
        <Link to="/gallery" className="animate-in inline-block mt-5 text-sm text-white/50 hover:text-white transition-colors underline underline-offset-4">
          Or browse our gallery first
        </Link>
      </div>
    </section>
  );
}
