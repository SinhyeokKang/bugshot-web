import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GITHUB_URL } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="px-10 py-[60px]">
      <div className="container mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground/80">
        <span>© 2026 BugShot</span>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          {t("github")}
        </a>
        <Link
          href="/privacy"
          className="hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          {t("privacy")}
        </Link>
      </div>
    </footer>
  );
}
