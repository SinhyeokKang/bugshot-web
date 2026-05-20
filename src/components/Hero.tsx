import Image from "next/image";
import { SiGooglechrome } from "@icons-pack/react-simple-icons";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/constants";

export function Hero() {
  const t = useTranslations("hero");
  const subcopy = t.raw("subcopy") as string[];

  return (
    <section className="pt-20 pb-12 md:pt-[120px] md:pb-[60px]">
      <div className="container mx-auto flex max-w-[1200px] flex-col items-center text-center">
        <Image
          src="/bugshot-symbol.svg"
          alt={t("logoAlt")}
          width={88}
          height={88}
          priority
          className="h-16 w-16 md:h-[88px] md:w-[88px]"
        />
        <h1 className="mt-8 text-4xl font-bold tracking-tight md:text-[60px] md:leading-[1.28]">
          {t("heading")}
        </h1>
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
