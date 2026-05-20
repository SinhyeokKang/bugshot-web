import { useTranslations } from "next-intl";

const GITHUB_URL = "https://github.com/SinhyeokKang/bugshot-2";
const PRIVACY_POLICY_URL = "https://sinhyeokkang.github.io/bugshot-2/privacy";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="px-10 py-[60px]">
      <div className="container mx-auto flex max-w-[1200px] items-center justify-center gap-10 text-base text-muted-foreground">
        <span>{t("copyright")}</span>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground"
        >
          {t("github")}
        </a>
        <a
          href={PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground"
        >
          {t("privacy")}
        </a>
      </div>
    </footer>
  );
}
