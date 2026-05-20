import { useTranslations } from "next-intl";

export function Review() {
  const t = useTranslations("review");

  return (
    <section className="border-b py-20 md:py-[120px]">
      <div className="container mx-auto max-w-[1200px] flex flex-col items-center gap-5">
        <p className="text-sm text-muted-foreground md:text-base">
          {t("author")}
        </p>
        <blockquote className="text-center text-xl font-medium leading-[140%] tracking-tight md:text-[32px]">
          {`“${t("quote")}”`}
        </blockquote>
        <p className="text-sm text-muted-foreground md:text-base">
          {t("source")}
        </p>
      </div>
    </section>
  );
}
