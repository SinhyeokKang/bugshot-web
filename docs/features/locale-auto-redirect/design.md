# Locale 자동 리디렉트 — 기술 설계

## 개요

정적 export(`output: 'export'`)라 미들웨어·서버 로직을 쓸 수 없으므로, 리디렉트는 **Vercel edge의 `vercel.json` `redirects`** 로 처리한다. redirects는 rewrites보다 먼저 평가되므로, 비한국어 요청은 edge에서 `/en`으로 리디렉트되고, 한국어 요청은 리디렉트를 통과해 기존 rewrite로 bare 경로에 ko 콘텐츠를 서빙한다. 수동 언어 선택은 `LocaleSwitcher`가 기록하는 `NEXT_LOCALE` 쿠키로 기억하며, edge redirect가 이 쿠키를 최우선으로 본다.

핵심 판정 로직(bare 경로 요청 1건 기준):

```
if 쿠키 NEXT_LOCALE == "en"        → /en... 리디렉트
elif 쿠키 NEXT_LOCALE 존재(=ko)     → 리디렉트 없음 (bare=ko)
elif Accept-Language 우선 언어 != ko → /en... 리디렉트
else (우선 ko 또는 헤더 없음)        → 리디렉트 없음 (bare=ko)
```

리디렉트 목적지는 **항상 `/en`뿐**이다(비대칭 전략). ko는 언제나 bare를 유지한다.

## 변경 범위

### `vercel.json` (수정)
- **현재 역할**: bare 경로 4종(`/`, `/privacy`, `/docs`, `/docs/:path*`)을 `/ko...`로 rewrite(ko 서빙).
- **변경 내용**: `rewrites`는 그대로 두고, 상위에 `redirects` 배열을 추가. 각 bare source마다 2개 규칙:
  1. 쿠키 `NEXT_LOCALE=en` → `/en...` (temporary)
  2. 쿠키 `NEXT_LOCALE` 없음 **AND** `Accept-Language` 우선 언어가 ko 아님 → `/en...` (temporary)
- 쿠키가 `ko`이거나(=규칙1·2 모두 불충족), 헤더 우선 ko/헤더 부재이면 어떤 redirect도 매칭되지 않아 기존 rewrite로 fall-through → ko 서빙.

### `src/components/LocaleSwitcher.tsx` (수정)
- **현재 역할**: 클릭 시 `window.location.href = /{next}{stripped}`로 로케일 전환.
- **변경 내용**: 이동 직전 `document.cookie`에 `NEXT_LOCALE={next}` 기록(1년, `path=/`, `SameSite=Lax`, `Secure`). 나머지 로직 불변.

### 새 파일
- 없음. (문서 외 프로덕션 신규 파일 없음.)

## 데이터 흐름

```
[브라우저]
  bare 경로 요청 (Cookie: NEXT_LOCALE?, Accept-Language)
      │
      ▼
[Vercel edge] redirects 평가 (source 순서대로, 첫 매칭 승)
  ├─ has cookie NEXT_LOCALE=en ──────────────► 307 Location: /en...
  ├─ missing cookie NEXT_LOCALE
  │    & has header accept-language ^(?!ko)... ► 307 Location: /en...
  └─ (매칭 없음) ─► rewrites 평가 ─► /ko... 정적 파일 서빙 (200, URL은 bare 유지)

[LocaleSwitcher] 사용자 클릭
  document.cookie = "NEXT_LOCALE=<next>; ..."  ──► 다음 요청부터 edge가 참조
  window.location.href = "/<next>..."
```

next-intl은 URL 경로에서 로케일을 읽는다(`localePrefix: always`, `request.ts`의 `requestLocale`). `NEXT_LOCALE` 쿠키는 **오직 edge redirect 판정에만** 쓰이고 next-intl 런타임에는 영향을 주지 않는다(정적 export라 서버 런타임 없음).

## 인터페이스 설계

### `vercel.json` redirects (전체)

```json
{
  "redirects": [
    { "source": "/",             "has": [{ "type": "cookie", "key": "NEXT_LOCALE", "value": "en" }], "destination": "/en", "permanent": false },
    { "source": "/",             "missing": [{ "type": "cookie", "key": "NEXT_LOCALE" }], "has": [{ "type": "header", "key": "accept-language", "value": "^(?![Kk][Oo]).+" }], "destination": "/en", "permanent": false },

    { "source": "/privacy",      "has": [{ "type": "cookie", "key": "NEXT_LOCALE", "value": "en" }], "destination": "/en/privacy", "permanent": false },
    { "source": "/privacy",      "missing": [{ "type": "cookie", "key": "NEXT_LOCALE" }], "has": [{ "type": "header", "key": "accept-language", "value": "^(?![Kk][Oo]).+" }], "destination": "/en/privacy", "permanent": false },

    { "source": "/docs",         "has": [{ "type": "cookie", "key": "NEXT_LOCALE", "value": "en" }], "destination": "/en/docs", "permanent": false },
    { "source": "/docs",         "missing": [{ "type": "cookie", "key": "NEXT_LOCALE" }], "has": [{ "type": "header", "key": "accept-language", "value": "^(?![Kk][Oo]).+" }], "destination": "/en/docs", "permanent": false },

    { "source": "/docs/:path*",  "has": [{ "type": "cookie", "key": "NEXT_LOCALE", "value": "en" }], "destination": "/en/docs/:path*", "permanent": false },
    { "source": "/docs/:path*",  "missing": [{ "type": "cookie", "key": "NEXT_LOCALE" }], "has": [{ "type": "header", "key": "accept-language", "value": "^(?![Kk][Oo]).+" }], "destination": "/en/docs/:path*", "permanent": false }
  ],
  "rewrites": [
    { "source": "/",            "destination": "/ko" },
    { "source": "/privacy",     "destination": "/ko/privacy" },
    { "source": "/docs",        "destination": "/ko/docs" },
    { "source": "/docs/:path*", "destination": "/ko/docs/:path*" }
  ]
}
```

