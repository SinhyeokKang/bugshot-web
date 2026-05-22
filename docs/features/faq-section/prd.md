# FAQ 섹션

## 배경

랜딩 페이지에 잠재 사용자의 공통 궁금증(가격, 브라우저 호환, 데이터 처리 등)에 답하는 FAQ 섹션이 없다. HowItWorks 섹션 아래에 FAQ 아코디언을 추가하면 전환 전 의사결정에 필요한 정보를 제공하고, FAQPage JSON-LD를 통해 Google 검색결과에 리치 스니펫으로 노출될 수 있다.

## 목표

- HowItWorks 아래, BottomCta 위에 FAQ 아코디언 섹션을 추가한다.
- FAQPage 구조화 데이터를 추가해 SERP 리치 스니펫 노출 가능성을 확보한다.
- ko/en 양 locale에서 동일한 FAQ 경험을 제공한다.

## 비목표 (Non-goals)

- HowItWorks 섹션 제거 또는 변경. 기존 그대로 유지한다.
- FAQ 항목의 카테고리 분류나 검색 기능.
- FAQ를 CMS나 외부 소스에서 동적 로딩.

## 사용자 시나리오

1. 사용자가 HowItWorks 섹션을 지나 스크롤하다 "자주 묻는 질문" 섹션을 만난다.
2. 궁금한 질문을 클릭하면 답변이 아코디언으로 펼쳐진다. 다른 항목을 클릭하면 이전 항목은 자동으로 접힌다.
3. Google에서 "BugShot 무료인가요" 같은 검색 시 FAQ 리치 스니펫이 노출될 수 있다.

### FAQ 항목 (5개)

| # | 질문 (ko) | 요약 |
|---|-----------|------|
| 1 | 어떤 브라우저에서 사용할 수 있나요? | Chrome + Chromium 기반(Edge, Brave, Arc) |
| 2 | 무료인가요? | 무료, 가입 불필요 |
| 3 | AI 리포트는 어떻게 생성되나요? | 수집 데이터 → AI 분석 → 구조화된 리포트 |
| 4 | 어떤 이슈 트래커를 지원하나요? | Jira, GitHub, Linear, Notion + Markdown 내보내기 |
| 5 | 수집된 데이터는 어떻게 처리되나요? | 로컬 처리, 외부 저장 없음 |

## 성공 기준

- [ ] FAQ 아코디언이 HowItWorks 아래, BottomCta 위에 렌더링된다.
- [ ] 5개 항목 모두 ko/en에서 펼침/접기 동작한다.
- [ ] 다른 항목을 열면 기존 항목이 자동으로 접힌다 (`type="single"`).
- [ ] 페이지 소스에 FAQPage JSON-LD가 SoftwareApplication과 별도 script 태그로 존재한다.
- [ ] `pnpm build` 정적 빌드 성공.
- [ ] Lighthouse SEO 점수 90 이상 유지.
