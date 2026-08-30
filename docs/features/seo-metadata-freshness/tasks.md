# Metadata & Freshness — 구현 태스크

## 선행 조건
- landing lastmod 소스 확정: i18n 메시지 파일 mtime(자동, 기본) vs 수동 상수.
- docs mtime이 tarball tip-commit 값으로 25개 동일할 수 있음을 인지(가시적 날짜가 균일해도 정상).

## 태스크

### Task 1: 소스 mtime 헬퍼 추가
- **변경 대상**: `src/lib/docs/content.ts`
- **작업 내용**: `fileMtime(absPath)`(또는 `privacyMtime(locale)`) 추가. 기존 `docMtime` 유지.
- **검증**:
  - [ ] `npx tsc --noEmit` 통과
  - [ ] 존재하지 않는 파일에 null 반환

### Task 2: sitemap lastmod 소스화 + x-default
- **변경 대상**: `src/app/sitemap.ts`
- **작업 내용**: landing `new Date()` → i18n 파일 mtime; privacy → `content/privacy/{locale}.md` mtime. `languages`/`privacyLanguages`/docs alternates에 `"x-default"` 추가.
- **검증**:
  - [ ] 재빌드 2회 시 landing/privacy `<lastmod>` 값 불변(콘텐츠 미변경 시)
  - [ ] sitemap 각 `<url>`에 `hreflang="x-default"` alternate 존재
  - [ ] 모든 URL 여전히 200(회귀 없음)

### Task 3: docs 신선도 노출 + dateModified JSON-LD
- **변경 대상**: `src/app/[locale]/docs/[[...slug]]/page.tsx`, (선택) `src/lib/docs/metadata.ts`, i18n
- **작업 내용**: `docMtime`로 가시적 "Last updated {date}"(본문 하단) + `TechArticle` JSON-LD(`dateModified`). "Last updated" 라벨 i18n(en/ko).
- **검증**:
  - [ ] docs 렌더 HTML에 last-updated 텍스트 + dateModified JSON-LD 존재
  - [ ] Rich Results Test에서 dateModified 인식
  - [ ] render_page `publication_date`가 플레이스홀더(2026-01-01) 아님

### Task 4: /privacy BreadcrumbList
- **변경 대상**: `src/app/[locale]/privacy/page.tsx`
- **작업 내용**: 기존 `docsBreadcrumbJsonLd` 재사용(빈 nav/slug, currentTitle=파싱된 H1, path="/privacy") → `<script>` 렌더.
- **검증**:
  - [ ] `/en/privacy`·`/ko/privacy` 렌더 HTML에 BreadcrumbList JSON-LD 존재
  - [ ] positions 순차, item URL 절대경로

## 테스트 계획
- 단위 테스트: `fileMtime`은 fs 의존(순수 아님) → Vitest 제외 가능. JSON-LD 빌더를 순수 함수로 분리하면 케이스 추가(선택).
- 수동 테스트:
  - [ ] `pnpm build` 후 `/sitemap.xml` 검사(lastmod·x-default)
  - [ ] docs/privacy 페이지 JSON-LD 검증
  - [ ] 재빌드 시 landing/privacy lastmod 안정성 확인

## 구현 순서 권장
Task 1 → Task 2·3(헬퍼 의존). Task 4는 독립 — 병렬 가능.
