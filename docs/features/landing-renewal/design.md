# Landing Renewal for BugShot v1.3.0 — 기술 설계

## 개요

기존 단일 `FeatureCards` 컴포넌트를 **i18n 네임스페이스 + 카드 목록을 그룹별로 분기**하는 형태로 일반화하여, 동일 컴포넌트로 "For Reporters" / "For Devs" 두 섹션을 렌더한다. Mockup은 슬라이드 배열에 2개 항목(`screenshot`, `logsViewer`)을 추가하고 기존 `record` 항목 캡션을 갱신한다. 새 컴포넌트는 만들지 않는다.

## 변경 범위

### 변경되는 파일

#### `src/components/FeatureCards.tsx`
- **현재 역할**: 6장 카드 단일 섹션 렌더. `features` 배열을 컴포넌트 내부 const로 보유.
- **변경 내용**:
  - `group: "reporter" | "dev"` props 추가
  - 컴포넌트 내부의 `features` const를 `FEATURES_BY_GROUP` 매핑으로 확장 (Reporter 6장 / Dev 4장)
  - `getTranslations("features")` → `getTranslations(\`features.\${group}\`)` 로 i18n 네임스페이스 분기
  - `id="features-heading"` → group별 다른 id (`id={\`features-\${group}-heading\`}`)
  - 신규 lucide 아이콘 import: `Camera`(screenshot), `Film`(logsViewer), `Activity`(consoleNetworkLogs), `ListChecks`(actionLog). `SquareTerminal`(log), `Magnet`(autoCollect)은 기존 import 재사용.

#### `src/components/Mockup.tsx`
- **현재 역할**: 5탭 캐러셀 (클릭/탭 전환만, 자동 전환 없음).
- **변경 내용**:
  - `slides` 배열 재구성: 기존 `record` 항목 이전에 `screenshot` 신규 삽입, 끝에 `logsViewer` 추가 → 7탭
  - 신규 아이콘 import: `Camera`, `Film`
  - 인터랙션 변경 없음 (자동 전환 신규 도입 안 함)

#### `src/components/HowItWorks.tsx`
- **현재 역할**: HOW_KEYS 6단계 아코디언.
- **변경 내용**: 없음 (i18n 메시지 description만 갱신).

#### `src/app/[locale]/page.tsx`
- **변경 내용**:
  - 기존 `<section aria-labelledby="features-heading">` 하나가 두 개로 분기
  - `<FeatureCards group="reporter" />` 와 `<FeatureCards group="dev" />` 를 각각 별도 `<section>`에 감쌈
  - 두 섹션 모두 `border-b py-20 md:py-[120px]` 유지 — 두 섹션 사이에 한 섹션 분량의 2배 공간이 생기는 게 의도(독립된 두 그룹임을 시각적으로 강조)

#### `src/lib/i18n/ko.json`, `src/lib/i18n/en.json`
- **변경 내용**:
  - `features.heading`, `features.items.*` 구조를 `features.reporter.*`, `features.dev.*` 로 재편
  - 기존 `features.items.record` 삭제 → `features.reporter.items.screenshot` 신규 + `features.reporter.items.record` 재정의 (자유 녹화 + 30초 리플레이 통합)
  - 기존 `features.items.log` → `features.reporter.items.log` (실시간 확인 톤, 리포터 관점)
  - 기존 `features.items.autoCollect` → `features.dev.items.autoCollect` (받는 사람 관점 톤으로 갱신)
  - 신규 `features.dev.items.consoleNetworkLogs` — 받는 사람도 풀셋 로그를 받음 (Section A `log`와 톤 분리)
  - 신규 `features.dev.items.actionLog` — 사용자 액션이 자동 기록되어 재현 과정으로 정리됨
  - 신규 `features.dev.items.logsViewer` — 영상과 콘솔·네트워크·액션 로그 동기 재생
  - `mockup.slides.record.{label,caption}` 갱신 (자유 녹화 + 30초 리플레이 함께, label도 `녹화` / `Record`)
  - `mockup.slides.screenshot` 신규 (주석 강조)
  - `mockup.slides.logsViewer` 신규
  - `how.steps.captureMode.description` 갱신 (30초 리플레이 옵션 한 줄 추가, 프리폼 제외 — 4모드만 나열)

