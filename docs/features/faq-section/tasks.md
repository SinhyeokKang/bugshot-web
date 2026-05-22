# FAQ 섹션 — 구현 태스크

## 선행 조건

- shadcn/ui 설치 환경 확인 (`components.json` 존재)
- pnpm 사용

## 태스크

### Task 1: shadcn Accordion 설치

- **작업 내용**: `npx shadcn@latest add accordion` 실행
- **결과 파일**: `src/components/ui/accordion.tsx` 생성, `@radix-ui/react-accordion` 의존성 추가
- **검증**:
  - [ ] `src/components/ui/accordion.tsx` 파일 존재
  - [ ] `package.json`에 `@radix-ui/react-accordion` 포함
  - [ ] `npx tsc --noEmit` 통과

### Task 2: i18n 메시지 추가

- **변경 대상**: `src/lib/i18n/ko.json`, `src/lib/i18n/en.json`
- **작업 내용**: 양 파일에 `faq` 네임스페이스 추가. 키 구조: `faq.heading`, `faq.items.{browser|pricing|ai|integrations|privacy}.{q|a}` (5개 항목)
- **검증**:
  - [ ] ko.json과 en.json의 `faq` 키 구조가 동일
  - [ ] 모든 항목에 q, a 값이 비어있지 않음
  - [ ] 기존 `how` 네임스페이스 그대로 유지됨
  - [ ] 답변 내 특수문자(따옴표, 앰퍼샌드 등)가 JSON-LD 직렬화 시 깨지지 않음
- **참고**: 답변 텍스트(ko/en)는 PRD의 "FAQ 답변" 섹션에 확정됨. bugshot-2 코드베이스 검증 완료

### Task 2.5: FAQ_KEYS 상수 추가

- **변경 대상**: `src/lib/constants.ts`
- **작업 내용**: `FAQ_KEYS` 배열을 `as const`로 export. 키: `["browser", "pricing", "ai", "integrations", "privacy"]`
- **검증**:
  - [ ] `constants.ts`에서 `FAQ_KEYS` export 확인
  - [ ] 키 목록이 i18n JSON의 `faq.items` 키와 일치

### Task 3: Faq.tsx 컴포넌트 생성

- **변경 대상**: `src/components/Faq.tsx` (신규)
- **작업 내용**:
  - async 서버 컴포넌트로 생성
  - `getTranslations("faq")` 사용
  - `FAQ_KEYS`를 `constants.ts`에서 import
  - `container mx-auto max-w-[960px]` 컨테이너
  - `<h2 id="faq-heading">` + 기존 섹션 헤딩 스타일
  - `Accordion type="single" collapsible` + 5개 AccordionItem
  - ScrollReveal: 헤딩(`as="div"`) + 아코디언 블록(`as="div"`) 각 1개
  - AccordionTrigger에 className prop으로 `text-base md:text-lg` 오버라이드 (`cn()` 병합)
  - AccordionContent에 className prop으로 `text-base text-muted-foreground` 추가
- **검증**:
  - [ ] `npx tsc --noEmit` 통과
  - [ ] export된 함수명이 `Faq`

### Task 4: page.tsx에 Faq 섹션 추가

- **변경 대상**: `src/app/[locale]/page.tsx`
- **작업 내용**:
  - `Faq` import 추가 (HowItWorks import 유지)
  - HowItWorks section 아래, BottomCta ScrollReveal 위에 FAQ section 추가:
    ```tsx
    <section aria-labelledby="faq-heading" className="border-b py-20 md:py-[120px]">
      <Faq />
    </section>
    ```
- **검증**:
  - [ ] `pnpm dev` → `/ko` 에서 HowItWorks 아래 FAQ 아코디언 렌더링
  - [ ] `/en` 에서 영문 FAQ 렌더링
  - [ ] HowItWorks 섹션 기존 그대로 유지
  - [ ] 5개 항목 모두 펼침/접기 동작
  - [ ] 다른 항목 클릭 시 기존 항목 자동 접힘 (`type="single"`)
  - [ ] 모바일 뷰포트(375px)에서 정상 표시
  - [ ] ScrollReveal 애니메이션 동작

### Task 5: FAQPage JSON-LD 추가

- **변경 대상**: `src/app/[locale]/layout.tsx`
- **작업 내용**:
  - `const faqT = await getTranslations({ locale, namespace: "faq" })` 추가
  - `FAQ_KEYS`를 `constants.ts`에서 import
  - `faqJsonLd` 객체 생성 (FAQPage 스키마, `url` 속성 포함)
  - 별도 `<script type="application/ld+json">` 태그로 렌더
- **검증**:
  - [ ] 페이지 소스에서 FAQPage JSON-LD 확인
  - [ ] JSON-LD에 `url` 속성이 locale별로 올바르게 포함
  - [ ] 기존 SoftwareApplication JSON-LD 유지 확인
  - [ ] ko/en 각각 해당 locale의 번역이 JSON-LD에 반영
  - [ ] Google Rich Results Test로 FAQPage 유효성 검증

### Task 6: 최종 빌드 확인

- **작업 내용**: `pnpm build` 실행
- **검증**:
  - [ ] 정적 빌드 성공 (exit code 0)
  - [ ] `out/ko.html`, `out/en.html` 모두 생성
  - [ ] Lighthouse SEO 점수 90 이상

## 테스트 계획

- **수동 테스트**: 
  - [ ] `/ko` FAQ 5개 항목 펼침/접기
  - [ ] `/en` FAQ 5개 항목 펼침/접기
  - [ ] `type="single"` 동작: 항목 열면 이전 항목 자동 접힘
  - [ ] `collapsible` 동작: 열린 항목 재클릭 시 접힘
  - [ ] 키보드 내비게이션 (Tab, Enter/Space로 토글, Arrow Up/Down으로 트리거 간 포커스 이동)
  - [ ] 모바일 뷰포트 (375px) 레이아웃 확인
  - [ ] 데스크톱 뷰포트에서 max-w-[960px] 중앙 정렬 확인
  - [ ] ScrollReveal: 스크롤 시 FAQ 섹션 fade-in 동작
  - [ ] HowItWorks 섹션 정상 동작 (회귀 없음)
  - [ ] 다른 섹션(Hero, Mockup, FeatureCards, Review, BottomCta, Footer) 회귀 없음
  - [ ] Google Rich Results Test로 FAQPage JSON-LD 유효성 검증

## 구현 순서 권장

```
Task 1 (Accordion 설치) + Task 2 (i18n) + Task 2.5 (FAQ_KEYS 상수)  [병렬 가능]
  → Task 3 (Faq.tsx)  [Task 1, 2, 2.5 완료 후]
    → Task 4 (page.tsx) + Task 5 (JSON-LD)  [병렬 가능]
      → Task 6 (빌드 확인)
```
