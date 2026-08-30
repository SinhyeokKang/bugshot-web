# Docs Content SEO (⚠️ bugshot-2 원본 레포)

> **레포 경계**: docs 가이드 콘텐츠는 bugshot-web이 아니라 **bugshot-2**(`guide/{en,ko}/**`)에 있고, bugshot-web이 빌드타임에 fetch해 내재화한다. 따라서 이 feature의 실제 편집은 **bugshot-2 레포에서** 수행하고, push 시 Vercel Deploy Hook으로 bug-shot.com이 자동 재배포된다. 이 문서는 백로그 추적용으로 bugshot-web에 보관.

## 배경
SEO 감사 SXO/GEO/Content에서 docs 콘텐츠 자체는 "진짜 1차 경험" 신호로 호평받았으나, 키워드 타깃팅·구조에서 개선점이 나옴:

1. **연동 docs 제목이 키워드 미포함 (SXO Critical)**: `/docs/integrations/platforms`는 1,365단어의 강한 절차 문서에 트래커별 연결 표까지 있으나, 제목/H1이 "Connecting Platforms"뿐 — "Jira", "GitHub", "extension", "bug report"가 없어 "jira github bug reporting extension" 쿼리에 안 잡힘. 콘텐츠 타입은 맞는데 타깃팅이 어긋남.
2. **선언형 헤딩(GEO Medium)**: 랜딩·docs 헤딩이 "Live Recording", "Inspect & Style"처럼 선언형 — "How do I record my screen for a bug report?" 같은 자연어 쿼리와 불일치. FAQ 스키마 질문은 좋으나 타깃 쿼리 커버 부족.
3. **thin 페이지 `/docs/element` (GEO Medium)**: 추출 108단어로 citability 타깃(134–167) 미달. 하위 페이지를 티저만 하고 개요가 얇음.

## 목표
- `/docs/integrations/platforms`(및 `/docs/integrations`) 제목/메타/H1에 핵심 키워드("Jira", "GitHub", "extension", "bug report") 포함.
- 주요 docs(특히 `video/record`)에 질문형 H2/H3 변형 추가(기존 UX 카피 해치지 않는 선에서).
- `/docs/element` 개요를 ~150단어로 보강(inspect→style→issue 흐름 요약).

## 비목표
- bugshot-web 코드 수정(제목 파생 로직 `page.tsx`는 H1에서 자동 생성 → 원본 H1만 바꾸면 반영).
- 새 docs 페이지 대량 신설.
- 영상 임베드(→ `seo-ai-discoverability` Task 4).

## 사용자 시나리오
1. "jira github bug reporting extension" 검색자가 연동 docs를 상위에서 발견(제목에 키워드).
2. "how do I record my screen for a bug report" 검색자/AI가 `video/record`의 질문형 헤딩에 매칭.
3. LLM이 `/docs/element`를 얇은 스텁이 아닌 자체완결 개요로 인용.

## 성공 기준
- [ ] `/docs/integrations/platforms` 제목·H1에 타깃 키워드 포함(재fetch 후 렌더 확인).
- [ ] `video/record` 등에 질문형 헤딩 존재.
- [ ] `/docs/element` 추출 단어수가 citability 타깃(≥134) 도달.
- [ ] bugshot-2 push → Deploy Hook 재배포 → bug-shot.com 반영.
- [ ] en/ko 콘텐츠 대칭 유지(`intersectSlugs`가 드롭 안 함).
