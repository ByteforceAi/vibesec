# DECISIONS.md — Architecture Decision Records

> **추가만 가능. 수정/삭제 금지.** 결정을 바꾸려면 새 ADR로 supersede하세요.

## ADR 포맷

```
## ADR-NNN: 제목

- **Status**: proposed | accepted | superseded by ADR-MMM
- **Date**: YYYY-MM-DD
- **Author**: 에이전트 이름 또는 사람

### Context
무엇이 문제였는가? 왜 결정이 필요했는가?

### Options Considered
고려한 대안들과 각각의 트레이드오프.

### Decision
무엇을 선택했는가? (한 문장으로 명확하게)

### Consequences
이 결정의 결과. 좋은 것, 나쁜 것, 감수하는 것.

### Related
다른 ADR 번호나 관련 문서 링크.
```

---

## ADR-000: 하네스 엔지니어링 원칙 채택

- **Status**: accepted
- **Date**: 2026-04-11
- **Author**: human

### Context
8개의 에이전트가 협업해서 앱을 만들어야 한다. 각 서브에이전트는 컨텍스트가 격리되어 있어서 
서로의 대화를 볼 수 없다. 상태 공유와 I/O 컨트랙트가 없으면 서로의 작업을 덮어쓰거나 
가정이 어긋나서 카오스가 된다.

### Options Considered
1. **자유 방임**: 메인 세션이 매번 에이전트에게 지시. 단순하지만 재현 불가.
2. **하네스 엔지니어링**: 컨트랙트·게이트·상태 보드를 문서화. 복잡하지만 안정적.
3. **풀 자동화**: 훅으로 완전 자동 실행. 너무 이르다 — 피드백 루프 필요.

### Decision
**옵션 2 (하네스 엔지니어링)**를 채택한다. 
파일시스템 기반 통신, 명시적 컨트랙트, HITL 게이트, 관찰 가능한 상태 보드로 운영한다.

### Consequences
- ➕ 에이전트 재실행/재시도가 안전해진다
- ➕ 사람이 중간에 개입하기 쉽다
- ➕ 실패 원인 추적이 가능해진다
- ➖ 초기 설정 비용이 크다 (이 문서들)
- ➖ 에이전트 프롬프트가 길어진다 (컨트랙트 명시 때문)

### Related
`harness/CONTRACTS.md`, `harness/WAVE-PLAN.md`, `harness/VERIFICATION.md`

---

## ADR-001: 기술 스택 선택 — Tauri 2 + Svelte 5 + ios26-design-system

- **Status**: accepted
- **Date**: 2026-04-11
- **Author**: architect agent

### Context
바이브코딩 보안센터 앱을 무슨 스택으로 만들 것인가. 제약:
- ios26-design-system의 1급 지원 프레임워크를 쓰고 싶음 (Svelte 5 / Rails / Flutter / Inertia)
- pretext가 JS/TS 라이브러리이므로 웹 기반이어야 함
- "네이티브 느낌"이 필요 — Tauri, Electron, Capacitor 후보
- 비개발자 앱이므로 번들 크기와 설치 경험 중요

### Options Considered

1. **Tauri 2 + Svelte 5 (runes)**: ios26-design-system 1급 지원, 번들 ~10MB, Rust 백엔드로 안전한 로컬 처리
2. **Electron + React**: 생태계 성숙하나 번들 150MB+, ios26-design-system React 미지원
3. **Flutter + ios26_design (Flutter 바인딩)**: 네이티브 렌더링이지만 pretext JS/TS 전용이라 호환 불가
4. **Tauri 2 + Vue 3**: 커뮤니티 크지만 ios26-design-system Vue 미지원

### Decision
**옵션 1 (Tauri 2 + Svelte 5)을 채택한다.** CLAUDE.md 권장안과 동일.
- 앱 쉘: Tauri 2
- 프론트: Svelte 5 (runes) + SvelteKit (adapter-static)
- 디자인: @ios26_design_system/svelte + @ios26_design_system/tokens
- 텍스트 측정: @chenglou/pretext
- 언어: TypeScript strict
- 패키징: pnpm workspaces

### Consequences
- (+) ios26-design-system 토큰/컴포넌트를 직접 사용 가능 — design-system-engineer 작업 효율 극대화
- (+) Tauri 번들 크기 ~10MB — 비개발자 설치 경험 우수
- (+) Svelte 5 runes로 별도 상태 관리 라이브러리 불필요 — 의존성 최소화
- (+) pretext가 JS/TS이므로 layout-verifier 파이프라인이 자연스럽게 연결
- (-) Tauri 2 생태계가 Electron보다 작아 일부 플러그인 부재 가능
- (-) Svelte 5 runes가 최신이라 레퍼런스가 상대적으로 적음
- (감수) MVP 범위에서는 Tauri 생태계 부족이 큰 문제가 되지 않음

### Related
`harness/CLAUDE.md`의 기술 스택 권장안, `docs/arch/stack.md`

---

## ADR-002: 데이터 스키마 설계 — 오프라인 우선 로컬 저장

- **Status**: accepted
- **Date**: 2026-04-11
- **Author**: architect agent

### Context
312개 패키지, 50+ 취약점, 사용자 스캔 기록, 장바구니/주문을 어떤 구조로 저장할 것인가.
PROJECT.md의 "오프라인 우선" 제약과 "데이터 최소 수집" 원칙을 만족해야 한다.
content-curator가 생성하는 Package JSON 스키마(CONTRACTS.md 명시)와 1:1 매칭이 필수.