#### 이미지 자산 (`public/images/`)
- **신규 캡처 필요**:
  - `mockup-screenshot.webp` (2256×1354) — 주석 UI 노출
  - `mockup-logs-viewer.webp` (2256×1354) — 로그 뷰어 UI (kebab-case 통일)
  - `how/screenshot-mobile.webp` (800×450), `how/screenshot-pc.webp` (648×720)
  - `how/record-mobile.webp`, `how/record-pc.webp` — 자유 녹화 + 30초 리플레이 둘 다 보이는 컷 (예: 녹화 중 + 30s 버퍼 진도 표시 화면). 자유 녹화·리플레이가 함께 드러나야 하므로 신규 캡처.
  - `how/logs-viewer-mobile.webp`, `how/logs-viewer-pc.webp`
  - `how/console-network-logs-mobile.webp`, `how/console-network-logs-pc.webp`
  - `how/action-log-mobile.webp`, `how/action-log-pc.webp`
- **갱신 필요**:
  - `mockup-record.webp` — 자유 녹화 + 30초 리플레이 함께 드러나는 컷
  - `how/logs-mobile.webp`, `how/logs-pc.webp` — 캡처 중 실시간 로그 스트림이 보이는 컷 (수집된 결과가 아니라 라이브로 흐르는 모습)
  - `how-steps/how-captureMode-mobile.webp`, `how-steps/how-captureMode.webp` — 30초 리플레이가 모드 선택지에 보이는 화면
- **재사용**:
  - `how/auto-collect-mobile.webp`, `how/auto-collect-pc.webp` — Dev 섹션 카드에서 그대로 사용. 자산 자체는 변경 없음.
- **삭제 가능** (사용처 없어짐):
  - `how/capture-mobile.webp`, `how/capture-pc.webp` (record 카드가 신규 `record-*.webp`를 쓰므로)

### 새로 추가되는 파일

없음.

## 데이터 흐름

```
page.tsx
  ├─ <Mockup />                            ← slides 7개 (screenshot, logsViewer 신규)
  ├─ <section id="features-reporter-heading">
  │    └─ <FeatureCards group="reporter" />
  │         └─ getTranslations("features.reporter")
  │         └─ FEATURES_BY_GROUP.reporter = 6장
  ├─ <section id="features-dev-heading">
  │    └─ <FeatureCards group="dev" />
  │         └─ getTranslations("features.dev")
  │         └─ FEATURES_BY_GROUP.dev = 4장
  └─ <section id="how-heading">
       └─ <HowItWorks />                   ← captureMode description만 갱신
```

i18n 메시지 키 구조:

```
mockup:
  slides:
    inspect:     { label, caption }
    screenshot:  { label, caption }       ← 신규
    record:      { label, caption }       ← label·caption 갱신 (자유 녹화 + 30초 리플레이)
    log:         { label, caption }
    ai:          { label, caption }
    submit:      { label, caption }
    logsViewer:  { label, caption }       ← 신규

features:
  reporter:
    heading: { line1, line2 }
    items:
      inspect:     { title, description }
      screenshot:  { title, description }     ← 신규
      record:      { title, description }     ← 신규 키 (자유 녹화 + 30초 리플레이 통합)
      log:         { title, description }     ← 톤 갱신 (수집 → 실시간 확인)
      ai:          { title, description }
      submit:      { title, description }
  dev:
    heading: { line1, line2 }
    items:
      autoCollect:        { title, description }   ← 톤 갱신 (받는 사람 관점)
      consoleNetworkLogs: { title, description }   ← 신규 (Section A log와 톤 분리)
      actionLog:          { title, description }   ← 신규
      logsViewer:         { title, description }   ← 신규
```

## 인터페이스 설계

### `FeatureCards.tsx` 시그니처

```typescript
type FeatureGroup = "reporter" | "dev";

interface FeatureItem {
  key: string;
  icon: LucideIcon;
  image: string;  // public/images/how/<image>-{mobile,pc}.webp prefix
}

const FEATURES_BY_GROUP: Record<FeatureGroup, readonly FeatureItem[]> = {
  reporter: [
    { key: "inspect",    icon: MousePointerClick, image: "inspect" },
    { key: "screenshot", icon: Camera,            image: "screenshot" },
    { key: "record",     icon: Video,             image: "record" },
    { key: "log",        icon: SquareTerminal,    image: "logs" },
    { key: "ai",         icon: Wand2,             image: "ai-reports" },
    { key: "submit",     icon: Send,              image: "integrations" },
  ],
  dev: [
    { key: "autoCollect",        icon: Magnet,     image: "auto-collect" },
    { key: "consoleNetworkLogs", icon: Activity,   image: "console-network-logs" },
    { key: "actionLog",          icon: ListChecks, image: "action-log" },
    { key: "logsViewer",         icon: Film,       image: "logs-viewer" },
  ],
} as const;

interface FeatureCardsProps {
  group: FeatureGroup;
}

export async function FeatureCards({ group }: FeatureCardsProps): Promise<JSX.Element>;
```

