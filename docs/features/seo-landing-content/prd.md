# Landing Content (연동 노출 · 카피 심화 · 신뢰 신호)

## 배경
SEO 감사 Content 56/100(최저), On-Page 68, SXO 47. 랜딩 콘텐츠 계층에 High 다수:

1. **연동 개수 불일치**: 랜딩 FAQ 답변은 6개(Jira, GitHub, Linear, Notion, GitLab, Asana), docs FAQ는 7개+Slack(ClickUp 추가). 랜딩 hero/feature는 4개만 언급. QRG "한 곳만 갱신" 정확성 플래그이자 실제 차별점 과소판매.
2. **연동 파묻힘**: 트래커 목록이 접힌 FAQ 안에만 존재, 로고/스캔 가능한 섹션 없음 → 개발자 페르소나 50/100(sxo).
3. **랜딩 카피 얇음**(~190 unique words)·타깃 키워드 부재: "visual bug report", "screen recording", "QA browser extension"가 랜딩에 0회(기능은 실재). GEO 인용성도 낮음(자체완결 문단 부재, 페이지가 파편 캡션으로 추출).
4. **가시적 연락처/About 부재**: 푸터가 © · GitHub · Privacy만. `CONTACT_EMAIL`(constants) 존재하나 미노출. 제품이 OAuth 토큰을 요구하는데 "누가 만들었나/어디로 연락" 신호 없음.

## 목표
- 랜딩에 지원 트래커/채널 8종(Jira·GitHub·Linear·Notion·GitLab·Asana·ClickUp·Slack)이 시각적으로 노출되고 docs 연동 가이드로 링크.
- 연동 목록이 **단일 소스**에서 나와 FAQ·로고 스트립이 항상 일치.
- 랜딩 카피에 타깃 키워드가 자연스럽게 포함되고, 자체완결 ~150단어 소개 문단이 있다.
- 가시적 About/연락처(기존 `CONTACT_EMAIL`) 노출.

## 비목표
- 블로그/프라이싱/비교("vs") 페이지 신설(CLAUDE.md 스코프 외 — 랜딩 내 카피로만 보강).
- docs 원본 콘텐츠 수정(→ `seo-docs-content`, bugshot-2).
- 연동을 실제로 추가/변경(제품 기능 아님).
- 후기/평점 UI(→ `seo-review-trust-ui`).

## 사용자 시나리오
1. 개발자가 랜딩에서 "Works with Jira · GitHub · Linear · Notion · GitLab · Asana · ClickUp · Slack" 로고 스트립을 스캔하고 docs 연동 가이드로 이동.
2. 비기술 이해관계자가 hero 인근의 평이한 자체완결 소개 문단으로 "BugShot이 무엇인지" 한 번에 이해.
3. LLM이 랜딩을 읽고 하나의 인용 가능한 요약 문단 + 정확한 연동 목록을 얻는다(FAQ·본문 불일치 없음).
4. 신뢰가 필요한 방문자가 푸터/About에서 제작자·연락처를 확인.

## 성공 기준
- [ ] 랜딩(`/en`·`/ko`) 렌더 HTML에 8개 트래커명이 접힘 없이 존재.
- [ ] FAQ 연동 답변과 로고 스트립이 동일 소스(불일치 0).
- [ ] "visual bug report"·"screen recording"·"QA browser extension"(및 KO 대응어)가 랜딩 본문에 등장.
- [ ] trafilatura 추출 시 자체완결 소개 문단(≈150단어)이 하나의 블록으로 잡힘.
- [ ] 푸터/About에 연락처(`CONTACT_EMAIL`) 노출.
- [ ] FAQ JSON-LD(`stripRichTags`)·i18n en/ko 정합 유지, 빌드 경고 0.