### Options Considered

1. **로컬 전용 (IndexedDB + 번들 JSON)**: 서버 없음. 정적 콘텐츠는 앱에 번들, 사용자 데이터는 IndexedDB
2. **SQLite (Tauri fs)**: Tauri Rust 백엔드에서 SQLite 사용
3. **원격 DB (Supabase 등)**: 클라우드 저장

### Decision
**옵션 1 (로컬 전용)을 채택한다.**
- 정적 콘텐츠 (Package, Vulnerability): `content/` 디렉토리의 JSON을 앱 번들에 포함
- 동적 데이터 (Scan, Report, User, Cart, Order): IndexedDB에 저장
- 엔티티 7개: Package, Vulnerability, Scan, Finding, Report, User, CartItem/Order

### Consequences
- (+) 오프라인에서 완전 동작 — 네트워크 없이도 과거 리포트 조회 가능
- (+) 서버 운영 비용 제로
- (+) 사용자 데이터가 로컬에만 존재 — 데이터 최소 수집 원칙 충족
- (-) 기기 간 동기화 불가 (MVP에서는 비목표)
- (-) IndexedDB 용량 제한 (일반적으로 수백MB, 충분함)
- (감수) 향후 클라우드 동기화 추가 시 마이그레이션 비용 발생

### Related
`docs/arch/schema.md`, `harness/CONTRACTS.md` content-curator 스키마

---

## ADR-003: 폴더 구조 — 에이전트 쓰기 영역 분리 기반

- **Status**: accepted
- **Date**: 2026-04-11
- **Author**: architect agent

### Context
8개 에이전트가 하나의 모노레포에서 작업한다. 에이전트 간 파일 충돌을 방지하려면
물리적 디렉토리 분리가 필요하다. CONTRACTS.md에 명시된 각 에이전트의 OUTPUT 경로와
일치하는 폴더 구조를 설계해야 한다.

### Options Considered

1. **기능별 분리**: feature/scan/, feature/packages/ 등
2. **에이전트별 분리**: 각 에이전트가 자기 폴더만 소유
3. **하이브리드**: 앱 코드는 기능별, 콘텐츠와 문서는 에이전트별

### Decision
**옵션 3 (하이브리드)을 채택한다.**
- `app/src/lib/ds/`, `app/src/lib/components/` -> design-system-engineer 소유
- `app/src/routes/`, `app/src/lib/stores/`, `app/src/lib/mock/` -> screen-builder 소유
- `content/packages/`, `content/copy/` -> content-curator 소유
- `content/security/` -> security-curator 소유
- `docs/product/` -> product-strategist 소유
- `docs/arch/` -> architect 소유
- `docs/qa/` -> layout-verifier + qa-reviewer 소유
- `scripts/` -> layout-verifier 소유

### Consequences
- (+) 에이전트 간 파일 충돌 제로 — 각자 자기 영역만 쓰기
- (+) CONTRACTS.md OUTPUT 경로와 1:1 매핑 — 검증 용이
- (+) content/와 app/src/ 분리로 병렬 작업 가능 (W2에서 핵심)
- (-) 디렉토리 깊이가 깊어질 수 있음
- (감수) 에이전트가 영역을 벗어나면 수동으로 잡아야 함 (CONTRACTS.md가 가드)

### Related
`docs/arch/folder-layout.md`, `harness/CONTRACTS.md`

---

## ADR-004: 레이아웃 검증 -- 휴리스틱 추정 채택 (pretext 대신)

- **Status**: accepted
- **Date**: 2026-04-11
- **Author**: layout-verifier agent

### Context
pretext (@chenglou/pretext)는 브라우저의 Canvas `measureText()`에 의존한다.
Node.js에서 이를 사용하려면 `canvas` 또는 `@napi-rs/canvas` 네이티브 의존성이 필요하다.
CI와 개발 머신에서 네이티브 빌드 의존성을 추가하는 것은 비용이 크고,
pretext 자체도 npm 설치 상태가 불확실하다.

### Options Considered

1. **pretext + @napi-rs/canvas**: 픽셀 정확도 높지만 네이티브 빌드 필요, CI 설정 복잡
2. **Playwright headless**: 실제 브라우저 측정, 정확하지만 느리고 의존성 무거움
3. **Heuristic estimation**: 한글 fontSize x 1.0, ASCII x 0.55 방식으로 보수적 추정. 네이티브 의존성 없음

### Decision
**옵션 3 (Heuristic estimation)을 채택한다.**
보수적으로 과대 추정하여 false negative를 최소화한다.
false positive이 일부 발생할 수 있지만 사람이 리포트를 검토하므로 허용 가능.
스크립트 구조는 pretext로 전환 가능하게 설계되어 있다.

### Consequences
- (+) 네이티브 의존성 없음 -- `npx tsx scripts/verify-layout.ts`로 즉시 실행
- (+) CI에서도 문제없이 돌아감
- (+) 312개 패키지 + 67개 취약점 + 60개 카피 = 3386개 텍스트를 1초 이내에 검증
- (-) 실제 렌더링과 최대 ~20% 오차 가능 (보수적 방향)
- (감수) pretext 도입 시 estimateTextWidth 함수만 교체하면 됨

### Related
`scripts/verify-layout.ts`, `scripts/verify-layout.config.json`, ADR-001

---

_(이후 ADR은 다른 에이전트가 추가한다. ADR-005 ~)_
