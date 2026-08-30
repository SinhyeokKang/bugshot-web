# HTTP & Crawler Config (보안 헤더 · 리디렉트 · IndexNow)

## 배경
SEO 감사 Technical(84/100)의 Medium/Low 이슈 다수가 HTTP 응답·크롤러 설정 계층에 몰려 있다. 정적 export라 미들웨어/API Route가 없으므로 전부 `vercel.json`·정적 파일·Vercel 대시보드·빌드 외 스크립트로 처리해야 한다.

1. **보안 헤더 부재**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy` 없음(전 페이지). 랭킹 직접 요인은 아니나 Lighthouse Best Practices·기본 하드닝.
2. **HSTS 약함**: `strict-transport-security: max-age=63072000`만 있고 `includeSubDomains; preload` 없음.
3. **www → apex가 307(임시)**: 영구(308/301)여야 신호 통합. Vercel 도메인 별칭 기본값이라 대시보드 설정 사안.
4. **robots.txt `Host:` 지시문**: `src/app/robots.ts`의 `host` 필드 → Yandex 전용 레거시, Google/Bing 무시. dead weight.
5. **IndexNow 미구현**: Naver 인증 태그가 있어 KR 검색 의도가 명확하고, Naver/Bing이 IndexNow 지원. 배포 자동화(Deploy Hook)가 이미 있어 저비용.

## 목표
- 응답에 표준 보안 헤더가 실린다(`curl -I`로 확인).
- HSTS에 `includeSubDomains; preload` 포함.
- www → apex가 영구 리디렉트.
- robots.txt에서 무의미한 `Host:` 제거.
- 콘텐츠 배포 시 변경 URL이 IndexNow로 통지된다.

## 비목표
- 완전한 CSP 정책 튜닝(jsDelivr·`_next` 소스 감사 후 별도 반영 — 초안만 옵션).
- CDN/호스팅 이전.
- Naver Search Advisor 수동 제출 자동화(IndexNow로 갈음).

## 사용자 시나리오
1. 브라우저/스캐너가 어떤 페이지를 받아도 보안 헤더가 실려 있다.
2. www 주소로 접속하면 영구 리디렉트로 apex에 안착한다.
3. bugshot-2 콘텐츠 push → 재배포 → 변경 URL이 IndexNow 엔드포인트로 자동 전송된다.

## 성공 기준
- [ ] `curl -sI https://bug-shot.com/`에 4종 보안 헤더 존재.
- [ ] HSTS에 `includeSubDomains; preload` 포함.
- [ ] `curl -sI https://www.bug-shot.com/`이 308/301.
- [ ] robots.txt에 `Host:` 없음.
- [ ] IndexNow 키 파일이 `public/`에 서빙되고, 배포 후 ping이 200/202 반환.
- [ ] securityheaders.com 등급 상승, 기존 기능(폰트 CDN·analytics) 정상.
