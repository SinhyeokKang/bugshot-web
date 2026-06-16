export const SITE_URL = "https://bug-shot.com";
export const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/bugshot/ohakhekagkodklkickemonmifdcbhmig";
export const CHROME_WEB_STORE_REVIEWS_URL = `${CHROME_WEB_STORE_URL}/reviews`;
export const GITHUB_URL = "https://github.com/SinhyeokKang/bugshot-2";
export const GUIDE_URL = "https://bugshot.gitbook.io";
export const PRIVACY_POLICY_URL =
  "https://sinhyeokkang.github.io/bugshot-2/privacy";
export const CONTACT_EMAIL = "ox501501@gmail.com";

export const FAQ_KEYS = [
  "pricing",
  "browser",
  "ai",
  "integrations",
  "privacy",
] as const;

// FAQ 답변 inline 링크용 — 가이드 내 세부 문서 경로 (locale prefix 뒤에 붙음)
export const FAQ_GUIDE_PATHS: Partial<
  Record<(typeof FAQ_KEYS)[number], string>
> = {
  browser: "/readme/quick-start",
  ai: "/settings/ai",
  integrations: "/integrations",
};

export const REVIEW_KEYS = ["qe", "designer", "backend", "frontend"] as const;

export const REVIEW_RATINGS: Record<(typeof REVIEW_KEYS)[number], number> = {
  qe: 5,
  designer: 5,
  backend: 5,
  frontend: 5,
};

export const HOW_KEYS = [
  "connectTracker",
  "captureMode",
  "editStyles",
  "aiDraft",
  "submitReport",
  "trackIssues",
] as const;

// HowItWorks 스텝 설명 inline 링크용 — 가이드 내 세부 문서 경로 (locale prefix 뒤에 붙음)
export const HOW_GUIDE_PATHS: Partial<
  Record<(typeof HOW_KEYS)[number], string>
> = {
  connectTracker: "/integrations",
  editStyles: "/element/styling",
  aiDraft: "/settings/ai",
};
