import { SiGooglechrome } from "@icons-pack/react-simple-icons";
import { getTranslations } from "next-intl/server";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL, CHROME_WEB_STORE_RATING } from "@/lib/constants";

export async function BottomCta() {
  const t = await getTranslations("bottomCta");
  const subcopy = t.raw("subcopy") as string[];

  return (
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
      <span className="mt-4 inline-flex items-center gap-1.5 text-base text-muted-foreground">
        <Star className="h-3.5 w-3.5 fill-brand text-brand md:h-4 md:w-4" />
        {t("rating", {
          rating: CHROME_WEB_STORE_RATING.ratingValue.toFixed(1),
          count: CHROME_WEB_STORE_RATING.ratingCount,
        })}
      </span>
    </div>
  );
}
