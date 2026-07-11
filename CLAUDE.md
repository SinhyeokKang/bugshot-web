# CLAUDE.md

bugshot-web: BugShot Chrome 확장의 랜딩 페이지 + 문서 사이트. 정적 사이트로 제품 소개 + 웹스토어 설치 CTA(랜딩), 개인정보처리방침(`/privacy`), 가이드 docs 포털(`/docs`)을 제공한다. privacy·guide 콘텐츠는 bugshot-2 마크다운을 빌드타임 fetch해 내재화(SEO를 `bug-shot.com`에 집중).

사용자는 한국어로 간결한 답변을 선호한다. 불필요한 꾸밈말·서두 금지.

## 작업 원칙

- **가정을 명시**: 해석이 여러 개면 조용히 하나 고르지 말고 선택지를 제시. 불확실하면 물어라.
- **더 단순한 방법이 있으면 제안**: 요청하지 않은 유연성·설정 가능성·추상화 추가 금지.
- **외과적 변경**: 요청과 직접 관련 없는 인접 코드 개선·리팩터 금지. 기존 스타일 따르기.
- **검증 가능한 목표로 전환**: 멀티스텝 작업은 단계별 검증 체크를 포함한 플랜을 먼저 제시.

## 스코프 & 제약

- **스코프 외**: 블로그·프라이싱·뉴스레터 폼 등은 추가 안 함. 폼 같은 동적 기능 필요 시 외부 서비스(Tally 등) 검토.
- **콘텐츠 내재화**: 가이드 docs·개인정보처리방침은 bugshot-2(`docs/privacy.{ko,en}.md`, `guide/{ko,en}/**`)를 빌드타임 fetch. 이 레포엔 미커밋(gitignore). 원본 push 시 Vercel Deploy Hook으로 자동 재배포.
- **품질 목표**: Lighthouse Performance ≥ 90, SEO ≥ 90. (docs 페이지도 고유 canonical·hreflang·OG·BreadcrumbList JSON-LD.)
- **정적 export 제약**: `output: 'export'`라 API Routes·서버 동적 기능·미들웨어 사용 불가. bare 경로 locale 감지 불가(→ vercel rewrite로 기본 en 서빙). `next/image`는 `images.unoptimized: true` 필수.

## 스택

- Next.js 15 App Router + TypeScript + React 19
- `output: 'export'` (정적 내보내기) + `images: { unoptimized: true }`
- Tailwind CSS v3 + `tailwindcss-animate` + `@tailwindcss/typography` 플러그인 + shadcn/ui (style `new-york`, base color `gray`)
- 마크다운 렌더: `react-markdown` + `remark-gfm` + `rehype-slug` (privacy·docs 공용 `Markdown` 컴포넌트, shadcn Typography 클래스로 요소별 스타일). 앵커 slug 일치용 `github-slugger`.
- docs 검색: `cmdk`(shadcn command) + `fuse.js`. 빌드타임 인덱스(`public/search/{locale}.json`) 클라이언트 퍼지 검색.
- 아이콘: lucide-react (UI 일반), `@icons-pack/react-simple-icons` (브랜드 — `Si{Name}` import, `color="default"` + GitHub만 `dark:invert`)
- 폰트: DM Sans (next/font/google, Latin) + Pretendard Variable (CDN, 한글). font stack에서 문자 기반 자동 분기.
- i18n: next-intl (`defaultLocale: "en"`, `localePrefix: "always"`, routing `/ko`, `/en`). Vercel rewrite로 `/`·`/privacy`·`/docs/*` → 기본 **en** 서빙(크롤러·SEO 기준선 = en, x-default도 `/en`). **ko 브라우저는 Vercel edge `redirects`로 `/ko` 자동 안내**(`Accept-Language`가 "ko로 시작" + `sec-fetch-dest: document`; 수동 선택은 `NEXT_LOCALE` 쿠키 우선). ⚠️ `vercel.json` `has.value`는 헤더 값 **전체 매칭** — 정규식 뒤에 `.*` 필수.
- 테스트: Vitest (순수 함수·정규식 회귀만. 컴포넌트·레이아웃은 브라우저 검증). `src/**/__tests__/*.test.ts`.
- 배포: Vercel (정적 호스팅). bugshot-2 콘텐츠 push → Deploy Hook으로 자동 재빌드.
- 패키지 매니저: pnpm

## 명령어

| 용도 | 명령 |
|---|---|
| 개발 서버 | `pnpm dev` |
| 빌드 | `pnpm build` |
| 타입 체크만 | `npx tsc --noEmit` |
| 린트 | `pnpm lint` |
| 유닛 테스트 | `pnpm test` (Vitest, `vitest run`) |

`dev`·`build`는 먼저 콘텐츠 fetch + 검색 인덱스 + 임베드 메타 스크립트를 체이닝한다: `fetch-privacy.mjs && fetch-guide.mjs && build-search.mjs && build-embeds.mjs && next dev|build`. (bugshot-2 public repo에서 privacy·guide를 받아 `content/`·`public/docs`·`public/search`로 전개, guide의 `{% embed %}` URL은 OG 메타를 받아 `content/guide/embeds.json`으로 — 전부 gitignore.)

