# Review Carousel — 구현 태스크

## 선행 조건

- 두 번째 리뷰 텍스트 확정 (author, quote, source — ko/en)
- 기존 Review.tsx 동작 확인 (회귀 기준점)

## 태스크

### Task 1: REVIEW_KEYS 상수 추가

- **변경 대상**: `src/lib/constants.ts`
- **작업 내용**: `REVIEW_KEYS` 배열을 `as const`로 export. 첫 번째 키는 `"qe"` (기존 리뷰), 두 번째 키는 리뷰 내용에 맞는 slug.
- **검증**:
  - [ ] `constants.ts`에서 `REVIEW_KEYS` export 확인
  - [ ] `npx tsc --noEmit` 통과

### Task 2: i18n 메시지 구조 변경

- **변경 대상**: `src/lib/i18n/ko.json`, `src/lib/i18n/en.json`
- **작업 내용**:
  - `review.author`, `review.quote`, `review.source` → `review.items.qe.{author|quote|source}`로 이동
  - `review.srHeading` 유지
  - 두 번째 리뷰 항목 추가: `review.items.{key}.{author|quote|source}`
- **검증**:
  - [ ] ko.json과 en.json의 `review.items` 키 구조가 동일
  - [ ] 기존 리뷰 텍스트가 `items.qe` 아래로 정확히 이동됨
  - [ ] 두 번째 리뷰의 ko/en 텍스트가 채워짐

### Task 3: Review.tsx 캐러셀로 전환

- **변경 대상**: `src/components/Review.tsx`
- **작업 내용**:
  - `"use client"` 지시문 추가
  - `getTranslations` → `useTranslations` 전환
  - `useState`로 active 인덱스 관리
  - `useEffect` + `setInterval`로 5초 자동 전환 (active 변경 시 타이머 리셋)
  - Grid 스택 (`col-start-1 row-start-1`) + opacity 전환으로 시프트 방지
  - Dot navigation: 하단 중앙, `h-2 w-2` 원형 버튼, active/inactive 색상 분기
  - `aria-hidden` 처리, dot에 `aria-label`
  - `REVIEW_KEYS.length > 1` 일 때만 dot 및 자동 전환 활성화
- **검증**:
  - [ ] `npx tsc --noEmit` 통과
  - [ ] `pnpm dev` → `/ko`, `/en`에서 리뷰 자동 전환 동작
  - [ ] dot 클릭 시 해당 리뷰로 이동 + 타이머 리셋
  - [ ] 전환 시 dot 위치 시프트 없음
  - [ ] `REVIEW_KEYS`가 1개일 때 dot 미표시, 자동 전환 없음
  - [ ] 기존 인용 스타일 유지 (폰트, 간격, 정렬)

### Task 4: 빌드 확인

- **작업 내용**: `pnpm build` 실행
- **검증**:
  - [ ] 정적 빌드 성공 (exit code 0)
  - [ ] `out/ko.html`, `out/en.html` 생성 확인

## 테스트 계획

- **수동 테스트**:
  - [ ] `/ko` 리뷰 자동 전환 (5초 간격)
  - [ ] `/en` 리뷰 자동 전환
  - [ ] dot 클릭 → 해당 리뷰 표시 + 5초 후 다음으로 전환
  - [ ] 마지막 리뷰 → 첫 번째로 순환
  - [ ] 모바일 뷰포트 (375px) 레이아웃 확인
  - [ ] 전환 중 dot navigation 위치 고정 확인
  - [ ] ScrollReveal 입장 애니메이션 정상 동작
  - [ ] 다른 섹션 회귀 없음

## 구현 순서 권장

```
Task 1 (REVIEW_KEYS) + Task 2 (i18n)  [병렬 가능]
  → Task 3 (Review.tsx 전환)
    → Task 4 (빌드 확인)
```
