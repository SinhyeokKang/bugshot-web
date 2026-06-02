import { useLocale, useTranslations } from "next-intl";
import {
  GITHUB_URL,
  PRIVACY_POLICY_URL,
  CONTACT_EMAIL,
  GUIDE_URL,
} from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="px-10 py-[60px]">
      <div className="container mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground/80">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          {t("github")}
        </a>
        <a
          href={`${GUIDE_URL}/${locale}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:text-brand focus-visible:text-brand focus-visible:outline-none"
        >
          {t("guide")}
        </a>
        <a
          href={PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          {t("privacy")}
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          {t("contact")}
        </a>
      </div>
    </footer>
  );
}
