# Privacy Page — 기술 설계

## 개요

빌드 전(prebuild) bugshot-2 raw 파일에서 `docs/privacy.ko.md`(ko)·`docs/privacy.en.md`(en)를 받아 `content/privacy/{locale}.md`로 전개한다. next-intl `[locale]` 아래 정적 `privacy` 라우트가 빌드 시 해당 파일을 `fs`로 읽어 공용 `Markdown` 컴포넌트(react-markdown + remark-gfm + rehype-slug + `@tailwindcss/typography`)로 프리렌더한다. Footer 링크·sitemap·vercel rewrite를 내부 경로로 전환한다. 이 마크다운 렌더 스택은 후속 docs-portal이 그대로 재사용한다.

## 변경 범위

### 신규 파일

- `scripts/fetch-privacy.mjs` — 빌드/데브 전 실행. bugshot-2 public repo raw URL 2개를 직접 fetch:
  - `https://raw.githubusercontent.com/SinhyeokKang/bugshot-2/main/docs/privacy.ko.md` → `content/privacy/ko.md`
  - `https://raw.githubusercontent.com/SinhyeokKang/bugshot-2/main/docs/privacy.en.md` → `content/privacy/en.md`
  - 각 응답이 `2xx`·비어있지 않음·`#`로 시작(마크다운 헤딩)인지 assert. 하나라도 실패 시 `process.exit(1)`. (tarball 불필요 — 파일 2개라 raw 직접 fetch가 최소.)
- `src/components/Markdown.tsx` — react-markdown 래퍼(서버 컴포넌트). `remarkPlugins={[remarkGfm]}`, `rehypePlugins={[rehypeSlug]}`. `prose max-w-none` 래퍼(65ch 제한 해제 — 긴 3컬럼 테이블 대응). **`components={{ table }}`로 각 `<table>`을 `<div className="overflow-x-auto">`로 래핑**(전역 `word-break: keep-all`로 한글 셀이 줄바꿈 안 돼 넓어지므로 필수 — CLAUDE.md "body must never scroll horizontally" 준수). docs-portal이 재사용할 공용 렌더러.
- `src/app/[locale]/privacy/page.tsx` — privacy 라우트. `setRequestLocale` → `fs.readFileSync(path.join(process.cwd(), "content/privacy", `${locale}.md`), "utf-8")`로 읽어 `<Markdown>`에 전달. 최상단 skip 링크(`#main`, 랜딩 패턴 차용) + 상단 바(**non-sticky**, 일반 흐름): 좌측 홈 로고 링크(next/image `/bugshot-symbol.svg` → `/{locale}`) + `<LocaleSwitcher />`(기존 fixed 재사용). 본문 `<main id="main">`(container + prose), `<Footer />`. `generateMetadata`(title·description·canonical·**openGraph override**·alternates + robots index — 아래 메타 참조).

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

**package.json scripts** — fetch를 build·dev **인라인 체이닝**(pnpm `predev`/pre-post-scripts 설정 의존 회피, Vercel `pnpm build` 시 content 누락 방지):
```jsonc
"build": "node scripts/fetch-privacy.mjs && next build",
"dev": "node scripts/fetch-privacy.mjs && next dev"
```
> **Vercel 확인 필요**: 대시보드 Build Command가 비어(기본 = `pnpm build`) 있어야 인라인 fetch가 발동한다. `next build`로 오버라이드돼 있으면 fetch가 건너뛰어져 `content/` 부재로 빌드 실패 → 확인 후 필요 시 `vercel.json`에 `buildCommand` 명시.

**deps**: `react-markdown`, `remark-gfm`, `rehype-slug` / **devDeps**: `@tailwindcss/typography`.

### 외부(bugshot-2 레포 + Vercel, 선행)

- `docs/privacy.ko.md`·`docs/privacy.en.md` **main 커밋·push** — ko 원본은 기존 `privacy.md`에서 `privacy.ko.md`로 리네이밍, en은 그 충실한 영문 번역. 구조(헤딩·테이블·앵커)를 대칭으로 유지해 양 로케일 렌더가 동일 동작. (두 파일 모두 **아직 main 미반영·raw URL 404** — Task 1 fetch 전 필수.) 구 github.io URL은 `docs/privacy.html`(bug-shot.com 리디렉트 스텁)이 담당 — bugshot-2 스코프, 이번 기능은 무시.
- **Vercel Deploy Hook 생성** — bugshot-web 프로젝트에서 main용 Deploy Hook URL 발급, bugshot-2 repo secret으로 등록.
- **`.github/workflows/trigger-web-deploy.yml`** (bugshot-2) — `docs/privacy.ko.md`·`docs/privacy.en.md` push 시 Deploy Hook을 `curl`로 호출해 bugshot-web 재빌드 트리거(원본 수정 → 수 분 내 자동 반영). docs-portal이 `guide/**`로 확장할 동일 패턴의 선행 도입.

## 데이터 흐름

**빌드**: `fetch-privacy.mjs` → `content/privacy/{ko,en}.md` → `[locale]/privacy/page.tsx`가 빌드 시 `fs`로 읽음 → react-markdown SSG → `next build` → `out/{locale}/privacy/index.html`.

