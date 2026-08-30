# SEO 개선 백로그

`/seo audit https://bug-shot.com` (claude-seo 2.2.5) 감사 결과를 백로그로 정리. 감사 원본: `bug-shot.com-audit/`(FULL-AUDIT-REPORT.md · ACTION-PLAN.md · findings/ · screenshots/).

**SEO Health Score: 71/100** — 아키텍처는 우수, 콘텐츠 깊이·신뢰 신호·모바일 LCP가 주요 감점.

## Feature 목록

각 디렉터리에 `prd.md` · `design.md` · `tasks.md`.

| Feature | 성격 | 핵심 | 우선도 | 레포 |
|---|---|---|---|---|
| [seo-review-trust-ui](./seo-review-trust-ui/) | Trust/Schema | 집계 평점 UI 노출(Critical) + EN 후기 마스킹 이름 수정 | ★★★ | web |
| [seo-performance-lcp](./seo-performance-lcp/) | Performance | Pretendard async 로드(모바일 LCP) + preconnect + 목업 리사이즈 | ★★★ | web |
| [seo-landing-content](./seo-landing-content/) | Content/On-Page | 연동 로고 스트립 + 단일 소스 + FAQ 동기화 + 카피 심화 + 키워드 + About | ★★★ | web |
| [seo-http-config](./seo-http-config/) | Technical | 보안 헤더 + HSTS + www 영구 + robots Host 제거 + IndexNow | ★★ | web/vercel |
| [seo-metadata-freshness](./seo-metadata-freshness/) | Metadata | dateModified/"Last updated" + sitemap lastmod/x-default + privacy Breadcrumb | ★★ | web |
| [seo-ai-discoverability](./seo-ai-discoverability/) | GEO | llms.txt + 데모 영상 임베드 + VideoObject | ★★ | web |
| [seo-docs-content](./seo-docs-content/) | Content/On-Page | 연동 docs 제목 키워드화 + 질문형 헤딩 + thin `/docs/element` 보강 | ★★ | **bugshot-2** |

권장 착수 순서: `seo-review-trust-ui` → `seo-performance-lcp` → `seo-landing-content` → 나머지.

## 오프사이트 / 비코드 후속 과제

코드로 구현되는 항목이 아니라 feature 문서로 만들지 않음. 별도 트래킹:

- **데모 영상 제작**: 60–90초 캡처→주석→녹화→제출 워크스루 촬영·편집·YouTube 업로드. (`seo-ai-discoverability`의 임베드/스키마 선행 조건이자 AI 인용 최대 상관요인.)
- **Reddit 시딩**: r/QualityAssurance·r/webdev·r/chrome_extensions에서 실제 질문에 진정성 있게 답변(링크 스팸 아님). AI Overview·Perplexity 인용 상관 높음.
- **Chrome Web Store 리뷰 확보**: 16 → 50+. `AggregateRating` 스키마가 이미 연결돼 있어 카운트 증가 시 자동 강화.
- **GitHub/Product Hunt/기타 브랜드 신호** 성장(현재 소규모).
- **Google API 크리덴셜 설정 + `/seo google` 재실행**: `GOOGLE_API_KEY`(PageSpeed/CrUX) + GSC/GA4 OAuth 연결 → 실측 CWV(CrUX)·색인 상태·유입 데이터 확보(현 감사는 lab-only). `~/.config/claude-seo/google-api.json`.
- **(선택) 프리미엄 백링크 API**: Moz/Bing Webmaster 키 → `/seo backlinks` 심화(현 Common Crawl only).

## 참고
- 감사 상세: `bug-shot.com-audit/FULL-AUDIT-REPORT.md`, `bug-shot.com-audit/ACTION-PLAN.md`
- 카테고리별 findings: `bug-shot.com-audit/findings/{technical,content,schema,sitemap,performance,visual,geo,sxo}.md`
