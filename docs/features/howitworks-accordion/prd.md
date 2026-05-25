# HowItWorks Accordion 디자인 변경

## 배경

현재 HowItWorks 섹션은 4스텝 가로 카드 그리드(1×4)로, 각 스텝이 개별 이미지를 가진다. 이 레이아웃은 스텝이 늘어날수록 가로 공간이 부족해지고, 각 이미지가 작아져 제품 화면의 디테일이 전달되지 않는다.

새 디자인은 좌측에 큰 목업 이미지, 우측에 Accordion을 배치해 하나의 큰 이미지로 각 스텝의 맥락을 명확히 보여주면서, 스텝 수를 6개로 확장한다.

## 목표

- 기존 4스텝 가로 카드 그리드를 **좌측 목업 + 우측 Accordion** 2단 레이아웃으로 교체한다.
- 스텝을 4개에서 **6개**로 확장하여 BugShot의 전체 워크플로우(연동→캡처모드→스타일 수정→AI 초안→제출→추적)를 커버한다.
- Accordion 선택에 따라 좌측 목업 이미지가 교체되어, 각 스텝의 실제 화면을 보여준다.
- 모바일에서는 이미지를 숨기고 Accordion만 표시한다.

## 비목표 (Non-goals)

- 자동 전환(auto-rotate) — Accordion은 사용자 클릭으로만 전환한다.
- 모바일에서의 이미지 표시 — md 미만에서는 Accordion만 노출한다.
- 이미지 제작 — 이미지는 별도 제공. 이 작업에서는 이미지 스펙과 렌더링 로직만 구현한다.

## 사용자 시나리오

### 데스크톱 (md+)
1. 스크롤해서 HowItWorks 섹션 진입.
2. 헤딩 아래 좌측에 큰 목업 이미지, 우측에 6개 Accordion이 보인다.
3. 첫 번째 항목("트래커 연동")이 펼쳐진 상태로 표시되고, 해당 목업 이미지가 보인다.
4. 다른 Accordion 항목을 클릭하면 해당 항목이 펼쳐지고(기존 항목은 접힘), 좌측 이미지가 페이드 전환된다.
5. 목업 이미지 좌측 가장자리에 흰색→투명 그래디언트 페이드가 적용되어 자연스러운 크롭 효과를 준다.

### 모바일 (md 미만)
1. HowItWorks 섹션에서 Accordion만 보인다(이미지 영역 hidden).
2. 첫 번째 항목이 펼쳐진 상태. 항목을 눌러 다른 스텝을 확인한다.

### 엣지 케이스
- 펼쳐진 항목을 다시 클릭하면 접힘(collapsible). 이미지는 마지막 선택 상태를 유지한다.
- 모든 항목이 접혀 있을 때: 이미지는 마지막으로 펼쳐졌던 스텝의 이미지를 유지한다.

## 6스텝 카피 초안

### 1. 트래커 연동

- **ko title**: 트래커 연동
- **ko description**: Jira, GitHub, Linear, Notion 중 팀에서 사용하는 트래커를 연결합니다. 한 번 설정해두면 리포트 작성 후 클릭 한 번으로 이슈를 바로 제출할 수 있습니다.
- **en title**: Connect tracker
- **en description**: Link the tracker your team uses — Jira, GitHub, Linear, or Notion. Set it up once and you can file an issue with a single click right after drafting a report.

### 2. 캡처모드 선택

- **ko title**: 캡처모드 선택
- **ko description**: 스크린샷, 최대 60초 화면 녹화, 요소 검사 중 상황에 맞는 캡처 모드를 선택합니다. 녹화 중에는 콘솔 에러와 네트워크 요청이 자동으로 수집됩니다.
- **en title**: Choose capture mode
- **en description**: Pick the capture mode that fits the situation — screenshot, up to 60-second recording, or element inspection. Console errors and network requests are collected automatically during recording.

### 3. 스타일 수정

- **ko title**: 스타일 수정
- **ko description**: 요소를 클릭해 적용된 스타일을 확인하고, 페이지 위에서 바로 수정할 수 있습니다. 수정 전후 차이가 자동으로 기록되어 리포트에 포함됩니다.
- **en title**: Edit styles
- **en description**: Click any element to view its applied styles and edit them right on the page. Before-and-after changes are recorded automatically and included in the report.

### 4. AI 초안

- **ko title**: AI 초안
- **ko description**: 수집된 환경 정보, 로그, 스크린샷을 바탕으로 재현 단계, 기대 동작, 실제 동작이 정리된 구조화된 버그 리포트를 자동으로 생성합니다. Chrome 내장 AI를 포함해 OpenAI, Anthropic, Gemini 등의 LLM을 사용할 수 있습니다.
- **en title**: AI draft
- **en description**: Automatically generates a structured bug report — with reproduction steps, expected behavior, and actual behavior — from the collected environment info, logs, and screenshots. Works with Chrome's built-in AI as well as OpenAI, Anthropic, and Gemini.

### 5. 제출

- **ko title**: 리포트 제출
- **ko description**: 완성된 리포트를 연동된 이슈 트래커로 바로 제출합니다. 스크린샷, 녹화 영상, 로그 등 첨부 파일이 함께 전달됩니다. 트래커를 사용하지 않으면 Markdown으로 복사해 원하는 곳에 붙여넣을 수 있습니다.
- **en title**: Submit report
- **en description**: File the finished report directly to your connected issue tracker. Attachments like screenshots, recordings, and logs are included automatically. If you don't use a tracker, copy the report as Markdown and paste it wherever your team works.

### 6. 이슈 추적

- **ko title**: 이슈 추적
- **ko description**: 제출한 이슈의 상태를 BugShot 안에서 바로 확인할 수 있습니다. 이슈 트래커를 따로 열지 않아도 진행 상황을 한눈에 파악할 수 있습니다.
- **en title**: Track issues
- **en description**: Check the status of submitted issues right inside BugShot. Keep track of progress at a glance without switching to your issue tracker.

## 성공 기준

- [ ] 데스크톱(md+)에서 좌측 목업 + 우측 6-item Accordion이 Figma 레이아웃대로 표시된다.
- [ ] Accordion 항목 전환 시 좌측 이미지가 페이드 전환된다.
- [ ] 목업 이미지 좌측에 그래디언트 페이드 오버레이가 적용된다.
- [ ] 모바일(md 미만)에서 Accordion만 표시되고, 이미지 영역은 숨겨진다.
- [ ] ko.json / en.json에 6스텝 카피가 반영되고, 기존 4스텝 키가 제거된다.
- [ ] 빌드 에러 없음. 타입 에러 없음.
