# Locale 자동 리디렉트 — 구현 태스크

## 선행 조건

- 검증은 **Vercel 프리뷰 배포** 또는 `vercel dev`에서만 가능(`vercel.json` redirects는 `next dev`에 적용 안 됨). Vercel CLI 링크 상태 확인.
- 프리뷰 URL 취득: `vercel` (또는 `vercel --prebuilt`) 실행 후 출력되는 Preview URL, 또는 대시보드의 배포 URL. 이하 `curl` 예시의 `$P`를 이 URL로 치환. 예: `P=https://bugshot-web-xxx.vercel.app`.
- `curl`은 리디렉트를 따라가지 않도록 `-sI`(헤더만)로 확인하고 `sec-fetch-dest: document`를 명시해야 실제 문서 내비게이션을 재현한다. 예: `curl -sI -H "Sec-Fetch-Dest: document" -H "Accept-Language: en-US,en;q=0.9" "$P/"`.
- 신규 의존성·env·권한 없음.

## 태스크

### Task 1: `vercel.json`에 edge redirects 추가
- **변경 대상**: `vercel.json`
- **작업 내용**: 기존 `rewrites`는 유지하고, 상위에 `redirects` 배열 추가. bare source 4종(`/`, `/privacy`, `/docs`, `/docs/:path*`) 각각에 2규칙(쿠키 `^en$` / 쿠키부재+헤더 `^([^kK]|[kK][^oO])`), 두 규칙 모두 `sec-fetch-dest: document` AND 조건, 목적지 `/en...`, `permanent: false`. **헤더 정규식 `^([^kK]|[kK][^oO])`("ko 아님", negated char class라 엔진 무관 안전)·cookie 앵커 `^en$`.** (전체 JSON은 design.md "인터페이스 설계" 참조.)
- **검증**: (프리뷰 배포 후 `curl -sI`, 모든 요청에 `-H "Sec-Fetch-Dest: document"`)
  - [ ] `-H "Accept-Language: en-US,en;q=0.9"` `/` → `307`, `Location: /en`
  - [ ] `-H "Accept-Language: ko-KR,ko;q=0.9"` `/` → 리디렉트 없음(200, ko 콘텐츠)
  - [ ] `-H "Accept-Language: fr-FR,fr;q=0.9"` `/` → `307` `/en` — 비-ko는 en(대전제)
  - [ ] `-H "Accept-Language: ja-JP"` `/` → `307` `/en`
  - [ ] `-H "Accept-Language: *"` `/` → `307` `/en`(any→en). 빈 헤더 / 헤더 없이 `/` → 리디렉트 없음(200, ko)
  - [ ] `-H "Accept-Language: Ko-kr"`(대문자) `/` → 리디렉트 없음 — `[kK][oO]` ko 커버 확인
  - [ ] `/privacy`, `/docs`, `/docs/a/b`도 en 헤더에서 각각 `/en/privacy`, `/en/docs`, `/en/docs/a/b`로 `307`
  - [ ] `/ko`, `/en`, `/sitemap.xml` → 리디렉트 없음

### Task 2: 쿠키·에셋·캐시 검증 (Task 1과 동일 배포에서)
- **변경 대상**: 없음(설정 검증 태스크)
- **작업 내용**: 쿠키 오버라이드, **"ko 아님" 정규식 실동작, docs 에셋 404 방어, 캐시 오염**을 확인.
- **검증**:
  - [ ] `-H "Accept-Language: ko-KR" --cookie "NEXT_LOCALE=en"` `-H "Sec-Fetch-Dest: document"` `/` → `307` `/en`
  - [ ] `-H "Accept-Language: en-US" --cookie "NEXT_LOCALE=ko"` `-H "Sec-Fetch-Dest: document"` `/` → 리디렉트 없음(ko)
  - [ ] **정규식 `^([^kK]|[kK][^oO])`이 실제로 동작함을 위 결과로 확정**(negated char class 지원 확인; 미동작 시 design.md 위험1 폴백 → Task 1b)
  - [ ] **docs 에셋 방어**: `-H "Accept-Language: en-US" -H "Sec-Fetch-Dest: image"` `/docs/en/assets/dummy.jpg` → 리디렉트 없음(200). 실제 EN 브라우저로 `/en/docs/quick-start` 열어 이미지 정상 표시 확인(DevTools Network에 404 없음)
  - [ ] **캐시 오염**: ko 요청으로 bare `/` 200 받은 뒤 en 헤더로 재요청 시 캐시된 ko가 재사용되지 않고 `/en` 리디렉트되는지 확인. 오염 시 design 위험2의 `Vary` 헤더 적용