**아이콘 확정** (lucide-react):
- `screenshot` → `Camera`
- `record` → `Video` (기존 그대로 — 자유 녹화 + 30초 리플레이 모두 영상이므로 Video 한 아이콘으로 충분)
- `consoleNetworkLogs` → `Activity` (Section A `log`의 `SquareTerminal`과 시각 구분; "흐르는 활동"의 메타포)
- `actionLog` → `ListChecks` (단계별 재현 과정)
- `logsViewer` → `Film` (영상 동기 재생)

### `Mockup.tsx` slides 배열

```typescript
const slides = [
  { key: "inspect",    icon: MousePointerClick, image: "/images/mockup-inspect.webp" },
  { key: "screenshot", icon: Camera,            image: "/images/mockup-screenshot.webp" },
  { key: "record",     icon: Video,             image: "/images/mockup-record.webp" },
  { key: "log",        icon: SquareTerminal,    image: "/images/mockup-log.webp" },
  { key: "ai",         icon: Wand2,             image: "/images/mockup-ai.webp" },
  { key: "submit",     icon: Send,              image: "/images/mockup-submit.webp" },
  { key: "logsViewer", icon: Film,              image: "/images/mockup-logs-viewer.webp" },
] as const;
```

### i18n 키 카피 초안

#### ko.json (변경 부분)

```json
"mockup": {
  "slides": {
    "screenshot": {
      "label": "스크린샷",
      "caption": "필요한 화면을 캡처하고, 도형·형광펜·텍스트로 어디가 문제인지 그 위에서 바로 표시합니다."
    },
    "record": {
      "label": "녹화",
      "caption": "직접 녹화하거나, 항상 켜진 30초 리플레이로 놓친 순간까지 영상으로 가져옵니다."
    },
    "logsViewer": {
      "label": "로그 뷰어",
      "caption": "이슈에 첨부된 로그 뷰어를 열면 영상과 콘솔·네트워크·액션 로그가 시간축으로 함께 재생됩니다."
    }
  }
},
"features": {
  "reporter": {
    "heading": {
      "line1": "버그를 잡는 사람을",
      "line2": "<brand>위한 기능</brand>"
    },
    "items": {
      "inspect": {
        "title": "요소 검사와 편집",
        "description": "요소를 클릭해 스타일을 확인하고, 페이지 위에서 바로 수정할 수 있습니다."
      },
      "screenshot": {
        "title": "스크린샷 + 주석",
        "description": "필요한 화면을 캡처하고, 도형·형광펜·텍스트로 문제 지점을 그 위에서 바로 표시합니다."
      },
      "record": {
        "title": "녹화 & 30초 리플레이",
        "description": "직접 녹화하거나, 항상 켜진 30초 리플레이로 본 직후의 버그까지 영상으로 잡아냅니다."
      },
      "log": {
        "title": "콘솔·네트워크 로그 실시간 확인",
        "description": "캡처 중 콘솔 에러와 네트워크 요청이 실시간으로 흐르는 걸 그대로 보며 어디서 무엇이 깨졌는지 즉시 확인합니다."
      },
      "ai": {
        "title": "AI 리포트 생성",
        "description": "수집된 정보를 바탕으로 재현 과정과 환경 정보가 포함된 리포트를 자동으로 작성합니다."
      },
      "submit": {
        "title": "이슈 트래커 제출",
        "description": "Jira·GitHub·Linear·Notion으로 리포트와 첨부 파일을 바로 제출할 수 있습니다."
      }
    }
  },
  "dev": {
    "heading": {
      "line1": "버그를 고치는 사람을",
      "line2": "<brand>위한 기능</brand>"
    },
    "items": {
      "autoCollect": {
        "title": "환경 정보가 자동으로 첨부",
        "description": "리포트와 함께 브라우저·해상도·DOM 정보가 자동 첨부되어, '어떤 환경에서요?'를 다시 묻지 않아도 됩니다."
      },
      "consoleNetworkLogs": {
        "title": "콘솔·네트워크 로그 풀셋",
        "description": "콘솔 에러와 네트워크 요청이 헤더·본문까지 온전한 형태로 함께 전달돼, 받은 사람도 1차 자료를 그대로 갖습니다."
      },
      "actionLog": {
        "title": "액션 로그로 정리되는 재현 과정",
        "description": "사용자의 클릭·입력·페이지 이동이 자동 기록되어 재현 과정으로 정리됩니다. 비밀번호 같은 민감 입력은 자동 마스킹됩니다."
      },
      "logsViewer": {
        "title": "영상과 로그를 함께 재생",
        "description": "이슈에 첨부된 로그 뷰어를 열면 영상과 콘솔·네트워크·액션 로그가 시간축으로 동기화돼 재생됩니다."
      }
    }
  }
},
"how": {
  "steps": {
    "captureMode": {
      "title": "상황에 맞는 캡처 모드를 고르세요",
      "description": "스크린샷, 최대 60초 화면 녹화, 항상 기록해두는 최근 30초 리플레이, 요소 검사 중 상황에 맞는 모드를 선택합니다. 녹화 중 콘솔 로그와 네트워크 요청이 헤더·본문까지 자동 수집되며, 민감 헤더는 자동 마스킹됩니다."
    }
  }
}
```

