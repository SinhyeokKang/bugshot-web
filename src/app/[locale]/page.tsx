import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  SITE_URL,
  CHROME_WEB_STORE_URL,
  FAQ_KEYS,
} from "@/lib/constants";
import { Hero } from "@/components/Hero";
import { Mockup } from "@/components/Mockup";
import { FeatureCards } from "@/components/FeatureCards";
import { Faq } from "@/components/Faq";
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
  const t = await getTranslations({ locale, namespace: "meta" });
  const faqT = await getTranslations({ locale, namespace: "faq" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BugShot",
    description: t("description"),
    url: `${SITE_URL}/${locale}`,
    image: `${SITE_URL}/og-image.png`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Chrome",
    inLanguage: locale,
    author: {
      "@type": "Person",
      name: "Sinhyeok Kang",
      url: "https://github.com/SinhyeokKang",
    },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    downloadUrl: CHROME_WEB_STORE_URL,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${SITE_URL}/${locale}`,
    mainEntity: FAQ_KEYS.map((key) => ({
      "@type": "Question",
      name: faqT(`items.${key}.q`),
      acceptedAnswer: {
        "@type": "Answer",
        text: faqT(`items.${key}.a`),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
        <section aria-labelledby="features-reporter-heading" className="border-b py-20 md:py-[120px]">
          <FeatureCards group="reporter" />
        </section>
        <section aria-labelledby="features-dev-heading" className="border-b py-20 md:py-[120px]">
          <FeatureCards group="dev" />
        </section>
        <section aria-labelledby="how-heading" className="border-b py-20 md:py-[120px]">
          <HowItWorks />
        </section>
        <ScrollReveal className="border-b py-20 md:py-[120px]">
          <Review />
        </ScrollReveal>
        <section aria-labelledby="faq-heading" className="border-b py-20 md:py-[120px]">
          <Faq />
        </section>
        <ScrollReveal className="py-24 md:py-[200px]">
          <BottomCta />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