**빌드는 자동 실행하지 않는다.** 사용자가 명시적으로 요청하거나 `/build` 스킬을 실행할 때만 돌린다. ⚠️ **dev 서버 실행 중 `pnpm build` 금지** — 같은 `.next`를 덮어써 dev가 깨진다(복구: dev 종료 → `rm -rf .next` → 재시작).

## 디렉터리 구조

```
scripts/
├── fetch-privacy.mjs       # 빌드 전: bugshot-2 privacy.{ko,en}.md → content/privacy
├── fetch-guide.mjs         # 빌드 전: bugshot-2 guide/{ko,en} tarball → content/guide + public/docs/{locale}/assets
├── build-search.mjs        # 빌드 전: guide 콘텐츠 → public/search/{locale}.json (검색 인덱스)
├── build-embeds.mjs        # 빌드 전: guide의 {% embed url %} → OG 메타 fetch → content/guide/embeds.json (링크 카드)
└── lib/fetch-retry.mjs     # 공용 fetch 헬퍼 (429·5xx·네트워크 오류 지수 백오프 재시도) — 위 세 fetch 스크립트 공용
src/
├── app/
│   ├── layout.tsx          # 최상위 RootLayout — passthrough (viewport/metadata만; <html>/<body>·DM Sans·globals.css는 [locale]/layout으로 이동)
│   ├── globals.css         # Tailwind directives + shadcn CSS 변수 (--sidebar-* 포함, light only). Pretendard는 [locale]/layout의 hoisted <link rel=stylesheet>+preconnect로 로드(구 @import 대체)
│   ├── icon.svg · favicon.ico · apple-icon.png
│   ├── sitemap.ts          # /sitemap.xml — 랜딩·privacy·docs 전 slug × locale alternates
│   ├── robots.ts           # /robots.txt — allow all + Sitemap 지시문
│   └── [locale]/
│       ├── layout.tsx      # <html lang>/<body> + DM Sans + Pretendard link + NextIntlClientProvider + generateStaticParams + generateMetadata
│       ├── page.tsx        # 랜딩 (전역 DocsHeader + 섹션 조합 + 랜딩 JSON-LD)
│       ├── privacy/page.tsx        # 개인정보처리방침 (Markdown + DocsShell, nav 없음)
│       └── docs/[[...slug]]/page.tsx # 가이드 catch-all (generateStaticParams·metadata·BreadcrumbList JSON-LD + DocsShell)
├── components/
│   ├── ui/                 # shadcn/ui (accordion·button·dialog·sheet·command·textarea)
│   ├── Hero·Mockup·FeatureCards·HowItWorks·Review·Faq·BottomCta·ScrollReveal  # 랜딩 섹션
│   ├── Footer.tsx          # © + GitHub·개인정보처리방침(/privacy) 링크
│   ├── LocaleSwitcher.tsx  # locale 토글 캡슐 (인라인, className으로 위치 조정)
│   ├── Markdown.tsx         # 공용 마크다운 렌더 (react-markdown, shadcn Typography 요소 매핑) — privacy·docs. embed 코드펜스 → EmbedCard
│   └── docs/               # 전역 헤더 + 문서 사이트 셸·구성요소
│       ├── DocsShell.tsx    # 헤더 + (docs)서브헤더바 + (옵션)사이드바 + 본문 + 우측 TOC + Footer 단일 셸 (privacy·docs 공용)
│       ├── DocsHeader.tsx   # 전역 sticky 헤더 (랜딩·privacy·docs 공용): 로고+nav(좌) / 검색·LocaleSwitcher·모바일메뉴(우)
│       ├── DocsHeaderNav.tsx # 데스크톱 중앙 nav (client, Guide·Contact·Add to Chrome, path matching active)
│       ├── HeaderMobileMenu.tsx # 모바일 우측 Sheet 드로어 (nav + 하단 LocaleSwitcher)
│       ├── DocsSidebar.tsx  # SUMMARY nav (client, active 하이라이트)
│       ├── DocsMobileNav.tsx# docs 모바일 서브헤더 바 ({docName}+chevron) → 하단 Sheet(90dvh)로 SUMMARY
│       ├── DocsSearch.tsx   # cmdk + fuse.js 전역 검색: 아이콘 버튼 → 다이얼로그(모바일 풀스크린), 빈 쿼리 시 부모 문서만, / 단축키
│       ├── DocsPager.tsx    # 이전/다음 문서
│       ├── EmbedCard.tsx    # GitBook {% embed url %} → OG 링크 카드 (빌드타임 메타)
│       └── TocNav.tsx       # 우측 앵커 TOC (IntersectionObserver 스크롤스파이)
├── hooks/useScrollReveal.ts
├── i18n/                   # routing.ts · navigation.ts · request.ts (next-intl)
└── lib/
    ├── constants.ts        # SITE_URL·CHROME_WEB_STORE_URL·GITHUB_URL 등 + FAQ/REVIEW/HOW_KEYS + 내부 docs 경로 맵(FAQ_GUIDE_PATHS, HOW_GUIDE_PATHS)
    ├── utils.ts            # cn()
    ├── locale-redirect.ts  # localeSwitchHref(pathname, next) — LocaleSwitcher 경로 계산 (Vitest 커버)
    ├── docs/               # summary(SUMMARY 파서·findParent·flattenNav) · content(slug↔파일) · markdown(정규화) · toc · metadata(docPageMetadata·BreadcrumbList) · embeds(embeds.json 로드)
    └── i18n/en.json · ko.json
public/                     # bugshot-symbol.svg + images/ (+ 빌드 fetch: docs/·search/ = gitignore)
content/                    # 빌드 fetch: privacy/·guide/ (gitignore)
vercel.json                 # redirects(ko 브라우저 → /ko, 쿠키/sec-fetch-dest 게이팅) + rewrite(/ · /privacy · /docs · /docs/:path* → 기본 en)
vitest.config.ts            # Vitest 설정 (@/ alias, src/**/*.test.ts)
```

