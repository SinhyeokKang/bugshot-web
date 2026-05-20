import { Hero } from "@/components/Hero";
import { Mockup } from "@/components/Mockup";
import { FeatureCards } from "@/components/FeatureCards";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Mockup />
        <FeatureCards />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
