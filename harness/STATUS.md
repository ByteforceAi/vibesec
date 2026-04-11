# STATUS.md — 라이브 상태 보드

> 이 파일은 **에이전트들이 실시간으로 업데이트**하는 상태 보드입니다.  
> 사람이 오케스트레이션 할 때 여기 먼저 봅니다.

**마지막 업데이트**: `2026-04-11 10:30 (architect done)`

---

## 현재 웨이브

`wave: MVP_SHIPPED`

가능한 값: `W0_NOT_STARTED` | `W1_FOUNDATION` | `W1_DONE_GATE_PENDING` | `W2_PARALLEL` | `W2_DONE_GATE_PENDING` | `W3_SCREENS` | `W3_DONE_GATE_PENDING` | `W4_VERIFY` | `W4_DONE_GATE_PENDING` | `MVP_SHIPPED`

---

## 에이전트 상태

### Wave 1

#### product-strategist
- **status**: `done`
- **started_at**: 2026-04-11 09:00
- **finished_at**: 2026-04-11 09:45
- **outputs**:
  - `docs/product/personas.md`
  - `docs/product/packages-taxonomy.md`
  - `docs/product/copy-guide.md`
  - `docs/product/journey.md`
- **notes**: —

#### architect
- **status**: `done`
- **started_at**: 2026-04-11 10:00
- **finished_at**: 2026-04-11 10:30
- **outputs**:
  - `docs/arch/stack.md`
  - `docs/arch/schema.md`
  - `docs/arch/folder-layout.md`
  - `docs/arch/api-contract.md`
  - `harness/DECISIONS.md` (ADR-001, ADR-002, ADR-003)
  - `app/package.json`
  - `app/tsconfig.json`
  - `app/svelte.config.js`
- **notes**: "pnpm install 통과 확인. peer dependency 경고 없음. @sveltejs/vite-plugin-svelte ^5 + vite ^6 조합."

---

### Wave 2

#### design-system-engineer
- **status**: `done`
- **started_at**: 2026-04-11 11:00
- **finished_at**: 2026-04-11 11:45
- **outputs**:
  - `app/package.json` (unchanged, deps already present)
  - `app/vite.config.ts`
  - `app/src/app.html`
  - `app/src/app.css`
  - `app/src/app.d.ts`
  - `app/src/lib/ds/tokens.ts`
  - `app/src/lib/ds/liquid-glass.ts`
  - `app/src/lib/components/Button.svelte`
  - `app/src/lib/components/Card.svelte`
  - `app/src/lib/components/TabBar.svelte`
  - `app/src/lib/components/Toolbar.svelte`
  - `app/src/lib/components/ListRow.svelte`
  - `app/src/lib/components/Sheet.svelte`
  - `app/src/lib/components/Alert.svelte`
  - `app/src/lib/components/ProgressIndicator.svelte`
  - `app/src/lib/components/Badge.svelte`
  - `app/src/lib/components/Input.svelte`
  - `app/src/lib/components/index.ts`
  - `app/src/routes/+layout.svelte`
  - `docs/arch/components-inventory.md`
- **notes**: All 10 components + Input. svelte-check: 0 errors 0 warnings. vite build: clean. No Korean hardcoded text. 44pt min height respected. Liquid Glass via CSS custom properties and backdrop-filter. Dark mode via prefers-color-scheme media query on CSS variables.

#### content-curator
- **status**: `done`
- **started_at**: 2026-04-11 11:15
- **finished_at**: 2026-04-11 12:30
- **outputs**:
  - `content/packages/index.json` (312 entries)
  - `content/packages/secrets/*.json` (41 packages)
  - `content/packages/auth/*.json` (40 packages)
  - `content/packages/data/*.json` (40 packages)
  - `content/packages/network/*.json` (40 packages)
  - `content/packages/injection/*.json` (40 packages)
  - `content/packages/infra/*.json` (35 packages)
  - `content/packages/monitor/*.json` (35 packages)
  - `content/packages/response/*.json` (41 packages)
  - `content/copy/onboarding.md`
  - `content/copy/diagnosis.md`
  - `content/copy/checkout.md`
  - `content/copy/empty-states.md`
  - `content/copy/errors.md`
- **notes**: 312 packages generated. All name_kr <=7 chars, all subtitle_kr <=20 chars, all prices on ladder, 0 forbidden words, all fixes_vulns in VULN-XXX-NNN format. 7 cross-category bundles included. 5 copy files with Korean copy in repair-shop tone.
- **progress**: `312 / 312 packages`

#### security-curator
- **status**: `done`
- **started_at**: 2026-04-11 11:20
- **finished_at**: 2026-04-11 12:00
- **outputs**:
  - `content/security/vulnerabilities.json` (67 vulnerabilities)
  - `content/security/detection-rules.md`
  - `content/security/fixes-by-vuln.md`
  - `content/security/severity-scale.md`
  - `docs/security/non-technical-glossary.md` (60 terms)
