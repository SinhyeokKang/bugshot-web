import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { Mockup } from "@/components/Mockup";
import { FeatureCards } from "@/components/FeatureCards";
import { HowItWorks } from "@/components/HowItWorks";
import { BottomCta } from "@/components/BottomCta";
import { Footer } from "@/components/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <main>
        <Hero />
        <Mockup />
        <FeatureCards />
        <HowItWorks />
      </main>
      <BottomCta />
      <Footer />
    </>
  );
}
