# 폴더 레이아웃 (ADR-003 상세)

> architect 산출물. 모든 에이전트가 참조합니다.
> 핵심 설계 원리: **에이전트 간 쓰기 영역 분리**.

---

## 전체 구조

```
vibesec-app/                        # 루트 (pnpm workspace root)
|
|-- CLAUDE.md                       # 하네스 메인 컨텍스트 (불변)
|-- pnpm-workspace.yaml             # workspace 설정
|
|-- harness/                        # 하네스 파일 (불변 + 공유 상태)
|   |-- PROJECT.md                  # 프로젝트 비전 (불변)
|   |-- CONTRACTS.md                # 에이전트 I/O 컨트랙트 (불변)
|   |-- WAVE-PLAN.md                # 실행 웨이브 (불변)
|   |-- VERIFICATION.md             # 게이트 체크리스트 (불변)
|   |-- STATUS.md                   # 라이브 상태 보드 (공유 쓰기)
|   +-- DECISIONS.md                # ADR (추가만 가능)
|
|-- .claude/agents/                 # 서브에이전트 정의
|
|-- app/                            # Svelte/Tauri 앱 (pnpm workspace member)
|   |-- package.json
|   |-- svelte.config.js
|   |-- tsconfig.json
|   |-- vite.config.ts              # SvelteKit Vite 설정
|   |-- src/
|   |   |-- app.html                # HTML 엔트리
|   |   |-- app.css                 # 글로벌 스타일 (토큰 기반)
|   |   |-- lib/
|   |   |   |-- ds/                 # design-system-engineer 영역
|   |   |   |   |-- tokens.ts       # ios26 토큰 re-export
|   |   |   |   +-- liquid-glass.ts # Liquid Glass 유틸리티
|   |   |   |-- components/         # design-system-engineer 영역
|   |   |   |   |-- Button.svelte
|   |   |   |   |-- Card.svelte
|   |   |   |   |-- TabBar.svelte
|   |   |   |   |-- Toolbar.svelte
|   |   |   |   |-- ListRow.svelte
|   |   |   |   |-- Sheet.svelte
|   |   |   |   |-- Alert.svelte
|   |   |   |   |-- ProgressIndicator.svelte
|   |   |   |   |-- Badge.svelte
|   |   |   |   +-- index.ts        # barrel export
|   |   |   |-- stores/             # screen-builder 영역
|   |   |   |   |-- scan.ts         # 스캔 상태 store
|   |   |   |   +-- cart.ts         # 장바구니 store
|   |   |   |-- mock/               # screen-builder 영역
|   |   |   |   +-- fake-scanner.ts # 더미 스캔 결과 생성기
|   |   |   +-- i18n/               # 콘텐츠 로더
|   |   |       +-- loader.ts       # content/ JSON/MD 로더
|   |   +-- routes/                 # screen-builder 영역
|   |       |-- +layout.svelte      # 루트 레이아웃 (design-system-engineer가 초기 작성)
|   |       |-- +page.svelte        # 홈
|   |       |-- onboarding/
|   |       |   +-- +page.svelte
|   |       |-- diagnose/
|   |       |   +-- +page.svelte
|   |       |-- report/
|   |       |   |-- +page.svelte    # 리포트 목록
|   |       |   +-- [scanId]/
|   |       |       +-- +page.svelte
|   |       |-- packages/
|   |       |   |-- +page.svelte    # 카탈로그
|   |       |   +-- [id]/
|   |       |       +-- +page.svelte
|   |       |-- checkout/
|   |       |   +-- +page.svelte
|   |       +-- incident/
|   |           +-- +page.svelte    # 긴급출동 (P3)
|   +-- src-tauri/                  # Tauri Rust 백엔드 (향후)
|       |-- Cargo.toml
|       |-- tauri.conf.json
|       +-- src/
|           +-- main.rs
|
|-- content/                        # content-curator + security-curator 영역
|   |-- packages/
|   |   |-- index.json              # 전체 패키지 목록 (312개 요약)
|   |   |-- secrets/                # SECRETS 카테고리 (~40 JSON)
|   |   |-- auth/                   # AUTH 카테고리
|   |   |-- data/                   # DATA 카테고리
|   |   |-- network/                # NETWORK 카테고리
|   |   |-- injection/              # INJECTION 카테고리
|   |   |-- infra/                  # INFRA 카테고리
|   |   |-- monitor/                # MONITOR 카테고리
|   |   +-- response/               # RESPONSE 카테고리
|   |-- security/                   # security-curator 영역
|   |   |-- vulnerabilities.json
|   |   |-- detection-rules.md
|   |   |-- fixes-by-vuln.md
|   |   +-- severity-scale.md
|   +-- copy/                       # content-curator 영역
|       |-- onboarding.md
|       |-- diagnosis.md
|       |-- checkout.md
|       |-- empty-states.md
|       +-- errors.md
|
|-- docs/
|   |-- product/                    # product-strategist 영역 (W1 완료)
|   |   |-- personas.md
|   |   |-- packages-taxonomy.md
|   |   |-- copy-guide.md
|   |   +-- journey.md
|   |-- arch/                       # architect 영역
|   |   |-- stack.md
|   |   |-- schema.md
|   |   |-- folder-layout.md        # 이 문서
|   |   |-- api-contract.md
|   |   +-- components-inventory.md # design-system-engineer가 작성
|   |-- security/                   # security-curator 영역
|   |   +-- non-technical-glossary.md
|   +-- qa/                         # layout-verifier + qa-reviewer 영역
|       |-- layout-report.md
|       |-- layout-report.json
|       |-- accessibility.md
|       |-- flows.md
|       |-- edge-cases.md
|       +-- issues-priority.md
|
+-- scripts/                        # layout-verifier 영역
    |-- verify-layout.ts
    +-- verify-layout.config.json
```

