# Docs Content SEO — 기술 설계 (⚠️ bugshot-2 원본)

## 개요
전부 **콘텐츠(마크다운) 편집**이며 bugshot-web 코드 변경은 원칙적으로 없다. bugshot-web의 docs 메타데이터는 원본 H1/첫 문단에서 자동 파생되므로(아래), 원본 마크다운만 고치면 제목·description·breadcrumb가 따라 바뀐다.

## bugshot-web 측 파생 동작 (참고 — 변경 대상 아님)
- `src/app/[locale]/docs/[[...slug]]/page.tsx` `generateMetadata`: 제목 = `slug.length ? "{H1} | {titleSuffix}" : H1`. **즉 H1을 바꾸면 `<title>`이 바뀐다.**
- description = `resolveDocDescription(firstParagraph(markdown), fallback)`(`src/lib/docs/metadata.ts`, `content.ts`). **첫 문단을 키워드 포함 문장으로 시작하면 meta description이 개선된다.**
- BreadcrumbList `name`은 SUMMARY nav title/H1에서 옴 → SUMMARY.md의 항목명도 함께 볼 것.

## 변경 범위 (bugshot-2 레포)
- `guide/en/integrations/platforms.md` + `guide/ko/integrations/platforms.md` — H1을 키워드 포함형으로("Connecting Jira, GitHub & More — BugShot Integrations" 류), 첫 문단에 "bug report", "extension", 주요 트래커명 자연 포함.
- `guide/en/integrations/README.md`(및 ko) — 상위 개요 제목/첫 문단 키워드 보강(있다면).
- `guide/{en,ko}/SUMMARY.md` — 위 페이지의 nav title도 키워드 반영(breadcrumb/사이드바 일관).
- `guide/{en,ko}/video/record.md` — 기존 "Live Recording" 등 앞에 질문형 H2/H3("How do I record my screen for a bug report?") 추가.
- `guide/{en,ko}/element/README.md`(thin `/docs/element`) — 개요를 inspect→style→issue 흐름 요약 ~150단어로 확장.

## 데이터 흐름
bugshot-2 push → bugshot-web `fetch-guide.mjs`(빌드 전)가 tarball fetch → `content/guide/**` 전개 → `build-search.mjs`(검색 인덱스)·페이지 렌더 자동 반영. bugshot-web 코드/설정 무변경.

## 기존 패턴 준수
- CLAUDE.md: docs 콘텐츠 내재화 — **원본은 bugshot-2**, bugshot-web엔 미커밋(gitignore). 원본 push가 유일한 변경 경로.
- en/ko 대칭 필수(`intersectSlugs`가 한쪽에만 있는 slug를 드롭 → sitemap 404 방지). 파일 추가/이름변경 시 양 로케일 동시.
- 질문형 헤딩은 기존 UX 카피를 대체하지 말고 **보완**(GEO 권고).
- HowTo 스키마는 추가 금지(deprecated) — 스텝형이어도 마크다운 헤딩만.

## 대안 검토
- **제목만 vs 제목+첫문단+SUMMARY**: 제목만 바꾸면 `<title>`은 개선되나 description/breadcrumb 일관성 부족. → 제목+첫문단+SUMMARY 함께(일관 신호).
- **bugshot-web에서 제목 override 로직 추가**: 원본과 이원화되어 유지보수 악화·내재화 원칙 위반. → 기각, 원본 편집이 정공법.

## 위험 요소
- en/ko 비대칭 편집 시 slug 드롭/사이트맵 404 — 양 로케일 동시 수정.
- H1 변경이 앵커/내부 링크(`#slug`)에 영향 가능(`rehype-slug` 기반) — 다른 문서가 해당 앵커를 링크하면 깨질 수 있음. 변경 전 참조 확인.
- 키워드 삽입이 과하면 부자연 — 절차 문서의 실사용 톤 유지.
- bugshot-web 레포에서는 검증 불가(콘텐츠가 gitignore) — bugshot-2에서 편집 후 bugshot-web 재빌드로 확인.
