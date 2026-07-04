# Privacy Page — bug-shot.com/privacy 개인정보처리방침 내재화

> **스코프 가정** (질문 라운드 결과):
> - `/en/privacy`는 **영문판을 신규 작성**해 서빙. bugshot-2에 `docs/privacy.en.md` 신설(콘텐츠 작성 포함).
> - 콘텐츠는 **빌드타임 fetch**(bugshot-2 raw 파일 직접 다운로드, 레포 미커밋·gitignore) + **자동 반영**(Vercel Deploy Hook + bugshot-2 GitHub Action). docs-portal의 "자동발행" UX와 정합.
> - '인프라 선깔기' 범위는 **마크다운 렌더 스택 + Deploy Hook 자동 반영 인프라**(react-markdown + remark-gfm + rehype-slug + @tailwindcss/typography + 공용 `Markdown` 컴포넌트 + Deploy Hook). 공용 SiteHeader·검색은 이번 스코프 제외(docs-portal에서).
> - 기존 github.io privacy URL은 **내부 `/privacy`로 전환**하고 **색인(index)** 대상으로 둔다. github.io 원본은 이번에 손대지 않아 **단기 중복 인덱싱을 감수**한다(트레이드오프는 아래 목표·성공 기준에 명시).

## 배경

- 현재 개인정보처리방침은 bugshot-2 레포 `docs/privacy.md`(한국어 전용)를 GitHub Pages(Jekyll)로 발행 → `https://sinhyeokkang.github.io/bugshot-2/privacy`.
- 문제: 법적 고지 문서가 제품 도메인(`bug-shot.com`) 밖 `github.io`에 있어 신뢰도·SEO 권위가 제품 도메인에 쌓이지 않는다. 랜딩 Footer가 외부 도메인으로 튕긴다.
- 다가올 **docs-portal**(가이드 내재화)은 마크다운을 `bug-shot.com` 하위에 정적 렌더하는 인프라(빌드타임 콘텐츠 fetch + 마크다운 렌더 스택)를 필요로 한다. privacy 페이지는 이 인프라의 **최소 선행 도입 대상**이다 — 단일 문서라 복잡도가 낮고, docs-portal이 그대로 재사용할 마크다운 렌더러를 먼저 검증할 수 있다.
- privacy.md는 순수 GFM(HTML 태그 0)이며 GFM 테이블 다수 + 내부 앵커 링크(예: `[3. 외부 전송](#3-외부-전송)`)를 포함한다.

## 목표

- `bug-shot.com/{ko,en}/privacy`에 개인정보처리방침을 **인덱싱 가능한 상태로 정적 서빙**한다(고유 canonical·title·description·robots index + sitemap 등록).
- 한국어(`docs/privacy.md`)·영어(`docs/privacy.en.md`) 양 로케일을 서빙. 영문판은 이번에 신규 작성.
- bugshot-2의 privacy 원본을 **빌드타임 fetch**(레포 미커밋)하고, 원본 push 시 **Vercel Deploy Hook + GitHub Action으로 수 분 내 자동 반영**한다(수동 재배포 불필요).
- docs-portal이 재사용할 **공용 마크다운 렌더 스택**(react-markdown + typography)과 **Deploy Hook 자동 반영 파이프라인**을 최소 형태로 확립한다.
- **중복 인덱싱 트레이드오프 감수**: v1 배포 직후엔 github.io 원본과 `bug-shot.com`이 동일 본문으로 단기 중복 색인된다. 실질적 권위 이전(github.io noindex/301)은 후속으로 분리한다.
- 랜딩 Footer의 개인정보처리방침 링크를 외부 github.io → 내부 `/{locale}/privacy`로 전환.
- CLAUDE.md 품질 목표 유지: Lighthouse Performance ≥ 90, SEO ≥ 90.

## 비목표 (Non-goals)

- **공용 SiteHeader**(sticky 글로벌 헤더) — docs-portal 스코프. 이번엔 기존 `LocaleSwitcher` + 최소 홈 링크(로고)만.
- **docs-portal 본체**(가이드 사이드바·검색·catch-all 라우트) — 별도 feature.
- **가이드용 guide/** tarball fetch** — 이번 privacy fetch는 raw 파일 2개만 대상. docs-portal이 별도 fetch 구성.
- **기존 github.io Jekyll 사이트 내림/noindex/301** — bugshot-2 스코프. 이번엔 손대지 않음(내부 링크만 전환) → **단기 중복 인덱싱 감수**. 권위 이전 완결은 후속.
- **Chrome Web Store 개인정보 URL 갱신** — bugshot-2/스토어 콘솔 스코프. 별도 안내만.
- **privacy 콘텐츠 자체 개정** — 원문 그대로 렌더. 영문판은 한국어판의 충실한 번역(내용 변경 아님).

## 사용자 시나리오

1. 랜딩 Footer의 "개인정보처리방침" 클릭 → 같은 로케일 `/{locale}/privacy`로 이동(외부 이탈 없음).
2. privacy 페이지에서 GFM 테이블 포함 본문을 prose 스타일로 열람. 넓은 테이블은 가로 스크롤 컨테이너 안에서 스크롤.
3. 본문 내 인라인 앵커 링크(ko `#3-외부-전송`, en `#3-external-transmission` — §6에서 §3을 참조하는 단일 링크) 클릭 → 해당 섹션으로 스크롤.
4. 상단 LocaleSwitcher로 ko ↔ en 전환 → 같은 경로(`/en/privacy`)의 다른 언어 문서로 이동.
5. 상단 BugShot 로고 클릭 → 랜딩(`/{locale}`)으로 복귀.

**엣지 케이스**
- 직접 `bug-shot.com/privacy`(로케일 프리픽스 없음) 접속 → vercel rewrite로 `/ko/privacy` 서빙.
- 빌드 시 ko 또는 en 원본 fetch 실패 → 빌드 non-zero exit(부분 성공 금지).
- 이미지 없는 문서(privacy엔 이미지 없음)도 정상 렌더.
- 넓은 3컬럼 GFM 테이블 + `word-break: keep-all` 전역 → 모바일(375px)에서 body 가로 스크롤 위험 → 테이블별 `overflow-x-auto` 래퍼로 격리.
- 앵커 slug와 헤딩 id 불일치 시 스크롤 실패 → 검증 항목에 포함(ko/en 각 1개).

## 성공 기준

- `pnpm build`로 `out/ko/privacy/index.html`, `out/en/privacy/index.html` 정적 생성.
- `bug-shot.com/privacy` 접속 시 ko 문서 서빙(rewrite), `/en/privacy`는 영문 문서 서빙.
- privacy 페이지에 고유 canonical·title·description·openGraph(title/description/url) 메타 + `robots index` + `sitemap.xml` 등록(ko/en `/{locale}/privacy` alternates). 랜딩 JSON-LD(SoftwareApplication·FAQPage) 미주입.
- GFM 테이블이 스타일과 함께 렌더되고 넓은 테이블은 가로 스크롤로 격리(모바일 body 가로 스크롤 없음), 인라인 앵커 클릭 시 해당 섹션으로 이동.
- Footer 개인정보처리방침 링크가 내부 `/{locale}/privacy`로 이동(외부 도메인 아님).
- bugshot-2 `docs/privacy.{md,en.md}` push → Deploy Hook으로 수 분 내 `bug-shot.com/{locale}/privacy` 자동 반영.
- (감수) v1 배포 직후 github.io 원본과 단기 중복 색인 — 권위 이전 완결은 후속(github.io noindex/301).