---

## 에이전트별 쓰기 영역 매핑

| 에이전트 | 쓰기 허용 영역 | 읽기 전용 |
|---------|-------------|----------|
| product-strategist | `docs/product/` | `harness/PROJECT.md` |
| architect | `docs/arch/`, `app/package.json`, `app/tsconfig.json`, `app/svelte.config.js` | `harness/*`, `docs/product/` |
| design-system-engineer | `app/src/lib/ds/`, `app/src/lib/components/`, `app/src/routes/+layout.svelte` | `docs/arch/`, `docs/product/copy-guide.md` |
| content-curator | `content/packages/`, `content/copy/` | `docs/product/` |
| security-curator | `content/security/`, `docs/security/` | `docs/product/` |
| screen-builder | `app/src/routes/` (레이아웃 제외), `app/src/lib/stores/`, `app/src/lib/mock/` | `app/src/lib/components/`, `content/`, `docs/` |
| layout-verifier | `scripts/`, `docs/qa/layout-*` | `app/src/`, `content/` |
| qa-reviewer | `docs/qa/` (layout 제외) | `app/`, `content/`, `docs/product/` |

---

## 영역 분리 설계 이유

### 1. content/와 app/src/의 분리
content-curator와 screen-builder가 Wave 2-3에서 독립적으로 작업하려면,
콘텐츠(JSON, MD)와 UI 코드(Svelte)가 물리적으로 분리되어야 합니다.
screen-builder는 content/에서 import하여 사용하되 직접 수정하지 않습니다.

### 2. app/src/lib/ds/ vs app/src/lib/components/
둘 다 design-system-engineer 영역이지만, ds/는 토큰과 유틸리티(순수 TS),
components/는 Svelte 컴포넌트입니다. screen-builder는 components/를 조합만 합니다.

### 3. app/src/lib/stores/와 app/src/lib/mock/
screen-builder가 소유합니다. 상태 관리와 모킹 로직은 화면 구축 시 필요한 것이므로
screen-builder가 스키마(docs/arch/schema.md)를 참고하여 구현합니다.

### 4. docs/ 하위 분리
product/, arch/, security/, qa/ 4개 폴더로 나누어 각 에이전트가
자기 영역만 쓰도록 합니다. 교차 읽기는 자유지만 교차 쓰기는 금지입니다.

### 5. scripts/의 독립
layout-verifier가 소유하는 검증 스크립트 영역입니다.
앱 코드와 분리하여 빌드 프로세스에 영향을 주지 않습니다.
