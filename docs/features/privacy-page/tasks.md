# Privacy Page — 구현 태스크

## 선행 조건

- **bugshot-2 `docs/privacy.ko.md`·`docs/privacy.en.md` main 커밋·push**: 두 원본이 로컬엔 준비됐으나 **아직 main 미반영 — raw URL 현재 404**. main에 커밋·push해야 Task 1 fetch 성공. 헤딩·테이블·앵커 구조를 ko/en 대칭 유지. (`docs/privacy.html`은 구 URL 리디렉트 스텁 — 무시.)
- bugshot-2가 public repo 확인(raw.githubusercontent 인증 불필요 — 확인됨).
- **Vercel Build Command 확인**: 대시보드 Build Command가 비어(기본 `pnpm build`) 있어야 인라인 fetch 발동. `next build` 오버라이드면 fetch 스킵 → 빌드 실패. 확인 후 필요 시 `vercel.json buildCommand` 명시.
- 신규 deps 설치 권한: `react-markdown`, `remark-gfm`, `rehype-slug`, `@tailwindcss/typography`.
- Deploy Hook 자동 반영을 위한 bugshot-2 write 권한 + Vercel Deploy Hook 발급 권한(Task 7).

## 태스크

### Task 1: privacy 콘텐츠 fetch 스크립트
- **변경 대상**: `scripts/fetch-privacy.mjs`(신규), `.gitignore`, `package.json`(scripts)
- **작업 내용**:
  - raw URL 2개(`docs/privacy.ko.md`→`content/privacy/ko.md`, `docs/privacy.en.md`→`content/privacy/en.md`) fetch·저장.
  - 각 응답 status 2xx + 본문 non-empty + `#`로 시작 assert. 실패 시 `console.error` + `process.exit(1)`.
  - `content/` 디렉터리 없으면 생성.
  - `.gitignore`에 `content/` 추가.
  - `package.json`: `"build": "node scripts/fetch-privacy.mjs && next build"`, `"dev": "node scripts/fetch-privacy.mjs && next dev"`(pre-post-scripts 설정 의존 회피 위해 `predev` 대신 `dev` 인라인 체이닝).
- **검증**:
  - [ ] `node scripts/fetch-privacy.mjs` 실행 시 `content/privacy/ko.md`·`en.md` 생성, 내용이 원본과 동일.
  - [ ] en 원본이 없는(404) 상태로 실행 시 non-zero exit + 명확한 에러(부분 성공 금지).
  - [ ] `git status`에 `content/`가 뜨지 않음(gitignore 반영).

### Task 2: 마크다운 렌더 스택 도입
- **변경 대상**: `package.json`(deps), `tailwind.config.ts`, `src/components/Markdown.tsx`(신규)
- **작업 내용**:
  - `pnpm add react-markdown remark-gfm rehype-slug` + `pnpm add -D @tailwindcss/typography`.
  - `tailwind.config.ts` `plugins`에 `require("@tailwindcss/typography")` 추가.
  - `Markdown.tsx`: `react-markdown`에 `remarkPlugins={[remarkGfm]}`, `rehypePlugins={[rehypeSlug]}`. `prose max-w-none` 래퍼(라이트 온리). 링크색 `--brand`, 테이블 스타일은 typography 기본 + 최소 오버라이드. **`components={{ table }}`로 각 테이블을 `<div className="overflow-x-auto">`로 래핑**(모바일 가로 오버플로우 격리).
- **검증**:
  - [ ] `npx tsc --noEmit` 통과.
  - [ ] 임시로 테이블·헤딩·링크 포함 마크다운 렌더 시 테이블이 표로, 헤딩에 `id` 부여됨(dev에서 확인).
  - [ ] 넓은 3컬럼 테이블이 `overflow-x-auto` 컨테이너 안에서 스크롤되고, 375px 뷰포트에서 **body(페이지 전체)가 가로 스크롤되지 않음**(DevTools).

