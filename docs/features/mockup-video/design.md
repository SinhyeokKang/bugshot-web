# Mockup 섹션 — 이미지 → MP4 비디오 전환 — 기술 설계

## 개요

`Mockup.tsx`의 `<img>` 요소를 `<video>` 요소로 교체한다. 기존 grid 스택 + opacity 페이드 전환 패턴을 그대로 유지하되, 활성 비디오만 재생하고 비활성 비디오는 일시정지한다. `<button>` 래퍼(클릭 → 다음 슬라이드)를 제거하고 `<div>`로 교체한다.

## 변경 범위

### 수정 파일

#### `src/components/Mockup.tsx`
- 현재 역할: 5개 탭 이미지 슬라이드 + 탭 버튼 + 캡션
- 변경 내용:
  - `slides` 배열: `image` 프로퍼티를 `video`로 변경, 경로를 `/videos/mockup-{key}.mp4`로
  - `<button>` 래퍼 → `<div>`로 교체 (`handleNext` 제거)
  - `<img>` → `<video>` 교체. 속성: `muted`, `autoPlay`, `loop`, `playsInline`, `preload`
  - `useRef`로 video 요소 배열 참조. 탭 전환 시 새 비디오 `currentTime = 0` + `play()`, 이전 비디오 `pause()`
  - 비활성 비디오에 `preload="none"`, 활성 비디오에 `preload="auto"`

### 삭제 파일

- `public/images/mockup-inspect.webp`
- `public/images/mockup-record.webp`
- `public/images/mockup-log.webp`
- `public/images/mockup-ai.webp`
- `public/images/mockup-submit.webp`

### 새 파일

- `public/videos/mockup-inspect.mp4`
- `public/videos/mockup-record.mp4`
- `public/videos/mockup-log.mp4`
- `public/videos/mockup-ai.mp4`
- `public/videos/mockup-submit.mp4`

(비디오 파일은 별도 준비 예정. 디렉터리만 생성.)

## 데이터 흐름

```
탭 버튼 클릭
  → setActive(i)
  → useEffect: videoRefs[prev].pause(), videoRefs[i].currentTime = 0, videoRefs[i].play()
  → opacity 전환: active 비디오 opacity-100, 나머지 opacity-0
```

## 인터페이스 설계

```typescript
// slides 배열 변경
const slides = [
  { key: "inspect", icon: MousePointerClick, video: "/videos/mockup-inspect.mp4" },
  { key: "record", icon: Video, video: "/videos/mockup-record.mp4" },
  { key: "log", icon: SquareTerminal, video: "/videos/mockup-log.mp4" },
  { key: "ai", icon: Wand2, video: "/videos/mockup-ai.mp4" },
  { key: "submit", icon: Send, video: "/videos/mockup-submit.mp4" },
] as const;
```

```typescript
// video ref 관리
const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
```

```typescript
// 탭 전환 시 비디오 제어
useEffect(() => {
  videoRefs.current.forEach((video, i) => {
    if (!video) return;
    if (i === active) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, [active]);
```

```typescript
// video 요소
<video
  ref={(el) => { videoRefs.current[i] = el; }}
  src={slide.video}
  muted
  autoPlay={i === 0}
  loop
  playsInline
  preload={i === 0 ? "auto" : "none"}
  aria-hidden={i !== active}
  className={cn(
    "col-start-1 row-start-1 -m-px w-[calc(100%+2px)] max-w-none transition-opacity duration-300 ease-out",
    i === active ? "opacity-100" : "opacity-0"
  )}
/>
```

## 기존 패턴 준수

- **반응형**: `md:` 단일 브레이크포인트. 비디오는 width 100%로 자연스럽게 반응형 처리되므로 별도 분기 불필요.
- **섹션 구조**: outer `<section>` + inner `container mx-auto max-w-[1200px]` 패턴 유지.
- **rounded border**: 기존 `rounded-3xl border-[6px] / md:rounded-card md:border-[12px]` + `overflow-hidden` 유지.
- **i18n**: `t(`slides.${key}.label`)`, `t(`slides.${key}.caption`)` 패턴 유지. 메시지 키 변경 없음.
- **클라이언트 컴포넌트**: `"use client"` 유지 (useState, useRef, useEffect 사용).

## 대안 검토

### 단일 `<video>` + src 동적 교체
탭 전환 시 하나의 `<video>` 요소의 `src`를 바꾸는 방식. 메모리 사용량이 적지만, src 교체 시 로딩 지연 + 화면 깜빡임이 발생한다. 기존 grid 스택 opacity 페이드 패턴과도 맞지 않아 채택하지 않음.

## 위험 요소

- **파일 크기**: MP4 파일이 webp 대비 크게 증가할 수 있음. 5개 비디오 동시 로딩 시 초기 로드 성능 저하 가능. `preload="none"`으로 비활성 비디오의 선로딩을 방지하지만, 첫 탭 전환 시 약간의 로딩 지연이 있을 수 있음.
- **Lighthouse Performance**: 비디오 파일 크기에 따라 LCP/TBT에 영향. 비디오 파일을 10초 이내, 5MB 이하로 유지하는 것을 권장.
- **iOS autoplay 정책**: `muted` + `playsInline` 조합이면 Safari에서도 자동 재생이 허용됨. 누락 시 재생 불가.
- **`play()` Promise rejection**: 브라우저 정책으로 autoplay가 차단될 수 있음. `.catch(() => {})` 으로 무시 처리.