정규식 `^(?![Kk][Oo]).+`: 값의 첫 두 글자가 `ko`(대소문자 무관)가 **아니면** 매칭 → 우선 언어가 한국어가 아님을 의미. `Accept-Language`의 첫 태그가 우선 언어이므로 문자열 시작만 검사한다. `ko-KR,...` → 매칭 실패(리디렉트 안 함), `en-US,...` → 매칭(리디렉트).

### `LocaleSwitcher.switchTo` (수정 후)

```ts
function switchTo(next: Locale) {
  if (next === active) return;
  document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax; secure`;
  const stripped = pathname.replace(/^\/[a-z]{2}/, "");
  window.location.href = `/${next}${stripped || ""}`;
}
```

## 기존 패턴 준수

- **CLAUDE.md 정적 export 제약**: "미들웨어 사용 불가", "bare 경로 locale 감지 불가(→ vercel rewrite로 기본 ko 서빙)"를 그대로 존중. 본 설계는 rewrite를 유지하고 그 앞단에 edge redirect만 얹는다.
- **SEO 집중(`bug-shot.com`)**: canonical·hreflang·sitemap 무변경. ko는 bare 유지, 리디렉트 목적지는 슬러그 canonical과 일치하는 `/en`.
- **외과적 변경**: 프로덕션 코드 변경은 `vercel.json`과 `LocaleSwitcher.tsx` 단 2곳. 컴포넌트·페이지·메타데이터 로직 불변.
- **쿠키 네이밍**: `NEXT_LOCALE`(next-intl 관례명). 정적 export라 실제 next-intl 런타임과 충돌 지점 없음. 향후 서버 렌더 전환 시에도 관례와 정합.

## 대안 검토

### 대안 A — 클라이언트 JS 인라인 리디렉트 (기각)
루트 레이아웃 `<head>`에 `navigator.languages`로 판정하는 인라인 스크립트를 넣어 리디렉트. `navigator.languages`가 `Accept-Language`보다 풍부하다는 장점이 있으나, 비한국어 사용자가 **ko 페이지를 먼저 로드한 뒤 리디렉트**(플래시) → Lighthouse Performance 저하·불필요 로드. edge 방식이 플래시 없이 처리하므로 기각. (단, 아래 위험의 정규식 미지원 시 폴백 후보로 보존.)

### 대안 B — 대칭 리디렉트(ko도 `/ko`로) (기각)
모든 bare 요청을 슬러그로 리디렉트. 멘탈 모델은 단순하나 한국어 사용자의 clean bare URL을 잃고 현행 SEO/rewrite 전략을 뒤집는다. 사용자가 비대칭(한국어 bare 유지)을 선택 → 기각.

### 대안 C — 지리(geo) 기반 판정 (기각)
Vercel geo 헤더(`x-vercel-ip-country`)로 KR 여부 판정. 요청이 "브라우저 로케일 기반"이며, VPN·해외 거주 한국어 사용자 오판 등 언어 의도와 불일치 → 기각.

## 위험 요소

1. **Vercel `has.value` 부정 룩어헤드 지원 여부 (최우선 검증)**: `^(?![Kk][Oo]).+`가 Vercel 매칭 엔진에서 기대대로 동작하는지 배포 프리뷰에서 반드시 확인. 미지원/오동작 시 폴백: (a) 대안 A(클라이언트 JS)로 전환, 또는 (b) 헤더 정규식을 앵커링 방식으로 재작성. **로컬 `pnpm dev`/`next dev`는 `vercel.json`을 적용하지 않으므로 이 검증은 `vercel dev` 또는 Vercel 프리뷰 배포에서만 가능.**
2. **캐시로 인한 오배포**: header/cookie 조건부 리디렉트가 중간 캐시에 URL만으로 캐시되면 오배포 가능. `permanent: false`(307)이라 브라우저 영구 캐시는 없으나, 필요 시 `Vary: Accept-Language, Cookie` 헤더를 `vercel.json` `headers`로 명시 검토. 프리뷰에서 캐시 오염 여부 확인.
3. **크롤러 Accept-Language 부재**: 헤더가 없으면 리디렉트 없이 ko(bare) 서빙. 의도된 기본값이나, 영어 인덱싱은 sitemap의 `/en` 엔트리·hreflang로 커버됨을 재확인.
4. **쿠키 미기록 상태의 auto-redirect 사용자**: edge redirect는 쿠키를 쓰지 못하므로, 자동으로 `/en`에 안착한 사용자는 이후에도 매번 헤더로 재판정된다(동일 결과라 무해). 쿠키는 수동 전환 시에만 생김 — 의도된 동작.
5. **cookie `has.value` 부분 매칭**: Vercel은 `value`를 정규식으로 취급. `"en"`은 값에 `en` 포함 시 매칭되나 대상 쿠키 값은 `en`/`ko`뿐이라 오탐 없음. 엄밀히 하려면 `"^en$"`로 앵커 가능.
