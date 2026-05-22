# FAQ 섹션 — 기술 설계

## 개요

HowItWorks 섹션 아래, BottomCta 위에 shadcn/ui Accordion 기반 FAQ 섹션을 새로 추가한다. HowItWorks는 기존 그대로 유지한다. 서버 컴포넌트에서 i18n 번역을 가져와 클라이언트 컴포넌트(Accordion)에 전달하는 구조. FAQPage JSON-LD는 layout.tsx에서 같은 i18n 키로 생성한다.

### 페이지 배치 (변경 후)

```
Hero → Mockup → FeatureCards → Review → HowItWorks → FAQ(신규) → BottomCta → Footer
```

## 변경 범위

### 신규 파일

| 파일 | 역할 |
|---|---|
| `src/components/ui/accordion.tsx` | shadcn/ui Accordion (`npx shadcn@latest add accordion`으로 생성) |
| `src/components/Faq.tsx` | FAQ 섹션 컴포넌트 (async 서버 컴포넌트) |

### 수정 파일

| 파일 | 현재 역할 | 변경 내용 |
|---|---|---|
| `src/lib/i18n/ko.json` | 한글 메시지 | `faq` 네임스페이스 추가 |
| `src/lib/i18n/en.json` | 영문 메시지 | `faq` 네임스페이스 추가 |
| `src/app/[locale]/page.tsx` | 랜딩 페이지 조합 | HowItWorks section 아래에 Faq section 추가 |
| `src/app/[locale]/layout.tsx` | 메타데이터·JSON-LD | FAQPage JSON-LD script 태그 추가 |

### 건드리지 않는 파일

`HowItWorks.tsx`, `public/images/how-steps/*`, i18n `how` 네임스페이스 — 기존 그대로 유지. page.tsx에서도 HowItWorks를 제거하지 않는다.

## 데이터 흐름

```
i18n/ko.json (또는 en.json)
  └─ faq.heading, faq.items.{key}.q, faq.items.{key}.a
       ├─ Faq.tsx (getTranslations → Accordion children으로 전달)
       └─ layout.tsx (getTranslations → FAQPage JSON-LD 생성)
```

## 인터페이스 설계

### i18n 메시지 구조

```typescript
// faq 네임스페이스 타입 (next-intl이 자동 추론)
{
  heading: string;
  items: {
    [key in "whatIs" | "browser" | "pricing" | "ai" | "integrations" | "privacy"]: {
      q: string;
      a: string;
    };
  };
}
```

### Faq.tsx 컴포넌트

```typescript
// src/components/Faq.tsx
// async 서버 컴포넌트 — props 없음, 내부에서 getTranslations("faq") 호출
export async function Faq(): Promise<JSX.Element>
```

**핵심 결정**:
- **서버 컴포넌트**: `getTranslations`는 서버 전용. shadcn Accordion은 내부적으로 클라이언트 컴포넌트이지만, 서버 컴포넌트에서 렌더 가능 (React RSC 규칙).
- **`Accordion type="multiple"`**: 여러 항목 동시 펼치기 허용.
- **컨테이너**: `container mx-auto max-w-[800px]` — 텍스트 전용 콘텐츠이므로 가독성 위해 좁게. Review 섹션(960px)보다 약간 좁음.
- **ScrollReveal**: 헤딩 + 아코디언 블록 각각 1개씩 (섹션 레벨). 개별 AccordionItem에 걸지 않음 — 아코디언은 하나의 인터랙티브 블록.

### 스타일링

- 헤딩: 기존 섹션 헤딩과 동일 — `text-center text-3xl font-bold leading-tight tracking-tight md:text-[40px] md:leading-[48px]`. `t("heading")` 사용 (brand 하이라이트 불필요).
- AccordionTrigger: 기본 shadcn 스타일에 `text-base md:text-lg` 오버라이드 (기본 `text-sm`이 랜딩 페이지에 비해 작음).
- AccordionContent: `text-muted-foreground` 추가로 Q/A 시각 위계 구분.
- 아코디언 상단 여백: `mt-12` (헤딩과 아코디언 사이, 기존 섹션들과 동일).

### FAQPage JSON-LD

```typescript
// layout.tsx에 추가
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqKeys.map((key) => ({
    "@type": "Question",
    name: faqT(`items.${key}.q`),
    acceptedAnswer: {
      "@type": "Answer",
      text: faqT(`items.${key}.a`),
    },
  })),
};
```

기존 SoftwareApplication 스키마와 별도 `<script type="application/ld+json">` 태그로 추가.

## 기존 패턴 준수

- **섹션 구조**: outer `<section>` (border-b + padding)은 page.tsx에 배치. Faq.tsx 내부에 section을 넣지 않음. FeatureCards·HowItWorks와 동일 패턴.
- **반응형**: `md:` 브레이크포인트만 사용.
- **i18n**: `getTranslations` (서버) 패턴. `useTranslations` (클라이언트) 아님.
- **shadcn/ui 우선**: Accordion은 `npx shadcn@latest add accordion`으로 설치.
- **아이콘**: lucide-react (Accordion 내부에서 ChevronDown 사용 — shadcn 기본).

## 대안 검토

**정적 리스트 (채택하지 않음)**: 모든 Q&A가 펼쳐진 채 보이는 방식. 추가 의존성 불필요하나, 6개 항목이 모두 보이면 페이지가 길어지고 사용자가 관심 있는 항목을 찾기 어려움. 아코디언이 FAQ UX의 표준 패턴이고 FAQPage 리치 스니펫과도 자연스럽게 대응.

## 위험 요소

- **`output: 'export'` 환경에서 Radix Accordion 동작**: Radix UI 컴포넌트는 정적 빌드에서 정상 동작한다 (클라이언트 JS로 번들됨). 기존 Mockup.tsx도 클라이언트 인터랙션을 사용 중이므로 동일 패턴.
- **faqKeys 중복**: `Faq.tsx`와 `layout.tsx`에 각각 키 배열 정의. 6개 문자열이라 공유 파일 추출은 과도한 추상화. 항목 추가/삭제 시 양쪽 모두 업데이트 필요.
