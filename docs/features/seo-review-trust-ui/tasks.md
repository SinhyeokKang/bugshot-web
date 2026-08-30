# Review & Trust UI — 구현 태스크

## 선행 조건
- 후기 이름 처리 방식 확정(기본: 직함만 표기 = 대안 B). 실명 노출 원하면 리뷰어 동의 필요.
- 값 소스는 `CHROME_WEB_STORE_RATING`(이미 존재) 재사용 — 신규 데이터 없음.

## 태스크

### Task 1: 집계 평점 i18n 문구 추가
- **변경 대상**: `src/lib/i18n/en.json`, `src/lib/i18n/ko.json`
- **작업 내용**: `hero.rating.label` / `hero.rating.ariaLabel` 키 추가(EN·KO). ICU 인자 `{value}`, `{count}`.
- **검증**:
  - [ ] en/ko 두 파일에 동일 키 구조 존재
  - [ ] `pnpm build` 시 next-intl 누락 키 경고 없음

### Task 2: Hero에 집계 평점 요소 렌더
- **변경 대상**: `src/components/Hero.tsx`
- **작업 내용**: CTA 아래(`note` 인접)에 별 아이콘(`Star`, `fill-brand text-brand`) + `t("rating.label", { value, count })` + `CHROME_WEB_STORE_REVIEWS_URL` 링크. 값은 `CHROME_WEB_STORE_RATING`에서 import.
- **검증**:
  - [ ] `/en`·`/ko` 렌더 HTML에 "4.94"·"16" 텍스트 존재
  - [ ] 링크가 새 탭 + `rel="noopener noreferrer"`
  - [ ] 모바일/데스크톱에서 above-the-fold 레이아웃 깨짐/가로스크롤 없음
  - [ ] 값이 상수 파생(하드코딩 중복 grep으로 확인)

### Task 3: EN 후기 attribution 정합
- **변경 대상**: `src/lib/i18n/en.json` (`review.items.{qe,designer,backend,frontend}.author`)
- **작업 내용**: 한글 마스킹 이름 제거 → 직함만("QA Engineer" 등) 또는 확정안대로. KO는 현행 유지 여부 확인(한국 로케일은 마스킹 이름이 자연스러우므로 유지 가능).
- **검증**:
  - [ ] EN author 값에 한글/별표 마스킹 없음
  - [ ] Review 캐러셀 4개 모두 EN에서 자연스럽게 표기

## 테스트 계획
- 단위 테스트: 순수 함수 신규 없음 → 추가 불필요(값 포맷을 헬퍼로 뺄 경우에만 Vitest 케이스 추가).
- 수동 테스트:
  - [ ] `/en`, `/ko`에서 Hero 평점 노출·링크 이동
  - [ ] Google Rich Results Test로 `/en` 검사 → AggregateRating 경고 0
  - [ ] Lighthouse 모바일 재측정 → LCP/CLS 회귀 없음

## 구현 순서 권장
Task 1 → Task 2 (의존). Task 3은 독립 — 병렬 가능.
