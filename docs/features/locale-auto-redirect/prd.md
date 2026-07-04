# Locale 자동 리디렉트 (브라우저 언어 기반)

## 배경

`bug-shot.com`의 canonical URL은 이미 `/ko`·`/en` 슬러그다. 하지만 슬러그 없는 bare 경로(`/`, `/privacy`, `/docs/*`)는 `vercel.json` rewrite로 **누구에게나 한국어(ko) 콘텐츠**를 서빙한다. 즉 영어권 방문자가 `bug-shot.com`에 진입해도 한국어 페이지를 보게 된다.

브라우저 언어에 맞는 페이지로 자동 안내해 첫 진입 경험을 개선한다.

## 목표

- 슬러그 없는 경로 진입 시 **브라우저 언어**를 판정해 적절한 로케일 페이지를 제공한다.
  - 브라우저 우선 언어가 한국어(`ko*`) → 현행대로 bare 경로에서 ko 서빙 (리디렉트 없음)
  - 그 외 → `/en` 대응 경로로 리디렉트
- 적용 범위: `/`, `/privacy`, `/docs`, `/docs/*` (bare 경로 전체)
- 사용자가 `LocaleSwitcher`로 **수동 선택한 언어를 재방문 시 기억**한다(쿠키). 수동 선택은 브라우저 언어 판정보다 우선한다.
- 정적 export 제약(미들웨어 불가) 안에서 구현한다 → Vercel edge(`vercel.json` redirects).
- 기존 clean-URL·SEO 전략 보존: 한국어 사용자는 계속 bare 경로를 유지한다.

## 비목표 (Non-goals)

- **지리/IP 기반(geo) 판정** — 브라우저 언어만 사용. Vercel geo 헤더 미사용.
- **ko 사용자의 리디렉트** — 한국어는 bare 경로 유지(비대칭 전략). `/ko`로 강제 이동시키지 않는다.
- **다국어 확장** — 로케일은 `ko`/`en` 2개 고정. 새 언어 추가는 스코프 외.
- **canonical·hreflang·sitemap 변경** — 현행 유지. bare 경로는 sitemap에 없고 canonical은 슬러그이므로 SEO 영향 없음.
- **auto-redirect 시 쿠키 자동 기록** — 쿠키는 오직 수동 전환(LocaleSwitcher)에서만 기록. edge redirect는 쿠키를 쓰지 않는다(config redirect 제약).

## 사용자 시나리오

### S1. 영어권 신규 방문자 (쿠키 없음)
1. `bug-shot.com/` 진입. `Accept-Language: en-US,...`
2. edge가 우선 언어가 ko가 아님을 판정 → `307` → `/en`
3. 영어 랜딩 표시.

### S2. 한국어 신규 방문자 (쿠키 없음)
1. `bug-shot.com/docs/quick-start` 진입. `Accept-Language: ko-KR,...`
2. 리디렉트 조건 불충족 → rewrite로 bare 경로에 ko 콘텐츠 서빙(현행 그대로). URL은 `/docs/quick-start` 유지.

### S3. 수동 전환 후 재방문 (쿠키 기록됨)
1. 한국어 브라우저 사용자가 `LocaleSwitcher`로 EN 선택 → `NEXT_LOCALE=en` 쿠키 기록 + `/en`으로 이동.
2. 다음날 `bug-shot.com/` 재진입(브라우저는 여전히 ko).
3. edge가 `NEXT_LOCALE=en` 쿠키를 감지 → `307` → `/en`. 수동 선택 존중.
4. 반대로 영어 브라우저 사용자가 KO 선택 시 `NEXT_LOCALE=ko` 기록 → 이후 bare 재진입 시 리디렉트 없이 ko 유지.

### 엣지 케이스
- **Accept-Language 헤더 없음**(일부 크롤러): 리디렉트 없음 → bare(ko) 서빙. 기본 시장(ko)·`defaultLocale`과 일치. bare canonical은 `/ko`이므로 SEO 정상.
- **ko가 2순위 이하**(`en-US,en;q=0.9,ko;q=0.5`): 우선 언어가 en → `/en`. 의도대로.
- **명시적 슬러그 경로**(`/ko/*`, `/en/*`): redirect source에 미포함 → 영향 없음.
- **정적 에셋**(`/sitemap.xml`, `/og-image.png` 등): redirect source에 미포함 → 영향 없음.

## 성공 기준

- 쿠키 없는 `en-US` 요청이 bare 경로 4종(`/`, `/privacy`, `/docs`, `/docs/x/y`)에서 각각 대응 `/en...` 경로로 `307` 리디렉트된다.
- 쿠키 없는 `ko-KR` 요청은 bare 경로에서 리디렉트 없이 ko 콘텐츠를 받는다.
- `NEXT_LOCALE=en` 쿠키가 있으면 브라우저 언어와 무관하게 bare → `/en` 리디렉트된다.
- `NEXT_LOCALE=ko` 쿠키가 있으면 브라우저 언어와 무관하게 bare에서 리디렉트되지 않는다.
- `LocaleSwitcher` 전환 시 `NEXT_LOCALE` 쿠키가 1년 만료로 기록된다.
- 명시적 `/ko`·`/en` 경로와 정적 에셋은 리디렉트되지 않는다.
