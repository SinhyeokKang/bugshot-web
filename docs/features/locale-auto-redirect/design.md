# Locale 자동 리디렉트 — 기술 설계

## 개요

정적 export(`output: 'export'`)라 미들웨어·서버 로직을 쓸 수 없으므로, 리디렉트는 **Vercel edge의 `vercel.json` `redirects`** 로 처리한다. redirects는 rewrites보다 먼저 평가되므로, 영어 요청은 edge에서 `/en`으로 리디렉트되고, 그 외 요청은 리디렉트를 통과해 기존 rewrite로 bare 경로에 ko 콘텐츠를 서빙한다. 수동 언어 선택은 `LocaleSwitcher`가 기록하는 `NEXT_LOCALE` 쿠키로 기억하며, edge redirect가 이 쿠키를 최우선으로 본다.

**판정은 positive 매칭(`en`이면 리디렉트)이다.** Vercel 프로덕션 라우팅은 RE2 계열 엔진으로 평가되어 부정 룩어헤드(`^(?!ko)`)를 지원하지 않을 가능성이 높으므로(위험1), "ko가 아니면 en"이 아니라 "**en이면 en, 그 외(ko·기타 언어·헤더 없음)는 전부 bare(ko)**"로 설계한다. 결과적으로 fr/ja/de 등 비-en·비-ko 브라우저는 ko로 안착한다(한국 중심 제품의 합리적 기본값).

또한 리디렉트는 **문서 내비게이션 요청에만** 적용한다(`sec-fetch-dest: document`). docs 페이지의 이미지·서브리소스(`/docs/{locale}/assets/...`)가 `/docs/:path*` 규칙에 걸려 리디렉트되면 404가 나므로(위험6), 이미지 요청을 게이팅으로 배제한다.

핵심 판정 로직(bare 경로 요청 1건 기준):

```
if 서브리소스 요청(sec-fetch-dest != document) → 리디렉트 없음 (에셋 보호)
elif 쿠키 NEXT_LOCALE == "en"(앵커 ^en$)        → /en... 리디렉트
elif 쿠키 NEXT_LOCALE 존재(=ko)                 → 리디렉트 없음 (bare=ko)
elif Accept-Language 첫 태그가 en(^[Ee][Nn])    → /en... 리디렉트
else (ko·기타 언어·헤더 없음)                    → 리디렉트 없음 (bare=ko)
```

리디렉트 목적지는 **항상 `/en`뿐**이다(비대칭 전략). ko는 언제나 bare를 유지한다.

## 변경 범위

### `vercel.json` (수정)
- **현재 역할**: bare 경로 4종(`/`, `/privacy`, `/docs`, `/docs/:path*`)을 `/ko...`로 rewrite(ko 서빙).
- **변경 내용**: `rewrites`는 그대로 두고, 상위에 `redirects` 배열을 추가. 각 bare source마다 2개 규칙(둘 다 `sec-fetch-dest: document` AND 조건 포함):
  1. 쿠키 `NEXT_LOCALE=en`(앵커 `^en$`) **AND** 문서 내비게이션 → `/en...` (temporary)
  2. 쿠키 `NEXT_LOCALE` 없음 **AND** `Accept-Language` 첫 태그가 en(`^[Ee][Nn]`) **AND** 문서 내비게이션 → `/en...` (temporary)
- 쿠키가 `ko`이거나(=규칙1·2 모두 불충족), 첫 태그가 en이 아니거나(ko·fr·ja 등), 헤더 부재, 서브리소스 요청이면 어떤 redirect도 매칭되지 않아 기존 rewrite로 fall-through → ko 서빙.

### `src/components/LocaleSwitcher.tsx` (수정)
- **현재 역할**: 클릭 시 `window.location.href = /{next}{stripped}`로 로케일 전환.
- **변경 내용 3가지**:
  1. 이동 직전 `document.cookie`에 `NEXT_LOCALE={next}` 기록(1년, `path=/`, `SameSite=Lax`, `Secure`).
  2. **strip 정규식 버그 수정(필수)**: 현재 `pathname.replace(/^\/[a-z]{2}/, "")`는 로케일 prefix가 항상 있다고 가정하는데, `usePathname`은 `next/navigation`에서 오므로 bare 경로에선 prefix 없는 실제 URL을 반환한다. bare `/privacy`→`ivacy`→`/enivacy`(404), bare `/docs/x`→`/encs/x`(404)로 깨진다. 이 기능의 S3(bare에서 EN 선택)가 이 함수에 의존하므로 실제 로케일 세그먼트만 제거하도록 `/^\/(ko|en)(?=\/|$)/`로 교정.
  3. **뒤로가기 트랩 완화**: `window.location.href`(history push) → `window.location.replace`로 변경. 쿠키=en 기록 후 뒤로가기 시 edge가 다시 `/en`으로 보내 back이 먹통이 되는 문제(위험7)를 history 오염 최소화로 완화.

### 새 파일
- 없음. (문서 외 프로덕션 신규 파일 없음.)

## 데이터 흐름

