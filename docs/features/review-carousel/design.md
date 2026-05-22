# Review Carousel — 기술 설계

## 개요

기존 서버 컴포넌트 Review.tsx를 클라이언트 컴포넌트로 전환한다. Mockup.tsx와 동일한 grid 스택 + opacity 페이드 패턴으로 레이아웃 시프트 없이 리뷰를 전환한다. `useEffect` + `setInterval`로 5초 자동 전환을 구현하고, active 인덱스 변경 시 타이머를 리셋한다.

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
export const REVIEW_KEYS = ["qe", "..."] as const;
```

키 이름은 리뷰어 역할을 나타내는 짧은 slug. 두 번째 리뷰 키는 내용에 따라 결정.

### Review.tsx 컴포넌트

```typescript
// src/components/Review.tsx
"use client";

// 클라이언트 컴포넌트 — useTranslations + useState + useEffect
export function Review(): JSX.Element
```

**상태**:
- `active: number` — 현재 표시 중인 리뷰 인덱스

**자동 전환 로직**:
```typescript
useEffect(() => {
  const timer = setInterval(() => {
    setActive((prev) => (prev + 1) % REVIEW_KEYS.length);
  }, 5000);
  return () => clearInterval(timer);
}, [active]);
```

`active`를 dependency에 포함하여 dot 클릭 시 타이머가 자동 리셋됨. cleanup → 새 interval 생성.

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
<div className="mt-8 flex justify-center gap-2">
  {REVIEW_KEYS.map((_, i) => (
    <button
      key={i}
      onClick={() => setActive(i)}
      aria-label={`Review ${i + 1}`}
      className={cn(
        "h-2 w-2 rounded-full transition-colors duration-300",
        i === active ? "bg-foreground" : "bg-foreground/20"
      )}
    />
  ))}
</div>
```

- dot 크기: `h-2 w-2` (8px)
- active: `bg-foreground`, inactive: `bg-foreground/20`
- gap: `gap-2` (8px)

### 기존 스타일 유지

리뷰 텍스트 스타일(폰트 사이즈, 인용부호, 저자 표기 등)은 현재 Review.tsx 그대로 유지. 레이아웃 컨테이너(`container mx-auto max-w-[960px]`)도 동일.

## 기존 패턴 준수

- **반응형**: `md:` 브레이크포인트만 사용.
- **i18n**: `useTranslations` (클라이언트) 패턴. Mockup.tsx가 동일 패턴 사용 중.
- **캐러셀 전환**: Mockup.tsx의 grid 스택 + opacity 패턴과 동일. `transition-opacity duration-300 ease-out`.
- **섹션 구조**: page.tsx의 `<ScrollReveal className="border-b py-20 md:py-[120px]">` 래퍼 유지. Review 내부에 section을 넣지 않음.
- **상수 관리**: FAQ_KEYS와 동일 패턴으로 REVIEW_KEYS 정의.

## 대안 검토

**CSS scroll-snap 기반 가로 스크롤 (채택하지 않음)**: 네이티브 스크롤로 자동 전환 구현이 어렵고, 레이아웃 시프트 제어가 불편. grid 스택 + opacity가 이 프로젝트에서 검증된 패턴이고 시프트가 원천 차단됨.

## 위험 요소

- **리뷰가 1개일 때**: REVIEW_KEYS 길이 1이면 dot navigation 불필요. `REVIEW_KEYS.length > 1` 조건으로 dot 렌더링 및 자동 전환을 분기.
- **서버→클라이언트 전환**: `getTranslations` → `useTranslations` 변경. 기존 서버 컴포넌트에서 호출하던 방식과 다르지만, Mockup.tsx가 이미 같은 패턴을 사용 중.
