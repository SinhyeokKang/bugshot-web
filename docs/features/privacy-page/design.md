# Privacy Page — 기술 설계

## 개요

빌드 전(prebuild) bugshot-2 raw 파일에서 `docs/privacy.md`(ko)·`docs/privacy.en.md`(en)를 받아 `content/privacy/{locale}.md`로 전개한다. next-intl `[locale]` 아래 정적 `privacy` 라우트가 빌드 시 해당 파일을 `fs`로 읽어 공용 `Markdown` 컴포넌트(react-markdown + remark-gfm + rehype-slug + `@tailwindcss/typography`)로 프리렌더한다. Footer 링크·sitemap·vercel rewrite를 내부 경로로 전환한다. 이 마크다운 렌더 스택은 후속 docs-portal이 그대로 재사용한다.

## 변경 범위

### 신규 파일

- `scripts/fetch-privacy.mjs` — 빌드/데브 전 실행. bugshot-2 public repo raw URL 2개를 직접 fetch:
  - `https://raw.githubusercontent.com/SinhyeokKang/bugshot-2/main/docs/privacy.md` → `content/privacy/ko.md`
  - `https://raw.githubusercontent.com/SinhyeokKang/bugshot-2/main/docs/privacy.en.md` → `content/privacy/en.md`
  - 각 응답이 `2xx`·비어있지 않음·`#`로 시작(마크다운 헤딩)인지 assert. 하나라도 실패 시 `process.exit(1)`. (tarball 불필요 — 파일 2개라 raw 직접 fetch가 최소.)
- `src/components/Markdown.tsx` — react-markdown 래퍼(서버 컴포넌트). `remarkPlugins={[remarkGfm]}`, `rehypePlugins={[rehypeSlug]}`. `prose` 클래스로 감싼 본문. docs-portal이 재사용할 공용 렌더러.
- `src/app/[locale]/privacy/page.tsx` — privacy 라우트. `setRequestLocale` → `content/privacy/${locale}.md`를 `fs.readFileSync`로 읽어 `<Markdown>`에 전달. `generateMetadata`(title·description·canonical + alternates + robots index). 상단 최소 홈 링크(로고) + `LocaleSwitcher`, 본문(`<main>`), `Footer` 조합(랜딩 `page.tsx` 골격 차용).

### 수정 파일

- `src/app/[locale]/layout.tsx` — 랜딩 전용 JSON-LD(`SoftwareApplication` + `FAQPage`)를 랜딩 `page.tsx`로 이관. 현재 layout에서 주입되면 privacy 하위 라우트에도 잘못 삽입되므로(스키마 누수) 차단. `NextIntlClientProvider`·lang 스크립트·Analytics·SpeedInsights는 layout 유지(전 페이지 공통).
- `src/app/[locale]/page.tsx` — layout에서 내려온 랜딩 JSON-LD 2개(`jsonLd`, `faqJsonLd`) `<script type="application/ld+json">` 주입 추가(기존 layout 코드 그대로 이동).
- `src/components/Footer.tsx` — 개인정보처리방침 링크를 외부 `PRIVACY_POLICY_URL`(`<a target=_blank>`)에서 내부 next-intl `Link href="/privacy"`(현재 로케일 자동 프리픽스)로 교체. `target=_blank`·`rel` 제거.
- `src/lib/constants.ts` — `PRIVACY_POLICY_URL` 상수 제거(Footer 외 사용처 없음).
- `src/app/sitemap.ts` — `/{locale}/privacy` 엔트리 추가(ko/en, alternates 포함, `changeFrequency: "yearly"`, `priority: 0.5`).
- `src/app/[locale]/layout.tsx` `generateMetadata` — privacy 라우트 canonical은 page의 `generateMetadata`가 덮으므로 별도 수정 불필요(자식 canonical이 부모를 override, openGraph는 병합 상속).
- `tailwind.config.ts` — `plugins`에 `require("@tailwindcss/typography")` 추가.
- `vercel.json` — `{ "source": "/privacy", "destination": "/ko/privacy" }` rewrite 룰 추가(기존 `/`→`/ko` 패턴 확장).
- `.gitignore` — `content/` 추가(fetch 산출물 미커밋).
- `package.json` — deps 추가 + scripts 변경(아래).
- `src/lib/i18n/ko.json`·`en.json` — privacy 메타 라벨 추가(`privacy.meta.title`, `privacy.meta.description`, `privacy.home` = 홈 링크 aria-label). footer의 기존 `privacy` 라벨은 유지.

**package.json scripts**
```jsonc
// fetch를 build/dev에 체이닝. Vercel이 pnpm build를 호출하므로 build 인라인 체이닝으로 누락 방지.
"build": "node scripts/fetch-privacy.mjs && next build",
"predev": "node scripts/fetch-privacy.mjs"   // dev에서도 content 필요
```
**deps**: `react-markdown`, `remark-gfm`, `rehype-slug` / **devDeps**: `@tailwindcss/typography`.

### 외부(bugshot-2 레포, 선행)

- `docs/privacy.en.md` 신규 작성 — `docs/privacy.md`의 충실한 영문 번역. 구조(헤딩·테이블·앵커)를 한국어판과 대칭으로 유지해 양 로케일 렌더가 동일하게 동작하게 함. (기존 `docs/privacy.md`는 그대로 두어 github.io Jekyll URL 유지.)

## 데이터 흐름

**빌드**: `fetch-privacy.mjs` → `content/privacy/{ko,en}.md` → `[locale]/privacy/page.tsx`가 빌드 시 `fs`로 읽음 → react-markdown SSG → `next build` → `out/{locale}/privacy/index.html`.

