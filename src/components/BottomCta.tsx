"use client";

import { SiGooglechrome } from "@icons-pack/react-simple-icons";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function BottomCta() {
  const t = useTranslations("bottomCta");
  const { ref, revealed } = useScrollReveal<HTMLElement>();
  const subcopy = t.raw("subcopy") as string[];

  return (
    <section ref={ref} className={cn("py-24 md:py-[200px] transition-all duration-1500 ease-out", revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
      <div className="container mx-auto flex max-w-[1200px] flex-col items-center text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-[60px] md:leading-[1.28]">
          {t.rich("heading", {
            brand: (chunks) => <span className="text-brand">{chunks}</span>,
          })}
        </h2>
        <p className="mt-4 text-xl leading-snug text-foreground md:text-2xl">
          {subcopy.map((line, i) => (
            <span key={i}>
              {line}
              {i < subcopy.length - 1 && <br />}
            </span>
          ))}
        </p>
        <Button asChild size="xl" className="mt-8">
          <a
            href={CHROME_WEB_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiGooglechrome color="currentColor" />
            {t("cta")}
          </a>
        </Button>
        <span className="mt-4 text-base text-muted-foreground">
          {t("note")}
        </span>
      </div>
    </section>
  );
}
