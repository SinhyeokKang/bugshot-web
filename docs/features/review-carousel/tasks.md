# Review Carousel — 구현 태스크

## 선행 조건

- 두 번째 리뷰 텍스트 확정 (author, quote, source — ko/en)
- 기존 Review.tsx 동작 확인 (회귀 기준점)

## 태스크

### Task 1: REVIEW_KEYS 상수 추가

- **변경 대상**: `src/lib/constants.ts`
- **작업 내용**: `REVIEW_KEYS` 배열을 `as const`로 export. 키: `["qe", "designer"]`.
- **검증**:
  - [ ] `constants.ts`에서 `REVIEW_KEYS` export 확인
  - [ ] `npx tsc --noEmit` 통과

### Task 2: i18n 메시지 구조 변경

- **변경 대상**: `src/lib/i18n/ko.json`, `src/lib/i18n/en.json`
- **작업 내용**:
  - `review.author`, `review.quote`, `review.source` → `review.items.qe.{author|quote|source}`로 이동
  - `review.srHeading` 유지
  - 두 번째 리뷰 항목 추가: `review.items.designer.{author|quote|source}`
  - `review.dotLabel` 키 추가 (ko: "리뷰 {index}", en: "Review {index}") — dot navigation aria-label용
- **검증**:
  - [ ] ko.json과 en.json의 `review.items` 키 구조가 동일
  - [ ] 기존 리뷰 텍스트가 `items.qe` 아래로 정확히 이동됨
  - [ ] 두 번째 리뷰의 ko/en 텍스트가 채워짐 (키: `designer`)
  - [ ] `review.dotLabel` 키가 ko/en 모두 존재

### Task 3: Review.tsx 캐러셀로 전환

- **변경 대상**: `src/components/Review.tsx`
- **작업 내용**:
  - `"use client"` 지시문 추가
  - `getTranslations` → `useTranslations` 전환
  - `useState`로 active 인덱스 관리
  - `useRef`로 타이머 ID 관리 + dot 클릭 시 명시적 타이머 리셋
  - 5초 자동 전환 (`setInterval`) + `visibilitychange`로 탭 비활성 시 정지/복귀 시 리셋
  - Grid 스택 (`col-start-1 row-start-1`) + opacity 전환으로 시프트 방지
  - 각 리뷰 항목(author/quote/source)을 하나의 래퍼(`div`)로 감싸고, 래퍼에 `aria-hidden={i !== active}` 적용
  - 비활성 리뷰 래퍼에 `pointer-events-none` 적용
  - Dot navigation: 하단 중앙, 시각적 `h-2 w-2` 원형 + 터치 타겟 `h-[44px] w-[44px]` 확보 (패딩)
  - dot 컨테이너 `role="tablist"`, 각 dot `role="tab"` + `aria-selected`, `aria-label`은 i18n (`t("dotLabel", { index })`)
  - 좌우 화살표 키로 dot 이동 (키보드 내비게이션)
  - hover/focus 시 자동 전환 일시정지 (WCAG 2.2.2)
  - `prefers-reduced-motion: reduce` 시 자동 전환 비활성화 + `duration-0`
  - `REVIEW_KEYS.length > 1` 일 때만 dot 및 자동 전환 활성화
- **검증**:
  - [ ] `npx tsc --noEmit` 통과
  - [ ] `pnpm dev` → `/ko`, `/en`에서 리뷰 자동 전환 동작
  - [ ] dot 클릭 시 해당 리뷰로 이동 + 타이머 리셋
  - [ ] 전환 시 dot 위치 시프트 없음
  - [ ] `REVIEW_KEYS`가 1개일 때 dot 미표시, 자동 전환 없음
  - [ ] hover 시 자동 전환 정지, 마우스 떠나면 재개
  - [ ] 캐러셀 focus 시 자동 전환 정지
  - [ ] `prefers-reduced-motion: reduce` 시 자동 전환 없음 + 전환 즉시 적용
  - [ ] 좌우 화살표 키로 dot 이동 동작
  - [ ] dot `aria-label`이 locale에 맞게 표시 (ko: "리뷰 1", en: "Review 1")
  - [ ] 탭 비활성 후 복귀 시 자연스러운 전환 (밀린 전환 없음)
  - [ ] 기존 인용 스타일 유지 (폰트, 간격, 정렬)

### Task 4: 빌드 확인

- **작업 내용**: `pnpm build` 실행
- **검증**:
  - [ ] 정적 빌드 성공 (exit code 0)
  - [ ] `out/ko.html`, `out/en.html` 생성 확인

### Task 5: CLAUDE.md 업데이트

- **변경 대상**: `CLAUDE.md`
- **작업 내용**: Review.tsx 설명을 서버 컴포넌트 → 클라이언트 컴포넌트(캐러셀)로 갱신
- **검증**:
  - [ ] CLAUDE.md의 Review.tsx 설명이 실제 구현과 일치

## 테스트 계획

- **수동 테스트**:
  - [ ] `/ko` 리뷰 자동 전환 (5초 간격)
  - [ ] `/en` 리뷰 자동 전환
  - [ ] dot 클릭 → 해당 리뷰 표시 + 5초 후 다음으로 전환
  - [ ] 마지막 리뷰 → 첫 번째로 순환
  - [ ] 모바일 뷰포트 (375px) 레이아웃 확인
  - [ ] 전환 중 dot navigation 위치 고정 확인
  - [ ] ScrollReveal 입장 애니메이션 정상 동작
  - [ ] ScrollReveal opacity와 Review 내부 opacity 전환 간 시각적 충돌 없음
  - [ ] 탭 비활성 후 복귀 시 전환이 자연스럽게 재개
  - [ ] hover 시 자동 전환 정지, 마우스 떠나면 재개
  - [ ] 키보드: Tab으로 dot 진입 → 좌우 화살표로 이동
  - [ ] `REVIEW_KEYS` 1개로 변경 시 dot 미표시 + 자동 전환 없음
  - [ ] 다른 섹션 회귀 없음

## 구현 순서 권장

```
Task 1 (REVIEW_KEYS) + Task 2 (i18n)  [병렬 가능 — 단, 키 이름 "designer" 사전 합의 필수]
  → Task 3 (Review.tsx 전환)
    → Task 4 (빌드 확인)
      → Task 5 (CLAUDE.md 업데이트)
```
