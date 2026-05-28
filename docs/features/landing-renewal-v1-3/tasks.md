# Landing Renewal for BugShot v1.3.0 — 구현 태스크

## 선행 조건

- [ ] bugshot-2 v1.3.0이 로컬에 설치돼 실제 동작 확인 가능 (`~/code/bugshot-2/`에서 빌드 후 Chrome 로드)
- [ ] Section B 카드용 새 자산 캡처 환경 준비 (로그 뷰어 동기 재생 화면, 콘솔·네트워크 풀셋 첨부 화면, 액션 로그 출력 화면, 환경 정보 자동 첨부 화면)
- [ ] `pnpm install` 동기화 확인 — Next 15 / React 19 환경

## 태스크

### Task 1: 이미지 자산 준비

- **변경 대상**: `public/images/` 및 `public/images/how/`, `public/images/how-steps/`
- **작업 내용**:
  - **Mockup 신규** (2256×1354):
    - `public/images/mockup-screenshot.webp` — 주석 UI 노출
    - `public/images/mockup-logs-viewer.webp` — 로그 뷰어 UI (kebab-case)
  - **Mockup 갱신**:
    - `public/images/mockup-record.webp` — 자유 녹화 + 30초 리플레이 함께 보이는 컷
  - **FeatureCards `how/` 신규** (모바일 800×450, PC 648×720):
    - `screenshot-mobile.webp`, `screenshot-pc.webp`
    - `record-mobile.webp`, `record-pc.webp` (신규 캡처 — image prefix `record`로 결정, `capture-*.webp` 재사용 안 함)
    - `logs-viewer-mobile.webp`, `logs-viewer-pc.webp`
    - `console-network-logs-mobile.webp`, `console-network-logs-pc.webp`
    - `action-log-mobile.webp`, `action-log-pc.webp`
  - **FeatureCards `how/` 갱신**:
    - `logs-mobile.webp`, `logs-pc.webp` — 실시간 로그 스트림이 흐르는 컷 (캡처 중 라이브 표시)
  - **HowItWorks 갱신**:
    - `how-steps/how-captureMode-mobile.webp`, `how-steps/how-captureMode.webp` — 30초 리플레이가 모드 선택지에 보이는 화면 (4모드 + replay)
  - **재사용** (Section B로 이동):
    - `how/auto-collect-mobile.webp`, `how/auto-collect-pc.webp` — Dev 섹션 `autoCollect` 카드에서 그대로 사용
  - **삭제 가능** (사용처 없어짐):
    - `how/capture-mobile.webp`, `how/capture-pc.webp` (record 카드가 신규 `record-*.webp`를 쓰므로)
- **검증**:
  - [ ] 모든 신규/갱신 파일 존재
  - [ ] 파일 크기 100KB 이하 (Lighthouse Performance 유지)
  - [ ] PC는 648×720, 모바일은 800×450 비율 준수
  - [ ] mockup-*는 2256×1354 (기존과 동일)

### Task 2: i18n 메시지 재구성 — `ko.json`

- **변경 대상**: `src/lib/i18n/ko.json`
- **작업 내용**:
  - `features.heading`, `features.items` 구조를 `features.reporter`, `features.dev`로 재편 (design.md ko 초안 그대로 사용 가능)
  - `features.reporter.items`: `inspect`, `screenshot`(NEW), `record`(NEW key, 자유 녹화 + 30초 리플레이 통합), `log`(톤 갱신), `ai`, `submit`
  - `features.dev.items`: `autoCollect`(이동+톤 갱신), `consoleNetworkLogs`(NEW), `actionLog`(NEW), `logsViewer`(NEW) — **이 순서로**
  - 기존 `features.items.record`, `features.items.log`, `features.items.autoCollect` 키 제거
  - `mockup.slides.screenshot` 신규 추가 (label: 스크린샷, caption: 주석 강조)
  - `mockup.slides.record.label` 갱신 ("스크린샷 & 녹화" → "녹화") + `caption` 갱신 (자유 녹화 + 30초 리플레이 함께)
  - `mockup.slides.logsViewer` 신규 추가 (label: 로그 뷰어)
  - `how.steps.captureMode.description` 갱신 (30초 리플레이 옵션 추가, **프리폼 제거** — 4모드만 나열)
- **검증**:
  - [ ] JSON 구문 유효 (`jq . ko.json` 통과)
  - [ ] `features.heading`, `features.items` 키 부재 (재편 완료 확인)
  - [ ] 신규 키 모두 존재
  - [ ] `mockup.slides.record.label`이 "녹화"인지 확인

