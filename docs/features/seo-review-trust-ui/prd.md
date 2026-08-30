# Review & Trust UI (집계 평점 노출 + 후기 이름 정합)

## 배경
SEO 감사(`bug-shot.com-audit`)에서 **가장 상위 Critical**로, 4개 전문 에이전트(content·schema·sxo·geo)가 독립적으로 지적한 항목.

1. `SoftwareApplication` JSON-LD에 `aggregateRating`(4.94 / ratingCount 16 / reviewCount 8, `CHROME_WEB_STORE_RATING`)이 있으나, 화면 어디에도 **집계 평점이 시각적으로 표시되지 않는다**. Google 구조화 데이터 정책은 rating 마크업이 페이지에 실제 보이는 평점을 반영할 것을 요구 — 위반 시 리치결과 무시 또는 수동 조치 리스크.
2. EN 로케일 후기 4개(`review.items.{qe,designer,backend,frontend}.author`)가 전부 `안**, QA Engineer`처럼 **한글 마스킹 이름**이라 영어 독자에겐 깨진/플레이스홀더 콘텐츠로 보인다 (모든 페르소나에서 Trust 축 최하점, sxo).

## 목표
- 랜딩(`/en`, `/ko`)에 "4.94 ★ · 16 ratings" 형태의 집계 평점이 시각적으로 노출되고, Chrome Web Store 리뷰 URL로 링크된다.
- 노출 값은 JSON-LD와 **동일한 단일 소스**(`CHROME_WEB_STORE_RATING`)에서 온다 — 두 값이 절대 어긋나지 않는다.
- EN 후기 attribution이 영어 독자에게 자연스럽다(마스킹 한글 이름 제거).
- Google Rich Results Test에서 AggregateRating "not visible" 경고가 사라진다.

## 비목표 (Non-goals)
- 실제 리뷰 8건 본문을 페이지에 전부 렌더 (별도 스코프 — 링크로 갈음).
- Chrome Web Store 평점을 런타임 API로 실시간 fetch (정적 export 제약 — 상수 유지).
- 후기 캐러셀(`Review.tsx`) 동작/애니메이션 변경.
- 리뷰 개수 늘리기 등 오프사이트 활동(README 후속 과제).

## 사용자 시나리오
1. 방문자가 랜딩 상단(Hero CTA 부근)에서 "4.94 ★ · 16 ratings on Chrome Web Store"를 즉시 본다 → 클릭 시 새 탭으로 CWS 리뷰 페이지.
2. 방문자가 Review 섹션에서 개별 후기를 볼 때, 영어 로케일에서는 영어권에 맞는 이름/직함(또는 직함만)이 보인다.
3. 크롤러/LLM이 페이지를 읽을 때 집계 평점 텍스트가 본문에 존재해 JSON-LD와 일치한다.

## 성공 기준
- [ ] `/en`·`/ko` 렌더 HTML에 집계 평점 수치 텍스트가 존재한다.
- [ ] 표시 값이 `CHROME_WEB_STORE_RATING`에서 파생된다(하드코딩 중복 없음).
- [ ] EN `review.items.*.author`에 한글 마스킹 이름이 없다.
- [ ] Rich Results Test: AggregateRating 경고 0.
- [ ] Lighthouse/시각 회귀 없음(Hero LCP·CLS 영향 없음).
