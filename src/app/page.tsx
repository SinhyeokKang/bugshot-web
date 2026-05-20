import { Hero } from "@/components/Hero";
import { Mockup } from "@/components/Mockup";
import { FeatureCards } from "@/components/FeatureCards";
import { HowItWorks } from "@/components/HowItWorks";
import { Integrations } from "@/components/Integrations";
import { BottomCta } from "@/components/BottomCta";

export default function Home() {
  return (
    <main>
      <Hero />
      <Mockup />
      <FeatureCards />
      <HowItWorks />
      <Integrations />
      <BottomCta />
    </main>
  );
}