#### en.json (변경 부분)

```json
"mockup": {
  "slides": {
    "screenshot": {
      "label": "Screenshot",
      "caption": "Capture the screen and mark up the issue directly with shapes, highlights, and text."
    },
    "record": {
      "label": "Record",
      "caption": "Record live, or grab the last 30 seconds from the always-on replay buffer."
    },
    "logsViewer": {
      "label": "Log viewer",
      "caption": "Open the attached log viewer and the video replays in sync with console, network, and action logs."
    }
  }
},
"features": {
  "reporter": {
    "heading": {
      "line1": "Made for the people",
      "line2": "<brand>reporting bugs</brand>"
    },
    "items": {
      "inspect": {
        "title": "Inspect & Edit CSS",
        "description": "Click any element to view its styles, then tweak them live in the visual editor."
      },
      "screenshot": {
        "title": "Screenshot & annotate",
        "description": "Capture the screen and mark up the issue right on top with shapes, highlights, and text."
      },
      "record": {
        "title": "Recording & 30s replay",
        "description": "Record live, or grab the last 30 seconds from the always-on replay — catch the bug even after spotting it."
      },
      "log": {
        "title": "Live console & network logs",
        "description": "Watch console errors and network requests stream in real time as you capture — see exactly what's breaking the moment it happens."
      },
      "ai": {
        "title": "AI bug reports",
        "description": "Turn captured data into a structured report with steps, expected, and actual behavior."
      },
      "submit": {
        "title": "One-click issue filing",
        "description": "Submit tickets with full attachments to Jira, GitHub, Linear, or Notion in one click."
      }
    }
  },
  "dev": {
    "heading": {
      "line1": "Made for the people",
      "line2": "<brand>fixing them</brand>"
    },
    "items": {
      "autoCollect": {
        "title": "Environment, attached automatically",
        "description": "Browser, resolution, and DOM context come with every report — no more asking the reporter what setup they were on."
      },
      "consoleNetworkLogs": {
        "title": "Full console & network logs",
        "description": "Console errors and network requests come attached with full headers and bodies — you see the exact same raw data the reporter had."
      },
      "actionLog": {
        "title": "Steps to reproduce, captured as action logs",
        "description": "Clicks, inputs, and navigations are automatically captured into the steps to reproduce — with sensitive fields like passwords masked."
      },
      "logsViewer": {
        "title": "Replay video & logs together",
        "description": "Open the attached log viewer and the video plays in sync with console, network, and action logs."
      }
    }
  }
},
"how": {
  "steps": {
    "captureMode": {
      "title": "Pick the capture mode that fits the moment",
      "description": "Choose from screenshot, up to 60-second screen recording, an always-on 30s replay, or element inspection. Console logs and network requests are captured automatically while recording, with sensitive headers masked."
    }
  }
}
```

> `how.steps.captureMode.title`의 영문 원문은 기존 값 그대로 유지하고 description만 갱신.

## 기존 패턴 준수

- **반응형**: `md:` 단일 + `min-[1200px]:` (FeatureCards 컨테이너 max-w와 일치). CLAUDE.md 명시 패턴.
- **섹션 구조**: outer `<section>`이 `border-b py-20 md:py-[120px]` + inner `<div className="container mx-auto max-w-[1200px]">`.
- **i18n 동시 갱신**: ko/en 동일 시점에 같은 키로 갱신.
- **brand 토큰**: `<brand>...</brand>` next-intl `t.rich` 패턴.
- **이미지 명명**: `how/{image}-mobile.webp` + `how/{image}-pc.webp` 쌍. 모든 다단어는 kebab-case (`screenshot`, `record`, `logs`, `logs-viewer`, `console-network-logs`, `action-log`). Mockup 자산도 동일 (`mockup-logs-viewer.webp`).
- **shadcn**: 신규 컴포넌트 도입 없음.
- **앱 본체 용어 정렬**: `30s replay`/`30초 리플레이`, `Action Log`/`액션 로그`, `Steps to reproduce`/`재현 과정` — bugshot-2 i18n 표기와 일치.

