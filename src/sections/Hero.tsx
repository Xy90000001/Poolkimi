import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Check, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word');
        tl.fromTo(words, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 });
      }
      tl.fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.4');
      tl.fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.3');
      tl.fromTo(trustRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, '-=0.2');
      tl.fromTo(imageRef.current, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' }, '-=0.6');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const headlineWords = 'Design Your Dream Pool in Minutes'.split(' ');

  return (
    <section ref={sectionRef} className="min-h-[100dvh] flex items-center pt-[72px] relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 w-full">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-8">
          <div className="flex-1 max-w-[600px] text-center lg:text-left">
            <h1 ref={headlineRef} className="text-[42px] sm:text-[56px] lg:text-[80px] xl:text-[96px] font-light leading-[0.95] tracking-[-0.03em] text-pool-text">
              {headlineWords.map((word, i) => (
                <span key={i} className="word inline-block mr-[0.25em]">{word}</span>
              ))}
            </h1>
            <p ref={subtitleRef} className="mt-6 text-lg lg:text-xl text-pool-text-secondary leading-relaxed max-w-[480px] mx-auto lg:mx-0">
              Choose your shape, pick your finish, and watch your perfect pool come to life in stunning 3D. Get an instant price estimate based on real market data.
            </p>
            <div ref={ctaRef} className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/configure" className="inline-flex items-center gap-2 px-8 py-3.5 bg-pool-teal text-white font-medium rounded-full hover:bg-pool-teal-hover transition-all duration-300 hover:scale-[1.03]">
                Start Designing <ArrowRight size={18} />
              </Link>
              <Link to="/gallery" className="inline-flex items-center px-8 py-3.5 border-[1.5px] border-pool-border-warm text-pool-text font-medium rounded-full hover:bg-pool-surface hover:border-pool-teal hover:text-pool-teal transition-all duration-300">
                View Gallery
              </Link>
            </div>
            <div ref={trustRef} className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2">
              {['No credit card required', 'Instant estimate', 'Based on 2025 market data'].map((text) => (
                <span key={text} className="flex items-center gap-1.5 text-xs text-pool-text-muted font-medium">
                  <Check size={14} className="text-pool-price-green" /> {text}
                </span>
              ))}
            </div>
          </div>
          <div ref={imageRef} className="flex-1 w-full max-w-[600px] lg:max-w-none">
            <div className="relative rounded-2xl lg:rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <img src="/images/hero-pool.jpg" alt="Luxury pool with turquoise water and travertine deck" className="w-full h-[35vh] sm:h-[45vh] lg:h-[65vh] object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
