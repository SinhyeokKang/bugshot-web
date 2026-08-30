# Landing Content — 기술 설계

## 개요
연동 목록을 단일 상수로 정의하고, 이를 (a) 새 로고 스트립 섹션과 (b) FAQ 답변이 공유하도록 한다. 랜딩 카피/소개 문단/연락처는 i18n 메시지 + 기존 컴포넌트 수정으로 처리. 새 상태·API 없음(정적).

## 변경 범위

- `src/lib/constants.ts` — 현재: 연동 목록이 상수화되어 있지 않음(FAQ 답변 문자열에만 존재). 변경: `INTEGRATIONS` 상수 추가 — 각 항목 `{ key, label, docPath }`(8종). simple-icons 브랜드 아이콘 매핑은 컴포넌트에서. `CONTACT_EMAIL`은 이미 존재(재사용).
- `src/components/IntegrationStrip.tsx` (신규) — 8개 트래커를 브랜드 아이콘(`@icons-pack/react-simple-icons`, CLAUDE.md 규칙: `Si{Name}`, `color="default"`, GitHub만 `dark:invert`)+라벨로 렌더하는 서버 컴포넌트. 전체를 `/docs/integrations`로 링크(또는 항목별). `INTEGRATIONS` 소비.
- `src/app/[locale]/page.tsx` — 현재: Hero→Mockup→FeatureCards×2→HowItWorks→Review→Faq→BottomCta 순. 변경: `IntegrationStrip`을 HowItWorks와 Review 사이 `<section className="border-b ...">`로 삽입(CLAUDE.md 섹션 구조 준수).
- `src/components/Faq.tsx` + `src/lib/i18n/en.json`·`ko.json` — 현재: `faq.items.integrations.a`에 6종 하드코딩 문자열. 변경: 트래커 목록을 `INTEGRATIONS`에서 주입하거나, 최소한 답변 문구를 8종으로 갱신(en·ko). FAQ JSON-LD는 `page.tsx`가 `stripRichTags(faqT(...))`로 생성 — 문구 갱신 시 자동 반영.
- `src/components/Hero.tsx` 또는 신규 소개 섹션 — 자체완결 ~150단어 소개 문단 + 타깃 키워드. Hero subcopy는 짧은 카피라, 별도 intro를 Mockup 아래 또는 Hero 확장으로. i18n `hero`/신규 `intro` 네임스페이스.
- `src/components/Footer.tsx` + i18n — 현재: © · GitHub · Privacy. 변경: "Built by" 한 줄 + 연락처(`CONTACT_EMAIL` mailto 또는 GitHub Issues) 추가.

## 데이터 흐름
`INTEGRATIONS`(상수) → IntegrationStrip(렌더) + FAQ 답변(문구 주입 or 동기 갱신) → FAQ JSON-LD(`stripRichTags`)에 반영. 카피/문단/연락처는 i18n 메시지(빌드타임) → 정적 렌더. 런타임 상태 없음.

## 인터페이스 설계
```ts
// constants.ts
export const INTEGRATIONS = [
  { key: "jira",    label: "Jira",    docPath: "/integrations" },
  { key: "github",  label: "GitHub",  docPath: "/integrations" },
  { key: "linear",  label: "Linear",  docPath: "/integrations" },
  { key: "notion",  label: "Notion",  docPath: "/integrations" },
  { key: "gitlab",  label: "GitLab",  docPath: "/integrations" },
  { key: "asana",   label: "Asana",   docPath: "/integrations" },
  { key: "clickup", label: "ClickUp", docPath: "/integrations" },
  { key: "slack",   label: "Slack",   docPath: "/integrations" },
] as const;
```
아이콘 매핑은 IntegrationStrip 내부에서 `key → Si{Name}`(존재 여부 확인 필요 — simple-icons에 각 브랜드 존재).

## 기존 패턴 준수
- CLAUDE.md 섹션 구조: outer `<section>` full-width + `border-b` + `py`, inner `<div className="container mx-auto max-w-[1200px]">`.
- 브랜드 아이콘 규칙: `Si{Name}`, `color="default"`, GitHub만 `dark:invert`(단 dark mode는 스코프 외이므로 실질 무영향).
- i18n 동시 갱신(en/ko), 리치 태그(`<guide>`/`<store>`) + `stripRichTags` FAQ JSON-LD 패턴.
- 내부 링크는 `@/i18n/navigation`의 `Link`(로케일 인식).
- 반응형 `md:` 단일.

## 대안 검토
- **연동 목록 단일화 수준**: (A) FAQ 답변까지 `INTEGRATIONS`로 렌더 / (B) 로고 스트립만 상수화하고 FAQ 문구는 8종으로 수동 갱신. → A가 재발 방지에 낫지만 FAQ 답변은 문장형(설명 포함)이라 완전 데이터화가 어색할 수 있음 → 로고 스트립은 A, FAQ는 목록 부분만 상수 참조 또는 최소 8종 동기화(B 허용).
- **소개 문단 위치**: Hero 확장(above-the-fold 밀림, LCP 위험) vs Mockup 아래 별도 섹션. → 별도 섹션 권장(LCP 무영향, 자체완결 블록으로 GEO 추출 유리).
- **로고 이미지 vs 아이콘 폰트**: 브랜드 로고 이미지(용량/라이선스) vs simple-icons(이미 의존성). → simple-icons 채택(일관성·경량).

## 위험 요소
- simple-icons에 ClickUp/Asana/Linear 등 일부 브랜드 아이콘 부재/이름 상이 가능 — import 전 존재 확인, 없으면 텍스트 라벨 폴백.
- 카피 추가로 페이지 길이·번역량 증가 → en/ko 동시 작성 필수(누락 시 빌드 경고).
- 타깃 키워드는 "자연스럽게"만 — 키워드 스터핑 금지(감사에서 현재 밀도는 정상).
- 브랜드명 표기/상표 가이드 존중(로고 사용 조건).
- IntegrationStrip 삽입으로 섹션 순서 변경 → 앵커/스크롤 리빌(ScrollReveal) 및 인접 `border-b` 중복 확인.
