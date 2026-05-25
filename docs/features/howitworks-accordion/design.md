# HowItWorks Accordion — 기술 설계

## 개요

기존 서버 컴포넌트(`HowItWorks`)를 클라이언트 컴포넌트로 전환하여, shadcn Accordion + 이미지 스왑 상태를 관리한다. 좌측 목업 영역은 `grid` 스택 + opacity 전환(Mockup.tsx 패턴)으로 이미지를 교체하고, 우측에 기존 Faq.tsx와 동일한 shadcn Accordion을 사용한다.

## 변경 범위

### 수정 파일

#### `src/components/HowItWorks.tsx`
- **현재**: 서버 컴포넌트. `getTranslations` 사용. 4스텝 카드 그리드(`ol > li`).
- **변경**: 클라이언트 컴포넌트로 전환. `useTranslations` 사용. 좌측 목업 + 우측 Accordion 레이아웃.
  - `"use client"` 추가
  - `useState`로 활성 스텝 인덱스 관리
  - `Accordion` `onValueChange`로 활성 스텝 동기화
  - 이미지 전환: `grid` 스택 + `opacity` 토글 (Mockup.tsx의 슬라이드 전환 패턴)
  - ScrollReveal 유지 (`useScrollReveal` 훅 사용)
  - 좌측 그래디언트 오버레이: absolute positioned div + `bg-gradient-to-r from-background to-transparent`

#### `src/lib/constants.ts`
- **현재**: `FAQ_KEYS`, `REVIEW_KEYS` 정의.
- **변경**: `HOW_KEYS` 배열 추가.
  ```ts
  export const HOW_KEYS = [
    "launch",
    "connectTracker",
    "inspectCaptureRecord",
    "aiDraft",
    "submitReport",
    "trackIssues",
  ] as const;
  ```

#### `src/lib/i18n/ko.json` — `how` 섹션
- **현재**: `how.steps`에 4개 키 (`launch`, `recordInspect`, `aiReport`, `submit`).
- **변경**: 6개 키로 교체. 기존 4키 제거, 새 6키 추가. heading 유지.

#### `src/lib/i18n/en.json` — `how` 섹션
- **현재**: 4개 키.
- **변경**: ko.json과 동일 구조로 6개 키 교체.

### 변경 없는 파일

- `src/app/[locale]/page.tsx` — HowItWorks 호출부 변경 없음. `<section>` 래퍼도 그대로.
- `src/components/ui/accordion.tsx` — shadcn Accordion 그대로 사용.
- `src/components/ScrollReveal.tsx`, `src/hooks/useScrollReveal.ts` — 변경 없음.

### 삭제되는 것

- 기존 `how.steps` i18n 키 4개 (`recordInspect`, `aiReport`, `submit` 제거. `launch`는 키 유지하되 description 변경).

## 데이터 흐름

```
[Accordion onValueChange] → setState(activeKey)
                                ↓
                        activeKey → 이미지 인덱스
                                ↓
                    grid 스택 이미지 opacity 토글
```

- `Accordion`의 `type="single"`, `collapsible`, `defaultValue={HOW_KEYS[0]}`
- `onValueChange(value)`: value가 빈 문자열이면 (모두 접힘) activeKey를 변경하지 않음 → 마지막 이미지 유지
- value가 있으면 `setActiveKey(value)` → 해당 키의 이미지에 `opacity-100`, 나머지 `opacity-0`

## 인터페이스 설계

```ts
// constants.ts
export const HOW_KEYS = [
  "launch",
  "connectTracker",
  "inspectCaptureRecord",
  "aiDraft",
  "submitReport",
  "trackIssues",
] as const;

type HowKey = (typeof HOW_KEYS)[number];
```

```ts
// HowItWorks.tsx 내부 상태
const [activeKey, setActiveKey] = useState<string>(HOW_KEYS[0]);

// Accordion onValueChange
const handleValueChange = (value: string) => {
  if (value) setActiveKey(value);
};
```

