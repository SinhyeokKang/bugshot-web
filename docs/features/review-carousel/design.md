# Review Carousel — 기술 설계

## 개요

기존 서버 컴포넌트 Review.tsx를 클라이언트 컴포넌트로 전환한다. Mockup.tsx의 grid 스택 + opacity 페이드 기법을 차용하여 레이아웃 시프트 없이 리뷰를 전환한다. `useRef`로 타이머를 관리하며 5초 자동 전환을 구현하고, dot 클릭 시 명시적으로 타이머를 리셋한다.

> **Mockup.tsx와의 차이**: Mockup.tsx에서 차용하는 것은 grid 스택 + opacity 전환 기법뿐이다. 자동 전환(Mockup에는 없음), 네비게이션 형태(아이콘+텍스트 버튼 vs dot), ScrollReveal 위임 방식이 다르다.

## 변경 범위

### 수정 파일

| 파일 | 현재 역할 | 변경 내용 |
|---|---|---|
| `src/components/Review.tsx` | 단일 리뷰 표시 (서버 컴포넌트) | 클라이언트 컴포넌트로 전환, 캐러셀 + dot navigation + 자동 전환 |
| `src/lib/i18n/ko.json` | 한글 메시지 | `review` 네임스페이스 구조 변경 (단일 → items 객체) |
| `src/lib/i18n/en.json` | 영문 메시지 | 동일 |
| `src/lib/constants.ts` | 외부 링크 + FAQ_KEYS | `REVIEW_KEYS` 상수 추가 |

### 건드리지 않는 파일

- `src/app/[locale]/page.tsx` — Review를 감싸는 `<ScrollReveal>` 구조 그대로 유지.
- `src/components/ScrollReveal.tsx` — 변경 없음. Review의 입장 애니메이션은 이미 처리 중.

## 데이터 흐름

```
i18n/ko.json (또는 en.json)
  └─ review.srHeading, review.items.{key}.{author|quote|source}
       └─ Review.tsx (useTranslations → carousel children으로 렌더)
```

`getTranslations` (서버 전용) → `useTranslations` (클라이언트)로 전환. `NextIntlClientProvider`가 layout.tsx에서 이미 messages를 제공 중이므로 추가 설정 불필요.

## 인터페이스 설계

### i18n 메시지 구조 (변경 후)

```typescript
{
  review: {
    srHeading: string;
    items: {
      [key in "qe" | string]: {
        author: string;
        quote: string;
        source: string;
      };
    };
  };
}
```

### REVIEW_KEYS 상수

```typescript
// src/lib/constants.ts
export const REVIEW_KEYS = ["qe", "designer"] as const;
```

키 이름은 리뷰어 역할을 나타내는 짧은 slug. **REVIEW_KEYS 배열의 순서가 캐러셀 표시 순서를 결정한다** — i18n의 `items` 객체는 순서를 보장하지 않으므로, 항상 이 상수 배열을 기준으로 순회한다.

### Review.tsx 컴포넌트

```typescript
// src/components/Review.tsx
"use client";

// 클라이언트 컴포넌트 — useTranslations + useState + useEffect
export function Review(): JSX.Element
```

**상태**:
- `active: number` — 현재 표시 중인 리뷰 인덱스

**타이머 관리 (useRef)**:
```typescript
const timerRef = useRef<ReturnType<typeof setInterval>>(null);

function resetTimer() {
  if (timerRef.current) clearInterval(timerRef.current);
  timerRef.current = setInterval(() => {
    setActive((prev) => (prev + 1) % REVIEW_KEYS.length);
  }, 5000);
}

// dot 클릭 시
function goTo(index: number) {
  setActive(index);
  resetTimer();
}
```

`useRef`로 타이머 ID를 관리. dot 클릭 시에만 명시적으로 리셋하여, 자동 전환 시 불필요한 타이머 재생성을 방지한다.

**탭 비활성 처리 (visibilitychange)**:
```typescript
useEffect(() => {
  function handleVisibility() {
    if (document.hidden) {
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      resetTimer();
    }
  }
  document.addEventListener("visibilitychange", handleVisibility);
  return () => document.removeEventListener("visibilitychange", handleVisibility);
}, []);
```

브라우저 탭 비활성 시 타이머 정지, 복귀 시 리셋하여 밀린 전환 방지.

**접근성 — 자동 전환 일시정지**:
- hover(`mouseenter`/`mouseleave`) 시 타이머 정지/재개
- 캐러셀 영역에 focus가 있을 때 타이머 정지 (`focusin`/`focusout`)
- `prefers-reduced-motion: reduce` 환경에서 자동 전환 비활성화 + opacity 전환 `duration-0`

```typescript
const prefersReducedMotion = useRef(
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
);
// prefersReducedMotion.current가 true면 자동 전환 시작하지 않음
```

## 스타일링

