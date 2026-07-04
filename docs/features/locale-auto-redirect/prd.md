# Locale 자동 리디렉트 (브라우저 언어 기반)

## 배경

`bug-shot.com`의 canonical URL은 이미 `/ko`·`/en` 슬러그다. 하지만 슬러그 없는 bare 경로(`/`, `/privacy`, `/docs/*`)는 `vercel.json` rewrite로 **누구에게나 한국어(ko) 콘텐츠**를 서빙한다. 즉 영어권 방문자가 `bug-shot.com`에 진입해도 한국어 페이지를 보게 된다.

브라우저 언어에 맞는 페이지로 자동 안내해 첫 진입 경험을 개선한다.

> **성격**: 이 기능은 "영어 브라우저 사용자가 첫 진입에서 한국어를 보고 이탈한다"는 **UX 가설에 기반한 개선**이다. 정적 사이트라 진입률·이탈률 등 제품 지표 계측 수단이 없으므로, 완성 판정은 리디렉트 **동작 정확성**(성공 기준)으로 대체한다.

## 목표

- 슬러그 없는 경로 진입 시 **브라우저 언어**를 판정해 적절한 로케일 페이지를 제공한다. (positive 매칭 전략)
  - 브라우저 우선 언어가 **영어(`en*`)** → `/en` 대응 경로로 리디렉트
  - 그 외(한국어 `ko*`·fr/ja/de 등 기타 언어·헤더 부재) → 현행대로 bare 경로에서 ko 서빙 (리디렉트 없음)
- 적용 범위: `/`, `/privacy`, `/docs`, `/docs/*` (bare 경로 전체). 단 **문서 내비게이션 요청만**(이미지·서브리소스 제외).
- 사용자가 `LocaleSwitcher`로 **수동 선택한 언어를 재방문 시 기억**한다(쿠키). 수동 선택은 브라우저 언어 판정보다 우선한다.
- 정적 export 제약(미들웨어 불가) 안에서 구현한다 → Vercel edge(`vercel.json` redirects).
- 기존 clean-URL·SEO 전략 보존: 한국어 사용자는 계속 bare 경로를 유지한다.

## 비목표 (Non-goals)

- **지리/IP 기반(geo) 판정** — 브라우저 언어만 사용. Vercel geo 헤더 미사용.
- **ko 사용자의 리디렉트** — 한국어는 bare 경로 유지(비대칭 전략). `/ko`로 강제 이동시키지 않는다.
- **비-en·비-ko 언어의 자동 영어 안내** — positive 매칭(`^en`)이라 fr/ja/de 등 첫 태그가 en이 아닌 브라우저는 리디렉트되지 않고 ko로 안착한다. (부정 룩어헤드 정규식이 Vercel RE2에서 미지원이라 "ko가 아니면 en" 전략을 포기 — design 위험1.) 이들은 LocaleSwitcher로 EN 전환 가능.
- **다국어 확장** — 로케일은 `ko`/`en` 2개 고정. 새 언어 추가는 스코프 외.
- **canonical·hreflang·sitemap 변경** — 현행 유지. bare 경로는 sitemap에 없고 canonical은 슬러그이므로 SEO 영향 없음.
- **auto-redirect 시 쿠키 자동 기록** — 쿠키는 오직 수동 전환(LocaleSwitcher)에서만 기록. edge redirect는 쿠키를 쓰지 않는다(config redirect 제약).

## 사용자 시나리오

### S1. 영어권 신규 방문자 (쿠키 없음)
1. `bug-shot.com/` 진입. `Accept-Language: en-US,...`
2. edge가 첫 태그가 en임을 판정(문서 내비게이션) → `307` → `/en`
3. 영어 랜딩 표시.

### S2. 한국어 신규 방문자 (쿠키 없음)
1. `bug-shot.com/docs/quick-start` 진입. `Accept-Language: ko-KR,...`
2. 리디렉트 조건 불충족 → rewrite로 bare 경로에 ko 콘텐츠 서빙(현행 그대로). URL은 `/docs/quick-start` 유지.