- **notes**: 67 vulnerabilities across 8 categories (SECRETS 12, AUTH 10, DATA 8, NETWORK 7, INJECTION 8, INFRA 7, MONITOR 6, RESPONSE 5). All metaphors in Korean everyday language. No fear marketing. PKG references use content-curator naming convention.
- **progress**: `67 / 50+ vulnerabilities`

---

### Wave 3

#### screen-builder
- **status**: `done`
- **started_at**: 2026-04-11 13:00
- **finished_at**: 2026-04-11 14:10
- **outputs**:
  - `app/src/routes/+page.svelte`
  - `app/src/routes/onboarding/+page.svelte`
  - `app/src/routes/diagnose/+page.svelte`
  - `app/src/routes/report/+page.svelte`
  - `app/src/routes/report/[scanId]/+page.svelte`
  - `app/src/routes/packages/+page.svelte`
  - `app/src/routes/packages/[id]/+page.svelte`
  - `app/src/routes/checkout/+page.svelte`
  - `app/src/routes/incident/+page.svelte`
  - `app/src/lib/stores/scan.ts`
  - `app/src/lib/stores/cart.ts`
  - `app/src/lib/mock/fake-scanner.ts`
  - `app/src/lib/i18n/loader.ts`
- **notes**: All 9 routes built. svelte-check: 0 errors 0 warnings. vite build: clean. No hardcoded Korean in routes/stores/mock. All text from content/copy via i18n loader. Components used via import only, none modified. Fake scanner picks 5-12 random vulns from content/security/vulnerabilities.json. Cart persisted to localStorage. Scan history persisted to localStorage. Packages page uses IntersectionObserver for lazy loading 312 items. Onboarding checks localStorage for first-visit redirect.
- **routes_done**: `9 / 9`

---

### Wave 4

#### layout-verifier
- **status**: `done`
- **started_at**: 2026-04-11 15:00
- **finished_at**: 2026-04-11 15:30
- **outputs**:
  - `scripts/verify-layout.ts`
  - `scripts/verify-layout.config.json`
  - `docs/qa/layout-report.md`
  - `docs/qa/layout-report.json`
  - `harness/DECISIONS.md` (ADR-004)
- **issues_found**: `RED 0 / YELLOW 5 / INFO 132`
- **notes**: "3386 texts checked across 5 viewports. 0 critical (MVP gate pass). 5 warnings: long description_kr texts (60+ chars) exceed 3-line Card.subtitle on iPhone SE. 132 info: vulnerability title_kr truncated with ellipsis in ListRow (safe CSS). No hardcoded Korean in Svelte. Heuristic estimation used (ADR-004)."

#### qa-reviewer
- **status**: `done`
- **started_at**: 2026-04-11 15:30
- **finished_at**: 2026-04-11 16:15
- **outputs**:
  - `docs/qa/accessibility.md`
  - `docs/qa/flows.md`
  - `docs/qa/edge-cases.md`
  - `docs/qa/issues-priority.md`
- **issues_found**: `CRITICAL 4 / WARNING 10 / NICE-TO-HAVE 13`

---

## 상태 값 정의

- `not_started` — 아직 호출 안 됨
- `in_progress` — 작업 중. `started_at` 필수.
- `blocked` — 막힘. `notes`에 막힌 이유 필수.
- `done` — 완료. `outputs`에 생성한 파일 경로 나열.
- `failed` — 실패. `notes`에 사유.
- `stale` — 상류 에이전트 재실행으로 무효화됨. 재작업 필요.

---

## 게이트 실패 기록

```
(아직 없음)
```

형식:
```
- [GATE N] 실패 시각 YYYY-MM-DD HH:MM
  - 실패 항목: ...
  - 원인 에이전트: ...
  - 재시도 카운트: 1/3
  - 조치: ...
```

---

## 웨이브 전환 로그

```
(아직 없음)
```

형식:
```
- W1 → W2 전환: 2026-04-12 14:30 (사람 승인: @user)
- W2 → W3 전환: 2026-04-13 09:15 (사람 승인: @user)
```

---

## 에이전트 사용 팁

- **status를 업데이트할 때는 자기 블록만 건드려라.** 다른 에이전트의 status는 절대 수정 금지.
- **outputs 필드에는 생성한 실제 파일 경로를 나열한다** (존재 확인 쉽게).
- **blocked 상태는 부끄러운 게 아니다.** 애매한데 진행하는 게 훨씬 큰 죄.
- **1회 작업이 끝났으면 반드시 `done`을 찍어라.** 그래야 다음 에이전트가 병렬로 움직일 수 있다.
