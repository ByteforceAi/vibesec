# CONTRACTS.md — 에이전트 I/O 컨트랙트

> 하네스 엔지니어링의 심장. 이 문서는 **에이전트 간의 공개 API**입니다.  
> 자기 OUTPUT만 쓰고, 남의 OUTPUT은 읽기 전용으로 소비하세요.

## 규약

- **INPUT**: 에이전트가 시작 전에 **반드시** 존재해야 하는 파일
- **OUTPUT**: 에이전트가 종료 시 반드시 **생성/업데이트**해야 하는 파일
- **READ-ONLY**: 참고용으로 읽을 수 있지만 **절대 수정 금지**
- **FORBIDDEN**: 이 에이전트는 건드리면 안 되는 영역

위반 시 다른 에이전트의 작업을 망가뜨리므로 하네스가 깨집니다.

---

## 1. product-strategist

**INPUT** (read-only):
- `harness/PROJECT.md`
- `harness/CLAUDE.md`

**OUTPUT** (must write):
- `docs/product/personas.md` — P1/P2/P3 각 2페이지, 하루 일상 묘사 포함
- `docs/product/packages-taxonomy.md` — 8 카테고리 × 세부 증상, 트리 구조
- `docs/product/copy-guide.md` — 톤·금지어·비유 사전, 예시 before/after
- `docs/product/journey.md` — 3분 북극성 체험을 화면 단위로 분해
- `harness/STATUS.md` — 본인 블록만 업데이트

**FORBIDDEN**: `app/`, `content/`, `docs/arch/`

---

## 2. architect

**INPUT** (read-only):
- `harness/PROJECT.md`
- `harness/CLAUDE.md`
- `docs/product/personas.md` (있으면 참고, 없어도 진행 가능)

**OUTPUT** (must write):
- `docs/arch/stack.md` — 선택한 스택과 그 이유, 대안 비교
- `docs/arch/schema.md` — 데이터 모델 (Package, Scan, Report, User 엔티티)
- `docs/arch/folder-layout.md` — 모노레포 구조 명세
- `docs/arch/api-contract.md` — 프론트↔백 인터페이스 (스캔 결과 schema 등)
- `harness/DECISIONS.md` — 최소 3개 ADR (ADR-001: 스택 선택, ADR-002: 스키마, ADR-003: 폴더 구조)
- `app/package.json` (초기 스캐폴드만)
- `app/tsconfig.json`
- `app/svelte.config.js`
- `harness/STATUS.md` — 본인 블록

**FORBIDDEN**: `content/`, `docs/product/`, `app/src/`

---

## 3. design-system-engineer

**INPUT** (read-only):
- `docs/arch/stack.md`
- `docs/arch/folder-layout.md`
- `docs/product/copy-guide.md`
- `app/package.json` (architect가 초기 세팅한 것)

**OUTPUT** (must write):
- `app/package.json` — `@ios26_design_system/svelte`, `@chenglou/pretext` 의존성 추가
- `app/src/lib/ds/tokens.ts` — ios26 토큰을 앱에서 쓰기 좋게 re-export
- `app/src/lib/ds/liquid-glass.ts` — Liquid Glass 유틸리티 (blur, refraction, depth)
- `app/src/lib/components/Button.svelte`
- `app/src/lib/components/Card.svelte`
- `app/src/lib/components/TabBar.svelte`
- `app/src/lib/components/Toolbar.svelte`
- `app/src/lib/components/ListRow.svelte`
- `app/src/lib/components/Sheet.svelte`
- `app/src/lib/components/Alert.svelte`
- `app/src/lib/components/ProgressIndicator.svelte`
- `app/src/lib/components/Badge.svelte`
- `app/src/lib/components/index.ts` — barrel export
- `app/src/routes/+layout.svelte` — 토큰 CSS 로드
- `docs/arch/components-inventory.md` — 어떤 컴포넌트가 어떤 iOS26 스펙을 매핑하는지
- `harness/STATUS.md` — 본인 블록

