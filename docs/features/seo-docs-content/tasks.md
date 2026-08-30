# Docs Content SEO — 구현 태스크 (⚠️ bugshot-2 레포에서 수행)

## 선행 조건
- bugshot-2(`~/code/bugshot-2/`) 레포 접근. 편집·push는 bugshot-2에서.
- en/ko 대칭 유지 원칙 인지(양 로케일 동시 편집).
- 검증은 bugshot-web 재빌드(또는 dev)로 확인(콘텐츠 fetch 후).

## 태스크

### Task 1: 연동 docs 키워드 타깃팅
- **변경 대상**: bugshot-2 `guide/{en,ko}/integrations/platforms.md`, `guide/{en,ko}/integrations/README.md`, `guide/{en,ko}/SUMMARY.md`
- **작업 내용**: H1을 "Jira/GitHub/extension/bug report" 포함형으로, 첫 문단에 키워드 자연 삽입, SUMMARY nav title 반영.
- **검증**:
  - [ ] bugshot-web 재fetch/빌드 후 `/en/docs/integrations/platforms` `<title>`·H1에 키워드
  - [ ] meta description에 키워드 포함(첫 문단 반영)
  - [ ] en/ko 대칭(slug 드롭 없음, `[sitemap] dropped` 경고 없음)

### Task 2: 질문형 헤딩 추가
- **변경 대상**: bugshot-2 `guide/{en,ko}/video/record.md`(및 필요 시 video/README, quick-start)
- **작업 내용**: 기존 헤딩 앞/사이에 질문형 H2/H3("How do I record my screen for a bug report?" 등) 보완.
- **검증**:
  - [ ] 재빌드 후 해당 docs에 질문형 헤딩 렌더
  - [ ] 우측 TOC·앵커 정상, 기존 내부 링크 깨짐 없음

### Task 3: thin /docs/element 보강
- **변경 대상**: bugshot-2 `guide/{en,ko}/element/README.md`
- **작업 내용**: 개요를 inspect→style→issue 흐름 요약 ~150단어로 확장.
- **검증**:
  - [ ] 재빌드 후 `/docs/element` 추출 단어수 ≥134
  - [ ] 하위 페이지 링크 유지

## 테스트 계획
- 단위 테스트: 없음(콘텐츠).
- 수동 테스트:
  - [ ] bugshot-2 push → Deploy Hook 재배포 → bug-shot.com 반영 확인
  - [ ] `pnpm build`(bugshot-web) 시 `[sitemap] dropped` 경고 0(en/ko 대칭)
  - [ ] 변경 페이지 render_page/Rich Results로 제목·description 확인

## 구현 순서 권장
Task 1(SXO Critical) 우선. Task 2·3은 독립 — 병렬 가능. 세 태스크 모두 bugshot-2에서 en/ko 동시.
