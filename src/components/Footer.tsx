import { useTranslations } from "next-intl";
import { GITHUB_URL, PRIVACY_POLICY_URL, CONTACT_EMAIL } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="px-10 py-[60px]">
      <div className="container mx-auto flex max-w-[1200px] items-center justify-center gap-6 text-sm text-muted-foreground/80">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          {t("github")}
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
