---
description: 변경된 코드를 시급도별로 보고. 리포트 전용 — fix·빌드·커밋 안 함.
---

큰 작업을 끝낸 뒤 "지금 변경한 코드"에 대한 객관적 리뷰가 필요할 때 호출한다. **리포트 전용 스킬** — 빌드/타입체크 안 돌리고, 자동 fix 안 하고, 커밋도 안 한다. 시급도 분류된 발견 리스트만 출력하고 끝.

## 사용

- `/code-review` — **`origin/main` 대비 working tree 전체**.
- `/code-review <base>` — 임의 base 대비.

## 절차

### 1. 변경 범위 확인 (병렬)

base 결정:
- 인자 없으면 `origin/main`. (먼저 `git fetch origin main`.)
- 인자 있으면 그 인자 그대로.

병렬 실행:
- `git status`
- `git diff <base> --stat`
- `git log <base>..HEAD --oneline`

`git diff <base> --stat` 결과 0이면 즉시 종료: "리뷰할 변경 없음."

### 2. 리뷰 실행

변경 파일들의 diff를 CLAUDE.md 컨벤션에 비추어 검토.

#### 카테고리

- **UI / 디자인**: shadcn/ui 우선, Tailwind shadcn CSS 변수만, 커스텀 색상 남발 금지, CTA 버튼 사이즈(xl), 반응형 레이아웃 일관성, 새 UI 추가 시 기존 코드와 패턴 일치 여부.
- **SEO**: 메타 태그, JSON-LD, OG 이미지, 시맨틱 HTML(h1/h2/section/nav/footer), alt 텍스트.
- **성능**: next/image 사용 여부, 불필요한 client-side JS, Lighthouse 점수 영향, 번들 크기.
- **접근성**: 키보드 내비게이션, ARIA, 색상 대비, focus-visible.
- **코드 스타일**: `@/` 경로, 주석 최소화, 불필요한 추상화·shim 금지, 중복 코드.
- **일반**: 데드 코드, 외부 링크 정합성, 하드코딩된 URL(constants.ts 사용 여부).

### 3. 시급도 분류 + 보고

- **🔴 심각** — 동작이 깨지는 버그, SEO 치명적 오류, 보안 이슈.
- **🟡 권장** — 컨벤션 위반, 성능 저하, 접근성 문제.
- **⚪ 사소** — 스타일·정리 거리.

각 항목 형식:
```
1. 파일:줄 — 한 줄 요약. (근거)
```

발견 0개면 "✅ 큰 문제 없음." 한 줄.

### 4. 종료

여기서 끝. 후속 질문·액션 없음.

## 금지 사항

- **빌드 / typecheck 실행 금지** — 정적 진단만.
- **자동 fix 금지** — 발견을 리포트할 뿐 코드를 변경하지 않는다.
- **커밋 / staging 안 함**.
- **변경 범위 밖 파일 검토 금지**.
