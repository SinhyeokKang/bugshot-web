# Docs Portal — 구현 태스크

## 선행 조건

- deps 설치: `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code`(또는 `rehype-highlight`), `@tailwindcss/typography`(dev), `pagefind`(dev). shadcn 컴포넌트: `npx shadcn@latest add dialog input sheet`(sheet=모바일 사이드바 드로어).
- Vercel Deploy Hook 생성(프로젝트 설정 → Git → Deploy Hooks) → URL 확보.
- bugshot-2 레포 쓰기 권한(Action workflow + secret 추가용).

## 태스크

### Task 1: 콘텐츠 fetch 스크립트
- **변경 대상**: `scripts/fetch-guide.mjs`, `package.json`(build 인라인 체이닝·predev), `.gitignore`
- **작업 내용**: bugshot-2 main tarball 다운로드·전개 → `guide/{ko,en}` 마크다운을 `content/guide/{locale}`로, `assets/**`를 `public/docs/{locale}/assets`로 복사. `content/`·`public/docs/`를 gitignore. `build` 스크립트를 `node scripts/fetch-guide.mjs && next build && pagefind --site out`로(prebuild 훅 미의존, predev만 유지). fetch/전개 실패·SUMMARY 항목 수 불일치 시 non-zero exit로 빌드 중단.
- **검증**:
  - [ ] `node scripts/fetch-guide.mjs` 실행 시 `content/guide/ko/README.md` 등 생성
  - [ ] `public/docs/ko/assets`에 이미지 복사됨
  - [ ] `git status`에 `content/`·`public/docs/` 미추적
  - [ ] fetch 실패(예: URL 오타)·부분 전개 시 non-zero exit로 빌드 중단(조용한 성공 없음)
  - [ ] SUMMARY 항목 수 vs 실제 파일 수 정합 assert 동작

### Task 2: SUMMARY 파서 + 콘텐츠 로더
- **변경 대상**: `src/lib/docs/summary.ts`, `src/lib/docs/content.ts`
- **작업 내용**: `parseSummary`(중첩 리스트 → 트리, README→부모 slug), `getAllDocSlugs`, `getDoc`(제목=첫 H1). 파일→slug 규칙 구현. ko↔en slug 집합 diff 검증(비대칭 경고), SUMMARY↔파일 orphan 경고.
- **검증**:
  - [ ] `getAllDocSlugs('ko')`가 SUMMARY 항목 수와 일치하는 slug 배열 반환
  - [ ] `getDoc('ko',['settings','ai'])`가 제목·마크다운 로드
  - [ ] 루트 `README.md`→`[]`, 섹션 `integrations/README.md`→`['integrations']` 매핑 정확(경계 스팟 검증)
  - [ ] ko↔en slug 집합 diff 검증: 비대칭 시 경고(현재 27/27 대칭 확인)
  - [ ] SUMMARY에만 있고 파일 없는 orphan 항목 → 빌드 경고
  - [ ] `npx tsc --noEmit` 통과

### Task 3: 마크다운 정규화·렌더
- **변경 대상**: `src/lib/docs/markdown.ts`, `src/components/docs/Markdown.tsx`
- **작업 내용**: 이미지 경로(`assets/`, `../assets/`) → `/docs/{locale}/assets/` 재작성, 본문 상호참조 `bugshot.gitbook.io` 링크 제거/내부 매핑, `{% embed %}` 전처리. `react-markdown` + remark-gfm + rehype-slug/autolink + 코드 하이라이트. prose 스타일(링크색=brand, 코드블록, 이미지 radius, GFM 테이블).
- **검증**:
  - [ ] 이미지 src가 `/docs/{locale}/assets/...`로 렌더
  - [ ] 렌더된 본문에 `bugshot.gitbook.io` 링크 없음
  - [ ] 코드블록 하이라이트·헤딩 id 부여 확인
  - [ ] GFM 테이블(`settings/general.md` 등)이 prose 스타일로 렌더
  - [ ] `{% embed %}`가 링크/카드로 렌더, raw 토큰 미노출

### Task 4: docs 라우트 + 레이아웃
- **변경 대상**: `src/app/[locale]/docs/[[...slug]]/page.tsx`, `src/app/[locale]/docs/layout.tsx`, `src/components/docs/DocsSidebar.tsx`
- **작업 내용**: `generateStaticParams`(전 locale×slug, 빈 slug 포함), `generateMetadata`(canonical/title/desc + openGraph override), 본문 렌더. 공용 `SiteHeader` + 사이드바(데스크톱 고정/모바일 sheet) + 기존 Footer 재사용.
- **검증**:
  - [ ] `/ko/docs`(빈 slug index), `/ko/docs/settings/ai` 등 정상 렌더·정적 생성
  - [ ] 빌드 산출 HTML의 canonical·hreflang alternate가 slug/locale별로 정확(예: `/en/docs/settings/ai`)
  - [ ] docs OG title/description이 랜딩 값을 상속하지 않고 override됨
  - [ ] docs HTML에 랜딩용 JSON-LD(`SoftwareApplication`/`FAQPage`) 미주입
  - [ ] 사이드바 현재 문서 active, 모바일 sheet 열림/닫힘(Esc·포커스)
  - [ ] 없는 slug → 404