**FORBIDDEN**: `content/`, `docs/product/`, `app/src/routes/*` (레이아웃 제외)

---

## 4. content-curator

**INPUT** (read-only):
- `docs/product/packages-taxonomy.md`
- `docs/product/copy-guide.md`
- `docs/product/personas.md`

**OUTPUT** (must write):
- `content/packages/index.json` — 전체 패키지 목록 (312개)
- `content/packages/secrets/*.json` — SECRETS 카테고리 패키지 (~40개)
- `content/packages/auth/*.json` — AUTH 카테고리 (~40개)
- `content/packages/data/*.json` — DATA 카테고리 (~40개)
- `content/packages/network/*.json` — NETWORK 카테고리 (~40개)
- `content/packages/injection/*.json` — INJECTION 카테고리 (~40개)
- `content/packages/infra/*.json` — INFRA 카테고리 (~35개)
- `content/packages/monitor/*.json` — MONITOR 카테고리 (~35개)
- `content/packages/response/*.json` — RESPONSE 카테고리 (~40개)
- `content/copy/onboarding.md`
- `content/copy/diagnosis.md`  
- `content/copy/checkout.md`
- `content/copy/empty-states.md`
- `content/copy/errors.md`
- `harness/STATUS.md`

**스키마** (`content/packages/*.json` 각 파일):
```json
{
  "id": "PKG-SECRETS-KEY-RESCUE",
  "category": "SECRETS",
  "name": "KEY RESCUE",
  "name_kr": "키 구조대",
  "subtitle_kr": "노출된 API 키 응급 회수",
  "severity": "high",
  "price_krw": 89000,
  "duration": "당일",
  "symptoms": ["OpenAI 요금 폭탄", ".env 깃허브 노출"],
  "description_kr": "비개발자도 이해할 수 있는 2-3문장 설명",
  "fixes_vulns": ["VULN-001", "VULN-002"],
  "includes": ["키 즉시 회수", "백엔드 이전", "히스토리 정리"],
  "warranty_days": 30
}
```

**FORBIDDEN**: `app/`, `docs/`

---

## 5. security-curator

**INPUT** (read-only):
- `docs/product/packages-taxonomy.md`
- `docs/product/copy-guide.md`

**OUTPUT** (must write):
- `content/security/vulnerabilities.json` — 50+ 취약점 목록
- `content/security/detection-rules.md` — 각 취약점을 어떻게 탐지하는지 (사람이 읽기 좋게)
- `content/security/fixes-by-vuln.md` — 취약점별 수정 레시피
- `content/security/severity-scale.md` — 🔴/🟡/🟢 판정 기준
- `docs/security/non-technical-glossary.md` — 기술용어 → 일상어 매핑 사전
- `harness/STATUS.md`

**취약점 스키마**:
```json
{
  "id": "VULN-001",
  "slug": "exposed-openai-key",
  "title_kr": "OpenAI 키가 그대로 노출돼 있어요",
  "metaphor_kr": "가게 금고 비밀번호를 쇼윈도에 붙여놓은 상태",
  "severity": "critical",
  "category": "SECRETS",
  "how_to_detect": "프론트엔드 번들에 sk- 로 시작하는 문자열 검색",
  "example_damage_kr": "하룻밤 사이에 수백만원 요금 나올 수 있어요",
  "recommended_packages": ["PKG-SECRETS-KEY-RESCUE"]
}
```

**FORBIDDEN**: `app/`, `docs/product/`, `docs/arch/`

---

## 6. screen-builder

**INPUT** (read-only):
- `docs/product/journey.md`
- `docs/arch/folder-layout.md`
- `docs/arch/components-inventory.md`
- `app/src/lib/components/**` ← design-system-engineer의 output
- `content/packages/**` ← content-curator의 output
- `content/copy/**` ← content-curator의 output
- `content/security/**` ← security-curator의 output