### Task 3: i18n 메시지 재구성 — `en.json`

- **변경 대상**: `src/lib/i18n/en.json`
- **작업 내용**: Task 2와 동일한 구조 변경, design.md en 초안 사용. `mockup.slides.record.label`을 "Capture & Record" → "Record"로 갱신. `how.steps.captureMode.title`은 기존 값 유지, description만 갱신 (프리폼 제거).
- **검증**:
  - [ ] JSON 구문 유효
  - [ ] ko/en 키 구조 완전 일치 (`jq 'paths(scalars) | join(".")' ko.json | sort` vs en.json — 키 셋 동일)
  - [ ] **`mockup.slides.record.label`이 "Record"인지 확인**

### Task 4: `FeatureCards.tsx` 일반화

- **변경 대상**: `src/components/FeatureCards.tsx`
- **작업 내용**:
  - `group: "reporter" | "dev"` props 추가
  - 내부 `features` const를 `FEATURES_BY_GROUP` 매핑으로 확장 (design.md 시그니처 그대로 — Reporter 6장 / Dev 4장)
  - `getTranslations("features")` → `getTranslations(\`features.\${group}\`)`
  - 헤딩 `id="features-heading"` → `id={\`features-\${group}-heading\`}`
  - lucide-react import 추가: `Camera`, `Film`, `Activity`, `ListChecks`. `SquareTerminal`, `Magnet`은 기존 import 그대로 유지.
- **검증**:
  - [ ] `npx tsc --noEmit` 통과
  - [ ] `<FeatureCards group="reporter" />` 와 `<FeatureCards group="dev" />` 모두 컴파일 성공
  - [ ] FEATURES_BY_GROUP의 image 경로가 Task 1의 자산명과 일치 (`record`, `logs-viewer`, `console-network-logs`, `action-log` 등)

> **머지 단위 주의**: Task 2/3 (i18n 재편) 과 Task 4 (group prop 도입) 는 반드시 **같은 커밋/PR**에 묶을 것. 분리되면 FeatureCards가 옛 키를 호출하다 MISSING_MESSAGE throw로 페이지 전체가 깨진다.

### Task 5: `Mockup.tsx`에 screenshot · logsViewer 탭 추가

- **변경 대상**: `src/components/Mockup.tsx`
- **작업 내용**:
  - `slides` 배열 재구성 (design.md slides 그대로):
    - 기존 `record` 항목 이전에 `screenshot` 신규 삽입
    - 끝에 `logsViewer` 추가 (image: `/images/mockup-logs-viewer.webp`)
  - lucide-react import 추가: `Camera`, `Film`
  - 자동 전환 신규 도입 안 함 (현 클릭/탭 기반 그대로)
- **검증**:
  - [ ] `npx tsc --noEmit` 통과
  - [ ] 브라우저에서 Mockup 탭 버튼 7개 표시
  - [ ] 각 탭 클릭 시 해당 이미지 로딩 + caption 표시
  - [ ] 클릭/탭으로 7장 모두 순회 가능 (자동 전환 없음 — 인터랙션 변경 없음)

### Task 6: `page.tsx` 섹션 분리

- **변경 대상**: `src/app/[locale]/page.tsx`
- **작업 내용**:
  - 기존 `<section aria-labelledby="features-heading">` 하나를 두 개로 분리
  - 첫 번째: `<section aria-labelledby="features-reporter-heading" className="border-b py-20 md:py-[120px]"><FeatureCards group="reporter" /></section>`
  - 두 번째: `<section aria-labelledby="features-dev-heading" className="border-b py-20 md:py-[120px]"><FeatureCards group="dev" /></section>`
  - 순서: Mockup → Features(Reporter) → Features(Dev) → HowItWorks → Review → Faq → BottomCta
  - 두 섹션 사이 padding이 한 섹션의 2배가 되는 건 의도 (독립된 두 그룹임을 시각적으로 강조)
- **검증**:
  - [ ] 빌드 후 `out/ko/index.html`에 두 features 섹션 렌더됨
  - [ ] 각 섹션이 자체 헤딩과 카드 그룹을 가짐
  - [ ] 모바일/데스크톱 모두 두 섹션 사이 `border-b`가 한 줄로 보임

### Task 7: 빌드 + 시각 검증