```
[브라우저]
  bare 경로 요청 (Cookie: NEXT_LOCALE?, Accept-Language)
      │
      ▼
[Vercel edge] redirects 평가 (source 순서대로, 첫 매칭 승; 모든 규칙 sec-fetch-dest=document AND)
  ├─ has cookie NEXT_LOCALE=^en$ & document ──► 307 Location: /en...
  ├─ missing cookie NEXT_LOCALE
  │    & has header accept-language ^[Ee][Nn] & document ► 307 Location: /en...
  └─ (매칭 없음: ko·기타언어·헤더부재·서브리소스) ─► rewrites 평가 ─► /ko... 정적 파일 서빙 (200, URL은 bare 유지)

[LocaleSwitcher] 사용자 클릭
  document.cookie = "NEXT_LOCALE=<next>; ..."  ──► 다음 요청부터 edge가 참조
  window.location.replace("/<next>...")         ──► history 오염 최소화(뒤로가기 트랩 완화)
```

next-intl은 URL 경로에서 로케일을 읽는다(`localePrefix: always`, `request.ts`의 `requestLocale`). `NEXT_LOCALE` 쿠키는 **오직 edge redirect 판정에만** 쓰이고 next-intl 런타임에는 영향을 주지 않는다(정적 export라 서버 런타임 없음).

## 인터페이스 설계

### `vercel.json` redirects (전체)

각 규칙은 `has`에 `sec-fetch-dest: document`를 AND로 포함한다(에셋 보호). 규칙1은 쿠키(앵커 `^en$`), 규칙2는 쿠키 부재 + 헤더 positive 매칭(`^[Ee][Nn]`).

```json
{
  "redirects": [
    { "source": "/",             "has": [{ "type": "cookie", "key": "NEXT_LOCALE", "value": "^en$" }, { "type": "header", "key": "sec-fetch-dest", "value": "document" }], "destination": "/en", "permanent": false },
    { "source": "/",             "missing": [{ "type": "cookie", "key": "NEXT_LOCALE" }], "has": [{ "type": "header", "key": "accept-language", "value": "^[Ee][Nn]" }, { "type": "header", "key": "sec-fetch-dest", "value": "document" }], "destination": "/en", "permanent": false },

    { "source": "/privacy",      "has": [{ "type": "cookie", "key": "NEXT_LOCALE", "value": "^en$" }, { "type": "header", "key": "sec-fetch-dest", "value": "document" }], "destination": "/en/privacy", "permanent": false },
    { "source": "/privacy",      "missing": [{ "type": "cookie", "key": "NEXT_LOCALE" }], "has": [{ "type": "header", "key": "accept-language", "value": "^[Ee][Nn]" }, { "type": "header", "key": "sec-fetch-dest", "value": "document" }], "destination": "/en/privacy", "permanent": false },

    { "source": "/docs",         "has": [{ "type": "cookie", "key": "NEXT_LOCALE", "value": "^en$" }, { "type": "header", "key": "sec-fetch-dest", "value": "document" }], "destination": "/en/docs", "permanent": false },
    { "source": "/docs",         "missing": [{ "type": "cookie", "key": "NEXT_LOCALE" }], "has": [{ "type": "header", "key": "accept-language", "value": "^[Ee][Nn]" }, { "type": "header", "key": "sec-fetch-dest", "value": "document" }], "destination": "/en/docs", "permanent": false },

    { "source": "/docs/:path*",  "has": [{ "type": "cookie", "key": "NEXT_LOCALE", "value": "^en$" }, { "type": "header", "key": "sec-fetch-dest", "value": "document" }], "destination": "/en/docs/:path*", "permanent": false },
    { "source": "/docs/:path*",  "missing": [{ "type": "cookie", "key": "NEXT_LOCALE" }], "has": [{ "type": "header", "key": "accept-language", "value": "^[Ee][Nn]" }, { "type": "header", "key": "sec-fetch-dest", "value": "document" }], "destination": "/en/docs/:path*", "permanent": false }
  ],
  "rewrites": [
    { "source": "/",            "destination": "/ko" },
    { "source": "/privacy",     "destination": "/ko/privacy" },
    { "source": "/docs",        "destination": "/ko/docs" },
    { "source": "/docs/:path*", "destination": "/ko/docs/:path*" }
  ]
}
```

- 헤더 정규식 `^[Ee][Nn]`: 값의 첫 두 글자가 `en`(대소문자 무관)이면 매칭 → 첫 태그(우선 언어)가 영어. `Accept-Language`의 첫 태그가 우선 언어이므로 문자열 시작만 검사. `en-US,...` → 매칭(리디렉트), `ko-KR,...`·`fr-FR,...`·헤더 부재 → 매칭 실패(bare/ko 유지). **positive 매칭이라 RE2에서 안전하다.**
- 쿠키 `value: "^en$"`: 값 전체가 정확히 `en`일 때만 매칭(부분 매칭 방지, 위험5 해소).
- `sec-fetch-dest: document`: 최상위 문서 내비게이션 요청만 매칭. 이미지 요청은 `sec-fetch-dest: image`라 제외되어 `/docs/{locale}/assets/*` 404를 방지(위험6). 이 헤더를 안 보내는 구형 브라우저·일부 크롤러는 리디렉트되지 않고 ko로 서빙(허용 가능한 열화).

