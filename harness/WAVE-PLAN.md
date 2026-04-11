# WAVE-PLAN.md — 실행 웨이브와 의존성

> 에이전트 실행 순서와 병렬 가능성의 **유일한 공식 문서**.  
> 여기 명시되지 않은 에이전트 호출은 하지 말 것.

## 의존성 DAG

```
                    ┌─────────────────────┐
                    │  harness/PROJECT.md │  (불변 입력)
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┴─────────────────────┐
         ▼                                           ▼
  ┌───────────────┐                          ┌───────────────┐
  │ W1            │                          │ W1            │
  │ product-      │◀──── 싱크 포인트 ───────▶│ architect     │
  │ strategist    │  (둘 다 끝나야 W2 진입)   │               │
  └───────┬───────┘                          └───────┬───────┘
          │                                          │
          │      ┌──── GATE 1 (HITL) ────┐           │
          └─────▶│  사람이 승인:         │◀──────────┘
                 │  - personas.md OK?    │
                 │  - stack.md OK?       │
                 │  - taxonomy OK?       │
                 └───────────┬───────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │ W2          │     │ W2          │     │ W2          │
  │ design-     │     │ content-    │     │ security-   │
  │ system-eng  │     │ curator     │     │ curator     │
  │             │     │             │     │             │
  │ (병렬)      │     │ (병렬)      │     │ (병렬)      │
  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
                  ┌────── GATE 2 (HITL) ──────┐
                  │  - 토큰·컴포넌트 빌드 통과 │
                  │  - 312 패키지 채워짐      │
                  │  - 취약점 DB 검증 통과    │
                  └────────────┬─────────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │ W3              │
                      │ screen-builder  │
                      │                 │
                      │ (단독 순차)     │
                      └────────┬────────┘
                               │
                     ┌── GATE 3 (HITL) ──┐
                     │ - 모든 화면 존재  │
                     │ - 라우팅 동작     │
                     │ - 더미 데이터 연결│
                     └─────────┬─────────┘
                               │
                  ┌────────────┴────────────┐
                  ▼                         ▼
           ┌─────────────┐           ┌─────────────┐
           │ W4          │           │ W4          │
           │ layout-     │           │ qa-         │
           │ verifier    │           │ reviewer    │
           │             │           │             │
           │ (병렬)      │           │ (병렬)      │
           └──────┬──────┘           └──────┬──────┘
                  │                         │
                  └────────────┬────────────┘
                               ▼
                     ┌── GATE 4 (HITL) ──┐
                     │ - 레이아웃 이슈 0 │
                     │ - 접근성 ≥ 90     │
                     │ - 플로우 리포트   │
                     └─────────┬─────────┘
                               │
                               ▼
                          🎉 MVP READY
```

## Wave 1: Foundation (~순차 또는 느슨한 병렬)

**목적**: 프로젝트의 뼈대 결정. 이후 모든 작업이 여기에 의존한다.

| 에이전트 | 입력 | 산출물 | 병렬? |
|---------|------|--------|-------|
| `product-strategist` | `harness/PROJECT.md` | `docs/product/personas.md`, `docs/product/packages-taxonomy.md`, `docs/product/copy-guide.md`, `docs/product/journey.md` | △ architect와 느슨한 병렬 가능 |
| `architect` | `harness/PROJECT.md` + (있으면) `docs/product/*` | `docs/arch/stack.md`, `docs/arch/schema.md`, `docs/arch/folder-layout.md`, `harness/DECISIONS.md` (ADR-001 ~ ADR-00N) | △ 위와 동일 |

**실행 명령 (메인 세션에서)**:
```
Use the product-strategist subagent on "W1 kickoff per harness/WAVE-PLAN.md"
Use the architect subagent on "W1 kickoff per harness/WAVE-PLAN.md"
```

**GATE 1 체크리스트**: `harness/VERIFICATION.md` W1 섹션 참고.

---

## Wave 2: Parallel Build-out (진짜 병렬 3개)

**목적**: Wave 1의 결정을 바탕으로 독립적인 세 영역을 동시에 채운다.

