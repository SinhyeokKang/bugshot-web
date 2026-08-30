# Metadata & Freshness — 기술 설계

## 개요
이미 존재하는 `docMtime`(`src/lib/docs/content.ts`)를 docs 페이지 렌더와 JSON-LD로 확장하고, sitemap의 landing/privacy lastmod를 소스 mtime으로 교체 + x-default 추가, privacy에 기존 `docsBreadcrumbJsonLd` 헬퍼 재사용. 신규 데이터 소스 없음.

## 변경 범위

- `src/lib/docs/content.ts` — 현재: `docMtime(locale, slug)` 존재(docs 전용). 변경: privacy/landing 소스 mtime을 위한 범용 헬퍼 추가(예: `fileMtime(absPath)`), 또는 privacy 전용 `privacyMtime(locale)`(=`content/privacy/{locale}.md` mtime). landing은 소스가 i18n 메시지라 `src/lib/i18n/{locale}.json` mtime 또는 수동 "last significant change" 상수 중 택1.
- `src/app/sitemap.ts` — 현재: landing/privacy `lastModified: new Date()`; alternates에 en/ko만. 변경:
  - landing `lastModified` → i18n 메시지 파일 mtime(또는 상수); privacy → `content/privacy/{locale}.md` mtime.
  - `languages`/`privacyLanguages`/docs alternates 각 맵에 `"x-default": localeUrl("en")`(privacy·doc은 각 x-default 경로) 추가.
- `src/app/[locale]/docs/[[...slug]]/page.tsx` — 현재: BreadcrumbList JSON-LD만, 신선도 없음. 변경: `docMtime(locale, slug)`로 (a) 가시적 "Last updated {date}" 렌더(DocsShell 본문 하단 또는 제목 아래), (b) `TechArticle`(또는 `Article`) JSON-LD에 `dateModified` 추가(별도 `<script>`). 날짜 포맷은 로케일 고려.
- `src/lib/docs/metadata.ts` — 현재: `docsBreadcrumbJsonLd`, `docPageMetadata`. 변경(선택): `dateModified` 포함 Article JSON-LD 빌더 추가(`docArticleJsonLd`), 또는 page.tsx에서 인라인 생성. privacy용 breadcrumb는 기존 `docsBreadcrumbJsonLd`에 빈 nav/slug + currentTitle 전달로 재사용(신규 헬퍼 불요).
- `src/app/[locale]/privacy/page.tsx` — 현재: JSON-LD 없음. 변경: `docsBreadcrumbJsonLd({ nav: [], slug: [], locale, currentTitle: title, path: "/privacy" })` 결과를 `<script type="application/ld+json">`로 렌더.

## 데이터 흐름
빌드타임: `statSync().mtime`(content.ts) → sitemap lastmod + docs 페이지 렌더/JSON-LD. i18n 메시지 파일 mtime → landing lastmod. 전부 정적, 런타임 없음. ⚠️ docs mtime은 tarball tip-commit 시각이라 25개 doc이 동일 값일 수 있음(감사 확인) — 신선도 표기는 되지만 per-file 정밀도는 아님(비목표).

## 인터페이스 설계
```ts
// content.ts (신규 범용 헬퍼)
export function fileMtime(absPath: string): Date | null;
// 또는 privacy 전용
export function privacyMtime(locale: string): Date | null;

// docs Article JSON-LD (metadata.ts 또는 page.tsx 인라인)
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": doc.title,
  "dateModified": docMtime(locale, slug)?.toISOString(),
  "inLanguage": locale,
  "url": `${SITE_URL}/${locale}${path}`
}
```

## 기존 패턴 준수
- CLAUDE.md: docs·privacy 공용 DocsShell, JSON-LD는 페이지에서 `<script dangerouslySetInnerHTML>`로 렌더(기존 breadcrumb 패턴 동일).
- `docPageMetadata`가 이미 x-default를 head에 넣음 — sitemap을 여기에 맞추는 방향(head가 authoritative).
- i18n: 날짜 포맷은 next-intl `format.dateTime` 또는 단순 ISO date 표기. en/ko 라벨("Last updated"/"마지막 업데이트") 동시.

## 대안 검토
- **landing lastmod 소스**: (A) i18n 메시지 파일 mtime(자동, 카피 변경 시 갱신) / (B) 수동 상수 `LANDING_LAST_MODIFIED`(의도적 관리). → A가 자동이나 무관한 메시지 변경에도 갱신됨. B가 정확하나 수동. → A 기본(privacy는 콘텐츠 파일이라 명확).
- **docs 신선도 JSON-LD 타입**: `Article` vs `TechArticle`. → 절차/가이드성 콘텐츠라 `TechArticle` 적합.
- **가시적 날짜 위치**: 제목 아래 vs 본문 하단(Pager 근처). → 본문 하단 권장(콘텐츠 방해 최소, "문서 신선도" 관례).

## 위험 요소
- docs mtime이 전부 동일(tarball) → "Last updated"가 25개 페이지 동일 날짜로 표기될 수 있음. 오해 소지 없으나 per-file 정밀화는 bugshot-2 패키징 개선 필요(비목표).
- i18n 파일 mtime을 landing lastmod로 쓰면 사소한 문구 수정에도 갱신 → 안티패턴 재현 위험(무의미 갱신). 빈번하지 않다면 허용, 잦으면 상수(B)로.
- privacy breadcrumb는 nav 없이 호출 — `docsBreadcrumbJsonLd`가 빈 nav에서 findParent가 안전히 빠지는지 확인(코드상 `findParent` 미발견 시 break → 2단계 체인 생성, 안전).
- Vitest 회귀: content.ts에 순수 함수 추가 시 테스트 추가 여지(`fileMtime`은 fs 의존이라 순수 아님 — 테스트 제외 가능).
