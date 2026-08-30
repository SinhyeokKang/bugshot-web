# HTTP & Crawler Config — 기술 설계

## 개요
정적 export 제약(미들웨어·API Route 불가) 하에서 `vercel.json` `headers[]` 추가, `robots.ts` 한 줄 제거, `public/` 정적 키 파일 + 배포 후 IndexNow ping(Next 앱 밖 스크립트/훅), 그리고 Vercel 대시보드 수동 설정(www)으로 구성.

## 변경 범위

- `vercel.json` — 현재: `redirects`(ko 게이팅) + `rewrites`(en 기본)만. `headers` 키 없음. 변경: `headers[]` 배열 추가로 전 경로(`/(.*)`)에 보안 헤더 + 강화된 HSTS 적용. (Vercel은 정적 export에서도 edge 레벨 헤더 주입 가능.)
- `src/app/robots.ts` — 현재: `{ rules, sitemap, host: SITE_URL }`. 변경: `host` 필드 제거(Yandex 전용). `rules`/`sitemap` 유지.
- `public/<indexnow-key>.txt` (신규) — IndexNow 키 검증용 정적 파일(키와 동일 내용). 정적 export라 `public/`에 두면 그대로 서빙.
- IndexNow ping (신규, Next 앱 밖) — 배포 후 변경 URL을 `https://api.indexnow.org/indexnow`에 POST. 배치 위치 옵션: (a) GitHub Action(배포 성공 후), (b) 기존 Deploy Hook 트리거와 같은 자동화 단계의 curl/Node 스크립트, (c) `scripts/`에 스크립트만 두고 CI에서 호출. 정적 export의 "API Route 금지" 제약을 위반하지 않도록 **런타임 서버 코드로 만들지 않는다**.
- **Vercel 대시보드(코드 아님)**: 도메인 설정에서 www → primary domain 영구 리디렉트 옵션 활성화. HSTS preload는 `includeSubDomains` 안전 확인 후 hstspreload.org 제출.

## 데이터 흐름
- 헤더: Vercel edge가 모든 응답에 정적으로 주입(런타임 로직 없음).
- IndexNow: 배포 파이프라인 → 변경/전체 URL 목록 → POST(host, key, keyLocation, urlList) → IndexNow. sitemap.xml 또는 라우트 맵에서 URL 목록 생성 가능.

## 인터페이스 설계
`vercel.json` `headers[]` 예시(초안):
```jsonc
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
      { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
    ]
  }
]
```
IndexNow 페이로드:
```json
{ "host": "bug-shot.com", "key": "<key>", "keyLocation": "https://bug-shot.com/<key>.txt", "urlList": ["https://bug-shot.com/en", "..."] }
```

## 기존 패턴 준수
- CLAUDE.md: 정적 export 제약 — API Route·미들웨어·서버 동적 기능 금지. 헤더/리디렉트는 `vercel.json`, IndexNow는 앱 밖 스크립트.
- `vercel.json`은 이미 redirects/rewrites 보유 — headers만 추가(기존 키 보존). ⚠️ `has.value` 전체매칭 규칙은 redirects에만 해당(headers엔 무관).
- 배포 자동화(Deploy Hook)와의 결합점: 콘텐츠 push → 재배포 → post-deploy ping.

## 대안 검토
- **보안 헤더를 next.config `headers()`로**: 정적 export(`output: 'export'`)에서는 `headers()`가 적용되지 않음(빌드 산출물이 정적 파일). → `vercel.json`가 유일한 정공법.
- **IndexNow를 빌드 스크립트 체인에 포함**: 빌드는 배포 성공 전이라 아직 라이브가 아님 → 부정확. → 반드시 **배포 후** 훅/액션에서 실행.
- **CSP 즉시 도입**: jsDelivr(Pretendard)·Vercel analytics/speed-insights·`_next` 인라인 등 소스 화이트리스트 필요 → 잘못하면 폰트/스크립트 깨짐. 이번 스코프는 4종 헤더 + HSTS만, CSP는 소스 감사 후 후속.

## 위험 요소
- `X-Frame-Options: SAMEORIGIN` / `Permissions-Policy`가 임베드·서드파티 위젯을 막을 수 있음 — 현재 사이트는 iframe 임베드(docs EmbedCard는 링크 카드라 iframe 아님) 없어 안전하나 향후 영상 임베드(seo-ai-discoverability) 도입 시 `frame-src`/CSP 재검토 필요.
- IndexNow 키 노출은 정상(공개 파일). 단, 잘못된 host/key 조합은 무시됨 — keyLocation 정확히.
- www 영구 리디렉트는 Vercel 플랫폼 설정 의존 — 옵션 부재 시 support 문의 필요(실사용 영향은 낮음, www 비노출).
- HSTS `preload` 제출은 되돌리기 어려움(브라우저 목록 등재) — 모든 서브도메인 HTTPS 보장 확인 후 제출.
