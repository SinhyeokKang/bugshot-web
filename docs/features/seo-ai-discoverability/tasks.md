# AI Discoverability — 구현 태스크

## 선행 조건
- **llms.txt**: 선행 조건 없음 — 즉시 가능.
- **영상 임베드/스키마**: 데모 영상(YouTube URL) 준비 필요(오프사이트 마케팅, README 후속 과제). 미준비 시 Task 2·3 보류.
- `seo-http-config` CSP/frame 정책 도입 시 YouTube frame-src 허용 조율.

## 태스크

### Task 1: public/llms.txt 추가
- **변경 대상**: `public/llms.txt`(신규)
- **작업 내용**: 제품 1–2문장 설명 + 핵심 docs 링크(quick-start, faq, video/record, screenshot/capture, integrations) + GitHub. (선택: `scripts/`로 생성 스크립트화 후 빌드 체인 편입.)
- **검증**:
  - [ ] `GET /llms.txt` 200
  - [ ] 링크 URL 유효(200)
  - [ ] `pnpm build` 후 산출물에 포함

### Task 2: VideoEmbed 컴포넌트 + 랜딩 배치 (영상 준비 후)
- **변경 대상**: `src/components/VideoEmbed.tsx`(신규), `src/app/[locale]/page.tsx`, `src/lib/constants.ts`(`DEMO_VIDEO`)
- **작업 내용**: 썸네일 클릭-투-플레이 YouTube 임베드(고정 aspect-ratio, 지연 로드). HowItWorks 인접 배치.
- **검증**:
  - [ ] 랜딩에 영상 렌더·재생
  - [ ] LCP/CLS 회귀 없음(썸네일 우선, 고정 치수)
  - [ ] CSP/X-Frame 정책과 충돌 없음(frame-src 허용 확인)

### Task 3: VideoObject JSON-LD (영상 준비 후)
- **변경 대상**: `src/app/[locale]/page.tsx`
- **작업 내용**: `DEMO_VIDEO` 기반 `VideoObject` `<script>` 추가.
- **검증**:
  - [ ] 렌더 HTML에 유효한 VideoObject JSON-LD
  - [ ] Rich Results Test 통과
  - [ ] 실제 존재하는 영상만 마크업(허위 금지)

### Task 4: (bugshot-2) quick-start 영상 임베드
- **변경 대상**: bugshot-2 `guide/{en,ko}/quick-start.md`
- **작업 내용**: quick-start에 데모 영상 임베드/링크. → `seo-docs-content`와 함께 bugshot-2에서.
- **검증**:
  - [ ] 재fetch 후 `/docs/quick-start`에 영상 노출

## 테스트 계획
- 단위 테스트: 없음(정적 파일/임베드).
- 수동 테스트:
  - [ ] `/llms.txt` 접근
  - [ ] 랜딩 영상 재생·성능 측정(Lighthouse)
  - [ ] JSON-LD 검증

## 구현 순서 권장
Task 1(즉시, 독립) 먼저. Task 2·3은 영상 준비 후(순서: 2→3). Task 4는 bugshot-2 레포에서 별도.
