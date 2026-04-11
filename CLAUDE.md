# CLAUDE.md

> 이 파일은 Claude Code가 모든 세션에서 자동으로 읽는 메인 컨텍스트입니다.  
> **모든 에이전트와 메인 세션이 공유하는 불변의 진실.**

## 프로젝트 한 줄 정의

**바이브코딩 보안센터 (VibeSec)** — AI 도구로 앱 만든 비개발자가 "내 서비스 해킹 안 당하나?" 
걱정을 해결하러 오는 iOS 스타일 네이티브 느낌 앱. 컴퓨터 수리점처럼 패키지로 판매.

## 누구를 위한 앱인가 (절대 잊지 말 것)

- **개발자 아님.** Cursor, Claude, v0, Lovable, bolt.new, Replit Agent 등으로 서비스를 띄웠지만 
  `.env`, RLS, JWT, CORS, SQL injection 같은 단어를 들으면 얼어버리는 사람.
- 공포가 아니라 **안심**을 사러 오는 사람. 
- 화면 카피에 `CVE`, `OWASP`, `Authentication Bypass` 같은 단어가 나오면 **실패**.  
  대신 "로그인이 털릴 수 있는 상태예요"라고 말해야 한다.

## 북극성 지표 (North Star)

> **한 명의 비개발자가 앱을 깔고 3분 안에 자기 프로젝트의 보안 상태를 이해하고, 
> 어떤 패키지를 사야 할지 납득할 수 있는가?**

모든 에이전트는 자기 작업물이 이 지표에 기여하는지 자문해야 한다.

## 기술 스택 (architect가 최종 확정)

기본 권장안 (architect가 Wave 1에서 ADR-001로 확정):

| 레이어 | 선택 | 이유 |
|------|------|------|
| 쉘 | **Tauri 2** | 네이티브 느낌, 작고, Rust 백엔드 가능 |
| 프론트 | **Svelte 5 (runes)** | ios26-design-system 1급 지원 |
| 디자인 시스템 | **@ios26_design_system/svelte** | Liquid Glass 토큰·컴포넌트 |
| 텍스트 측정 | **@chenglou/pretext** | 개발 시점 레이아웃 검증 |
| 라우팅 | **SvelteKit** | 정적 빌드 → Tauri WebView |
| 상태 | **Svelte runes + stores** | 의존성 최소 |
| 언어 | **TypeScript strict** | 비결정 타입 금지 |
| 패키징 | **pnpm workspaces** | 모노레포 호환 |

*다른 스택으로 가려면 ADR-001을 수정하고 모든 에이전트에게 공지하는 절차가 필요합니다.*

## 에이전트 명단과 책임

| # | Agent | Wave | 핵심 산출물 |
|---|-------|------|----------|
| 1 | `product-strategist` | W1 | `docs/product/personas.md`, `packages-taxonomy.md`, `copy-guide.md` |
| 2 | `architect` | W1 | `docs/arch/stack.md`, `schema.md`, `harness/DECISIONS.md` |
| 3 | `design-system-engineer` | W2 | `app/src/lib/ds/**`, `app/src/lib/components/**` |
| 4 | `content-curator` | W2 | `content/packages/*.json` (312개), `content/copy/*.md` |
| 5 | `security-curator` | W2 | `content/security/vulnerabilities.json`, `detection-rules.md` |
| 6 | `screen-builder` | W3 | `app/src/routes/**/*.svelte` |
| 7 | `layout-verifier` | W4 | `scripts/verify-layout.ts` + `docs/qa/layout-report.md` |
| 8 | `qa-reviewer` | W4 | `docs/qa/accessibility.md`, `flows.md`, `edge-cases.md` |

## 하네스 엔지니어링 규칙 (모든 에이전트에 적용)

### 규칙 1. 파일로 말해라
에이전트 간 정보 전달은 **반드시 파일로**. "방금 다른 에이전트가 말했으니까" 같은 건 없다.  
서브에이전트는 컨텍스트가 격리되므로 다른 에이전트의 대화 내용을 볼 수 없다.

### 규칙 2. 컨트랙트를 먼저 읽어라
작업 시작 전에 반드시 `harness/CONTRACTS.md`에서 본인의 INPUT/OUTPUT 컨트랙트를 확인한다.  
컨트랙트에 없는 파일을 읽거나 쓰면 하네스가 깨진다.

### 규칙 3. STATUS.md를 실시간으로 업데이트
작업 시작할 때 `harness/STATUS.md`의 해당 웨이브 블록에 `in_progress`로 표시.  
완료 시 `done`으로 바꾸고 산출물 경로를 나열한다. 막히면 `blocked` + 사유.

### 규칙 4. 의사결정은 DECISIONS.md에 ADR로 남겨라
"왜 이 선택이었나"가 애매할 때마다 `harness/DECISIONS.md`에 ADR 항목 추가.  
포맷: `ADR-NNN: 제목 / Context / Decision / Consequences`.

### 규칙 5. 북극성으로 자가검증
최종 산출물을 쓰기 전에 한 번 멈추고 자문한다: 
"비개발자가 이걸 봤을 때 3분 안에 이해할까?"  
답이 `No`면 다시 쓴다.

### 규칙 6. 모른다고 말할 권리
LLM이 가장 위험한 건 모르는 걸 아는 척할 때. 막히면 `blocked`로 표시하고 
`harness/STATUS.md`에 구체적인 질문을 남겨라. 상상하지 말 것.

### 규칙 7. 코드는 최종, 컨텐츠는 분리
Svelte 컴포넌트에 하드코딩된 한국어 카피 금지. 모든 텍스트는 `content/`에서 로드.  
이유: content-curator와 screen-builder가 병렬로 작업하려면 분리가 필수.

## 언어와 카피 톤

- **기본 언어**: 한국어 (존댓말)
- **보조 언어**: 영어 (i18n 키로 분리, 초기엔 한국어만 채움)
- **톤**: 동네 수리점 사장님. 전문적이지만 친근. 설명할 때 비유를 쓴다.
  - ❌ "SQL Injection 취약점이 발견되었습니다"
  - ✅ "데이터베이스에 잠금을 안 걸어둔 상태예요. 지금 누구나 열 수 있어요."

## 금지 사항 (전 에이전트)

- 비개발자에게 보여지는 화면에 영문 기술용어 단독 사용 금지 (괄호 병기는 OK)
- 공포 마케팅 금지. "해킹당합니다!" 같은 카피 ❌
- 실제 고객 데이터나 API 키를 예시로 사용 금지
- 외부 LLM API를 프론트엔드 번들에 포함 금지 (우리 앱이 우리 교훈을 어기면 안 됨)
- Lighthouse/접근성 점수 85 미만인 상태로 다음 웨이브 진입 금지

## 웨이브 전환 체크리스트 (사람이 승인)

각 웨이브 종료 시 `harness/VERIFICATION.md`의 체크리스트를 돌려서 통과해야 다음 웨이브로 간다.  
메인 세션(사람)이 이 게이트를 운영한다.