### `LocaleSwitcher.switchTo` (수정 후)

```ts
function switchTo(next: Locale) {
  if (next === active) return;
  document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax; secure`;
  // 실제 로케일 세그먼트만 제거 (bare 경로엔 prefix가 없음)
  const stripped = pathname.replace(/^\/(ko|en)(?=\/|$)/, "");
  window.location.replace(`/${next}${stripped || ""}`);
}
```

`(?=\/|$)`는 positive lookahead지만 **브라우저 JS 정규식**에서 실행되므로(RE2 제약은 Vercel edge에만 적용) 안전하다. `/privacy`(bare)는 `ko|en` prefix가 없어 그대로 유지 → `/en/privacy`. `/ko/docs/x`는 `/ko` 제거 → `/en/docs/x`.

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

1. **Vercel `has.value` 부정 룩어헤드 미지원 (positive 매칭으로 회피)**: Vercel 프로덕션 라우팅은 RE2 계열이라 `^(?!ko)` 같은 lookahead를 지원하지 않을 가능성이 높다(`next dev`는 JS 정규식이라 로컬만 보면 통과해 속는다). 이를 near-certain failure로 취급해 **positive 매칭 `^[Ee][Nn]`을 1차 설계로 채택**했다. positive 매칭은 RE2 안전. 그래도 프리뷰 배포에서 실제 동작을 확인한다(로컬 `next dev`는 `vercel.json` 미적용 → 검증은 `vercel dev`/프리뷰에서만). 만약 그래도 미동작하면 폴백: 대안 A(클라이언트 JS 인라인 리디렉트).
2. **캐시로 인한 오배포**: header/cookie 조건부 리디렉트가 중간 캐시에 URL만으로 캐시되면 오배포 가능. `permanent: false`(307)이라 브라우저 영구 캐시는 없으나, 필요 시 `Vary: Accept-Language, Cookie, Sec-Fetch-Dest` 헤더를 `vercel.json` `headers`로 명시 검토. 프리뷰에서 캐시 오염 여부 확인(tasks Task 2).
3. **크롤러 Accept-Language 부재**: 헤더가 없으면 리디렉트 없이 ko(bare) 서빙. 의도된 기본값이나, 영어 인덱싱은 sitemap의 `/en` 엔트리·hreflang로 커버됨을 재확인.
4. **쿠키 미기록 상태의 auto-redirect 사용자**: edge redirect는 쿠키를 쓰지 못하므로, 자동으로 `/en`에 안착한 사용자는 이후에도 매번 헤더로 재판정된다(동일 결과라 무해). 쿠키는 수동 전환 시에만 생김 — 의도된 동작.
5. **cookie `has.value` 부분 매칭 (앵커로 해소)**: Vercel은 `value`를 정규식으로 취급. `"en"`은 값에 `en` 포함 시 오탐 가능하므로 `"^en$"`로 앵커해 정확히 `en`일 때만 매칭.
6. **`/docs/:path*` redirect의 docs 에셋 삼킴 (sec-fetch-dest로 해소)**: docs 이미지는 `src/lib/docs/markdown.ts:38`에서 bare `/docs/{locale}/assets/FILE`로 렌더되고 `public/docs/{ko,en}/assets/*`로 실존한다. EN 사용자가 `/en/docs/...` 페이지의 이미지(`/docs/en/assets/x.jpg`)를 로드하면 `/docs/:path*` 규칙에 걸려 307 → `/en/docs/en/assets/x.jpg`(부재) → 404. **모든 redirect 규칙에 `sec-fetch-dest: document` AND 조건을 걸어** 이미지·서브리소스(`sec-fetch-dest: image` 등)를 배제한다. 프리뷰에서 EN 헤더로 docs 페이지 열어 이미지 200 확인 필수(tasks Task 2).
7. **뒤로가기 트랩 (location.replace로 완화)**: 수동 EN 전환 시 쿠키=en 기록 + `/en`으로 이동. 이후 뒤로가기로 bare `/`에 오면 쿠키=en이라 edge가 다시 307 → `/en`, back이 먹통으로 보인다. `LocaleSwitcher`가 `window.location.replace`를 쓰면 전환 자체가 history에 새 엔트리를 만들지 않아 완화되나, edge 재판정 자체를 없애진 못한다. 사용자의 유일 복구는 KO 재클릭(쿠키=ko 기록)이며 이는 의도된 동작이다.
8. **비-en·비-ko 브라우저는 ko로 안착 (스펙상 수용)**: positive 매칭이라 fr/ja/de 등은 리디렉트되지 않고 bare(ko) 서빙된다. "ko가 아니면 전부 en"이던 초기 스펙에서 축소된 것으로, 한국 중심 제품에선 합리적 기본값. 이들 사용자는 LocaleSwitcher로 EN 전환 가능.
