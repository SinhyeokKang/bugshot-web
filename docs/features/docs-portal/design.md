# Docs Portal — 기술 설계

## 개요

빌드 전(prebuild) bugshot-2 public tarball에서 `guide/{ko,en}`을 받아 `content/`로 전개하고, 마크다운을 next-intl `[locale]` 아래 catch-all 라우트로 정적 프리렌더한다. `SUMMARY.md`를 사이드바의 단일 소스로, `react-markdown`으로 본문을, Pagefind로 정적 검색을 붙인다. 콘텐츠 변경은 Vercel Deploy Hook + bugshot-2 GitHub Action으로 재빌드를 트리거해 Gitbook 자동발행을 대체한다.

## 변경 범위

### 신규 파일

- `scripts/fetch-guide.mjs` — 빌드 전 실행. `https://codeload.github.com/SinhyeokKang/bugshot-2/tar.gz/refs/heads/main` tarball 다운로드 → `guide/ko`·`guide/en`만 추출. 마크다운은 `content/guide/{locale}/**`, `assets/**`는 `public/docs/{locale}/assets/**`로 복사. (public repo라 인증 불필요.)
- `src/lib/docs/summary.ts` — `SUMMARY.md`(마크다운 리스트) 파서 → nav 트리. 파일↔slug 매핑 규칙 보유.
- `src/lib/docs/content.ts` — 파일시스템 문서 로더. slug→파일 해석, 첫 H1에서 제목 추출, 전체 slug 목록(generateStaticParams용).
- `src/lib/docs/markdown.ts` — 마크다운 정규화 + remark/rehype 플러그인 구성. 이미지 경로 재작성, `bugshot.gitbook.io` 링크 정규화/제거, `{% embed %}` 전처리.
- `src/components/docs/Markdown.tsx` — `react-markdown` 래퍼(prose 스타일 + 컴포넌트 매핑).
- `src/app/[locale]/docs/layout.tsx` — docs 셸: 공용 `SiteHeader`(검색 슬롯 포함) + 좌측 `DocsSidebar` + 본문 슬롯 + 기존 `Footer` 재사용.
- `src/app/[locale]/docs/[[...slug]]/page.tsx` — catch-all. `generateStaticParams`(전 locale×전 slug, 빈 slug 포함), `generateMetadata`(title·description·canonical + openGraph override), 본문 렌더.
- `src/components/docs/DocsSidebar.tsx` — SUMMARY nav 트리 렌더, 현재 경로 active. 데스크톱 고정, 모바일은 헤더 햄버거 → shadcn `sheet` 드로어(신규 설치). 포커스 트랩·Esc 닫기·`aria-expanded` 포함.
- `src/components/docs/DocsSearch.tsx` (client) — Pagefind 기반 검색. shadcn `dialog` 재사용. 검색 아이콘 버튼 + `Cmd+K` 트리거. 상태: 로딩(Pagefind 비동기 로드) / 무결과 empty / dev 인덱스 부재 degrade.
- `src/components/SiteHeader.tsx` (sticky) — 랜딩/docs 공용 글로벌 헤더(BugShot 로고→홈 + Docs 링크 + `LocaleSwitcher` 흡수). docs에선 검색 슬롯 추가 주입. 랜딩·docs 상단에 삽입. 기존 fixed `LocaleSwitcher`는 제거·헤더로 흡수.

### 수정 파일

- `src/app/[locale]/page.tsx` — `SiteHeader` 삽입, 기존 fixed `<LocaleSwitcher />` 제거(헤더로 흡수). `[locale]/layout.tsx`에 있던 랜딩용 JSON-LD(`SoftwareApplication`+`FAQPage`)를 여기로 내려 docs 라우트 누수 차단.
- `src/app/[locale]/layout.tsx` — 랜딩 전용 JSON-LD를 `page.tsx`로 이관(docs 하위 라우트에 스키마 미주입).
- `src/app/sitemap.ts` — docs 전 slug × locale + alternates 추가.
- `vercel.json` — `/docs` **및** `/docs/:path*` → `/ko/docs/...` rewrite 2룰 추가(bare `/docs` 미매칭 방지, 기존 `/`→`/ko` 패턴 확장).
- `package.json` — deps 추가 및 scripts 변경(아래).
- `tailwind.config.ts` — `plugins`에 `@tailwindcss/typography` 추가.
- `.gitignore` — `content/`, `public/docs/` 추가.
- `src/lib/i18n/ko.json`·`en.json` — 헤더/검색 라벨(`docs.nav`, `docs.search.*` 등) 추가.