**런타임(정적)**: 브라우저가 `/{locale}/privacy` HTML 로드. 앵커 링크는 페이지 내 스크롤(JS 불필요).

**단일 소스**: privacy 원본 = bugshot-2 `docs/privacy.{ko,en}.md`. 이 레포엔 미커밋(gitignore).

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
// path.join(process.cwd(), "content/privacy", `${locale}.md`) 를 fs.readFileSync(utf-8) 로 로드해 <Markdown>에 전달.
```

**메타**: title/description = i18n `privacy.meta.*`. canonical = `${SITE_URL}/${locale}/privacy`. alternates.languages = `{ ko: ${SITE_URL}/ko/privacy, en: ${SITE_URL}/en/privacy, "x-default": ${SITE_URL}/ko/privacy }`(**반드시 `/{locale}/privacy` 경로 — 랜딩 `/ko` 복붙 금지**). `robots: { index: true, follow: true }`. **openGraph 최소 override**(`title`·`description` = privacy용, `url` = canonical) 필수 — 미override 시 부모 layout의 랜딩 OG(title·og-image·`url=홈`)를 통째 병합 상속해 소셜 카드가 랜딩을 표시(Next는 openGraph를 부모와 병합, title→og:title 자동 파생 없음). og-image는 부모 것 상속 허용(별도 privacy 이미지 불필요).

## 기존 패턴 준수

- **섹션/컨테이너**: 본문은 `container mx-auto max-w-[900px]`(가독 폭) 내부에 `prose max-w-none`. 넓은 테이블만 `overflow-x-auto`로 컨테이너 폭을 넘겨 가로 스크롤. `md:` 단일 브레이크포인트.
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
- **앵커 slug 불일치**: 내부 앵커는 문서당 **단 1개**(ko §6→§3 `#3-외부-전송`, en `#3-external-transmission`)로 TOC는 없음. rehype-slug(github-slugger)가 `## 3. 외부 전송`→`3-외부-전송`, `## 3. External Transmission`→`3-external-transmission`을 산출해 원본 링크와 일치함을 실물 대조로 확인. 그래도 렌더 후 실제 클릭 검증 1회 필수(ko/en).
- **빌드 네트워크 의존**: raw fetch 실패 시 prod 빌드 실패. fetch 스크립트에 명확한 에러 메시지 + non-zero exit. 부분 성공(한 로케일만)으로 조용히 넘어가지 않도록 두 파일 모두 assert.
- **ko/en 구조 비대칭**: 영문판 헤딩/앵커가 한국어판과 달라지면 LocaleSwitcher 전환 시 같은 문서인데 앵커가 깨질 수 있음. 번역 시 구조 대칭 유지(선행 조건).
- **react-markdown RSC 호환**: react-markdown v9는 서버 컴포넌트에서 동작. 클라이언트 지시자 불필요. Next 15 + React 19 조합 빌드 검증.
- **GFM 테이블 렌더 + 모바일 오버플로우**: `remark-gfm` 없으면 테이블이 리터럴 텍스트로 렌더. 또 privacy 본문은 3컬럼 테이블 다수 + 셀 텍스트가 길고 전역 `word-break: keep-all`이라 375px에서 body 가로 스크롤 위험. `components.table`의 `overflow-x-auto` 래퍼로 격리(변경 범위 참조). 375px에서 body 가로 스크롤 없음을 실기기/DevTools로 확인.
- **openGraph 병합 상속**: Next는 canonical만 자식이 덮고 openGraph는 부모와 병합. override 누락 시 privacy 소셜 카드가 랜딩 title·`og:url=홈`을 표시. `generateMetadata`에서 openGraph(title/description/url) override 필수(메타 참조). docs-portal design과 동일 방침.
- **중복 인덱싱(감수)**: v1은 github.io 원본을 색인 상태로 두므로 동일 privacy 본문이 두 도메인에 색인돼 단기 권위 분산. 명시적 트레이드오프(PRD 참조). 완결은 후속 github.io noindex/301.
- **Deploy Hook 부재 시 stale**: Deploy Hook·Action 미구성이면 bugshot-2 원본 수정이 라이브에 반영 안 됨. 선행 조건으로 구성(외부 선행 참조). Deploy Hook secret 노출 주의.
- **Footer Link 로케일 프리픽스**: next-intl `Link href="/privacy"`는 현재 로케일을 자동 프리픽스. `<a>`로 직접 쓰면 프리픽스 누락 → 반드시 `@/i18n/navigation`의 `Link` 사용.
- **테스트 인프라 부재**: 레포에 테스트 러너 없음 → fetch 스크립트·렌더는 수동/빌드 검증. `fetch-privacy.mjs`의 assert 로직만 스크립트 자체 실행으로 확인.
- **Chrome Web Store 링크 잔존**: 스토어 개인정보 URL은 여전히 github.io. 이번 스코프 아님 — 별도 콘솔에서 갱신 필요(보고 시 안내).