### Task 3: privacy 라우트 페이지
- **변경 대상**: `src/app/[locale]/privacy/page.tsx`(신규), `src/lib/i18n/ko.json`·`en.json`
- **작업 내용**:
  - `page.tsx`: `setRequestLocale` → `fs.readFileSync(path.join(process.cwd(), "content/privacy", `${locale}.md`), "utf-8")` 로드 → `<Markdown>`. 최상단 skip 링크(`#main`, 랜딩 `page.tsx` 패턴 차용) + 상단 바(**non-sticky**, 좌측 홈 로고 링크 next/image `/bugshot-symbol.svg` → `/{locale}`) + `<LocaleSwitcher />`(기존 fixed 재사용), 본문 `<main id="main">`(container max-w-[900px] + `prose max-w-none`), `<Footer />`.
  - `generateMetadata`: title/description = `privacy.meta.*`, canonical = `${SITE_URL}/${locale}/privacy`, **openGraph override**(title/description = privacy용, `url` = canonical), alternates.languages는 반드시 **`/{locale}/privacy` 경로**(ko=`.../ko/privacy`, en=`.../en/privacy`, x-default=ko), `robots index`.
  - i18n: `privacy.meta.title`, `privacy.meta.description`, `privacy.home`(홈 링크 aria-label) ko/en 추가.
- **검증**:
  - [ ] `pnpm dev`에서 `/ko/privacy`·`/en/privacy` 렌더, 본문·테이블 정상.
  - [ ] 인라인 앵커 링크(ko `#3-외부-전송`, en `#3-external-transmission`) 클릭 시 해당 섹션으로 스크롤(ko·en 각 1개).
  - [ ] Tab 키로 skip 링크 노출 → `#main` 이동.
  - [ ] LocaleSwitcher로 ko↔en 전환 시 `/…/privacy` 유지, 홈 로고 클릭 시 `/{locale}` 이동.
  - [ ] 페이지 소스에 고유 title/description/canonical + **openGraph(og:title·og:url=privacy)** + `robots index` 확인.

### Task 4: JSON-LD 누수 차단(layout → 랜딩 page 이관)
- **변경 대상**: `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`
- **작업 내용**:
  - layout `LocaleLayout` 본문의 `jsonLd`(SoftwareApplication)·`faqJsonLd`(FAQPage) 생성 + `t`(meta)·`faqT` const + 두 `<script ld+json>` 블록을 랜딩 `page.tsx`로 이동.
  - **이관 대상 import는 `FAQ_KEYS`·`CHROME_WEB_STORE_URL`만** page로 옮김. ⚠️ `SITE_URL`과 meta `getTranslations`는 layout `generateMetadata`가 계속 사용하므로 **layout에 잔존**(걷어내면 generateMetadata 깨짐). `getTranslations`는 page에서도 새로 import(JSON-LD용 meta/faq 번역).
  - layout `LocaleLayout` 본문엔 `NextIntlClientProvider`·lang 스크립트·Analytics·SpeedInsights만 유지. `generateMetadata`·`generateStaticParams`는 그대로.
- **검증**:
  - [ ] 랜딩(`/ko`) 소스에 두 JSON-LD 스크립트 여전히 존재.
  - [ ] `/ko/privacy` 소스에 SoftwareApplication·FAQPage JSON-LD **없음**.
  - [ ] 랜딩 `generateMetadata`(title·canonical·og) 정상 — `SITE_URL`·meta 번역 layout 잔존 확인.
  - [ ] `npx tsc --noEmit` 통과(이동/잔존 import 정확, unused import 없음).

### Task 5: Footer 내부 링크 전환 + 상수 정리
- **변경 대상**: `src/components/Footer.tsx`, `src/lib/constants.ts`
- **작업 내용**:
  - Footer 개인정보처리방침: 외부 `<a href={PRIVACY_POLICY_URL} target=_blank>` → `@/i18n/navigation`의 `Link href="/privacy"`(로케일 자동 프리픽스). `target`/`rel` 제거, 기존 클래스 유지.
  - `constants.ts`에서 `PRIVACY_POLICY_URL` 제거.
- **검증**:
  - [ ] Footer 개인정보처리방침 클릭 시 새 탭 없이 `/{현재로케일}/privacy`로 이동.
  - [ ] `grep PRIVACY_POLICY_URL` 결과 없음, `npx tsc --noEmit` 통과.

### Task 6: sitemap + vercel rewrite
- **변경 대상**: `src/app/sitemap.ts`, `vercel.json`
- **작업 내용**:
  - sitemap: `/{locale}/privacy` 엔트리 추가(ko/en). `alternates.languages`는 **`/{locale}/privacy` 경로**(ko=`.../ko/privacy`, en=`.../en/privacy`) — 랜딩 루트값 복붙 금지. `changeFrequency: "yearly"`, `priority: 0.5`.
  - vercel.json rewrites에 `{ "source": "/privacy", "destination": "/ko/privacy" }` 추가.
