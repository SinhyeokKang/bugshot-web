# Landing Renewal for BugShot v1.3.0

## 배경

bugshot-2 (Chrome 확장 본체) v1.3.0이 출시되면서 다음 세 가지 핵심 신기능이 추가되었다.

1. **30초 리플레이 (30s replay)** — 최근 30초 화면을 항상 기록해두는 캡처 모드. 버그가 발생한 후에도 영상 첨부 가능.
2. **로그 뷰어 (log viewer)** — 이슈 트래커에 첨부되는 로그 뷰어를 받는 사람이 열면, 영상과 콘솔·네트워크·액션 로그가 시간축으로 동기화돼 재생됨.
3. **액션 로그 (action log)** — 사용자의 클릭·입력·페이지 이동이 자동 기록되고, 같은 사이트 안의 페이지 이동에도 로그가 끊기지 않고 누적됨. 받는 사람도 콘솔·네트워크 로그를 헤더·본문까지 풀셋으로 받음.

현재 bugshot-web 랜딩 페이지(`https://bug-shot.com`)는 이 기능들을 노출할 자리가 없다. 또한 1.3.0의 신기능은 단순히 "BugShot이 잘 캡처한다"가 아니라, **리포트를 받는 사람도 같은 1차 자료를 풀세트로 받는다**는 새로운 가치 제안을 만든다. 기존 랜딩의 단일 Features 섹션 구조로는 이 두 측면(생산/소비)을 효과적으로 전달하기 어렵다.

## 목표

1. v1.3.0의 핵심 신기능 3가지가 랜딩 페이지에서 명확히 노출된다.
2. Features 섹션을 **"리포트를 만드는 사람을 위한 기능"**과 **"리포트를 받는 개발자를 위한 기능"** 두 섹션으로 분리해, 생산자/소비자 두 관점에서 BugShot의 가치를 보여준다. 후자에는 Section A의 reporter `log` 카드와 의도적으로 톤이 갈리는 dev 관점 로그 카드를 둔다.
3. 기존 섹션 구조(Hero, FAQ, Review, BottomCta, Footer)는 변경하지 않는다 — 외과적 변경. (Mockup은 슬라이드 2개를 추가하므로 카운트에서 제외.)
4. 한/영 i18n 모두 일관된 카피 갱신. 앱 본체 i18n의 공식 표기와 정렬한다.

## 비목표 (Non-goals)

- Hero 헤드라인/서브카피 변경 (그대로 유지)
- FAQ 추가/수정
- Review 섹션 추가/수정
- BottomCta 카피 변경
- Mockup 자체 인터랙션 변경 (자동 전환 신규 도입 안 함 — 현 코드 그대로 클릭/탭 기반)
- 새 디자인 토큰·컬러·폰트 추가
- 새 외부 의존성 도입
- Notion 로그 뷰어 ZIP 압축, Jira 미디어 치수 같은 백엔드 디테일은 랜딩에 노출하지 않음 (사용자에게는 "로그 뷰어"로만 묶어서 보여짐)
- Log Viewer UI 내부의 탭 분리·필터 같은 UI 디테일도 노출하지 않음
- Cross-page 로그 누적을 별도 카드로 강조하지 않음 (consoleNetworkLogs/actionLog 카피 안에 자연스럽게 흡수)

## 사용자 시나리오

### 시나리오 1: QA/리포터가 랜딩 페이지 방문
1. Hero에서 "한 번에 끝내는 버그 리포트" 메시지를 본다.
2. Mockup 캐러셀에서 inspect → **screenshot(NEW)** → record(30초 리플레이 흡수 캡션) → log → ai → submit → **logsViewer(NEW)** 7탭을 클릭/탭으로 본다.
3. **Section A "리포트하는 사람을 위한 기능"** 6장 카드에서 자신의 작업 흐름을 본다: inspect / **screenshot(NEW, 주석)** / record(자유 녹화 + 30초 리플레이 통합) / **log(실시간 콘솔·네트워크 확인)** / ai / submit.
4. **Section B "리포트 받는 개발자를 위한 기능"** 4장 카드(autoCollect / consoleNetworkLogs / actionLog / logsViewer)에서 자신이 리포트를 보낸 뒤 받는 사람이 어떤 1차 자료를 풀세트로 받는지를 본다 — 셀링포인트로 활용 가능.
5. HowItWorks 6단계 아코디언에서 `captureMode` 단계 설명에 30초 리플레이가 옵션으로 포함된 것을 본다 (4모드만 나열, 프리폼 제외).

### 시나리오 2: Dev가 동료에게 추천받아 랜딩 방문
1. Section A를 스크롤하며 빠르게 지나치고 Section B에서 멈춘다 — "내가 받는 이슈에 영상+로그 동기 뷰어가 함께 온다"는 가치를 인지.
2. Section A로 다시 시선이 가면서 팀의 리포터가 어떤 도구를 쓰는지 본다.
3. Chrome에 추가.

### 엣지 케이스
- 모바일(< 768px): 섹션 두 개로 늘어나도 카드는 1칼럼이라 스크롤 길이만 증가. 1200px 미만에서는 항상 1칼럼.
- 1200px 이상: 각 섹션이 2칼럼 그리드. Section A(6장)는 2×3 균등, Section B(4장)는 2×2 균등. 두 섹션 모두 단독 행 없음.
- Mockup 탭이 7개로 늘어남에 따라 모바일에서는 탭 버튼이 `flex-wrap`으로 2~3줄로 줄바꿈된다. 클릭/탭 기반이라 사용자가 7장 모두 보려면 5장 대비 클릭 비용이 약 40% 증가 — 라벨은 짧은 단일 단어 위주로 유지해 wrap 위치를 안정화한다.

## 성공 기준

- [ ] Mockup이 7탭으로 동작: `inspect`, `screenshot`(NEW), `record`(자유 녹화 + 30초 리플레이 흡수 캡션), `log`, `ai`, `submit`, `logsViewer`(NEW). 클릭/탭으로 7장 모두 순회 가능.
- [ ] Features가 두 섹션으로 분리되어 각각 헤딩과 카드 그룹을 가짐
- [ ] Section A 카드 6장: `inspect`, `screenshot`(NEW), `record`(자유 녹화 + 30초 리플레이 통합), `log`(톤 갱신, 실시간 확인), `ai`, `submit`
- [ ] Section B 카드 4장: `autoCollect`(이동+톤 갱신), `consoleNetworkLogs`(NEW), `actionLog`(NEW), `logsViewer`(NEW) — 이 순서
- [ ] HowItWorks `captureMode` 단계 description에 30초 리플레이 옵션 한 줄 추가, 프리폼 모드는 메인 나열에서 제외 (4모드만)
- [ ] ko/en 메시지 모두 갱신 — 새 키 추가 + `features.items.record`, `features.items.log`, `features.items.autoCollect` 기존 키 제거 (각각 reporter/dev 섹션으로 이동·재정의)
- [ ] 모바일/데스크톱 양쪽에서 레이아웃 깨짐 없음
- [ ] Lighthouse Performance ≥ 90, SEO ≥ 90 유지
- [ ] `pnpm build` 성공
- [ ] 빌드된 `out/`에서 두 Features 섹션 + 7탭 Mockup이 정적으로 렌더됨
