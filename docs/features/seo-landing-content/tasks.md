# Landing Content — 구현 태스크

## 선행 조건
- simple-icons에 8개 브랜드 아이콘 존재 확인(`Si{Name}`). 부재 브랜드는 텍스트 라벨 폴백.
- 타깃 키워드 KO 대응어 확정(예: "화면 녹화", "비주얼 버그 리포트" 등).
- 연락처 노출 방식 확정: `CONTACT_EMAIL` mailto vs GitHub Issues 링크.

## 태스크

### Task 1: INTEGRATIONS 상수 정의
- **변경 대상**: `src/lib/constants.ts`
- **작업 내용**: `INTEGRATIONS`(8종 `{key,label,docPath}`) 추가.
- **검증**:
  - [ ] `npx tsc --noEmit` 통과
  - [ ] 8개 항목·docPath 정확

### Task 2: IntegrationStrip 컴포넌트 + 섹션 삽입
- **변경 대상**: `src/components/IntegrationStrip.tsx`(신규), `src/app/[locale]/page.tsx`
- **작업 내용**: 8개 브랜드 아이콘+라벨 렌더, docs 연동 가이드 링크. HowItWorks와 Review 사이 `<section border-b py>` + `container max-w-[1200px]`로 삽입. 제목/설명은 i18n.
- **검증**:
  - [ ] `/en`·`/ko` 렌더 HTML에 8개 트래커명 노출(접힘 없음)
  - [ ] 섹션 구조(full-width border-b + inner container) 준수
  - [ ] 모바일/데스크톱 레이아웃·가로스크롤 없음
  - [ ] 링크가 로케일 인식(`/en/docs/...`, `/ko/docs/...`)

### Task 3: FAQ 연동 답변 8종 동기화
- **변경 대상**: `src/lib/i18n/en.json`·`ko.json`(`faq.items.integrations.a`)
- **작업 내용**: 6종 → 8종(ClickUp·Slack 추가). 가능하면 목록 부분을 `INTEGRATIONS` 참조.
- **검증**:
  - [ ] 랜딩 FAQ와 로고 스트립 목록 일치
  - [ ] FAQ JSON-LD(`page.tsx` `stripRichTags`)에 8종 반영
  - [ ] docs FAQ(7+Slack)와 정합

### Task 4: 자체완결 소개 문단 + 타깃 키워드
- **변경 대상**: `src/lib/i18n/en.json`·`ko.json`, `src/components/Hero.tsx` 또는 신규 intro 섹션 + `page.tsx`
- **작업 내용**: ~150단어 자체완결 소개 문단(제품 정의 + 캡처/녹화/로그/연동 + 무가입) 추가. "visual bug report"·"screen recording"·"QA browser extension"(및 KO 대응어) 자연스럽게 포함.
- **검증**:
  - [ ] trafilatura(또는 render_page)로 추출 시 하나의 인용 가능한 문단으로 잡힘
  - [ ] 타깃 키워드 존재(en/ko)
  - [ ] LCP/CLS 회귀 없음(above-the-fold 밀림 없음)

### Task 5: 푸터 About/연락처 노출
- **변경 대상**: `src/components/Footer.tsx`, i18n
- **작업 내용**: "Built by …" 한 줄 + 연락처(`CONTACT_EMAIL` mailto 또는 GitHub Issues). 기존 ©·GitHub·Privacy 유지.
- **검증**:
  - [ ] 푸터에 연락처 노출·클릭 동작
  - [ ] en/ko 문구 정합

## 테스트 계획
- 단위 테스트: `INTEGRATIONS` 소비 로직이 순수 함수화되면 Vitest 케이스 추가(선택). 기본은 없음.
- 수동 테스트:
  - [ ] `/en`·`/ko` Chrome 렌더 확인(로고 스트립·소개 문단·푸터)
  - [ ] Rich Results Test로 FAQPage 8종 확인
  - [ ] `pnpm build` 성공, next-intl 누락 키 경고 0

## 구현 순서 권장
Task 1 → Task 2·3(상수 의존). Task 4·5는 독립 — 병렬 가능.
