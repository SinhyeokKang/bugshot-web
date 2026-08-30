# Review & Trust UI — 기술 설계

## 개요
집계 평점을 표시하는 작은 프레젠테이션 요소를 Hero(또는 Review 섹션)에 추가하고, 값은 기존 `CHROME_WEB_STORE_RATING` 상수에서 읽는다. 별도 상태·API 없음. EN 후기 이름은 i18n 메시지 수정만으로 해결.

## 변경 범위

- `src/lib/constants.ts` — 현재: `CHROME_WEB_STORE_RATING`(값), `CHROME_WEB_STORE_REVIEWS_URL` 보유. 변경 없음(그대로 재사용). 필요 시 포맷 헬퍼는 컴포넌트 내 처리.
- `src/components/Hero.tsx` — 현재: 로고+H1+subcopy+CTA+note(서버 데이터 없이 `useTranslations("hero")`). 변경: CTA 아래 `note` 근처에 집계 평점 요소 추가(별 아이콘 + "4.94 · 16 ratings" + CWS 리뷰 링크). `lucide-react`의 `Star`(Review.tsx에서 이미 사용) 재사용.
- `src/lib/i18n/en.json`, `ko.json` — 현재: `review.items.*.author`가 한글 마스킹. 변경: EN은 영어권 attribution으로 교체(아래 대안 참조). `hero`(또는 새 `rating`) 네임스페이스에 "{count} ratings" / aria-label 문구 키 추가(EN·KO 동시).
- (대안 배치 시) `src/components/Review.tsx` — 집계 평점을 Review 섹션 헤더에 둘 경우 진입 지점. 기본안은 Hero 배치라 미변경.

## 데이터 흐름
`CHROME_WEB_STORE_RATING`(상수) → Hero(서버 컴포넌트 아님, `useTranslations`만 사용하는 함수형)에서 직접 import → 정적 렌더. 런타임 상태 없음. 표시 문구(라벨/복수형)는 next-intl 메시지에서, 수치는 상수에서 주입:
```
t("rating.label", { value: 4.94, count: 16 })  // "{value} ★ · {count} ratings"
```

## 인터페이스 설계
새 타입 없음. i18n 메시지 키만 추가(예):
```jsonc
// en.json / ko.json — hero 또는 신규 rating 네임스페이스
"rating": {
  "label": "{value} · {count} ratings on Chrome Web Store",
  "ariaLabel": "Rated {value} out of 5 from {count} ratings"
}
```
값 주입은 `CHROME_WEB_STORE_RATING.ratingValue` / `.ratingCount`.

## 기존 패턴 준수
- CLAUDE.md: 브랜드 컬러/별 표현은 Review.tsx의 `fill-brand text-brand` 패턴 재사용. 커스텀 색상 남발 금지.
- 반응형 `md:` 단일 브레이크포인트. 모바일 기본→md 확대.
- 외부 링크는 `target="_blank" rel="noopener noreferrer"`(기존 CTA·cite 패턴 동일).
- i18n 동시 갱신(en/ko 항상 함께).

## 대안 검토
- **EN 후기 이름 처리 3안**: (A) 실명/핸들+회사 노출(리뷰어 동의 필요, 진정성 최상) / (B) **직함만 표기**("QA Engineer" 등, 이름 제거 — 동의 불필요·즉시 적용, 기본 채택 권장) / (C) 영어권 리뷰로 교체(신규 콘텐츠 필요). → 기본 B, 추후 동의 확보 시 A.
- **평점 배치**: Hero(CTA 부근) vs Review 섹션 헤더 vs 둘 다. → Hero 단독 채택(전환 경로 상단 노출이 Trust 신호로 최적, sxo 권고). Review 섹션 중복은 과함.

## 위험 요소
- Hero는 LCP 요소(H1) 인접 — 평점 요소가 above-the-fold 레이아웃을 밀어 CLS/LCP를 건드리지 않도록 고정 높이/기존 여백 내 배치.
- ratingValue가 `4.94`(소수)라 로케일 숫자 포맷 차이 주의 — 문자열 그대로 표기(next-intl number 포맷 불필요).
- reviewCount(8) vs ratingCount(16) — 노출은 ratingCount 기준("16 ratings")으로 통일해 혼동 방지.
