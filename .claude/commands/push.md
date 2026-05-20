---
description: main에 안전하게 푸시. 푸시 전 상태 점검 + CLAUDE.md/README.md 신선도 확인.
---

원격(`origin/main`)에 푸시한다. 푸시 전에 저장소 문서의 신선도를 점검하고 필요시 업데이트까지 커밋한다.

## 절차

1. **상태 점검 (병렬 실행)**
   - `git status` — 미커밋 변경 확인
   - `git log @{u}..HEAD --oneline` — 푸시될 커밋 목록
   - `git log -1 --stat` — 마지막 커밋 규모
   - `git branch --show-current` — `main` 확인 (단일 브랜치 운영)

2. **미커밋 변경이 있으면 바로 커밋한다.** `/push`를 실행한 시점에 커밋 의도가 있다고 간주. 변경 파일을 stage하고 **영문 커밋 메시지**로 커밋한 뒤 푸시 절차를 계속 진행한다. 허락을 구하지 않는다.

3. **푸시될 커밋이 없으면** "푸시할 커밋 없음" 알리고 종료.

4. **문서 신선도 검사.** 푸시될 커밋들의 diff(`git diff @{u}..HEAD`)를 훑어 아래 트리거 중 하나라도 해당하면 **CLAUDE.md + README.md 업데이트 후보**:

   트리거:
   - 새 디렉터리/파일 추가·삭제 (특히 `src/` 하위 구조 변화)
   - `package.json`의 scripts/dependency 변경
   - 새 컴포넌트·섹션·라우트 추가/삭제 (`src/components/`, `src/app/`)
   - i18n 메시지 구조 변경 (`src/lib/i18n/`, `src/i18n/`)
   - 새로운 컨벤션·디자인 토큰·CTA 사양이 커밋 메시지에서 드러남
   - 기능 추가/삭제로 README의 설명이 어긋남
   - 워크플로우/스킬 라인업 변경

   검사 대상:
   - **CLAUDE.md** — 스택, 디렉터리 구조, 코드 컨벤션, 워크플로우 등 해당 섹션이 최신인지 확인
   - **README.md** — Stack, Project Structure, 기능 설명 등이 현재 코드와 맞는지 확인

   해당되는 변경을 발견하면:
   - 각 문서를 실제로 읽고 대응 섹션이 최신 상태인지 비교
   - 업데이트가 필요하면 **사용자에게 확인 후** Edit으로 반영
   - 문서별로 별도 커밋 (예: `docs(CLAUDE): update directory structure`, `docs(README): refresh stack list`)
   - 변경 불필요하거나 사용자가 스킵을 원하면 건너뜀

5. **푸시 전 최종 확인.** 사용자에게 "푸시해도 되냐" 묻고 OK면:
   - `git push` (upstream 없으면 `git push -u origin main`)
   - 출력에서 결과 줄만 발췌해 보고

## 금지 사항

- `git push --force` / `--force-with-lease`는 **사용자가 명시 요청**한 경우에만.
- `--no-verify`로 hook 스킵 금지. hook 실패하면 원인 수정이 우선.
- 사용자가 확인해 주기 전까지 새 커밋을 만들지 않는다 (문서 업데이트 커밋 포함).
- `.env`, 크레덴셜 파일 등은 staged여도 경고하고 멈춤.
