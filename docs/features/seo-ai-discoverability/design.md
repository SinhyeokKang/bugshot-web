# AI Discoverability — 기술 설계

## 개요
두 갈래: (1) `public/llms.txt` 정적 파일 추가(즉시 가능, 영상 무관), (2) 데모 영상 준비 후 랜딩/quick-start 임베드 + `VideoObject` JSON-LD. 정적 export 제약 내에서 서버 로직 없음.

## 변경 범위

- `public/llms.txt` (신규) — 제품 1–2문장 설명 + 핵심 URL 목록(quick-start, faq, video/record, screenshot/capture, integrations, GitHub). 정적 파일이라 `public/`에 두면 그대로 서빙. (선택: `scripts/`에 sitemap/SUMMARY 기반 생성 스크립트를 추가해 빌드 체인에 편입 — 초기엔 수동 정적 파일로 충분.)
- `src/components/VideoEmbed.tsx` (신규) — YouTube 영상을 지연 로드(썸네일 클릭 시 iframe 삽입, 또는 `loading="lazy"` iframe)하는 컴포넌트. CLS 방어 위해 고정 aspect-ratio 컨테이너. docs의 `EmbedCard`(링크 카드)와 별개 — 실제 영상 재생용.
- `src/app/[locale]/page.tsx` — 현재: 목업/HowItWorks만. 변경: (a) HowItWorks 인접 또는 Mockup 대체/보완으로 `VideoEmbed` 배치, (b) `VideoObject` JSON-LD `<script>` 추가(기존 4개 JSON-LD 블록 옆).
- `content/guide/**/quick-start.md` (bugshot-2 원본) — quick-start에 영상 링크/임베드. ⚠️ docs 콘텐츠는 bugshot-2에서 빌드타임 fetch → **원본 수정은 bugshot-2에서**(embeds.mjs가 `{% embed url %}`를 OG 카드로 처리하나, 영상 재생 임베드는 별도 처리 필요할 수 있음 → `seo-docs-content`/bugshot-2와 조율).

## 데이터 흐름
- llms.txt: 정적 파일 → 크롤러 GET. (스크립트화 시 빌드타임 생성.)
- 영상: YouTube URL(상수 or i18n) → VideoEmbed 렌더 + VideoObject JSON-LD(`contentUrl`/`embedUrl`/`thumbnailUrl`/`uploadDate`). 런타임 상태는 클릭-투-플레이 토글 정도.

## 인터페이스 설계
```ts
// constants.ts (영상 준비 후)
export const DEMO_VIDEO = {
  youtubeId: "<id>",
  embedUrl: "https://www.youtube.com/embed/<id>",
  thumbnailUrl: "https://i.ytimg.com/vi/<id>/maxresdefault.jpg",
  uploadDate: "2026-..",
} as const;
```
```jsonc
// page.tsx VideoObject JSON-LD
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "BugShot demo",
  "description": "...",
  "thumbnailUrl": "...",
  "uploadDate": "...",
  "embedUrl": "https://www.youtube.com/embed/<id>"
}
```

## 기존 패턴 준수
- CLAUDE.md: 정적 export — 서버 기능 없음. 영상은 클라이언트 iframe. CLS 방어(고정 치수) 필수(감사 CLS 0 유지).
- JSON-LD는 page.tsx `<script dangerouslySetInnerHTML>` 패턴 재사용.
- docs 콘텐츠 내재화 원칙: quick-start 임베드는 bugshot-2 원본에서.
- 브랜드/외부 링크 `rel="noopener noreferrer"`.

## 대안 검토
- **자체 호스팅 `<video>` vs YouTube 임베드**: 자체 호스팅은 대역폭/최적화 부담·정적 export 용량. YouTube는 브랜드-멘션 신호(AI 인용 상관)까지 획득 → **YouTube 채택**.
- **즉시 iframe vs 클릭-투-플레이**: 즉시 iframe은 YouTube 스크립트/쿠키·성능 부담(LCP). → 썸네일 클릭-투-플레이(경량, 성능 우호) 권장.
- **llms.txt 정적 vs 생성 스크립트**: 초기엔 정적 파일(빠름), 문서 증가 시 SUMMARY 기반 생성으로 전환(옵션).

## 위험 요소
- **영상 미준비 시 이 feature의 임베드/스키마 파트는 착수 불가** — llms.txt만 선행. VideoObject는 실제 영상 없이 넣으면 허위 마크업(금지).
- `seo-http-config` CSP/`X-Frame-Options` 도입 시 YouTube iframe 차단 가능 → `frame-src https://www.youtube.com` 허용 필요(두 feature 조율).
- YouTube iframe CLS/LCP 영향 → 고정 aspect-ratio + 지연 로드.
- quick-start 임베드는 bugshot-2 원본 수정 필요(레포 경계) → `seo-docs-content`와 함께.