- **검증**:
  - [ ] `pnpm build` 후 `out/sitemap.xml`에 ko/en privacy URL + `/{locale}/privacy` alternates 포함(랜딩 루트 아님).
  - [ ] `out/ko/privacy/index.html`·`out/en/privacy/index.html` 생성 확인.
  - [ ] `bug-shot.com/privacy`(프리픽스 없음) → `/ko/privacy` 서빙(배포 후).

### Task 7: Deploy Hook 자동 반영 파이프라인 (외부, 선행 인프라)
- **변경 대상**: Vercel 프로젝트(Deploy Hook), bugshot-2 `.github/workflows/trigger-web-deploy.yml`(신규) + repo secret
- **작업 내용**:
  - bugshot-web Vercel 프로젝트에서 main용 Deploy Hook URL 발급 → bugshot-2 repo secret(`WEB_DEPLOY_HOOK`)로 등록.
  - bugshot-2에 GitHub Action 추가: `docs/privacy.ko.md`·`docs/privacy.en.md` push 시 `curl -X POST $WEB_DEPLOY_HOOK` 호출.
  - docs-portal이 `guide/**`로 확장할 동일 패턴의 최소 선행 도입.
- **검증**:
  - [ ] bugshot-2에서 privacy 원본 사소 수정 push → Vercel에 bugshot-web 재빌드 트리거 확인.
  - [ ] 재빌드 완료 후 `/ko/privacy`에 변경분 반영(수 분 내).
  - [ ] guide/** 등 privacy 무관 파일 push 시엔 트리거 안 됨(paths 필터 정확).

## 테스트 계획

- **단위 테스트**: 레포에 테스트 러너 없음(스코프 외). `fetch-privacy.mjs`의 assert는 스크립트 직접 실행(성공/실패 케이스)으로 검증.
- **수동 테스트(빌드 후)**:
  - [ ] `pnpm build` 성공(fetch → next build 체이닝 정상).
  - [ ] `/ko/privacy`·`/en/privacy` 본문·테이블·인라인 앵커 동작.
  - [ ] 375px 뷰포트에서 넓은 테이블 가로 스크롤 격리 + body 가로 스크롤 없음.
  - [ ] Footer 링크 내부 전환, LocaleSwitcher·홈 로고·skip 링크 동작.
  - [ ] 랜딩 JSON-LD 유지 + privacy 미주입, 랜딩 generateMetadata 정상.
  - [ ] sitemap privacy 엔트리(`/{locale}/privacy` alternates) + canonical/openGraph/robots index.
  - [ ] Task 7: bugshot-2 privacy 원본 push → 자동 재빌드·반영.
  - [ ] (선택) Lighthouse로 privacy 페이지 Performance/SEO ≥ 90 확인.

## 구현 순서 권장

> **닭-달걀 주의**: bugshot-web 빌드가 bugshot-2 main의 privacy 원본을 fetch하므로, **bugshot-2 병합이 bugshot-web 첫 배포보다 먼저**여야 한다. 순서 역전 시 첫 배포에서 fetch 404 → 빌드 실패.

1. **[bugshot-2] `privacy.ko.md`·`privacy.en.md` main 병합** — fetch 소스 확보(최우선). raw URL 200 확인.
2. **[bugshot-web] Vercel Build Command 확인** — 비어있어야(기본 `pnpm build`) 인라인 fetch 발동.
3. **[bugshot-web] 구현**: **Task 1**(fetch)→**Task 2**(렌더 스택) [Task 3이 둘 다 의존] → **Task 3**(페이지). **Task 4**(JSON-LD 이관)는 Task 3과 독립·병렬, 색인 청결 위해 함께 검증. **Task 5**(Footer/상수)→**Task 6**(sitemap/rewrite)는 Task 3 라우트 존재 후. 로컬 `pnpm build` 전체 검증.
4. **[bugshot-web] 배포** — 첫 배포에서 빌드타임 fetch 실제 성공 + `/ko,/en/privacy` 라이브 확인(별도 fetch 테스트 단계가 여기에 포함됨).
5. **[Deploy Hook] Task 7** — 라우트 라이브 후 Vercel Hook 발급 + bugshot-2 Action 구성.
6. **[검증]** bugshot-2 privacy 원본 사소 수정 push → 자동 재빌드·반영 확인.
