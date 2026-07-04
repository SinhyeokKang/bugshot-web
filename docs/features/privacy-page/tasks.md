# Privacy Page — 구현 태스크

## 선행 조건

- **bugshot-2 `docs/privacy.en.md` 작성**: `docs/privacy.md`의 영문 번역. 헤딩·테이블·앵커 구조를 한국어판과 대칭으로. main에 push되어 raw URL로 접근 가능해야 함. (privacy 페이지 빌드가 이 파일에 의존.)
- bugshot-2가 public repo인지 확인(raw.githubusercontent 인증 불필요 — 확인됨).
- 신규 deps 설치 권한: `react-markdown`, `remark-gfm`, `rehype-slug`, `@tailwindcss/typography`.

## 태스크

### Task 1: privacy 콘텐츠 fetch 스크립트
- **변경 대상**: `scripts/fetch-privacy.mjs`(신규), `.gitignore`, `package.json`(scripts)
- **작업 내용**:
  - raw URL 2개(`docs/privacy.md`→`content/privacy/ko.md`, `docs/privacy.en.md`→`content/privacy/en.md`) fetch·저장.
  - 각 응답 status 2xx + 본문 non-empty + `#`로 시작 assert. 실패 시 `console.error` + `process.exit(1)`.
  - `content/` 디렉터리 없으면 생성.
  - `.gitignore`에 `content/` 추가.
  - `package.json`: `"build": "node scripts/fetch-privacy.mjs && next build"`, `"predev": "node scripts/fetch-privacy.mjs"`.
- **검증**:
  - [ ] `node scripts/fetch-privacy.mjs` 실행 시 `content/privacy/ko.md`·`en.md` 생성, 내용이 원본과 동일.
  - [ ] en 원본이 없는 상태로 실행 시 non-zero exit + 명확한 에러.
  - [ ] `git status`에 `content/`가 뜨지 않음(gitignore 반영).

### Task 2: 마크다운 렌더 스택 도입
- **변경 대상**: `package.json`(deps), `tailwind.config.ts`, `src/components/Markdown.tsx`(신규)
- **작업 내용**:
  - `pnpm add react-markdown remark-gfm rehype-slug` + `pnpm add -D @tailwindcss/typography`.
  - `tailwind.config.ts` `plugins`에 `require("@tailwindcss/typography")` 추가.
  - `Markdown.tsx`: `react-markdown`에 `remarkPlugins={[remarkGfm]}`, `rehypePlugins={[rehypeSlug]}`. `prose` 래퍼(라이트 온리). 링크색 `--brand`, 테이블 스타일은 typography 기본 + 최소 오버라이드.
- **검증**:
  - [ ] `npx tsc --noEmit` 통과.
  - [ ] 임시로 테이블·헤딩·링크 포함 마크다운 문자열 렌더 시 테이블이 표로, 헤딩에 `id` 부여됨(dev에서 확인).

### Task 3: privacy 라우트 페이지
- **변경 대상**: `src/app/[locale]/privacy/page.tsx`(신규), `src/lib/i18n/ko.json`·`en.json`
- **작업 내용**:
  - `page.tsx`: `setRequestLocale` → `content/privacy/${locale}.md`를 `fs.readFileSync`로 로드 → `<Markdown>`. 상단 홈 로고 링크(next/image `/bugshot-symbol.svg` → `/{locale}`) + `<LocaleSwitcher />`, 본문 `<main>`(container + prose), `<Footer />`.
  - `generateMetadata`: title/description = `privacy.meta.*`, canonical = `${SITE_URL}/${locale}/privacy`, alternates.languages(ko/en/x-default), `robots index`.
  - i18n: `privacy.meta.title`, `privacy.meta.description`, `privacy.home`(홈 링크 aria-label) ko/en 추가.
- **검증**:
  - [ ] `pnpm dev`에서 `/ko/privacy`·`/en/privacy` 렌더, 본문·테이블 정상.
  - [ ] 목차 앵커 링크(`#3-외부-전송` 등) 클릭 시 해당 섹션으로 스크롤(ko·en 모두).
  - [ ] LocaleSwitcher로 ko↔en 전환 시 `/…/privacy` 유지.
  - [ ] 홈 로고 클릭 시 `/{locale}` 이동.
  - [ ] 페이지 소스에 고유 title/description/canonical + `robots index` 확인.

### Task 4: JSON-LD 누수 차단(layout → 랜딩 page 이관)
- **변경 대상**: `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`
- **작업 내용**:
  - layout에서 `jsonLd`(SoftwareApplication)·`faqJsonLd`(FAQPage) 생성 + 두 `<script ld+json>` 블록을 랜딩 `page.tsx`로 이동. 관련 import(`getTranslations` meta/faq, `FAQ_KEYS`, `CHROME_WEB_STORE_URL`, `SITE_URL`)도 page로 이동.
  - layout엔 `NextIntlClientProvider`·lang 스크립트·Analytics·SpeedInsights만 유지.
- **검증**:
  - [ ] 랜딩(`/ko`) 소스에 두 JSON-LD 스크립트 여전히 존재.
  - [ ] `/ko/privacy` 소스에 SoftwareApplication·FAQPage JSON-LD **없음**.
  - [ ] `npx tsc --noEmit` 통과(이동한 import 누락 없음).

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
  - sitemap: `/{locale}/privacy` 엔트리 추가(ko/en, alternates.languages, `changeFrequency: "yearly"`, `priority: 0.5`).
  - vercel.json rewrites에 `{ "source": "/privacy", "destination": "/ko/privacy" }` 추가.
- **검증**:
  - [ ] `pnpm build` 후 `out/sitemap.xml`에 ko/en privacy URL + alternates 포함.
  - [ ] `out/ko/privacy/index.html`·`out/en/privacy/index.html` 생성 확인.

## 테스트 계획

- **단위 테스트**: 레포에 테스트 러너 없음(스코프 외). `fetch-privacy.mjs`의 assert는 스크립트 직접 실행(성공/실패 케이스)으로 검증.
- **수동 테스트(빌드 후)**:
  - [ ] `pnpm build` 성공(fetch → next build 체이닝 정상).
  - [ ] `/ko/privacy`·`/en/privacy` 본문·테이블·목차 앵커 동작.
  - [ ] Footer 링크 내부 전환, LocaleSwitcher·홈 로고 동작.
  - [ ] 랜딩 JSON-LD 유지 + privacy 미주입.
  - [ ] sitemap privacy 엔트리 + canonical/robots index.
  - [ ] (선택) Lighthouse로 privacy 페이지 Performance/SEO ≥ 90 확인.

## 구현 순서 권장

1. **선행**: bugshot-2 `docs/privacy.en.md` 작성·push(없으면 Task 1 fetch 실패).
2. **Task 1**(fetch) → **Task 2**(렌더 스택): 병렬 가능하나 Task 3이 둘 다 의존.
3. **Task 3**(페이지) — Task 1·2 완료 후.
4. **Task 4**(JSON-LD 이관) — Task 3과 독립, 병렬 가능. privacy 색인 청결을 위해 Task 3과 함께 검증.
5. **Task 5**(Footer/상수) → **Task 6**(sitemap/rewrite) — Task 3의 라우트 존재 후.
6. 마지막에 `pnpm build` 전체 검증.
