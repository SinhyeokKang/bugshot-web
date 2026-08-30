# Metadata & Freshness (dateModified · sitemap lastmod · privacy 스키마)

## 배경
SEO 감사에서 신선도 신호 부재와 메타데이터 정합 이슈가 여러 카테고리(content·schema·sitemap·geo)에 걸쳐 나옴:

1. **가시적/구조적 신선도 부재**: 어느 페이지에도 `dateModified`/`datePublished`가 없고, 렌더 콘텐츠에 "Last updated"가 없다. `docMtime`(source 파일 mtime)이 이미 sitemap용으로 계산되지만 사람/LLM이 읽는 페이지엔 안 보인다. 빠르게 바뀌는 docs(연동/AI 목록)엔 신뢰·AI 인용 recency 감점.
2. **sitemap lastmod 부정확(landing/privacy)**: `sitemap.ts`가 landing·privacy에 `new Date()`를 찍어 매 빌드마다 갱신(4 URL 동일 ms 타임스탬프) → "boilerplate date" 안티패턴. docs는 `docMtime` 사용(정상).
3. **sitemap hreflang에 `x-default` 누락**: HTML head(`layout.tsx`, `docPageMetadata`)는 `x-default → /en` 선언하나 sitemap alternates엔 en/ko만 → 신호 불일치.
4. **/privacy에 BreadcrumbList 부재**: 공용 DocsShell 페이지 중 privacy만 JSON-LD 없음(docs는 전부 있음).

## 목표
- docs 페이지에 가시적 "Last updated {date}" + `dateModified` JSON-LD가 붙는다(기존 `docMtime` 재사용).
- sitemap의 landing/privacy lastmod가 콘텐츠 소스 mtime 기반이 되어 무의미한 빌드-갱신이 사라진다.
- sitemap alternates에 `x-default`가 포함돼 HTML head와 일치.
- /privacy에 BreadcrumbList JSON-LD 추가.

## 비목표
- docs 원본의 per-file 실제 mtime 정밀화(tarball이 tip-commit 시각으로 stamp — bugshot-2 패키징 사안, 낮은 우선순위 옵션으로만 언급).
- `priority`/`changefreq` 제거(Google 무시 — 선택 정리, 별도).
- 랜딩에 dateModified 노출(에버그린 페이지라 docs 우선).

## 사용자 시나리오
1. 방문자/LLM이 docs 페이지 하단(또는 상단)에서 "Last updated 2026-08-24"를 보고 recency를 판단.
2. 크롤러가 sitemap을 읽을 때 landing/privacy lastmod가 실제 콘텐츠 변경 시각을 반영.
3. 크롤러가 sitemap·HTML head 양쪽에서 일관된 x-default(/en) 신호를 받는다.
4. privacy 페이지가 docs와 동일하게 BreadcrumbList로 구조화된다.

## 성공 기준
- [ ] docs 렌더 HTML에 가시적 last-updated 텍스트 + `dateModified` 포함 JSON-LD 존재.
- [ ] sitemap.xml의 landing/privacy lastmod가 매 빌드마다 바뀌지 않고 소스 mtime 반영.
- [ ] sitemap 각 URL alternates에 `x-default` 포함.
- [ ] /privacy 렌더 HTML에 BreadcrumbList JSON-LD 존재.
- [ ] Rich Results Test 통과, 빌드 성공.