| 에이전트 | 입력 | 산출물 |
|---------|------|--------|
| `design-system-engineer` | `docs/arch/stack.md`, `docs/product/copy-guide.md` | `app/package.json`, `app/src/lib/ds/**` (토큰·글라스 프리미티브), `app/src/lib/components/**` (버튼, 카드, 탭바 등 10+ 컴포넌트), `app/src/app.html` |
| `content-curator` | `docs/product/packages-taxonomy.md`, `docs/product/copy-guide.md` | `content/packages/*.json` (총 312개, 8 카테고리), `content/copy/onboarding.md`, `content/copy/diagnosis.md`, `content/copy/checkout.md` |
| `security-curator` | `docs/product/packages-taxonomy.md` | `content/security/vulnerabilities.json` (취약점 50+), `content/security/detection-rules.md`, `content/security/fixes-by-vuln.md` |

**실행 명령** (병렬):
```
Use the design-system-engineer subagent in the background on "W2 per WAVE-PLAN"
Use the content-curator subagent in the background on "W2 per WAVE-PLAN"  
Use the security-curator subagent in the background on "W2 per WAVE-PLAN"
```

> ℹ️ "in the background"로 띄우면 세 서브에이전트가 진짜로 동시 실행됩니다.  
> Ctrl+B로 현재 포그라운드 세션을 백그라운드로 보낼 수도 있습니다.

**GATE 2**: 세 에이전트 모두 `done` 상태인지 `harness/STATUS.md` 확인 후, 
`harness/VERIFICATION.md` W2 섹션 체크리스트 실행.

---

## Wave 3: Screen Construction (단독 순차)

**목적**: Wave 2의 세 가지 재료(디자인·콘텐츠·지식)를 묶어서 실제 화면을 짓는다.

| 에이전트 | 입력 | 산출물 |
|---------|------|--------|
| `screen-builder` | `docs/product/journey.md`, `app/src/lib/**`, `content/**` | `app/src/routes/+layout.svelte`, `app/src/routes/+page.svelte` (홈), `app/src/routes/onboarding/+page.svelte`, `app/src/routes/diagnose/+page.svelte`, `app/src/routes/report/+page.svelte`, `app/src/routes/packages/+page.svelte`, `app/src/routes/packages/[id]/+page.svelte`, `app/src/routes/checkout/+page.svelte`, `app/src/routes/incident/+page.svelte` |

**실행 명령**:
```
Use the screen-builder subagent on "W3 per WAVE-PLAN: 모든 라우트를 구현하라"
```

**GATE 3**: `pnpm build`가 경고 없이 통과하고, 모든 라우트가 더미 데이터로 렌더되는지 사람이 확인.

---

## Wave 4: Verification (병렬 2개)

**목적**: 완성품을 두 각도에서 검증. 둘 다 통과하면 MVP.

| 에이전트 | 입력 | 산출물 |
|---------|------|--------|
| `layout-verifier` | `app/src/routes/**`, `content/**` | `scripts/verify-layout.ts` (pretext 기반), `docs/qa/layout-report.md` (발견된 오버플로우 목록), 수정 PR |
| `qa-reviewer` | `app/`, `docs/product/journey.md` | `docs/qa/accessibility.md`, `docs/qa/flows.md`, `docs/qa/edge-cases.md`, 우선순위별 이슈 리스트 |

**실행 명령** (병렬):
```
Use the layout-verifier subagent in the background on "W4 per WAVE-PLAN"
Use the qa-reviewer subagent in the background on "W4 per WAVE-PLAN"
```

**GATE 4**: 레이아웃 이슈 0건(또는 명시적 예외), 접근성 점수 ≥ 90, 치명 플로우 버그 0건.

---

## 재실행 규칙 (중요)

- 에이전트가 이미 작업한 파일은 **덮어쓰지 말고 이어서 수정**한다.
- 컨트랙트에서 본인 OUTPUT으로 지정된 파일만 쓴다. 남의 OUTPUT은 건드리지 않는다.
- Wave N을 다시 돌리면 Wave N+1 이상의 산출물은 `STALE` 플래그를 `STATUS.md`에 표시해야 한다.

## 백프레셔 규칙

- 한 웨이브 내 에이전트가 15분 이상 `in_progress` 상태면 메인 세션이 개입해서 
  `STATUS.md`를 확인하고 이유를 파악한다.
- `blocked` 상태인 에이전트가 있으면 같은 웨이브의 다른 에이전트도 기다려야 한다 
  (종종 공통 가정이 깨졌다는 신호).
