# Locale 자동 리디렉트 — 구현 태스크

## 선행 조건

- 검증은 **Vercel 프리뷰 배포** 또는 `vercel dev`에서만 가능(`vercel.json` redirects는 `next dev`에 적용 안 됨). Vercel CLI 링크 상태 확인.
- 신규 의존성·env·권한 없음.

## 태스크

### Task 1: `vercel.json`에 edge redirects 추가
- **변경 대상**: `vercel.json`
- **작업 내용**: 기존 `rewrites`는 유지하고, 상위에 `redirects` 배열 추가. bare source 4종(`/`, `/privacy`, `/docs`, `/docs/:path*`) 각각에 2규칙(쿠키 en / 쿠키부재+헤더 non-ko), 목적지 `/en...`, `permanent: false`. 헤더 정규식 `^(?![Kk][Oo]).+`. (전체 JSON은 design.md "인터페이스 설계" 참조.)
- **검증**: (프리뷰 배포 후 `curl -sI`)
  - [ ] `-H "Accept-Language: en-US,en;q=0.9"` `/` → `307`, `Location: /en`
  - [ ] `-H "Accept-Language: ko-KR,ko;q=0.9"` `/` → 리디렉트 없음(200, ko 콘텐츠)
  - [ ] Accept-Language 헤더 없이 `/` → 리디렉트 없음(200, ko)
  - [ ] `/privacy`, `/docs`, `/docs/a/b`도 en 헤더에서 각각 `/en/privacy`, `/en/docs`, `/en/docs/a/b`로 `307`
  - [ ] `/ko`, `/en`, `/sitemap.xml` → 리디렉트 없음

### Task 2: 쿠키 조건 검증 (Task 1과 동일 배포에서)
- **변경 대상**: 없음(설정 검증 태스크)
- **작업 내용**: 쿠키가 헤더 판정을 오버라이드하는지 확인.
- **검증**:
  - [ ] `-H "Accept-Language: ko-KR" --cookie "NEXT_LOCALE=en"` `/` → `307` `/en`
  - [ ] `-H "Accept-Language: en-US" --cookie "NEXT_LOCALE=ko"` `/` → 리디렉트 없음(ko)
  - [ ] 부정 룩어헤드 정규식이 실제로 동작함을 위 결과로 확정(미동작 시 design.md 위험1 폴백 적용)

### Task 3: `LocaleSwitcher`에 쿠키 기록 추가
- **변경 대상**: `src/components/LocaleSwitcher.tsx`
- **작업 내용**: `switchTo`에서 `window.location.href` 이전에 `document.cookie = "NEXT_LOCALE=<next>; path=/; max-age=31536000; samesite=lax; secure"` 기록.
- **검증**:
  - [ ] `npx tsc --noEmit` 통과
  - [ ] 프리뷰에서 EN 클릭 후 DevTools Application → Cookies에 `NEXT_LOCALE=en`(만료 ~1년) 존재
  - [ ] 쿠키 기록 후 bare `/` 재방문 시 Task 2 동작대로 리디렉트

### Task 4: E2E 시나리오 확인 (프리뷰)
- **변경 대상**: 없음
- **작업 내용**: PRD S1~S3 수동 재현.
- **검증**:
  - [ ] 영어 브라우저로 `bug-shot.com/` → `/en` 자동 이동(플래시 없음)
  - [ ] 한국어 브라우저로 bare 경로 → ko 유지, URL 슬러그 없음
  - [ ] EN 수동 선택 → 쿠키 기록 → 브라우저 언어와 무관하게 bare 재방문 시 `/en` 유지
  - [ ] KO 수동 선택(영어 브라우저) → 재방문 시 ko 유지

## 테스트 계획

- **단위 테스트**: 순수 함수 신규 없음(설정·1-liner 쿠키). 별도 유닛 테스트 없음.
- **수동/통합 테스트**: 위 Task 1~4의 `curl` + 브라우저 체크리스트가 사실상의 통합 테스트. 로컬 불가 → 프리뷰 배포 필수.

## 구현 순서 권장

1. **Task 1 → Task 2**: `vercel.json` 작성 후 같은 프리뷰에서 헤더·쿠키 검증. **위험1(정규식 지원)을 여기서 조기 확정** — 실패 시 폴백 결정 후 재설계.
2. **Task 3**: 정규식 검증 통과 후 쿠키 write 추가(쿠키 read 측이 동작함을 먼저 보장).
3. **Task 4**: 통합 확인.

Task 1·3은 파일이 달라 병렬 편집 가능하나, **검증 순서상 Task 1의 정규식 확정이 먼저**다(폴백 시 Task 3 형태가 바뀔 수 있음).
