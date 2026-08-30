# Performance — Mobile LCP — 기술 설계

## 개요
세 가지 독립적 수정: (1) Pretendard 스타일시트를 비-렌더블로킹으로 로드, (2) preconnect CORS 정합, (3) 목업 WebP 소스 리사이즈. 모두 정적 export 제약 내에서 서버 로직 없이 가능.

## 변경 범위

- `src/app/[locale]/layout.tsx` — 현재: `<link rel="preconnect" href=jsdelivr crossOrigin="anonymous">` + `<link rel="stylesheet" href={PRETENDARD_CSS} precedence="default">`(React 19 precedence로 head에 blocking hoist). 변경:
  - **(A안, 기본)** locale 게이팅: `locale === "ko"`일 때만 Pretendard `<link>` 렌더. en은 DM Sans만. → en LCP에서 폰트 CSS 완전 제거.
  - **(B안, 보완/병행)** blocking 회피: `precedence` 제거하고 `rel="preload" as="style" onload="this.rel='stylesheet'"` + `<noscript>` fallback 패턴. (React 19에서 인라인 onload 주의 — 아래 위험 참조.)
  - preconnect: stylesheet를 실제 로드하는 경우 stylesheet `<link>`에도 `crossOrigin="anonymous"` 추가(정합) 또는 A안으로 en에서 preconnect도 제거.
- `src/components/Mockup.tsx` — 현재: 6개 `<img width=2256 height=1354>`를 crossfade로 전부 즉시 로드. 변경: 소스 자산을 표시 크기에 맞게 축소한 파일로 교체(파일명 유지 시 코드 무변경), 그리고 비활성 슬라이드는 `loading="lazy"`/디코딩 지연 고려(활성 1장만 우선).
- `public/images/mockup-*.webp` (6개) — 현재: 2256×1354. 변경: 실제 최대 렌더 폭에 맞춰 재출력(예: 데스크톱 컨테이너 1200px 기준 ~1400px @; 모바일용 별도 소스 필요 시 `<picture>` 도입). 자산 교체는 빌드 스크립트 `build-image-dims.mjs`가 치수를 다시 읽으므로 width/height 하드코딩(2256/1354)도 함께 갱신.

## 데이터 흐름
빌드타임: 정적 자산(폰트 CSS 링크, 이미지)만 관여. 런타임 상태 없음. `build-image-dims.mjs`는 guide 이미지(.jpg) 대상이라 랜딩 목업(public/images/*.webp)엔 관여하지 않음 — 목업 width/height는 Mockup.tsx에 하드코딩되어 있어 자산 교체 시 수동 갱신 필요.

## 인터페이스 설계
타입 변경 없음. A안 적용 시 layout 렌더 분기만:
```tsx
{locale === "ko" && (
  <>
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
    <link rel="stylesheet" href={PRETENDARD_CSS} crossOrigin="anonymous" precedence="default" />
  </>
)}
```

## 기존 패턴 준수
- CLAUDE.md: `next/image`는 `unoptimized: true` 필수(정적 export) — 자동 리사이즈 불가이므로 소스 자산 레벨에서 해결(이미 HowItWorks가 mobile/pc 이중 소스로 처리하는 패턴 존재 → Mockup에도 동일 적용 가능).
- CLS 방어: 모든 img에 명시적 width/height 유지(감사에서 CLS 0 확인 — 회귀 금지).
- 반응형 `md:` 단일 브레이크포인트.

## 대안 검토
- **Pretendard 자체호스팅**(`next/font/local`로 사용 서브셋 woff2 self-host): 서드파티 크리티컬 패스 완전 제거로 가장 견고하나 폰트 파일 관리·서브셋 부담. → 이번 스코프는 A안(locale 게이팅)로 en 영향 제거, 자체호스팅은 후속 옵션.
- **A안 vs B안**: A안(ko 전용 로드)이 en LCP엔 최선이나 ko는 여전히 blocking. B안(async load)은 양 로케일 개선하나 React 19 hoisting/onload 처리가 까다로움. → A안 기본, ko도 개선 필요하면 B안 병행.

## 위험 요소
- React 19 `precedence`는 스타일시트를 head로 hoist하며 Suspense와 연동 — `onload` 인라인 스왑 패턴이 React가 관리하는 링크와 충돌할 수 있음(B안 채택 시 실제 렌더 HTML 검증 필수).
- A안: en 페이지에서 혹시라도 한글이 노출되는 지점(예: 공용 컴포넌트에 한글 하드코딩)이 있으면 폰트 폴백으로 렌더됨 — en 콘텐츠는 전량 영어이므로 실질 문제 없음(확인 권장).
- 목업 자산 교체 시 width/height 하드코딩(2256/1354) 갱신 누락 → CLS 회귀. 자산·코드 동시 변경.
- 이미지 재출력 화질 저하 주의(제품 스크린샷 가독성).