- **변경 대상**: 없음 (검증 단계)
- **작업 내용**: `pnpm build` 실행 후 다음을 수동 점검
- **검증**:
  - [ ] `pnpm build` 성공
  - [ ] `pnpm dev`로 띄워 `/ko`, `/en` 모두 확인
  - [ ] 데스크톱 (1440px):
    - Section A 6장 그리드 = 2×3 균등. 그리드 깨짐 없음
    - Section B 4장 그리드 = 2×2 균등. 그리드 깨짐 없음
  - [ ] 모바일 (375px): 모든 카드 1칼럼, 각 카드 이미지/텍스트 잘림 없음
  - [ ] Mockup 7탭이 클릭/탭으로 모두 전환되며 screenshot, logsViewer 모두 표시
  - [ ] Mockup 탭 버튼 7개가 모바일에서 `flex-wrap`으로 자연스럽게 줄바꿈
  - [ ] HowItWorks `captureMode` 아코디언 열었을 때 30초 리플레이 옵션 언급 확인 + 프리폼 미언급 확인
  - [ ] `/en` 영문 카피가 자연스러운지 확인

## 테스트 계획

### 자동 테스트
- 현재 프로젝트는 단위 테스트 없음 — 별도 추가 안 함 (스코프 외)
- 타입 체크: `npx tsc --noEmit`
- 린트: `pnpm lint`
- 빌드: `pnpm build`

### 수동 테스트 체크리스트

**데스크톱 (≥ 1200px)**
- [ ] Features 섹션 두 개 사이 border-b 정상
- [ ] Section A 6장 2칼럼 그리드, 3행 균등 (2×3)
- [ ] Section B 4장 2칼럼 그리드, 2행 균등 (2×2)
- [ ] Mockup 탭 버튼 7개 가로 정렬, 클릭으로 모두 순회

**모바일 (< 768px)**
- [ ] 모든 카드 1칼럼
- [ ] Mockup 탭 버튼 7개 `flex-wrap`으로 2~3줄 자연스럽게
- [ ] HowItWorks 아코디언 captureMode 열면 이미지+텍스트 표시

**i18n**
- [ ] `/ko`에서 한글 카피 자연스러움
- [ ] `/en`에서 영문 카피 자연스러움
- [ ] locale 토글로 두 섹션 모두 즉시 갱신
- [ ] Section A `log` vs Section B `consoleNetworkLogs` 카피 톤이 명확히 다름 (실시간 확인 vs 받은 사람 풀셋)

**접근성**
- [ ] 두 Features 섹션 `aria-labelledby`가 각자 다른 id 가리킴
- [ ] 키보드 Tab으로 두 섹션의 카드/이미지 모두 접근 가능
- [ ] Mockup 7탭 모두 키보드 접근 가능

**Lighthouse (배포 후)**
- [ ] Performance ≥ 90
- [ ] SEO ≥ 90
- [ ] Accessibility 큰 하락 없음

## 구현 순서 권장

```
Task 1 (이미지 자산) ─── 선행. 자산 없으면 빌드 시 alt 텍스트만 보임 (빌드는 통과).
  │
  ├─ Task 2 (ko.json)  ──┐
  ├─ Task 3 (en.json)  ──┤
  ├─ Task 4 (FeatureCards.tsx) ──┼─ 셋은 반드시 같은 커밋/PR (MISSING_MESSAGE 위험)
  │                              │
  ├─ Task 5 (Mockup.tsx)  ──── Task 2/3 ko/en에 mockup.slides.screenshot/logsViewer 추가된 뒤
  │
  └─ Task 6 (page.tsx) ── Task 4 완료 후 (group prop이 있어야 호출 가능)
       │
       └─ Task 7 (빌드 + 검증) ── 최종 (Task 1 자산이 채워진 후에만 의미 있음)
```

**팁**:
- Task 1 자산이 일부 누락된 상태로 Task 2~6을 진행해도 dev 서버는 alt 텍스트로 렌더되지만 **Task 7 시각 검증은 자산이 채워진 뒤에야 의미가 있다**.
- ko/en 동시 갱신 원칙: Task 2와 3은 같은 커밋에 묶어야 한쪽 locale만 깨지는 회귀 방지.
- **Task 2/3/4 동일 커밋 강제**: i18n 키 재편(`features.items.*` 삭제)과 컴포넌트 group prop 도입이 분리되면 next-intl이 MISSING_MESSAGE throw → 페이지 깨짐.

## 커밋 분할 권장

1. `chore(assets): add v1.3.0 landing renewal images` — Task 1
2. `feat(landing): split features into reporter/dev sections` — Task 2 + 3 + 4 + 6 (i18n 재편 + 컴포넌트 일반화 + 섹션 분리, 반드시 한 커밋)
3. `feat(mockup): add screenshot and logsViewer tabs for v1.3.0` — Task 5

또는 한 커밋: `feat(landing): renewal for bugshot v1.3.0`