### 레이아웃 시프트 방지 (Grid 스택)

모든 리뷰를 동일 grid cell에 중첩. 컨테이너 높이 = 가장 긴 리뷰가 자동 결정.

```tsx
<div className="grid">
  {REVIEW_KEYS.map((key, i) => (
    <blockquote
      key={key}
      className={cn(
        "col-start-1 row-start-1 transition-opacity duration-300 ease-out",
        i === active ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-hidden={i !== active}
    >
      ...
    </blockquote>
  ))}
</div>
```

### Dot Navigation

```tsx
<div
  className="mt-8 flex justify-center gap-2"
  role="tablist"
  aria-label={t("srHeading")}
>
  {REVIEW_KEYS.map((_, i) => (
    <button
      key={i}
      role="tab"
      aria-selected={i === active}
      onClick={() => goTo(i)}
      onKeyDown={handleArrowKey}
      aria-label={t("dotLabel", { index: i + 1 })}
      className={cn(
        "flex items-center justify-center h-[44px] w-[44px] transition-colors duration-300",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full transition-colors duration-300",
          i === active ? "bg-foreground" : "bg-foreground/20"
        )}
      />
    </button>
  ))}
</div>
```

- dot 시각적 크기: `h-2 w-2` (8px), 터치 타겟: `h-[44px] w-[44px]` (WCAG 최소 기준)
- active: `bg-foreground`, inactive: `bg-foreground/20`
- gap: `gap-2` (8px)
- ARIA: `role="tablist"` + `role="tab"` + `aria-selected`
- 키보드: 좌우 화살표 키로 이전/다음 dot 이동 (`handleArrowKey`)
- i18n: `aria-label`에 `t("dotLabel", { index })` 사용 (ko: "리뷰 {index}", en: "Review {index}")

### 기존 스타일 유지

리뷰 텍스트 스타일(폰트 사이즈, 인용부호, 저자 표기 등)은 현재 Review.tsx 그대로 유지. 레이아웃 컨테이너(`container mx-auto max-w-[960px]`)도 동일. `max-w-[960px]`은 CLAUDE.md의 섹션 컨벤션(`max-w-[1200px]`)과 다르지만, 리뷰 인용문의 최적 읽기 폭(measure)을 위한 의도적 예외이다.

## 기존 패턴 준수

- **반응형**: `md:` 브레이크포인트만 사용.
- **i18n**: `useTranslations` (클라이언트) 패턴. Mockup.tsx가 동일 패턴 사용 중.
- **캐러셀 전환**: Mockup.tsx의 grid 스택 + opacity 기법을 차용. `transition-opacity duration-300 ease-out`. `prefers-reduced-motion: reduce` 시 `duration-0`.
- **섹션 구조**: page.tsx의 `<ScrollReveal className="border-b py-20 md:py-[120px]">` 래퍼 유지. Review 내부에 section을 넣지 않음.
- **상수 관리**: FAQ_KEYS와 동일 패턴으로 REVIEW_KEYS 정의.

## 대안 검토

**CSS scroll-snap 기반 가로 스크롤 (채택하지 않음)**: 네이티브 스크롤로 자동 전환 구현이 어렵고, 레이아웃 시프트 제어가 불편. grid 스택 + opacity가 이 프로젝트에서 검증된 패턴이고 시프트가 원천 차단됨.

**embla-carousel 등 외부 라이브러리 (채택하지 않음)**: 2개 리뷰의 단순 페이드 전환에 라이브러리는 과잉. 의존성 0으로 직접 구현해도 코드량이 적고 기존 Mockup.tsx 패턴을 참조할 수 있어 유지보수 부담이 없다.

## 위험 요소

- **리뷰가 1개일 때**: REVIEW_KEYS 길이 1이면 dot navigation 불필요. `REVIEW_KEYS.length > 1` 조건으로 dot 렌더링 및 자동 전환을 분기.
- **서버→클라이언트 전환**: `getTranslations` → `useTranslations` 변경. 기존 서버 컴포넌트에서 호출하던 방식과 다르지만, Mockup.tsx가 이미 같은 패턴을 사용 중.
- **접근성(a11y)**: 자동 전환 캐러셀은 WCAG 2.1 SC 2.2.2(일시정지 수단), SC 2.3.3(모션 감소), 키보드 접근성을 모두 충족해야 한다. hover/focus 일시정지, `prefers-reduced-motion` 대응, `role="tablist"` + 화살표 키 지원으로 대응.
- **ScrollReveal opacity 중첩**: ScrollReveal이 `opacity-0 → opacity-100` 입장 애니메이션을 하고, Review 내부에서도 opacity 전환을 한다. 부모가 아직 `opacity-0`인 시점에 자식 전환이 시작되어도 기능상 문제 없으나(타이머는 ScrollReveal과 무관하게 동작), 시각적으로 입장 후에만 전환이 보인다.
