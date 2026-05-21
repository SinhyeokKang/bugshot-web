import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { Mockup } from "@/components/Mockup";
import { FeatureCards } from "@/components/FeatureCards";
import { HowItWorks } from "@/components/HowItWorks";
import { Review } from "@/components/Review";
import { BottomCta } from "@/components/BottomCta";
import { Footer } from "@/components/Footer";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ScrollReveal } from "@/components/ScrollReveal";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
      >
        Skip to main content
      </a>
      <LocaleSwitcher />
      <main id="main">
        <Hero />
        <Mockup />
        <section className="border-b py-20 md:py-[120px]">
          <FeatureCards />
        </section>
        <ScrollReveal className="border-b py-20 md:py-[120px]">
          <Review />
        </ScrollReveal>
        <section className="border-b py-20 md:py-[120px]">
          <HowItWorks />
        </section>
      </main>
      <ScrollReveal className="py-24 md:py-[200px]">
        <BottomCta />
      </ScrollReveal>
      <Footer />
    </>
  );
}
