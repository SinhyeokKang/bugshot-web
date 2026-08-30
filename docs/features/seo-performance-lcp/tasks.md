# Performance — Mobile LCP — 구현 태스크

## 선행 조건
- Pretendard 로딩 전략 확정: A안(ko 전용 렌더, 기본) / B안(async load 병행) / 자체호스팅(후속).
- 목업 이미지 재출력 도구(WebP 리사이즈) 준비. 원본 고해상도 소스 확보.

## 태스크

### Task 1: Pretendard 스타일시트 렌더블로킹 제거
- **변경 대상**: `src/app/[locale]/layout.tsx`
- **작업 내용**: A안 — `locale === "ko"`일 때만 preconnect + Pretendard `<link>` 렌더. stylesheet에 `crossOrigin="anonymous"` 추가(preconnect 정합).
- **검증**:
  - [ ] `/en` 렌더 HTML `<head>`에 jsDelivr Pretendard `<link>` 없음
  - [ ] `/ko` 렌더 HTML엔 존재하고 한글이 Pretendard로 렌더됨
  - [ ] Lighthouse 모바일 `/en` `render-blocking-insight`에서 Pretendard CSS 사라짐
  - [ ] `unused preconnect` 경고 없음

### Task 2: 목업 WebP 소스 리사이즈
- **변경 대상**: `public/images/mockup-*.webp` (6개), `src/components/Mockup.tsx`
- **작업 내용**: 각 목업을 실제 최대 렌더 폭 기준으로 재출력(용량↓). 필요 시 HowItWorks식 mobile/pc 이중 소스 도입. Mockup.tsx의 `width={2256} height={1354}` 하드코딩을 새 치수로 갱신(비율 유지 시 값만 조정).
- **검증**:
  - [ ] Lighthouse 모바일 `image-delivery-insight` 목업 절감 대폭 감소(~355KB)
  - [ ] CLS = 0 유지(치수 정합)
  - [ ] 목업 화질 육안 확인(스크린샷 텍스트 가독)

### Task 3: (선택) 비활성 슬라이드 로딩 지연
- **변경 대상**: `src/components/Mockup.tsx`
- **작업 내용**: 활성 슬라이드 외 5장에 `loading="lazy"` 또는 첫 슬라이드만 우선. 캐러셀 전환 시 깜빡임 없는지 확인.
- **검증**:
  - [ ] 초기 로드 시 목업 이미지 동시 요청 수 감소(Network 탭)
  - [ ] 탭 전환 시 이미지 지연/깜빡임 없음

## 테스트 계획
- 단위 테스트: 없음(설정/자산 변경).
- 수동 테스트:
  - [ ] `/en`·`/ko` Chrome에서 렌더 확인(한글 폰트 정상)
  - [ ] Lighthouse 모바일 재측정: LCP·render-blocking·image savings 개선, CLS 0
  - [ ] `pnpm build` 성공(dev 서버 종료 후)

## 구현 순서 권장
Task 1(폰트, 최대 임팩트) 우선 → Task 2(이미지) → Task 3(선택). 세 태스크 상호 독립이라 병렬 가능.
