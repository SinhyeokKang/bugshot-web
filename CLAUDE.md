# CLAUDE.md

bugshot-web: BugShot Chrome 확장의 랜딩 페이지. 싱글 페이지 정적 사이트로, 제품 소개 + 웹스토어 설치 CTA를 제공한다.

사용자는 한국어로 간결한 답변을 선호한다. 불필요한 꾸밈말·서두 금지.

## 작업 원칙

- **가정을 명시**: 해석이 여러 개면 조용히 하나 고르지 말고 선택지를 제시. 불확실하면 물어라.
- **더 단순한 방법이 있으면 제안**: 요청하지 않은 유연성·설정 가능성·추상화 추가 금지.
- **외과적 변경**: 요청과 직접 관련 없는 인접 코드 개선·리팩터 금지. 기존 스타일 따르기.
- **검증 가능한 목표로 전환**: 멀티스텝 작업은 단계별 검증 체크를 포함한 플랜을 먼저 제시.

## 스택

- Next.js 14 App Router + TypeScript
- `output: 'export'` (정적 내보내기) + `images: { unoptimized: true }`
- Tailwind CSS v3 + shadcn/ui (style `new-york`, base color `gray`)
- 아이콘: lucide-react (UI 일반), `@icons-pack/react-simple-icons` (브랜드 — `Si{Name}` import, `color="default"` + GitHub만 `dark:invert`)
- 폰트: DM Sans (next/font/google)
- i18n: next-intl (locale routing `/en`, `/ko`, `localePrefix: "always"`)
- 배포: Vercel (정적 호스팅)
- 패키지 매니저: pnpm

## 명령어

| 용도 | 명령 |
|---|---|
| 개발 서버 | `pnpm dev` |
| 빌드 | `pnpm build` |
| 타입 체크만 | `npx tsc --noEmit` |
| 린트 | `pnpm lint` |

**빌드는 자동 실행하지 않는다.** 사용자가 명시적으로 요청하거나 `/build` 스킬을 실행할 때만 돌린다.

## 디렉터리 구조

```
docs/
├── prd.md          # PRD
├── design.md       # 기술 설계
└── tasks.md        # 태스크 목록
src/
├── app/
│   ├── layout.tsx          # 최상위 RootLayout — DM Sans, JSON-LD, metadataBase
│   ├── page.tsx            # 루트 / — navigator 무시하고 /en으로 client redirect
│   ├── globals.css         # Tailwind directives + shadcn CSS 변수 (light only)
│   └── [locale]/
│       ├── layout.tsx      # NextIntlClientProvider + generateStaticParams + generateMetadata
│       └── page.tsx        # 랜딩 페이지 (섹션 컴포넌트 조합)
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── Hero.tsx            # 히어로 — 로고·헤드라인·서브카피·CTA
│   ├── Mockup.tsx          # 제품 미리보기 (client) — 5탭 슬라이드 + 캡션
│   ├── FeatureCards.tsx    # 기능 카드 5개 (wide 1 + 2×2 비대칭 그리드)
│   ├── HowItWorks.tsx      # 4-step 가로 플로우
│   ├── Footer.tsx          # 하단 CTA + 카피라이트
│   └── LocaleSwitcher.tsx  # locale 토글 (fixed top-right, 현재 page에서 미사용)
├── i18n/
│   ├── routing.ts          # next-intl routing config (locales, defaultLocale)
│   └── request.ts          # getRequestConfig — messages 로딩
└── lib/
    ├── constants.ts        # 웹스토어 URL, 외부 링크 상수
    ├── utils.ts            # cn() 유틸 (clsx + tailwind-merge)
    └── i18n/
        ├── en.json         # 영문 메시지
        ├── ko.json         # 한글 메시지
        └── index.ts        # (deprecated, request.ts에서 직접 import)
public/
└── bugshot-symbol.svg      # BugShot 로고 (Hero에서 next/image로 사용)
```

## 릴리스 & 버전

### 버전 체계

semver(`MAJOR.MINOR.PATCH`). `package.json`의 `version` 기준.

### 브랜치 정책

- 작업 브랜치: **`dev`** — 자유롭게 push (force push 허용).
- 메인 브랜치: **`main`** — PR squash 머지만 허용.

### 워크플로우 (스킬 라인업)

```
/feature        → 기능 아이디어 → PRD·기술 설계·태스크 문서 산출
/feature-review → feature 산출물을 CPO·CDO·CTO·QA Lead 4명이 병렬 검수
/tdd            → 테스트만 작성 (구현·픽스·커밋 안 함)
/pull           → dev 최신 받고 작업 맥락 브리핑
/build          → pnpm build + 테스트 체크리스트
/code-review    → origin/main 대비 변경 코드 시급도별 리포트
/audit          → 코드베이스 전체 컨벤션·패턴 감사
/push           → dev push (main에서 호출 차단)
/merge          → dev에서 버전 bump 커밋 + dev → main squash PR
/deploy         → 빌드 검증 + Vercel 배포 상태 확인
/sync           → dev를 origin/main으로 hard reset + force push
```

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
- **반응형**: 브레이크포인트는 `md:` (768px) **단일**만 사용. 모바일 기본값 → `md:`에서 데스크톱 사이즈로 전환. 각 요소는 최솟값(모바일)과 최댓값(데스크톱)만 정의 — `sm:`·`lg:`·`xl:` 등 중간값 사용 금지.
- **섹션 구조**: outer `<section>`은 뷰포트 full width + `border-b`(divider, viewport 가로지름) + padding-y. inner `<div className="container mx-auto max-w-[1200px]">`가 콘텐츠 컨테이너. Hero·Footer는 border-b 없음.
- CTA 버튼: 모든 CTA는 `size="xl"` (h-14 gap-3 rounded-2xl pl-7 pr-8 text-lg, svg 20). 좌측 Chrome 아이콘(`SiGooglechrome color="currentColor"`) + "Add to Chrome" 단일 텍스트 (모바일 분기 없음). Figma 디자인 기준.
- 커밋 메시지·PR title/body는 **영문**으로 작성.
- 주석 최소화. WHY가 비자명할 때만 한 줄.
- Dark mode는 스코프 외 (light only).

## 관련 프로젝트

- **bugshot-2** (`~/code/bugshot-2/`): Chrome 확장 본체. 이 랜딩 사이트는 bugshot-2의 기능을 소개하는 독립 프로젝트.
- 기능 기획 문서: `~/code/bugshot-2/docs/features/bugshot-web/` (PRD, design, tasks)
