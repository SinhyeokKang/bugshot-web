# Privacy Page — bug-shot.com/privacy 개인정보처리방침 내재화

> **스코프 가정** (질문 라운드 결과):
> - `/en/privacy`는 **영문판을 신규 작성**해 서빙. bugshot-2에 `docs/privacy.en.md` 신설(콘텐츠 작성 포함).
> - 콘텐츠는 **빌드타임 fetch**(bugshot-2 raw 파일 직접 다운로드, 레포 미커밋·gitignore). docs-portal의 "자동발행" UX와 정합.
> - '인프라 선깔기' 범위는 **마크다운 렌더 스택만**(react-markdown + remark-gfm + rehype-slug + @tailwindcss/typography + 공용 `Markdown` 컴포넌트). 공용 SiteHeader는 이번 스코프 제외(docs-portal에서).
> - 기존 github.io privacy URL은 **내부 `/privacy`로 전환**하고 **색인(index)** 대상으로 둔다.

## 배경

- 현재 개인정보처리방침은 bugshot-2 레포 `docs/privacy.md`(한국어 전용)를 GitHub Pages(Jekyll)로 발행 → `https://sinhyeokkang.github.io/bugshot-2/privacy`.
- 문제: 법적 고지 문서가 제품 도메인(`bug-shot.com`) 밖 `github.io`에 있어 신뢰도·SEO 권위가 제품 도메인에 쌓이지 않는다. 랜딩 Footer가 외부 도메인으로 튕긴다.
- 다가올 **docs-portal**(가이드 내재화)은 마크다운을 `bug-shot.com` 하위에 정적 렌더하는 인프라(빌드타임 콘텐츠 fetch + 마크다운 렌더 스택)를 필요로 한다. privacy 페이지는 이 인프라의 **최소 선행 도입 대상**이다 — 단일 문서라 복잡도가 낮고, docs-portal이 그대로 재사용할 마크다운 렌더러를 먼저 검증할 수 있다.
- privacy.md는 순수 GFM(HTML 태그 0)이며 GFM 테이블 다수 + 내부 앵커 링크(예: `[3. 외부 전송](#3-외부-전송)`)를 포함한다.

## 목표

- `bug-shot.com/{ko,en}/privacy`에 개인정보처리방침을 **인덱싱 가능한 상태로 정적 서빙**한다(고유 canonical·title·description·robots index + sitemap 등록).
- 한국어(`docs/privacy.md`)·영어(`docs/privacy.en.md`) 양 로케일을 서빙. 영문판은 이번에 신규 작성.
- bugshot-2의 privacy 원본 수정 시 재빌드로 반영되는 **빌드타임 fetch** 구조를 도입(레포 미커밋).
- docs-portal이 재사용할 **공용 마크다운 렌더 스택**(react-markdown + typography)을 최소 형태로 확립한다.
- 랜딩 Footer의 개인정보처리방침 링크를 외부 github.io → 내부 `/{locale}/privacy`로 전환.
- CLAUDE.md 품질 목표 유지: Lighthouse Performance ≥ 90, SEO ≥ 90.

## 비목표 (Non-goals)

- **공용 SiteHeader**(sticky 글로벌 헤더) — docs-portal 스코프. 이번엔 기존 `LocaleSwitcher` + 최소 홈 링크(로고)만.
- **docs-portal 본체**(가이드 사이드바·검색·catch-all 라우트) — 별도 feature.
- **가이드용 guide/** tarball fetch** — 이번 privacy fetch는 raw 파일 2개만 대상. docs-portal이 별도 fetch 구성.
- **기존 github.io Jekyll 사이트 내림/301** — bugshot-2 스코프. 이번엔 손대지 않음(내부 링크만 전환).
- **Chrome Web Store 개인정보 URL 갱신** — bugshot-2/스토어 콘솔 스코프. 별도 안내만.
- **privacy 콘텐츠 자체 개정** — 원문 그대로 렌더. 영문판은 한국어판의 충실한 번역(내용 변경 아님).

## 사용자 시나리오

1. 랜딩 Footer의 "개인정보처리방침" 클릭 → 같은 로케일 `/{locale}/privacy`로 이동(외부 이탈 없음).
2. privacy 페이지에서 GFM 테이블·목차 포함 본문을 prose 스타일로 열람.
3. 본문 상단 목차의 앵커 링크(`#3-외부-전송` 등) 클릭 → 해당 섹션으로 스크롤.
4. 상단 LocaleSwitcher로 ko ↔ en 전환 → 같은 경로(`/en/privacy`)의 다른 언어 문서로 이동.
5. 상단 BugShot 로고 클릭 → 랜딩(`/{locale}`)으로 복귀.

**엣지 케이스**
- 직접 `bug-shot.com/privacy`(로케일 프리픽스 없음) 접속 → vercel rewrite로 `/ko/privacy` 서빙.
- 빌드 시 ko 또는 en 원본 fetch 실패 → 빌드 non-zero exit(부분 성공 금지).
- 이미지 없는 문서(privacy엔 이미지 없음)도 정상 렌더.
- 목차 앵커 slug와 헤딩 id 불일치 시 스크롤 실패 → 검증 항목에 포함.

## 성공 기준

- `pnpm build`로 `out/ko/privacy/index.html`, `out/en/privacy/index.html` 정적 생성.
- `bug-shot.com/privacy` 접속 시 ko 문서 서빙(rewrite), `/en/privacy`는 영문 문서 서빙.
- privacy 페이지에 고유 canonical·title·description 메타 + `robots index` + `sitemap.xml` 등록(ko/en alternates).
- GFM 테이블이 스타일과 함께 렌더되고, 목차 앵커 클릭 시 해당 섹션으로 이동.
- Footer 개인정보처리방침 링크가 내부 `/{locale}/privacy`로 이동(외부 도메인 아님).
- bugshot-2 `docs/privacy.md` 수정 후 재빌드 시 변경분 반영.
