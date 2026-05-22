import { getTranslations } from "next-intl/server";

export async function Review() {
  const t = await getTranslations("review");

  return (
    <div className="container mx-auto max-w-[960px] flex flex-col items-center gap-5">
      <h2 className="sr-only">{t("srHeading")}</h2>
      <p className="text-sm text-muted-foreground md:text-base">
        {t("author")}
      </p>
      <blockquote className="text-center text-xl font-medium leading-[140%] tracking-tight md:text-[32px]">
        {`"${t("quote")}"`}
      </blockquote>
      <cite className="not-italic text-sm text-muted-foreground md:text-base">
        {t("source")}
      </cite>
    </div>
  );
}
