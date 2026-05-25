# HowItWorks Accordion — 구현 태스크

## 선행 조건

- [ ] 6장의 목업 이미지 준비 (520×800 종횡비, webp, `/images/how-steps/` 디렉터리)
  - `how-connectTracker.webp`
  - `how-captureMode.webp`
  - `how-editStyles.webp`
  - `how-aiDraft.webp`
  - `how-submitReport.webp`
  - `how-trackIssues.webp`

## 태스크

### Task 1: constants.ts에 HOW_KEYS 추가

- **변경 대상**: `src/lib/constants.ts`
- **작업 내용**: `HOW_KEYS` 배열 추가. `FAQ_KEYS`, `REVIEW_KEYS`와 동일한 패턴.
  ```ts
  export const HOW_KEYS = [
    "connectTracker",
    "captureMode",
    "editStyles",
    "aiDraft",
    "submitReport",
    "trackIssues",
  ] as const;
  ```
- **검증**:
  - [ ] `npx tsc --noEmit` 통과
  - [ ] 기존 `FAQ_KEYS`, `REVIEW_KEYS` export에 영향 없음

### Task 2: i18n 메시지 업데이트

- **변경 대상**: `src/lib/i18n/ko.json`, `src/lib/i18n/en.json`
- **작업 내용**: `how.steps` 객체를 6개 새 키로 교체. 기존 4개 키 제거. heading 유지.
  - 새 키: `connectTracker`, `captureMode`, `editStyles`, `aiDraft`, `submitReport`, `trackIssues`
  - 각 키: `{ title, description }`
  - 카피는 PRD의 "6스텝 카피 초안" 참조
- **검증**:
  - [ ] JSON syntax 유효
  - [ ] ko.json과 en.json의 키 구조 일치
  - [ ] `npx tsc --noEmit` 통과

### Task 3: HowItWorks 컴포넌트 재작성

- **변경 대상**: `src/components/HowItWorks.tsx`
- **작업 내용**:
  1. `"use client"` 추가
  2. import 변경: `getTranslations` → `useTranslations`, `useState` 추가, shadcn Accordion import, `useScrollReveal` import, `HOW_KEYS` import
  3. 기존 `steps` 배열 및 `ol` 그리드 제거
  4. 새 레이아웃 구현:
     - `useState<string>(HOW_KEYS[0])`로 활성 키 관리
     - `useScrollReveal` 훅으로 스크롤 reveal
     - 외곽: heading + `flex gap-10` 컨테이너
     - 좌측(md only): `relative hidden md:block w-[520px] shrink-0`
       - 이미지 컨테이너: `overflow-hidden rounded-card border-[6px] md:border-[12px] border-border`
       - 이미지 6장 grid 스택: `grid` > `col-start-1 row-start-1` + `opacity` 전환
       - 그래디언트 오버레이: `absolute left-0 inset-y-0 w-[80px] bg-gradient-to-r from-background to-transparent pointer-events-none`
     - 우측: `flex-1`
       - `Accordion type="single" collapsible defaultValue={HOW_KEYS[0]} onValueChange={handleValueChange}`
       - `HOW_KEYS.map`으로 AccordionItem 렌더링
       - trigger에 번호 표시: `{i + 1}. {t(\`steps.${key}.title\`)}`
       - content에 description
  5. `handleValueChange`: value가 truthy일 때만 `setActiveKey` 호출
- **검증**:
  - [ ] 데스크톱(md+): 좌측 이미지 + 우측 Accordion 표시
  - [ ] Accordion 항목 클릭 시 이미지 페이드 전환
  - [ ] 첫 번째 항목 기본 펼쳐짐
  - [ ] 모든 항목 접힘 시 마지막 이미지 유지
  - [ ] 모바일(md 미만): Accordion만 표시, 이미지 hidden
  - [ ] 좌측 그래디언트 페이드 오버레이 표시
  - [ ] 스크롤 reveal 애니메이션 동작
  - [ ] `npx tsc --noEmit` 통과

### Task 4: 기존 이미지 정리 (선택)

- **변경 대상**: `public/images/how-steps/`
- **작업 내용**: 새 이미지 6장 배치 후 기존 `HowItWorks-1~4.webp` 삭제. 다른 곳에서 참조하지 않으므로 안전.
- **검증**:
  - [ ] `grep -r "HowItWorks-" src/` 결과 없음 (기존 참조 제거 확인)
  - [ ] 빌드 에러 없음

## 테스트 계획

- **수동 테스트 (브라우저)**:
  - [ ] `pnpm dev` → `/ko` 접속 → HowItWorks 섹션까지 스크롤
  - [ ] 데스크톱: 좌측 목업 + 우측 Accordion 레이아웃 확인
  - [ ] 첫 번째 항목("트래커 연동") 기본 펼쳐짐 + 해당 이미지 표시
  - [ ] 각 Accordion 항목 클릭 → 이미지 페이드 전환 확인
  - [ ] 펼쳐진 항목 재클릭 → 접힘, 이미지는 유지
  - [ ] 목업 좌측 그래디언트 오버레이 시각 확인
  - [ ] 브라우저 너비를 768px 이하로 줄임 → 이미지 숨김, Accordion만 표시
  - [ ] `/en` 접속 → 영문 카피 정상 표시
  - [ ] 스크롤 reveal 애니메이션 동작 확인
- **빌드 체크**:
  - [ ] `pnpm build` 성공
  - [ ] `npx tsc --noEmit` 통과
  - [ ] `pnpm lint` 통과

## 구현 순서 권장

1. **Task 1** (constants) → **Task 2** (i18n) — 순서 무관, 병렬 가능
2. **Task 3** (컴포넌트) — Task 1, 2 완료 후 진행
3. **Task 4** (이미지 정리) — 새 이미지 확보 후 진행