**package.json scripts**
```jsonc
// fetch를 build에 인라인 체이닝 — Vercel이 next build를 직접 호출해도 fetch·pagefind 누락 없음
// (pnpm prebuild lifecycle 훅은 `pnpm build` 경유 시에만 발동하므로 의존하지 않음)
"build": "node scripts/fetch-guide.mjs && next build && pagefind --site out",
"predev": "node scripts/fetch-guide.mjs"   // dev에서도 content 필요
```
**deps**: `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code`(또는 `rehype-highlight`) / **devDeps**: `@tailwindcss/typography`, `pagefind`.

### 외부(bugshot-2 레포, 선행)

- `.github/workflows/trigger-web-deploy.yml` — `guide/**` push 시 Vercel Deploy Hook을 `curl`로 호출.
- Vercel Deploy Hook URL을 bugshot-2 repo secret으로 등록.

## 데이터 흐름

**빌드**: `prebuild` fetch → `content/guide/{locale}/**`(md) + `public/docs/{locale}/assets` → `generateStaticParams`가 content 순회 → 페이지별 SSG(마크다운 정규화·렌더) → `next build` → `pagefind --site out`이 `out/` 인덱싱 → `out/pagefind/`.

**런타임(정적)**: 브라우저가 `/{locale}/docs/**` HTML 로드. 검색 시 `/pagefind/*` 로드.

**단일 소스**: `SUMMARY.md` = 사이드바 순서·계층의 유일 소스. 문서 존재·제목 = 파일시스템.

## 인터페이스 설계

```ts
// src/lib/docs/summary.ts
export interface DocsNavNode {
  title: string;        // SUMMARY 링크 텍스트
  slug: string[];       // ['integrations','platforms'] — README는 부모 slug
  href: string;         // `/${locale}/docs/${slug.join('/')}`
  children?: DocsNavNode[];
}
export function parseSummary(md: string, locale: string): DocsNavNode[];

// src/lib/docs/content.ts
export interface DocPage {
  slug: string[];
  title: string;        // 첫 H1
  markdown: string;     // 정규화 전 원본
  filePath: string;
}
export function getAllDocSlugs(locale: string): string[][];       // generateStaticParams
export function getDoc(locale: string, slug: string[]): DocPage | null;

// src/lib/docs/markdown.ts
export function normalizeMarkdown(md: string, locale: string): string;
```

**파일→slug 규칙**: `guide/{locale}/` 기준 상대경로에서 `.md` 제거. `README.md` → 부모 디렉터리 slug(루트 `README.md` → `[]`). 예: `settings/ai.md` → `['settings','ai']`, `integrations/README.md` → `['integrations']`.

## 기존 패턴 준수

- 섹션/컨테이너 구조, `md:` 단일 브레이크포인트, shadcn CSS 변수 컬러(커스텀 색 남발 금지).
- `generateMetadata`·canonical·alternates 패턴은 `[locale]/layout.tsx`를 그대로 차용.
- next-intl 메시지는 ko/en 동시 갱신.
- static export: catch-all은 `dynamicParams` 기본 false + 전 slug 열거. optional catch-all 루트(`{ slug: [] }`)로 `/docs` index 프리렌더. 마찰 크면 `[...slug]` + 별도 `docs/page.tsx`(index)로 분리하는 폴백.
- prose는 `@tailwindcss/typography` + 기존 CSS 변수로 테마(라이트 온리). 커스터마이즈 범위: 링크색=`--brand`, 코드블록(하이라이트), 이미지 `--radius`, GFM 테이블 스타일.
- 메타: docs `generateMetadata`는 canonical·title·description에 더해 `openGraph`(title/description) 최소 override — 미override 시 부모 `[locale]/layout.tsx`의 랜딩 OG(og-image·title)가 병합 상속됨.

## 대안 검토

