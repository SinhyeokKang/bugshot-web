import { SiGooglechrome } from "@icons-pack/react-simple-icons";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");
  const subcopy = t.raw("subcopy") as string[];

  return (
    <footer className="py-24 md:py-[200px]">
      <div className="container mx-auto flex max-w-[1200px] flex-col items-center text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-[60px] md:leading-[1.28]">
          {t("heading")}
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
        <span className="mt-8 text-base text-muted-foreground">
          {t("copyright")}
        </span>
      </div>
    </footer>
  );
}