**런타임(정적)**: 브라우저가 `/{locale}/privacy` HTML 로드. 앵커 링크는 페이지 내 스크롤(JS 불필요).

**단일 소스**: privacy 원본 = bugshot-2 `docs/privacy.{md,en.md}`. 이 레포엔 미커밋(gitignore).

## 인터페이스 설계

```ts
// src/components/Markdown.tsx
export function Markdown({ children }: { children: string }): JSX.Element;
// react-markdown + remarkGfm + rehypeSlug, `prose` 래퍼. 서버 컴포넌트.

// src/app/[locale]/privacy/page.tsx
export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata>;
export default async function PrivacyPage(
  { params }: { params: Promise<{ locale: string }> }
): Promise<JSX.Element>;
// content/privacy/${locale}.md 를 fs.readFileSync(utf-8) 로 로드해 <Markdown>에 전달.
```

**메타**: title/description = i18n `privacy.meta.*`. canonical = `${SITE_URL}/${locale}/privacy`. alternates.languages = `{ ko, en, "x-default": ko }`(layout 패턴 차용). `robots: { index: true, follow: true }`.

## 기존 패턴 준수

- **섹션/컨테이너**: 본문은 `container mx-auto max-w-[…]` 내부에 prose. `md:` 단일 브레이크포인트.
- **메타데이터**: `generateMetadata`·canonical·alternates 형태를 `[locale]/layout.tsx`에서 그대로 차용.
- **i18n 동시 갱신**: ko.json·en.json 동시 추가.
- **static export**: `[locale]/privacy/page.tsx`는 동적 세그먼트 없음 → `[locale]` layout의 `generateStaticParams`(전 locale)로 프리렌더. `output: 'export'` 호환.
- **prose 테마(라이트 온리)**: `@tailwindcss/typography` + shadcn CSS 변수. 커스터마이즈 최소 — 링크색 `--brand`, 테이블 보더/헤더 배경을 `--border`/`--muted` 기반으로. `prose-invert` 미사용(다크 스코프 외).
- **CTA/버튼 컨벤션**: privacy 페이지엔 CTA 없음. 홈 로고 링크는 next/image(`/bugshot-symbol.svg`, Hero 패턴 차용).
- **JSON-LD**: 랜딩 전용 스키마를 랜딩 `page.tsx`로 국한(누수 차단) — docs-portal design과 동일 방침.

## 대안 검토

1. **콘텐츠 vendoring(레포 커밋)** — 재현성 유리하나 원본 이중화·수동 동기화. docs-portal이 fetch를 택했고 privacy도 정합 위해 fetch. (사용자 선택.)
2. **tarball 다운로드 후 추출**(docs-portal 방식) — 파일 2개엔 과함(tar 의존·전개 로직). raw URL 직접 fetch가 최소. docs-portal은 68장이라 tarball이 합리적 — 두 방식 공존 OK.
3. **영문 미제공 / ko 리다이렉트** — 법적 문서를 영어권 사용자에게 한국어로만 노출하는 UX·신뢰 손실. 영문판 신규 작성 선택.
4. **MDX/정적 HTML 변환 빌드 스텝** — react-markdown 런타임 렌더보다 파이프라인 복잡. 단일 문서엔 불필요, docs-portal도 react-markdown 채택 예정이라 스택 통일.

## 위험 요소

- **JSON-LD 누수**: 현재 `[locale]/layout.tsx`가 `SoftwareApplication`+`FAQPage`를 전 하위 라우트에 주입 → privacy에도 잘못 삽입. **layout→랜딩 page.tsx 이관 필수**. 이관 후 랜딩에서 두 스키마가 여전히 렌더되는지 회귀 검증.
- **앵커 slug 불일치**: 본문 목차 링크(`#3-외부-전송`)의 slug와 rehype-slug(github-slugger) 헤딩 id가 어긋나면 스크롤 실패. privacy.md는 GitHub 렌더 기준으로 작성됐고 github-slugger도 동일 규칙(소문자화·공백→`-`·마침표 제거, 한글 보존)이라 대체로 일치하나, 실제 클릭 검증 필수. 영문판도 동일 확인.
- **빌드 네트워크 의존**: raw fetch 실패 시 prod 빌드 실패. fetch 스크립트에 명확한 에러 메시지 + non-zero exit. 부분 성공(한 로케일만)으로 조용히 넘어가지 않도록 두 파일 모두 assert.
- **ko/en 구조 비대칭**: 영문판 헤딩/앵커가 한국어판과 달라지면 LocaleSwitcher 전환 시 같은 문서인데 목차 앵커가 깨질 수 있음. 번역 시 구조 대칭 유지(선행 조건).
- **react-markdown RSC 호환**: react-markdown v9는 서버 컴포넌트에서 동작. 클라이언트 지시자 불필요. Next 15 + React 19 조합 빌드 검증.
- **GFM 테이블 렌더**: `remark-gfm` 없으면 테이블이 리터럴 텍스트로 렌더. 플러그인 누락 여부를 렌더 결과로 확인.
- **Footer Link 로케일 프리픽스**: next-intl `Link href="/privacy"`는 현재 로케일을 자동 프리픽스. `<a>`로 직접 쓰면 프리픽스 누락 → 반드시 `@/i18n/navigation`의 `Link` 사용.
- **테스트 인프라 부재**: 레포에 테스트 러너 없음 → fetch 스크립트·렌더는 수동/빌드 검증. `fetch-privacy.mjs`의 assert 로직만 스크립트 자체 실행으로 확인.
- **Chrome Web Store 링크 잔존**: 스토어 개인정보 URL은 여전히 github.io. 이번 스코프 아님 — 별도 콘솔에서 갱신 필요(보고 시 안내).
