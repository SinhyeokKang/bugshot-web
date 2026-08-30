# HTTP & Crawler Config — 구현 태스크

## 선행 조건
- Vercel 대시보드 접근 권한(www 리디렉트, 도메인 설정).
- IndexNow 키 생성(32+ hex 권장). 배포 파이프라인(GitHub Action or Deploy Hook 연계) 접근.
- CSP는 이번 스코프 제외(후속) — 4종 헤더 + HSTS만.

## 태스크

### Task 1: vercel.json 보안 헤더 + HSTS 추가
- **변경 대상**: `vercel.json`
- **작업 내용**: `headers[]` 배열 신규 추가(design.md 초안). 기존 `redirects`/`rewrites` 보존.
- **검증**:
  - [ ] 배포 후 `curl -sI https://bug-shot.com/`에 X-Content-Type-Options·X-Frame-Options·Referrer-Policy·Permissions-Policy 존재
  - [ ] HSTS에 `includeSubDomains; preload` 포함
  - [ ] 폰트 CDN·analytics·페이지 렌더 정상(회귀 없음)

### Task 2: robots.txt Host 지시문 제거
- **변경 대상**: `src/app/robots.ts`
- **작업 내용**: 반환 객체에서 `host` 필드 제거.
- **검증**:
  - [ ] `/robots.txt`에 `Host:` 라인 없음
  - [ ] `Sitemap:` 지시문·`Allow: /` 유지

### Task 3: IndexNow 키 파일 + 배포 후 ping
- **변경 대상**: `public/<key>.txt`(신규), 배포 파이프라인(GitHub Action/스크립트 — Next 앱 밖)
- **작업 내용**: 키 파일을 `public/`에 추가(내용 = 키). 배포 성공 후 변경(또는 전체) URL을 IndexNow에 POST하는 스텝 추가. URL 목록은 sitemap 또는 라우트 맵에서 생성.
- **검증**:
  - [ ] `https://bug-shot.com/<key>.txt`가 키 반환(200)
  - [ ] ping 응답 200/202
  - [ ] 서버 런타임 코드(API Route) 미도입(정적 export 제약 준수)

### Task 4: (대시보드) www 영구 리디렉트 + HSTS preload 제출
- **변경 대상**: Vercel 대시보드(코드 아님)
- **작업 내용**: 도메인 설정에서 www → apex 영구 리디렉트. 서브도메인 HTTPS 확인 후 hstspreload.org 제출.
- **검증**:
  - [ ] `curl -sI https://www.bug-shot.com/` → 308/301
  - [ ] (선택) hstspreload.org 상태 pending/submitted

## 테스트 계획
- 단위 테스트: 없음(설정).
- 수동 테스트:
  - [ ] 배포 후 헤더/리디렉트 curl 검증
  - [ ] securityheaders.com 등급 확인
  - [ ] IndexNow ping 로그 확인

## 구현 순서 권장
Task 1·2는 즉시(코드). Task 3은 파이프라인 작업(중간). Task 4는 대시보드(독립, 병렬). 상호 의존 없음.
