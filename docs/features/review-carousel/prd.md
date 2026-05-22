# Review Carousel

## 배경

현재 Review 섹션은 단일 리뷰만 정적으로 표시한다. 리뷰가 늘어나면 캐러셀로 전환해 여러 사용자의 목소리를 보여줘야 한다. 자동 전환으로 사용자 개입 없이도 다양한 리뷰를 노출하고, dot navigation으로 수동 탐색도 가능하게 한다.

## 목표

- Review 섹션을 자동 전환 캐러셀로 변경한다. 한 번에 하나의 리뷰만 보인다.
- 5초 간격으로 자동 전환한다.
- 영역 하단 dot navigation으로 수동 전환을 지원한다.
- 리뷰 길이 차이에 의한 레이아웃 시프트를 방지한다 (특히 dot navigation 위치 고정).
- 리뷰 추가가 쉬운 확장 가능 구조를 갖춘다.

## 비목표 (Non-goals)

- 스와이프 제스처 지원.
- 리뷰를 외부 소스(API, CMS)에서 로딩.
- 3개 이상의 리뷰를 지금 당장 추가하는 것.

## 사용자 시나리오

1. 사용자가 스크롤하여 Review 섹션에 도달한다. ScrollReveal 애니메이션과 함께 첫 번째 리뷰가 표시된다.
2. 5초 후 자동으로 다음 리뷰로 페이드 전환된다. 이 과정에서 dot navigation 위치는 변하지 않는다.
3. 마지막 리뷰 이후 다시 첫 번째로 순환한다.
4. 사용자가 dot을 클릭하면 해당 리뷰로 즉시 이동하고, 5초 타이머가 리셋된다.
5. ko/en 양 locale에서 동일하게 동작한다.

### 리뷰 항목 (2개)

| # | i18n key | 작성자 | 출처 |
|---|----------|--------|------|
| 1 | qe | 안**, QA Engineer | Chrome Web Store Review |
| 2 | designer | 김**, Product Designer | Chrome Web Store Review |

#### 1. 안**, QA Engineer (기존)

**ko**: DevTools 열고, 스크린샷 찍고, Jira에 따로 정리하던 작업을 브라우저 안에서 한 번에 끝낼 수 있어서 편합니다. 수정 결과와 diff, 영상까지 함께 전달되니까 커뮤니케이션 비용도 많이 줄었어요.

**en**: I used to juggle DevTools, screenshots, and Jira separately — now it all happens in the browser without breaking my flow. Replacing text explanations with visual diffs and recordings cut our back-and-forth way down.

#### 2. 김**, Product Designer (신규)

**ko**: 디자인 QA할 때 요소 위치를 찾으려고 DevTools를 뒤지고, 수정 사항을 따로 캡처해서 전달하는 과정이 번거로웠는데 화면 안에서 바로 확인하고 전달할 수 있어서 훨씬 편해졌어요.

**en**: During design QA, I used to dig through DevTools to find element positions and capture changes separately. Now I can inspect and share fixes right on the page — the whole process is so much smoother.

## 성공 기준

- [ ] 2개 리뷰가 5초 간격으로 자동 전환된다.
- [ ] dot navigation 클릭 시 해당 리뷰로 이동하고 타이머가 리셋된다.
- [ ] 전환 시 dot navigation 위치가 시프트되지 않는다.
- [ ] ko/en 양 locale에서 정상 동작한다.
- [ ] 리뷰 추가 시 i18n JSON + REVIEW_KEYS 상수만 수정하면 된다.
- [ ] `pnpm build` 정적 빌드 성공.