1. **콘텐츠 vendoring(레포 커밋)** — 재현성·오프라인 빌드 유리하나 커밋 노이즈 + 리뷰 게이트로 "자동발행" UX 저하. 사용자 선택은 fetch.
2. **Nextra/Starlight 통째 도입** — 기존 next-intl·커스텀 레이아웃·정적 export와 충돌, 프레임워크 이중화. 자체 catch-all이 마찰 최소이고 랜딩과 디자인 통일 가능.
3. **Gitbook 커스텀 도메인(유료)** — 비용 발생. 목표(무료 SEO 내재화)와 배치. 기각.
4. **런타임 검색(Algolia 등)** — 외부 의존·비용. Pagefind(정적·무료·빌드 인덱싱)로 대체.

## 위험 요소

- **콘텐츠 내 gitbook.io 하드코딩 링크**: 마크다운에 `🌐 [English](https://bugshot.gitbook.io/en/readme/quick-start)` 같은 수동 언어 링크·상호 참조가 거의 전 문서에 존재. 인라인 언어전환 링크는 **bugshot-2 소스에서 제거**(이 레포 스코프 외, LocaleSwitcher가 대체). 그 외 본문 상호참조 gitbook.io 링크는 `normalizeMarkdown`에서 내부 매핑/제거. 미처리 시 외부 Gitbook으로 튕김.
- **JSON-LD 누수**: `[locale]/layout.tsx`의 `SoftwareApplication`+`FAQPage` 스키마가 docs 전 하위 라우트에 주입됨. → JSON-LD를 랜딩 `page.tsx`로 이관해 차단(수정 파일 참조).
- **OG 병합 상속**: Next는 canonical만 자식이 덮고 openGraph는 부모와 병합. docs가 랜딩 og-image/title을 물려받으므로 docs `generateMetadata`에서 openGraph 최소 override 필수.
- **fetch 부분 실패의 조용한 성공**: tarball fetch·전개 중간 실패 시 부분 content로 빌드가 성공하면 누락 slug만 사라짐. fetch 스크립트에 SUMMARY 항목 수 vs 실제 파일 수 정합 assert + 실패 시 non-zero exit 필수(단순 "재시도 고려"로는 불충분).
- **vercel rewrite bare `/docs`**: `/docs/:path*`는 슬래시 없는 `/docs`를 놓칠 수 있음 → `/docs` + `/docs/:path*` 2룰로 분리.
- **ko/en SUMMARY 비대칭**: LocaleSwitcher는 경로를 통짜 치환 → 한쪽에만 있는 slug면 404. 빌드 시 ko↔en slug 집합 diff 검증(비대칭 경고) + LocaleSwitcher 런타임 폴백(대상 slug 부재 시 docs 루트).
- **Gitbook URL 스킴 불일치**: Gitbook은 루트 문서를 `/readme/...`로 냄. 내부 route는 `readme/` 없음 → 기존 `FAQ_GUIDE_PATHS`(`/readme/quick-start`)와 불일치. 해당 링크 전환은 스코프 외지만, 후속 전환 시 `/readme/quick-start` → `/quick-start` 매핑 주의.
- **빌드 네트워크 의존**: bugshot-2 tarball fetch 실패·깨진 콘텐츠 → prod 빌드 실패. fetch 스크립트에 명확한 에러·재시도 고려.
- **Pagefind ↔ static export 순서**: pagefind는 `next build` 후 `out/` 대상으로 실행. fetch→build→pagefind를 `build` 스크립트에 인라인 체이닝해 Vercel이 `next build`를 직접 호출해도 순서 보장. dev엔 인덱스 부재 → graceful degrade.
- **이미지 용량**: locale당 68장(합 136). `public/docs`로 복사 → out 크기·빌드 시간 증가. unoptimized라 원본 서빙.
- **catch-all + i18n 정적 생성**: `[[...slug]]` optional catch-all과 `[locale]` 중첩 SSG 검증 필요.
- **SEO 중복**: 새 docs 인덱싱 시 gitbook.io와 중복 콘텐츠로 권위 분산. Gitbook noindex/내림(후속)까지는 완전 통합 아님.
- **테스트 인프라 부재**: 현재 레포에 테스트 러너 없음. 순수 함수 단위 테스트는 vitest 도입 필요(스코프 외) → 기본은 수동 검증.
