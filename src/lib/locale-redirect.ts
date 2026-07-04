import { type Locale } from "@/i18n/routing";

// LocaleSwitcher 경로 계산. usePathname()이 주는 실제 브라우저 경로(bare 또는
// prefixed)를 받아 목적 locale로 전환할 href를 반환한다. bare 경로엔 locale
// prefix가 없으므로 실제 세그먼트만 제거해야 한다(`/privacy`→`/enivacy` 방지).
export function localeSwitchHref(pathname: string, next: Locale): string {
  const stripped = pathname.replace(/^\/(ko|en)(?=\/|$)/, "");
  return stripped === "" || stripped === "/" ? `/${next}` : `/${next}${stripped}`;
}
