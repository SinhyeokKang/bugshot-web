# Performance — Mobile LCP

## 배경
SEO 감사 Performance 카테고리 78/100. 데스크톱은 98(LCP 1.1s)로 우수하나 **모바일 LCP 5.1s(Poor)**. 원인:

1. Pretendard(한글 폰트) 스타일시트가 jsDelivr CDN에서 **렌더블로킹 `<link rel="stylesheet">`** 로 로드되며, `[locale]/layout.tsx`가 로케일 구분 없이 **en·ko 양쪽에** 무조건 hoist. en 상단 H1은 DM Sans(Latin)로 렌더되므로 위 폰트가 above-the-fold에 불필요한데도 첫 페인트를 막는다(Lighthouse est. savings ~1,050ms).
2. jsDelivr `preconnect`에 `crossOrigin="anonymous"`가 있으나 실제 stylesheet `<link>`엔 없어 CORS 모드 불일치 → preconnect가 재사용되지 못하고 별도 커넥션 → **preconnect 효과 0**.
3. Hero/Mockup 목업 스크린샷(WebP)이 표시 크기의 ~6배(2256×1354)로 서빙 → 모바일 ~355KB 낭비. `next/image`가 `unoptimized: true`(정적 export 필수)라 자동 리사이즈 불가.

## 목표
- 모바일 LCP를 "Needs Improvement"/"Good" 경계(≤2.5s 목표) 방향으로 개선(~750–1,050ms 단축).
- Pretendard 스타일시트가 첫 페인트를 막지 않는다.
- jsDelivr preconnect가 실제로 재사용되거나 제거된다.
- 모바일 목업 이미지 페이로드 ~355KB 감소.
- CLS는 현행 0 유지.

## 비목표
- Pretendard 자체호스팅 전환(더 큰 변경 — 대안으로만 검토).
- DM Sans 로딩 방식 변경(`next/font` 현행 유지).
- Mockup 캐러셀 UX/애니메이션 변경.
- 데스크톱 성능(이미 우수).

## 사용자 시나리오
1. 모바일 방문자가 `/en` 진입 시 H1이 폰트 CSS 대기 없이 즉시 페인트된다.
2. 한글 방문자(`/ko`)는 Pretendard가 적용되되 첫 페인트를 막지 않는다(swap).
3. 모바일에서 목업 이미지가 화면 크기에 맞는 용량으로 다운로드된다.

## 성공 기준
- [ ] Lighthouse 모바일 `render-blocking-insight`에서 Pretendard CSS 사라짐.
- [ ] 모바일 LCP가 감사 기준(5.1s) 대비 유의미 개선(재측정으로 확인).
- [ ] `unused preconnect` 경고 사라짐(재사용) 또는 preconnect 제거.
- [ ] `image-delivery-insight` 목업 절감 대폭 감소.
- [ ] CLS = 0 유지, `/ko` 한글 렌더 정상.
