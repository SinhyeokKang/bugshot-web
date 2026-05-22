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

| # | i18n key | 질문 (ko) | 질문 (en) |
|---|----------|-----------|-----------|
| 1 | browser | 어떤 브라우저에서 사용할 수 있나요? | Which browsers are supported? |
| 2 | pricing | 무료인가요? | Is it free? |
| 3 | ai | AI 기능을 쓰려면 무엇이 필요한가요? | What do I need to use the AI feature? |
| 4 | integrations | 어떤 이슈 트래커를 지원하나요? | Which issue trackers are supported? |
| 5 | privacy | 수집된 데이터는 어떻게 처리되나요? | How is collected data handled? |

### FAQ 답변

#### 1. 어떤 브라우저에서 사용할 수 있나요?

**ko**: Chrome 및 Chromium 기반 브라우저(Edge, Brave, Arc 등)에서 사용할 수 있습니다. Chrome 116 이상이 필요합니다.

**en**: BugShot works on Chrome and Chromium-based browsers like Edge, Brave, and Arc. Chrome 116 or later is required.

#### 2. 무료인가요?

**ko**: 네, 완전히 무료이며 가입도 필요 없습니다. 설치 후 바로 사용할 수 있습니다.

**en**: Yes, completely free with no sign-up required. Install and start reporting right away.

#### 3. AI 기능을 쓰려면 무엇이 필요한가요?

**ko**: Chrome 내장 AI를 사용하면 별도 설정 없이 바로 쓸 수 있습니다. OpenAI·Anthropic·Gemini 등 외부 LLM을 사용하려면 본인의 API 키만 입력하면 됩니다.

**en**: Chrome's built-in AI works out of the box with no setup. To use external LLMs like OpenAI, Anthropic, or Gemini, just enter your own API key.

#### 4. 어떤 이슈 트래커를 지원하나요?

**ko**: Jira·GitHub·Linear·Notion으로 리포트와 첨부 파일을 바로 제출할 수 있습니다. 이슈 트래커를 사용하지 않는 경우 Markdown으로 복사해 원하는 곳에 붙여넣을 수도 있습니다.

**en**: Submit reports with attachments directly to Jira, GitHub, Linear, or Notion. You can also copy as Markdown and paste it wherever your team works.

#### 5. 수집된 데이터는 어떻게 처리되나요?

**ko**: 모든 데이터는 브라우저 로컬에만 저장되며, BugShot 서버로 전송되지 않습니다. 이슈 제출이나 AI 리포트 생성 시에만 해당 서비스로 데이터가 전달되고, 제출이 완료되면 로컬 데이터는 자동으로 삭제됩니다.

**en**: All data is stored locally in your browser and is never sent to BugShot's servers. Data is only shared with the services you use — your issue tracker or AI provider — and local data is automatically deleted after submission.

## 성공 기준

- [ ] FAQ 아코디언이 HowItWorks 아래, BottomCta 위에 렌더링된다.
- [ ] 5개 항목 모두 ko/en에서 펼침/접기 동작한다.
- [ ] 다른 항목을 열면 기존 항목이 자동으로 접힌다 (`type="single"`).
- [ ] 페이지 소스에 FAQPage JSON-LD가 SoftwareApplication과 별도 script 태그로 존재한다.
- [ ] `pnpm build` 정적 빌드 성공.
- [ ] Lighthouse SEO 점수 90 이상 유지.
