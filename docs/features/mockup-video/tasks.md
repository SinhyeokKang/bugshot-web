# Mockup 섹션 — 이미지 → MP4 비디오 전환 — 구현 태스크

## 선행 조건

- [ ] 5개 MP4 파일 준비 완료 (`mockup-inspect.mp4`, `mockup-record.mp4`, `mockup-log.mp4`, `mockup-ai.mp4`, `mockup-submit.mp4`)
- [ ] 비디오 해상도: 기존 이미지 비율(2256×1354, ≈5:3)과 일치 권장
- [ ] 비디오 파일 크기: 개당 5MB 이하 권장 (Lighthouse Performance 유지)

## 태스크

### Task 1: 비디오 파일 배치

- **변경 대상**: `public/videos/` (신규 디렉터리)
- **작업 내용**: `public/videos/` 디렉터리 생성, 5개 MP4 파일 배치
- **검증**:
  - [ ] `public/videos/mockup-{inspect,record,log,ai,submit}.mp4` 5개 파일 존재
  - [ ] `pnpm dev` 후 브라우저에서 `/videos/mockup-inspect.mp4` 직접 접근 가능

### Task 2: Mockup.tsx 비디오 전환

- **변경 대상**: `src/components/Mockup.tsx`
- **작업 내용**:
  1. `slides` 배열: `image` → `video` 프로퍼티, 경로를 `/videos/mockup-{key}.mp4`로 변경
  2. `useRef` 추가: `videoRefs`로 5개 video 요소 참조
  3. `useEffect` 추가: `active` 변경 시 이전 비디오 `pause()`, 새 비디오 `currentTime = 0` + `play()`
  4. `<button>` 래퍼 → `<div>`로 교체, `handleNext` 함수 삭제, `onClick`/`aria-label("next")` 제거
  5. `<img>` → `<video>` 교체. 속성: `muted`, `loop`, `playsInline`, `ref`, `preload`, `aria-hidden`
  6. 첫 번째 비디오만 `autoPlay` + `preload="auto"`, 나머지는 `preload="none"`
  7. `width`/`height`/`alt` 속성 제거 (video에 불필요)
- **검증**:
  - [ ] 페이지 로드 시 첫 번째 탭 비디오가 음소거 자동 재생 + 루프
  - [ ] 탭 버튼 클릭 시 비디오가 처음부터 재생되며 opacity 페이드 전환
  - [ ] 비디오 영역 클릭 시 아무 동작 없음 (cursor: default)
  - [ ] iOS Safari에서 inline 자동 재생 확인

### Task 3: 기존 mockup 이미지 삭제

- **변경 대상**: `public/images/mockup-*.webp`
- **작업 내용**: 5개 mockup webp 파일 삭제
- **검증**:
  - [ ] `public/images/mockup-*.webp` 파일 없음
  - [ ] 빌드 에러 없음 (`pnpm build`)
  - [ ] 프로젝트 내 mockup webp 참조가 남아 있지 않음 (`grep -r "mockup-" src/`)

### Task 4: i18n 메시지 정리

- **변경 대상**: `src/lib/i18n/ko.json`, `src/lib/i18n/en.json`
- **작업 내용**: `mockup.next` 키 삭제 (클릭 → 다음 슬라이드 동작 제거로 더 이상 불필요)
- **검증**:
  - [ ] `mockup.next` 키가 ko.json, en.json에서 제거됨
  - [ ] 타입 체크 통과 (`npx tsc --noEmit`)

## 테스트 계획

- 수동 테스트 (Chrome):
  - [ ] 페이지 로드 → 첫 번째 비디오 자동 재생 확인
  - [ ] 5개 탭 모두 순회하며 비디오 재생 + 루프 확인
  - [ ] 탭 전환 시 이전 비디오 정지, 새 비디오 처음부터 재생 확인
  - [ ] 비디오 영역 클릭 시 반응 없음 확인
  - [ ] 스크롤 reveal 애니메이션 정상 동작 확인
- 수동 테스트 (Safari / iOS 시뮬레이터):
  - [ ] playsInline 동작 확인 (전체 화면 전환 없이 inline 재생)
- 성능:
  - [ ] Lighthouse Performance ≥ 90
  - [ ] 비활성 탭 비디오가 네트워크 요청하지 않음 (DevTools Network 탭 확인)

## 구현 순서 권장

1. **Task 1** (비디오 배치) — 선행 필수. MP4 파일이 있어야 이후 작업 검증 가능.
2. **Task 2** (Mockup.tsx 수정) — 핵심 변경. Task 1 완료 후 진행.
3. **Task 3** (이미지 삭제) + **Task 4** (i18n 정리) — 병렬 가능. Task 2 검증 완료 후 진행.