### S3. 수동 전환 후 재방문 (쿠키 기록됨)
1. 한국어 브라우저 사용자가 `LocaleSwitcher`로 EN 선택 → `NEXT_LOCALE=en` 쿠키 기록 + `/en`으로 이동.
2. 다음날 `bug-shot.com/` 재진입(브라우저는 여전히 ko).
3. edge가 `NEXT_LOCALE=en` 쿠키를 감지 → `307` → `/en`. 수동 선택 존중.
4. 반대로 영어 브라우저 사용자가 KO 선택 시 `NEXT_LOCALE=ko` 기록 → 이후 bare 재진입 시 리디렉트 없이 ko 유지.

### S4. 자동 안착한 en 사용자가 한국어를 원함
1. 영어 브라우저 사용자가 bare `/` 진입 → S1대로 `/en` 자동 안착.
2. 실은 한국어를 원해 `LocaleSwitcher`로 KO 클릭 → `NEXT_LOCALE=ko` 쿠키 기록 + `window.location.replace`로 ko 페이지 이동.
3. 이후 bare 재진입 시 쿠키=ko라 리디렉트 없이 ko 유지. (KO 복귀의 유일 경로는 LocaleSwitcher — 비대칭 전략의 사용자 비용.)

### 엣지 케이스
- **Accept-Language 헤더 없음**(일부 크롤러): 리디렉트 없음 → bare(ko) 서빙. 기본 시장(ko)·`defaultLocale`과 일치. bare canonical은 `/ko`이므로 SEO 정상.
- **비-en·비-ko 언어**(`fr-FR,...`, `ja-JP,...`): 첫 태그가 en이 아님 → 리디렉트 없이 ko 안착. (초기 "ko 아니면 en" 스펙에서 축소 — 비목표 참조.)
- **첫 태그가 en이나 q값은 ko가 높음**(`en;q=0.1,ko;q=0.9`): 정규식은 **문자열 첫 태그**만 검사하므로 `/en`으로 감. q값 재정렬 미지원은 **허용 오차**(대부분의 브라우저는 선호 순 = 문자열 순). 사용자는 LocaleSwitcher로 복구 가능.
- **`Accept-Language: *` / 빈 값**: `*`·빈 문자열은 `^[Ee][Nn]`에 매칭 안 됨 → ko 안착.
- **대소문자 변형**(`EN-us`): `[Ee][Nn]`으로 커버 → `/en`.
- **명시적 슬러그 경로**(`/ko/*`, `/en/*`): redirect source에 미포함 → 영향 없음.
- **정적 에셋**(`/sitemap.xml`, `/og-image.png`, `/_next/*`): redirect source에 미포함 → 영향 없음. **docs 이미지**(`/docs/{locale}/assets/*`)는 `/docs/:path*` source에 걸리나 `sec-fetch-dest: document` 게이팅으로 배제(design 위험6).

## 성공 기준

> 이 기능은 UX 가설이며(배경 참조), 완성 판정은 아래 동작 정확성으로 대체한다.

- 쿠키 없는 `en-US` 요청이 bare 경로 4종(`/`, `/privacy`, `/docs`, `/docs/x/y`)에서 각각 대응 `/en...` 경로로 `307` 리디렉트된다.
- 쿠키 없는 `ko-KR` 요청은 bare 경로에서 리디렉트 없이 ko 콘텐츠를 받는다.
- 쿠키 없는 **비-en·비-ko**(`fr-FR` 등) 요청은 리디렉트 없이 ko를 받는다.
- `NEXT_LOCALE=en` 쿠키가 있으면 브라우저 언어와 무관하게 bare → `/en` 리디렉트된다.
- `NEXT_LOCALE=ko` 쿠키가 있으면 브라우저 언어와 무관하게 bare에서 리디렉트되지 않는다.
- **`/en/docs/...` 페이지의 docs 이미지(`/docs/en/assets/*`)가 EN 헤더에서 200으로 로드된다**(리디렉트로 인한 404 없음).
- `LocaleSwitcher` 전환 시 `NEXT_LOCALE` 쿠키가 1년 만료로 기록되고, **bare 비루트 경로(`/privacy`·`/docs/*`)에서도 올바른 목적지로 이동한다**(404 없음).
- 명시적 `/ko`·`/en` 경로와 정적 에셋은 리디렉트되지 않는다.
- (검증 전제) positive 헤더 정규식 `^[Ee][Nn]`이 Vercel 프리뷰에서 동작함을 확인한다. 미동작 시 design 위험1 폴백(대안 A) 적용 후 동일 기준 재검증.