## 레이아웃 상세 (Figma 기준)

### 데스크톱 (md+)

```
container max-w-[1200px]
├── heading (centered)
└── flex gap-10 (40px)
    ├── 목업 영역 (w-[520px], relative, hidden md:block)
    │   ├── image container (rounded-card border-[12px] border-border overflow-hidden)
    │   │   └── grid 스택 이미지 6장 (opacity 전환)
    │   └── gradient overlay (absolute left-0 inset-y-0 w-[80px])
    └── accordion 영역 (flex-1)
        └── Accordion (6 items, single, collapsible)
```

### 모바일 (md 미만)

```
container max-w-[1200px]
├── heading (centered)
└── accordion 영역 (full width)
    └── Accordion (6 items)
```

### 목업 이미지 스펙

- 종횡비: 520×800 (실제 제공 이미지 기준)
- 포맷: webp
- 네이밍: `/images/how-steps/how-{key}.webp` (예: `how-launch.webp`)
- border: Mockup 섹션과 동일 — `rounded-card border-[6px] md:border-[12px] border-border`
- 좌측 그래디언트: `absolute left-0 inset-y-0 w-[80px] bg-gradient-to-r from-background to-transparent`

### Accordion 스타일

- 기존 `Faq.tsx`의 Accordion 스타일과 동일한 shadcn Accordion 사용.
- trigger: `text-[18px] font-semibold md:text-[20px]`
- 각 항목 앞에 번호 표시: `{i + 1}. {title}`
- content: `text-base text-foreground`
- divider: shadcn AccordionItem의 기본 `border-b`

## 기존 패턴 준수

- **클라이언트 컴포넌트 전환**: Mockup.tsx와 동일한 패턴 — `"use client"` + `useTranslations` + `useState`.
- **이미지 전환**: Mockup.tsx의 `grid` 스택 + `opacity` 전환 패턴 재사용.
- **Accordion 사용**: Faq.tsx의 shadcn Accordion 사용 패턴과 동일.
- **ScrollReveal**: `useScrollReveal` 훅 사용 (클라이언트 컴포넌트이므로 `ref` 기반).
- **반응형**: `md:` 브레이크포인트만 사용. 모바일 기본 → md에서 데스크톱.
- **섹션 구조**: outer `<section>`은 page.tsx에서 이미 감싸고 있으므로 컴포넌트 내부는 `<div>`.
- **이미지 네이밍**: `/images/how-steps/` 디렉터리 유지.
- **constants 패턴**: `FAQ_KEYS`, `REVIEW_KEYS`와 동일하게 `HOW_KEYS` 정의.

## 대안 검토

### A. Accordion 대신 탭(Tab) UI
Figma 디자인이 Accordion을 명시하고 있고, 기존 Faq에서 이미 Accordion 패턴이 검증되어 있으므로 Accordion 채택. Tab은 6개 항목에서 라벨이 길어 모바일 가로 공간이 부족하다.

### B. 서버 컴포넌트 유지 + 클라이언트 래퍼 분리
이미지 전환과 Accordion 상태가 밀접하게 연결되어 있어, 컴포넌트 전체를 클라이언트로 전환하는 것이 더 단순하다. Mockup.tsx도 동일한 이유로 전체가 클라이언트 컴포넌트다.

## 위험 요소

- **이미지 미제공 시 빈 화면**: 6장의 이미지가 준비되기 전까지 데스크톱에서 빈 목업 영역이 보일 수 있다. placeholder 이미지를 넣거나, 이미지 없을 때 영역을 숨기는 방어 코드는 스코프 외 — 이미지 준비 후 배포.
- **Accordion 높이 변동**: 각 스텝의 description 길이가 다르면 Accordion 영역 높이가 변동하고, 좌측 이미지 영역 높이와 불일치할 수 있다. 좌측 이미지 영역은 aspect-ratio로 자체 높이를 유지하므로 문제없음.