## 릴리스 & 버전

### 버전 체계

semver(`MAJOR.MINOR.PATCH`). `package.json`의 `version` 기준.

### 브랜치 정책

- 단일 브랜치 **`main`** 직접 작업. 평소엔 main에 바로 push.
- 큰 변경(브레이킹·실험적 리팩터)은 임시 feature 브랜치 → PR로 머지.
- Vercel production branch = `main`. main push 시 자동 배포.

### 워크플로우 (스킬 라인업)

```
/feature        → 기능 아이디어 → PRD·기술 설계·태스크 문서 산출
/feature-review → feature 산출물을 CPO·CDO·CTO·QA Lead 4명이 병렬 검수
/tdd            → 테스트만 작성 (구현·픽스·커밋 안 함)
/pull           → main 최신 받고 작업 맥락 브리핑
/build          → pnpm build + 테스트 체크리스트
/code-review    → origin/main 대비 변경 코드 시급도별 리포트
/audit          → 코드베이스 전체 컨벤션·패턴 감사
/push           → main push (큰 변경 직전엔 /build 먼저 권장)
```

main push 시 Vercel이 자동 빌드·배포한다. 별도 deploy 액션 불필요.

### 문서 신선도

`/push`는 항상 CLAUDE.md / README.md 신선도 검사를 거친다. 아래 중 하나라도 해당하면 문서 갱신:

- 새 디렉터리·파일 추가/삭제
- `package.json` scripts 변경
- 새 컴포넌트·섹션 추가/삭제
- 기능 추가/삭제로 README의 설명이 어긋남
- 워크플로우/스킬 라인업 변경

## 코드 컨벤션

- 경로: `@/` → `src/`
- **UI 컴포넌트**: shadcn/ui 우선. 없으면 `npx shadcn@latest add <component>`로 설치.
- Tailwind: shadcn CSS 변수 사용, 커스텀 색상 남발 금지.
- 브랜드 컬러: `--brand` (HSL `221 83% 53%` = #2563EB) → `text-brand` / `bg-brand`. 헤드라인 안 wordplay 강조에만 사용 (next-intl `t.rich` + i18n 메시지의 `<brand>...</brand>` 토큰).
- **반응형**: 브레이크포인트는 `md:` (768px) **단일**만 사용. 모바일 기본값 → `md:`에서 데스크톱 사이즈로 전환. 각 요소는 최솟값(모바일)과 최댓값(데스크톱)만 정의 — `sm:`·`lg:`·`xl:` 등 중간값 사용 금지. 예외: FeatureCards는 컨테이너 max-w(1200px)와 일치시키기 위해 `min-[1200px]:`로 2칼럼 전환.
- **섹션 구조**: outer `<section>`은 뷰포트 full width + `border-b`(divider, viewport 가로지름) + padding-y. inner `<div className="container mx-auto max-w-[1200px]">`가 콘텐츠 컨테이너. Hero·Footer는 border-b 없음.
- CTA 버튼: 모든 CTA는 `size="xl"`. 모바일 `h-12 / pl-6 pr-7 / text-base`, md+ `h-14 / pl-7 pr-8 / text-lg`. 공통: `gap-3 rounded-2xl`, svg 20. 좌측 Chrome 아이콘(`SiGooglechrome color="currentColor"`) + "Add to Chrome" 단일 텍스트. Figma 디자인 기준.
- 커밋 메시지·PR title/body는 **영문**으로 작성.
- 주석 최소화. WHY가 비자명할 때만 한 줄.
- Dark mode는 스코프 외 (light only).

## 관련 프로젝트

- **bugshot-2** (`~/code/bugshot-2/`): Chrome 확장 본체. 이 랜딩 사이트는 bugshot-2의 기능을 소개하는 독립 프로젝트.
- 기능 기획 문서: `~/code/bugshot-2/docs/features/bugshot-web/` (PRD, design, tasks)
