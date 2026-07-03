# Docs Portal — 구현 태스크

## 선행 조건

- deps 설치: `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code`(또는 `rehype-highlight`), `@tailwindcss/typography`(dev), `pagefind`(dev). 검색 UI에 필요 시 `npx shadcn@latest add dialog input`.
- Vercel Deploy Hook 생성(프로젝트 설정 → Git → Deploy Hooks) → URL 확보.
- bugshot-2 레포 쓰기 권한(Action workflow + secret 추가용).

## 태스크

### Task 1: 콘텐츠 fetch 스크립트
- **변경 대상**: `scripts/fetch-guide.mjs`, `package.json`(prebuild·predev), `.gitignore`
- **작업 내용**: bugshot-2 main tarball 다운로드·전개 → `guide/{ko,en}` 마크다운을 `content/guide/{locale}`로, `assets/**`를 `public/docs/{locale}/assets`로 복사. `content/`·`public/docs/`를 gitignore.
- **검증**:
  - [ ] `node scripts/fetch-guide.mjs` 실행 시 `content/guide/ko/README.md` 등 생성
  - [ ] `public/docs/ko/assets`에 이미지 복사됨
  - [ ] `git status`에 `content/`·`public/docs/` 미추적

### Task 2: SUMMARY 파서 + 콘텐츠 로더
- **변경 대상**: `src/lib/docs/summary.ts`, `src/lib/docs/content.ts`
- **작업 내용**: `parseSummary`(중첩 리스트 → 트리, README→부모 slug), `getAllDocSlugs`, `getDoc`(제목=첫 H1). 파일→slug 규칙 구현.
- **검증**:
  - [ ] `getAllDocSlugs('ko')`가 SUMMARY 항목 수와 일치하는 slug 배열 반환
  - [ ] `getDoc('ko',['settings','ai'])`가 제목·마크다운 로드
  - [ ] `npx tsc --noEmit` 통과

### Task 3: 마크다운 정규화·렌더
- **변경 대상**: `src/lib/docs/markdown.ts`, `src/components/docs/Markdown.tsx`
- **작업 내용**: 이미지 경로(`assets/`, `../assets/`) → `/docs/{locale}/assets/` 재작성, `bugshot.gitbook.io` 링크 제거/내부 매핑, `{% embed %}` 전처리. `react-markdown` + remark-gfm + rehype-slug/autolink + 코드 하이라이트. prose 스타일.
- **검증**:
  - [ ] 이미지 src가 `/docs/{locale}/assets/...`로 렌더
  - [ ] 렌더된 본문에 `bugshot.gitbook.io` 링크 없음
  - [ ] 코드블록 하이라이트·헤딩 id 부여 확인

### Task 4: docs 라우트 + 레이아웃
- **변경 대상**: `src/app/[locale]/docs/[[...slug]]/page.tsx`, `src/app/[locale]/docs/layout.tsx`, `src/components/docs/DocsSidebar.tsx`
- **작업 내용**: `generateStaticParams`(전 locale×slug), `generateMetadata`(canonical/title/desc), 본문 렌더. 미니헤더 + 사이드바 + 기존 Footer 재사용.
- **검증**:
  - [ ] `/ko/docs`, `/ko/docs/settings/ai` 등 정상 렌더
  - [ ] 사이드바 현재 문서 active
  - [ ] 없는 slug → 404

### Task 5: 클라이언트 검색(Pagefind)
- **변경 대상**: `package.json`(build), `src/components/docs/DocsSearch.tsx`, docs 본문 컨테이너에 `data-pagefind-body`
- **작업 내용**: build를 `next build && pagefind --site out`로. dialog 검색 UI가 `/pagefind` 로드. 랜딩은 인덱싱 제외.
- **검증**:
  - [ ] `pnpm build` 후 `out/pagefind` 생성
  - [ ] 검색어 입력 시 문서 결과·이동
  - [ ] 검색 결과에 랜딩 페이지 미포함

### Task 6: 글로벌 헤더 + 진입점 + rewrite + sitemap
- **변경 대상**: `src/components/SiteHeader.tsx`, `src/app/[locale]/page.tsx`, `vercel.json`, `src/app/sitemap.ts`, `src/lib/i18n/{ko,en}.json`
- **작업 내용**: 헤더에 Docs 링크, `/docs`→`/ko/docs` rewrite, sitemap에 docs slug×locale + alternates.
- **검증**:
  - [ ] 랜딩 헤더 Docs 클릭 → `/{locale}/docs`
  - [ ] `bug-shot.com/docs`가 ko 소개로 서빙(rewrite)
  - [ ] `/sitemap.xml`에 docs URL·alternates 포함

### Task 7: 자동 재빌드 (bugshot-2)
- **변경 대상**: bugshot-2 `.github/workflows/trigger-web-deploy.yml`, Vercel Deploy Hook secret
- **작업 내용**: `guide/**` push 시 `curl`로 Deploy Hook 호출.
- **검증**:
  - [ ] guide 더미 수정 push → Vercel 새 배포 트리거
  - [ ] `bug-shot.com/docs`에 반영 확인

## 테스트 계획

- **단위**(러너 없음 — vitest 도입 시): `parseSummary`(중첩·README 매핑), 파일→slug 규칙, `normalizeMarkdown`(이미지·gitbook 링크·embed) 케이스. 도입 전엔 스크립트로 스팟 검증.
- **수동**: `/ko`·`/en` docs 전 섹션 스팟체크, 이미지 로드, 검색 동작, LocaleSwitcher 문서 유지, `bug-shot.com/docs` rewrite, Lighthouse SEO/Perf ≥ 90.

## 구현 순서 권장

`1 → 2 → 3 → 4` 순차(각 선행 필요). `5`·`6`은 `4` 이후 병렬 가능. `7`은 배포와 독립이라 언제든 병렬.