### Task 5: 클라이언트 검색(Pagefind)
- **변경 대상**: `package.json`(build), `src/components/docs/DocsSearch.tsx`, docs 본문 컨테이너에 `data-pagefind-body`
- **작업 내용**: build를 `node scripts/fetch-guide.mjs && next build && pagefind --site out`로(Task 1). dialog 검색 UI가 `/pagefind` 로드, 검색 아이콘 + `Cmd+K` 트리거. 랜딩은 인덱싱 제외. 상태: 로딩 / 무결과 empty / dev degrade.
- **검증**:
  - [ ] `pnpm build` 후 `out/pagefind` 생성
  - [ ] Vercel 실배포에서 fetch→build→pagefind 순차 실행 + `out/pagefind`·content 생성 확인
  - [ ] 검색어 입력 시 문서 결과·이동, `Cmd+K`로 열기
  - [ ] 검색 결과에 랜딩 페이지 미포함
  - [ ] 무결과 시 empty state 표시
  - [ ] dev 모드(인덱스 부재)에서 검색 UI 크래시 없이 degrade

### Task 6: 글로벌 헤더 + 진입점 + rewrite + sitemap
- **변경 대상**: `src/components/SiteHeader.tsx`, `src/app/[locale]/page.tsx`, `src/app/[locale]/layout.tsx`, `vercel.json`, `src/app/sitemap.ts`, `src/lib/i18n/{ko,en}.json`
- **작업 내용**: sticky 공용 헤더(로고 + Docs 링크 + `LocaleSwitcher` 흡수), 랜딩 fixed `LocaleSwitcher` 제거, 랜딩 JSON-LD를 layout→page.tsx로 이관, `/docs`+`/docs/:path*` 2룰 rewrite, sitemap에 docs slug×locale + alternates. LocaleSwitcher는 대상 로케일 slug 부재 시 docs 루트 폴백.
- **검증**:
  - [ ] 랜딩 헤더 Docs 클릭 → `/{locale}/docs`
  - [ ] 랜딩에 헤더와 fixed LocaleSwitcher 이중 노출 없음(흡수 확인)
  - [ ] `bug-shot.com/docs`(bare) 및 `/docs/settings/ai`가 ko로 서빙(rewrite 2룰)
  - [ ] `/sitemap.xml`에 docs URL·alternates 포함
  - [ ] LocaleSwitcher 문서 전환: 대칭 slug 유지, 부재 시 docs 루트 폴백
  - [ ] 랜딩 페이지 기존 JSON-LD 동작 유지(이관 후에도 SoftwareApplication/FAQPage 노출)

### Task 7: 자동 재빌드 (bugshot-2)
- **변경 대상**: bugshot-2 `.github/workflows/trigger-web-deploy.yml`, Vercel Deploy Hook secret
- **작업 내용**: `guide/**` push 시 `curl`로 Deploy Hook 호출.
- **검증**:
  - [ ] guide 더미 수정 push → Vercel 새 배포 트리거
  - [ ] `bug-shot.com/docs`에 반영 확인

## 테스트 계획

- **단위**(러너 없음 — vitest 도입 시): `parseSummary`(중첩·README 매핑), 파일→slug 규칙, `normalizeMarkdown`(이미지·gitbook 링크·embed) 케이스. 도입 전엔 스크립트로 스팟 검증.
- **수동**: `/ko`·`/en` docs 전 섹션 스팟체크, 이미지 로드, 검색 동작(무결과·dev degrade 포함), LocaleSwitcher 문서 유지·폴백, `bug-shot.com/docs` rewrite. Lighthouse SEO/Perf ≥ 90 — 대표 URL(`/ko/docs` index + 이미지 많은 문서 1개) 대상, 프로덕션 빌드 산출물로 측정.

## 구현 순서 권장

`1 → 2 → 3 → 4` 순차(각 선행 필요). `5`·`6`은 `4` 이후 병렬 가능. `7`은 배포와 독립이라 언제든 병렬. 단 `build` 스크립트는 Task 1(fetch 인라인)과 Task 5(pagefind)가 함께 수정하므로 최종 형태(`fetch && next build && pagefind`)로 한 번에 정합시킬 것.