**OUTPUT** (must write):
- `app/src/routes/+page.svelte` — 홈 (수리점 간판, 바로 진단 CTA)
- `app/src/routes/onboarding/+page.svelte` — 최초 실행 튜토리얼
- `app/src/routes/diagnose/+page.svelte` — URL 입력 + 스캔 진행
- `app/src/routes/report/+page.svelte` — 건강 검진표
- `app/src/routes/report/[scanId]/+page.svelte` — 특정 스캔 리포트
- `app/src/routes/packages/+page.svelte` — 312개 카탈로그 (카테고리 필터)
- `app/src/routes/packages/[id]/+page.svelte` — 패키지 상세
- `app/src/routes/checkout/+page.svelte` — 결제 페이지 (모킹)
- `app/src/routes/incident/+page.svelte` — 긴급 911 진입점
- `app/src/lib/stores/scan.ts` — 스캔 상태 store
- `app/src/lib/stores/cart.ts` — 장바구니
- `app/src/lib/mock/fake-scanner.ts` — 더미 스캔 결과 생성기
- `harness/STATUS.md`

**FORBIDDEN**: `content/`, `docs/`, `app/src/lib/components/` (컴포넌트 수정 금지, 조합만)

**특수 규칙**: 컴포넌트에 **하드코딩된 한국어 카피 금지**. 모든 텍스트는 `content/copy/*.md` 
또는 `content/packages/*.json`에서 import해서 쓴다.

---

## 7. layout-verifier

**INPUT** (read-only):
- `app/src/routes/**`
- `app/src/lib/components/**`
- `content/**`

**OUTPUT** (must write):
- `scripts/verify-layout.ts` — pretext 기반 검증 스크립트
- `scripts/verify-layout.config.json` — 검증 대상 viewport 목록 (iPhone 16 Pro, iPad Mini, Desktop)
- `docs/qa/layout-report.md` — 발견된 이슈 목록 (파일·라인·viewport 명시)
- `docs/qa/layout-report.json` — 기계 판독 가능 버전
- `.github/workflows/layout-check.yml` — CI 통합 (선택적)
- `harness/STATUS.md`

**검증 방법**:
1. `content/packages/**/*.json`에서 모든 `name_kr`, `subtitle_kr` 수집
2. 디자인 시스템의 Button/Card 폭에 맞춰 pretext `layout()` 호출
3. `lineCount`가 예상치를 초과하면 이슈로 기록
4. Svelte 컴포넌트에 박힌 정적 텍스트도 정규식으로 수집해서 검증

**FORBIDDEN**: 앱 코드 수정 금지. 리포트만 쓴다 (수정은 별도 PR로 사람이 처리).

---

## 8. qa-reviewer

**INPUT** (read-only):
- 앱 전체 (`app/**`)
- `docs/product/journey.md`
- `content/**`

**OUTPUT** (must write):
- `docs/qa/accessibility.md` — WCAG AA 체크리스트 결과
- `docs/qa/flows.md` — 3분 북극성 여정 재현 성공/실패 기록
- `docs/qa/edge-cases.md` — 에지케이스 목록 (빈 상태, 오프라인, 긴 텍스트 등)
- `docs/qa/issues-priority.md` — 🔴/🟡/🟢 분류된 이슈 리스트
- `harness/STATUS.md`

**FORBIDDEN**: 앱 코드 수정. QA는 관찰하고 기록만 한다.

---

## 공유 영역 (모든 에이전트가 쓸 수 있음)

- `harness/STATUS.md` — 자기 블록만 (다른 에이전트 블록 건드리지 말 것)
- `harness/DECISIONS.md` — 새 ADR 추가만 (기존 ADR 수정 금지)

## 누구도 건드리면 안 되는 영역

- `harness/PROJECT.md` — 불변
- `harness/CLAUDE.md` — 불변  
- `harness/WAVE-PLAN.md` — 불변
- `harness/CONTRACTS.md` — 불변 (지금 이 파일)
- `harness/VERIFICATION.md` — 불변

이 5개 파일을 수정하려면 사람이 직접 편집하고 모든 에이전트에게 변경을 공지해야 합니다.