## 그리드 균형

- **Section A (6장)**: 1200px+ 2칼럼 → 3행 (2×3) 균등. 기존 FeatureCards 6장 패턴 그대로 유지. 모바일 1칼럼.
- **Section B (4장)**: 1200px+ 2칼럼 → 2행 (2×2) 균등. 모바일 1칼럼.
- 두 섹션 모두 데스크톱 그리드가 균등하게 떨어져 시각적 안정감 ↑.
- **Mockup (7탭)**: 탭 버튼 `flex-wrap`이므로 모바일에서 자동 줄바꿈 (2~3줄). 라벨은 짧은 단일 단어 위주로 유지해 wrap 위치를 안정화.

## 대안 검토

### 대안 1: record와 replay를 별도 카드로 분리 (Section A 7장)
- **장점**: 30초 리플레이를 독립 카드+이미지로 강하게 부각.
- **단점**: 그리드가 2×3 + 1장 단독으로 비대칭. Mockup record 탭이 30초 리플레이를 흡수한 것과 grain 불일치.
- **결론**: 사용자가 명시적으로 묶음 안 채택. **채택 안 함.**

### 대안 2: capture(record+replay+screenshot 모두 통합) 단일 카드 (Section A 5장)
- **장점**: 최소 변경.
- **단점**: screenshot 주석과 30초 리플레이 모두 한 카드에 묻혀 셀링포인트 약화.
- **결론**: 사용자가 screenshot 별도 분리 요청. **채택 안 함.**

### 대안 3: 두 컴포넌트 분리 (`FeaturesForReporters.tsx`, `FeaturesForDevs.tsx`)
- **장점**: 가독성 명료.
- **단점**: 카드 렌더 로직 100% 동일한데 두 파일로 중복.
- **결론**: 단순성 원칙 위반. **채택 안 함.**

### 대안 4: Mockup record/replay 탭 분리 (Mockup 8탭)
- **장점**: 사용자에게 30초 리플레이를 시각적으로도 독립 노출.
- **단점**: 탭이 많아져 모바일 wrap 늘어남. 사용자가 "Mockup은 record에 흡수"로 명시.
- **결론**: **채택 안 함.**

### 대안 5: Cross-Page Logs를 별도 카드로 (Section B 5장)
- **장점**: SPA 라우팅·페이지 이동 시 로그 누적을 독립 셀링포인트화.
- **단점**: 앱 i18n에 사용자 노출 용어가 없어 신조어가 됨. 사용자가 "강조 안 함, logging 일반으로 흡수" 결정.
- **결론**: **채택 안 함.** `consoleNetworkLogs`/`actionLog` 카피 안에 자연스럽게 흡수.

## 위험 요소

1. **i18n 키 제거**: 기존 `features.items.record`, `features.items.log`, `features.items.autoCollect` 키 삭제. 현재는 FeatureCards.tsx만 참조 → 안전. 단, **Task 2/3 (i18n 재편) 머지와 Task 4 (FeatureCards group prop 도입) 머지가 분리되면 next-intl이 MISSING_MESSAGE를 throw해 페이지 전체가 깨질 수 있다.** 두 작업은 반드시 같은 커밋/PR로 묶을 것.
2. **이미지 자산 누락**: 신규 자산 12개 + 갱신 자산 3개. 빠지면 alt 텍스트만 표시되지만 빌드는 통과. Task 1을 선행으로.
3. **그리드 균형**: Section A 2×3 + Section B 2×2 — 두 섹션 모두 균등 그리드로 떨어짐. 비대칭 위험 제거됨.
4. **Mockup 7탭 클릭 비용**: 자동 전환이 없으므로 사용자가 7장 모두 보려면 클릭/탭 비용이 5장 대비 +40%. 자동 전환 신규 도입은 비목표.
5. **Lighthouse SEO**: 페이지에 `<h2>`가 두 개 추가됨. 시맨틱 정상. 빌드 후 점수 확인.
6. **번들 사이즈**: lucide 아이콘 4개 추가 import (`Camera`, `Film`, `Activity`, `ListChecks`) → ~4KB tree-shaken. 무시 가능.
7. **Section A `log` ↔ Section B `consoleNetworkLogs` 톤 분리**: 카피 톤이 헷갈리면 사용자가 "같은 카드 두 번 봤네" 오인 가능. ko/en 모두 "실시간 확인(리포터)" vs "받은 사람도 풀셋(받는 사람)" 톤이 명확히 갈리도록 카피 유지.
