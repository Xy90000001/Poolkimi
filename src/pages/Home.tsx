import Hero from '@/sections/Hero';
import HowItWorks from '@/sections/HowItWorks';
import FeatureHighlights from '@/sections/FeatureHighlights';
import StatsCounter from '@/sections/StatsCounter';
import CTABanner from '@/sections/CTABanner';

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeatureHighlights />
      <StatsCounter />
      <CTABanner />
    </>
  );
}
