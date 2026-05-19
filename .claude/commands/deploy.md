---
description: Vercel 배포 (빌드 검증 → Lighthouse 체크 → 배포 상태 확인)
---

Vercel에 정적 사이트를 배포하는 흐름. Vercel Git Integration(GitHub 연동)으로 push 시 자동 배포가 기본이므로, 이 스킬은 배포 전후 검증에 집중한다.

## 워크플로우 위치

```
1. dev pull → 작업 (/pull → 코드 → /build)
2. /push
3. /merge — dev → main squash PR
4. Vercel이 main push 감지 → 자동 빌드·배포
5. /deploy ← 여기. 배포 결과 검증
```

## 절차

1. **사전 점검 (병렬 실행)**
   - `git branch --show-current` — 현재 브랜치 확인
   - `git status` — 미커밋 변경 확인
   - `node -p "require('./package.json').version"` — 현재 버전
   - `git log --oneline -5` — 최근 커밋

2. **로컬 빌드 검증.** `pnpm build` 실행.
   - 실패 시 에러 보고 + 중단.
   - 성공 시 `out/` 산출물 요약.

3. **정적 파일 검증.**
   - `out/index.html`에 OG 메타 태그, JSON-LD, title 정상 삽입 확인.
   - `out/` 내 주요 파일 목록 (HTML, CSS, JS, 이미지).

4. **배포 상태 확인.**
   - Vercel Git Integration이면: "main에 push하면 자동 배포됩니다. `/merge` 후 Vercel 대시보드에서 배포 상태를 확인하세요."
   - 수동 배포가 필요하면: `vercel --prod` 명령 안내.

5. **배포 후 체크리스트.**
   ```
   - [ ] 프로덕션 URL 접속 가능
   - [ ] 커스텀 도메인 HTTPS 정상 (설정된 경우)
   - [ ] 모든 CTA → 웹스토어 링크 정상
   - [ ] 외부 링크 (Privacy Policy, GitHub) 정상
   - [ ] 모바일 반응형 레이아웃 정상
   - [ ] OG 메타 공유 미리보기 (opengraph.dev 등)
   - [ ] Lighthouse Performance ≥ 90, SEO ≥ 90
   ```

## 주의

- 이 스킬은 검증과 안내가 주 역할이다. 실제 Vercel 배포는 Git push 또는 CLI로 사용자가 직접 트리거.
- 빌드 전 코드 수정 금지.
- `vercel` CLI 명령은 사용자 확인 후에만.
