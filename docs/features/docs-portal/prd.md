# Docs Portal — bug-shot.com/docs 가이드 내재화

> **스코프 가정** (질문 라운드 결과):
> - 콘텐츠는 빌드타임 fetch(레포 미커밋, gitignore).
> - v1 기능: 좌측 사이드바 + 본문 + **클라이언트 검색**. 우측 TOC 제외.
> - 골격: 미니헤더 + 랜딩 Footer 재사용.
> - 진입점: 랜딩 상단 **글로벌 헤더 신설 + Docs 링크**.
> - 기존 외부 GUIDE_URL 링크(Footer·FAQ·HowItWorks) 내부 전환 및 Gitbook noindex/내림은 이번 스코프 제외(후속, Gitbook-down 단계와 커플링).

## 배경

- 현재 가이드는 `bugshot.gitbook.io/ko`로 운영. 콘텐츠 원본은 bugshot-2 레포 `guide/{ko,en}`이며 GitHub sync로 Gitbook에 발행.
- 문제: `gitbook.io` 도메인이 가이드의 모든 SEO 권위를 흡수. `bug-shot.com`에는 권위가 전혀 쌓이지 않음.
- Gitbook 커스텀 도메인은 유료. 무료로 권위를 `bug-shot.com`에 집중하려면 자체 호스팅이 유일한 길.
- 콘텐츠는 거의 순수 GFM(특수 문법은 `{% embed %}` 2곳뿐, HTML 태그·table 0). 소스를 그대로 재사용 가능.

## 목표

- `bug-shot.com/docs` 하위에 ko/en 가이드 전체를 정적 서빙하고 검색엔진에 인덱싱시킨다.
- bugshot-2 `guide/**` 변경 시 자동 반영(Gitbook 자동발행 UX 유지) — Vercel Deploy Hook + bugshot-2 GitHub Action.
- 문서 내 클라이언트 검색 제공(Gitbook 검색 대체).
- CLAUDE.md 품질 목표 유지: Lighthouse Performance ≥ 90, SEO ≥ 90.

## 비목표 (Non-goals)

- 우측 TOC(페이지 내 목차) — 후속.
- 기존 Gitbook 사이트 noindex / 사이트 내림 / 301 리다이렉트 — 방침만 정함, 실행은 새 docs 안정화 후 별도 진행.
- 기존 외부 가이드 링크(`Footer`·`Faq`·`HowItWorks`의 `GUIDE_URL`) 내부 `/docs` 전환 — Gitbook 유지 중이라 여전히 동작. Gitbook-down 단계와 함께 전환(후속). 이번엔 신규 글로벌 헤더 Docs 링크만 진입점으로 추가.
- 문서 편집 UI — 작성은 계속 bugshot-2 마크다운에서.
- 신규 언어 추가 — ko/en 유지.

## 사용자 시나리오

1. 랜딩 상단 글로벌 헤더의 "Docs" 클릭 → `/{locale}/docs`(소개 = 루트 README).
2. 좌측 사이드바(SUMMARY 트리)로 섹션·문서 탐색. 현재 문서 active 표시.
3. 문서 페이지에서 이미지·코드블록 포함 본문 열람.
4. 검색: 헤더 검색 진입 → 쿼리 입력 → 결과 클릭 → 해당 문서로 이동.
5. LocaleSwitcher로 같은 문서의 다른 언어 전환(ko/en SUMMARY 대칭이라 동일 slug 유지).

**엣지 케이스**
- 존재하지 않는 slug → 404.
- 이미지 없는 문서도 정상 렌더.
- dev 모드(검색 인덱스 부재) → 검색 UI는 graceful degrade.

## 성공 기준

- `pnpm build`로 `out/`에 `/ko/docs/**`, `/en/docs/**` 정적 HTML 전량 생성.
- `bug-shot.com/docs` 접속 시 ko 소개 페이지 서빙(rewrite).
- 각 docs 페이지에 고유 canonical·title·description 메타 + `sitemap.xml` 포함(locale alternates).
- 검색으로 문서 본문 텍스트 매칭·이동.
- bugshot-2 `guide` 수정 push → 수 분 내 `bug-shot.com/docs` 자동 반영.