### Task 1b: (조건부) 정규식 폴백 — Task 2에서 `^([^kK]|[kK][^oO])` 미동작 시에만
- **변경 대상**: `src/app/layout.tsx`(또는 `[locale]/layout.tsx`) `<head>` 인라인 스크립트, `vercel.json`(헤더 redirect 규칙 제거)
- **작업 내용**: design.md 대안 A(클라이언트 JS 인라인 리디렉트)로 전환. bare 경로에서 `navigator.languages[0]`가 en이면 `/en`으로 `location.replace`. 쿠키 규칙(Task 1의 규칙1)은 edge에 유지 가능(룩어헤드 없음). **주의**: 클라이언트 리디렉트는 ko 페이지 플래시 가능 → `<head>` 최상단 동기 스크립트로 최소화. Task 3의 쿠키 read 측(edge 쿠키 규칙)이 유지되는지 재확인.
- **검증**: Task 1·2 체크리스트를 폴백 구현 기준으로 재수행.

### Task 3: `LocaleSwitcher` 쿠키 기록 + strip 버그 수정 + replace 전환
- **변경 대상**: `src/components/LocaleSwitcher.tsx`
- **작업 내용** (3가지):
  1. `switchTo`에서 이동 직전 `document.cookie = "NEXT_LOCALE=<next>; path=/; max-age=31536000; samesite=lax; secure"` 기록.
  2. **strip 정규식 버그 수정(필수)**: `pathname.replace(/^\/[a-z]{2}/, "")` → `pathname.replace(/^\/(ko|en)(?=\/|$)/, "")`. 현재는 bare `/privacy`→`ivacy`→`/enivacy`(404), bare `/docs/x`→`/encs/x`(404)로 깨진다. S3가 이 함수에 의존.
  3. **뒤로가기 트랩 완화**: `window.location.href` → `window.location.replace`.
- **검증**:
  - [ ] `npx tsc --noEmit`·`pnpm lint` 통과
  - [ ] 프리뷰에서 EN 클릭 후 DevTools Application → Cookies에 `NEXT_LOCALE=en`(만료 ~1년) 존재 (⚠️ 로컬 `next dev`는 http라 `secure` 쿠키 미기록 → 프리뷰 https에서만 검증)
  - [ ] **bare 경로 전환 회귀**: bare `/`·`/privacy`·`/docs/quick-start`에서 EN 클릭 → 각각 `/en`·`/en/privacy`·`/en/docs/quick-start`로 정확히 이동(404 없음). KO 클릭(영어 브라우저) → ko 복귀 정확
  - [ ] **기존 슬러그 경로 회귀**: `/ko/docs/x`에서 EN 클릭 → `/en/docs/x` (기존 동작 유지)
  - [ ] 쿠키 기록 후 bare `/` 재방문 시 Task 2 동작대로 리디렉트
  - [ ] 뒤로가기: EN 전환 후 back 눌러도 `replace`로 history 오염 최소화됨 확인

### Task 4: E2E 시나리오 확인 (프리뷰)
- **변경 대상**: 없음
- **작업 내용**: PRD S1~S4 수동 재현.
- **검증**:
  - [ ] 영어 브라우저로 `bug-shot.com/` → `/en` 자동 이동(플래시 없음)
  - [ ] 한국어 브라우저로 bare 경로 → ko 유지, URL 슬러그 없음
  - [ ] 프랑스어·일본어 등 비-ko 브라우저 → `/en` 자동 이동(대전제)
  - [ ] EN 수동 선택 → 쿠키 기록 → 브라우저 언어와 무관하게 bare 재방문 시 `/en` 유지
  - [ ] KO 수동 선택(영어 브라우저, S4) → 재방문 시 ko 유지
  - [ ] `/en/docs` 페이지의 이미지 정상 로드(에셋 404 없음)
  - [ ] (회귀) sitemap·canonical·hreflang 무변경, `/ko`·`/en` 직접 접근 정상

## 테스트 계획

- **단위 테스트**: 순수 함수 신규 없음(설정·1-liner 쿠키). 별도 유닛 테스트 없음.
- **수동/통합 테스트**: 위 Task 1~4의 `curl` + 브라우저 체크리스트가 사실상의 통합 테스트. 로컬 불가 → 프리뷰 배포 필수.

## 구현 순서 권장

1. **Task 1 → Task 2**: `vercel.json` 작성 후 같은 프리뷰에서 헤더·쿠키·에셋·캐시 검증. **위험1(negated char class 정규식 실동작)·위험6(에셋 404)을 여기서 조기 확정** — 정규식 미동작 시 Task 1b(폴백) 진행.
2. **Task 3**: 정규식 검증 통과 후 LocaleSwitcher 수정(쿠키 write + strip 버그 수정 + replace). strip 버그는 이 기능의 S3/S4 전제이므로 필수.
3. **Task 4**: 통합 확인.

Task 1·3은 파일이 달라 병렬 편집 가능하나, **검증 순서상 Task 1의 정규식 확정이 먼저**다(폴백 시 edge 쿠키 규칙 유지 여부가 Task 3에 영향).
