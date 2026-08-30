# AI Discoverability (llms.txt · 데모 영상 임베드 · VideoObject)

## 배경
SEO 감사 GEO 63/100. 기술적 접근성(정적 export)은 90으로 최상이나, 멀티모달·발견성에서 감점:

1. **llms.txt 부재**: `/llms.txt`·`/.well-known/llms.txt` 모두 404. Google Search는 무시하나 ChatGPT/Perplexity/Claude 브라우징이 큐레이션 진입점으로 점점 참조. 24페이지 docs 사이트에 저비용 개선.
2. **데모 영상 0 (화면녹화 툴인데)**: 랜딩·docs에 `<video>`/YouTube 임베드 없음. YouTube 존재는 AI 인용 최대 상관요인(~0.737)이자 "screen recording bug report" SERP가 영상 보상. 제품 자체가 녹화 도구라 가장 자연스러운 포맷인데 정적 `.webp` 목업만 존재. `VideoObject` 스키마도 없음.

## 목표
- `public/llms.txt`가 서빙되고, 고가치 docs 페이지 + 제품 설명을 담는다.
- 랜딩(및 docs quick-start)에 제품 데모 영상이 임베드된다.
- 랜딩에 `VideoObject` JSON-LD가 추가된다.

## 비목표
- **영상 제작 자체**(60–90초 워크스루 촬영·편집·YouTube 업로드)는 오프사이트 마케팅 작업(README 후속 과제). 이 feature는 영상이 준비됐을 때의 **임베드 + 스키마 구현**만 다룬다.
- Reddit/CWS 리뷰 등 오프사이트 신호(README).
- llms.txt 자동 생성 파이프라인(초기엔 정적 파일; 빌드 스크립트화는 옵션).

## 사용자 시나리오
1. ChatGPT/Perplexity/Claude 브라우징이 `/llms.txt`를 읽고 quick-start·faq·video/record·integrations로 진입.
2. 방문자가 랜딩에서 60–90초 데모 영상으로 캡처→주석→녹화→제출 흐름을 본다.
3. 크롤러가 랜딩 `VideoObject` JSON-LD로 영상 존재/설명을 인식.

## 성공 기준
- [ ] `GET /llms.txt` 200 + 제품 설명 + 핵심 docs 링크.
- [ ] 랜딩(및 quick-start)에 데모 영상 임베드 렌더(영상 준비 후).
- [ ] 랜딩 렌더 HTML에 `VideoObject` JSON-LD 존재(유효).
- [ ] 영상 임베드가 LCP/CLS를 악화시키지 않는다(지연 로드/썸네일).
- [ ] CSP/frame 정책(seo-http-config)과 충돌 없음.

## 의존성
- **데모 영상 준비**(YouTube URL)가 임베드/스키마의 선행 조건 — 없으면 llms.txt만 먼저 진행.
- `seo-http-config`의 CSP/`X-Frame-Options` 도입 시 영상 iframe 허용(frame-src) 조율 필요.
