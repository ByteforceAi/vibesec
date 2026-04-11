# VERIFICATION.md — 품질 게이트

> 웨이브 전환 시점에 **사람이** 손으로 돌리는 체크리스트.  
> 이 게이트를 건너뛰면 하네스가 아닌 그냥 LLM 난장판이 됩니다.

## 공통 원칙

- 게이트는 **자동 검증 + 사람 검증** 두 층.
- 체크리스트 하나라도 ❌면 다음 웨이브 진입 금지.
- ❌가 있으면 해당 에이전트에게 수정 지시 후 다시 돌린다.

---

## GATE 1 — Wave 1 완료 확인

### 자동 검증
```bash
# 파일 존재 확인
test -f docs/product/personas.md || echo "❌ personas.md missing"
test -f docs/product/packages-taxonomy.md || echo "❌ taxonomy missing"
test -f docs/product/copy-guide.md || echo "❌ copy-guide missing"
test -f docs/product/journey.md || echo "❌ journey missing"
test -f docs/arch/stack.md || echo "❌ stack.md missing"
test -f docs/arch/schema.md || echo "❌ schema missing"
test -f docs/arch/folder-layout.md || echo "❌ folder layout missing"
test -f app/package.json || echo "❌ package.json missing"

# DECISIONS.md에 ADR-001 이상 존재
grep -q "ADR-001" harness/DECISIONS.md || echo "❌ no ADRs"

# STATUS.md에서 product-strategist, architect 모두 done
grep -q "product-strategist: done" harness/STATUS.md || echo "❌ product-strategist not done"
grep -q "architect: done" harness/STATUS.md || echo "❌ architect not done"
```

### 사람 검증 (체크리스트)
- [ ] `docs/product/personas.md`에 P1·P2·P3 모두 서술되어 있다
- [ ] 각 페르소나의 "화면에 이 단어가 나오면 이탈한다" 리스트가 구체적이다
- [ ] `packages-taxonomy.md`의 8 카테고리 × 카테고리별 세부 증상이 실제 수리점 메뉴판처럼 읽힌다
- [ ] `copy-guide.md`에 before/after 예시가 최소 10쌍 있다
- [ ] `journey.md`의 3분 여정이 실제로 3분 안에 읽힌다 (소리내서 읽어봐라)
- [ ] `stack.md`가 Tauri+Svelte가 아닌 다른 선택을 했다면 그 이유가 납득 가능하다
- [ ] `schema.md`의 Package 엔티티가 `content/packages/*.json`에 쓸 필드를 모두 커버한다
- [ ] `DECISIONS.md`의 ADR이 "무엇을/왜/결과"를 모두 서술한다 ("무엇을"만 쓴 ADR은 실격)
- [ ] `app/package.json`에 `@ios26_design_system/svelte`와 `@chenglou/pretext`가 dependencies에 있다
- [ ] `pnpm install` (또는 npm install)이 경고 없이 성공한다

**통과 조건**: 모든 항목 ✅  
**실패 시 액션**: 실패 항목을 `STATUS.md`에 `blocked_by_gate1` 플래그와 함께 기록하고 해당 에이전트 재호출.

---

## GATE 2 — Wave 2 완료 확인

### 자동 검증
```bash
# 컴포넌트 존재
ls app/src/lib/components/*.svelte | wc -l  # ≥ 8 이어야 함

# 패키지 카탈로그
jq 'length' content/packages/index.json  # ≥ 300 이어야 함
find content/packages -name "*.json" | wc -l  # ≥ 300 이어야 함

# 취약점 DB
jq 'length' content/security/vulnerabilities.json  # ≥ 50 이어야 함

# 빌드 통과
cd app && pnpm build 2>&1 | grep -v "^$" || echo "build failed"

# 각 패키지 JSON이 스키마 준수
node scripts/validate-package-schema.js  # (있다면)
```

### 사람 검증 (체크리스트)

**design-system-engineer 결과**:
- [ ] `app/src/lib/components/`의 모든 컴포넌트가 Liquid Glass 토큰을 쓰고 있다
- [ ] 각 컴포넌트에 Storybook-style 샘플이 있거나 사용 예시가 주석으로 있다
- [ ] Button의 높이가 iOS26 스펙(최소 44pt)을 따른다
- [ ] 다크 모드 토큰이 준비되어 있다
- [ ] `components-inventory.md`가 iOS26 컴포넌트 ↔ 우리 구현 매핑을 명시한다

**content-curator 결과**:
- [ ] `content/packages/`에 **총 300개 이상의** JSON 파일이 있다
- [ ] 랜덤으로 5개 골라서 열었을 때 `name_kr`에 영어 기술용어가 없다 (괄호 병기는 OK)
- [ ] 가격이 `PROJECT.md`의 가격 사다리를 벗어나지 않는다
- [ ] `content/copy/*.md`가 비개발자 톤을 유지한다 (기계적 번역 느낌 없음)
- [ ] 같은 증상에 대해 저가/중가/고가 패키지가 모두 존재한다

**security-curator 결과**:
- [ ] 취약점 50+개가 있고, 각각 `metaphor_kr`(비유)가 구체적이다 ("가게 금고 비밀번호..." 같은)
- [ ] `non-technical-glossary.md`가 최소 30쌍의 용어 매핑을 포함한다
- [ ] 모든 취약점이 `recommended_packages`로 최소 1개의 실제 패키지 ID를 가리킨다
- [ ] 존재하지 않는 패키지 ID를 가리키지 않는다 (교차 검증)

### 교차 검증 (중요)
- [ ] `content/packages/*.json`의 `fixes_vulns`가 `content/security/vulnerabilities.json`의 실제 ID만 참조한다
- [ ] 역으로, `vulnerabilities.json`의 `recommended_packages`가 실제 패키지 ID만 참조한다
- [ ] orphan 패키지(어떤 취약점도 안 고치는) 개수가 20개 이하

**통과 조건**: 모든 항목 ✅  
**실패 시 액션**: 어떤 에이전트가 원인인지 식별, 해당 에이전트만 재호출.

---

## GATE 3 — Wave 3 완료 확인

### 자동 검증
```bash
cd app
pnpm build  # 반드시 통과
pnpm check  # svelte-check: 0 errors

# 핵심 라우트 존재
test -f src/routes/+page.svelte
test -f src/routes/onboarding/+page.svelte
test -f src/routes/diagnose/+page.svelte
test -f src/routes/report/+page.svelte
test -f src/routes/packages/+page.svelte
test -f src/routes/packages/\[id\]/+page.svelte
test -f src/routes/checkout/+page.svelte
test -f src/routes/incident/+page.svelte

# 하드코딩된 한국어 금지 규칙 검사
# (컴포넌트에 한글이 직접 박혀있으면 안 됨 — content/에서 import해야)
grep -r "[가-힣]" app/src/lib/components/ && echo "❌ hardcoded Korean in components"
```

### 사람 검증 (실제 앱 실행)
- [ ] `pnpm dev` 실행 후 `/` 진입 → 홈이 수리점 간판처럼 보인다
- [ ] 홈에서 "무료 진단" 버튼 → `/diagnose`로 이동
- [ ] URL 입력 후 스캔 시작 → 가짜 프로그레스가 돌고 → `/report`로 이동
- [ ] 리포트 화면에 🔴/🟡/🟢 요약이 보인다
- [ ] 리포트에서 "추천 패키지"를 클릭 → 패키지 상세 → 체크아웃
- [ ] `/packages`에서 312개 카탈로그가 카테고리 필터와 함께 보인다
- [ ] 스크롤, 탭 전환, 뒤로가기 모두 네이티브 느낌이다
- [ ] Liquid Glass 효과가 실제로 보인다 (블러·굴절·그림자)
- [ ] 3분 북극성 여정이 실제로 3분 안에 완주된다 (타이머 돌려봐라)

**통과 조건**: 모든 항목 ✅  
**실패 시 액션**: 구체적 이슈를 `STATUS.md`에 기록하고 `screen-builder` 재호출.

---

## GATE 4 — Wave 4 완료 확인 (최종 MVP 게이트)

### 자동 검증
```bash
# layout-verifier 리포트 확인
test -f docs/qa/layout-report.md
jq '.issues | length' docs/qa/layout-report.json  # 0 이어야 함 (또는 명시적 예외)

# qa-reviewer 리포트 확인
test -f docs/qa/accessibility.md
test -f docs/qa/flows.md

# Lighthouse 접근성 (Tauri WebView에서는 puppeteer로 실행)
node scripts/lighthouse-a11y.js  # score ≥ 90
```

### 사람 검증
- [ ] `docs/qa/layout-report.md`에 치명 이슈(🔴) 0건
- [ ] 예외로 남겨둔 🟡 이슈는 모두 사유가 명시되어 있다
- [ ] `docs/qa/accessibility.md` WCAG AA 체크리스트 전체 통과
- [ ] `docs/qa/flows.md`에서 3분 북극성 여정이 자동 재현 성공
- [ ] **진짜 비개발자 1명에게 앱을 보여주고 관찰**: 3분 안에 "뭐하는 앱인지 알겠다"고 말함
- [ ] 같은 테스터가 "내 프로젝트 가져오면 진짜 고쳐주나요?"라고 물어본다 (= 구매 의향 신호)

### 최종 질문 (사람이 마지막으로 묻는다)
- [ ] 이 앱을 우리 부모님한테 보여줄 수 있는가?
- [ ] 카피 중에 "해킹" "털린다" 같은 공포 단어가 남발되지 않는가?
- [ ] 우리 자신이 만든 앱이 우리 교훈을 어기고 있지 않는가? (프론트에 API 키 없음, 등)

**통과 조건**: 모든 항목 ✅  
**통과 시**: 🎉 MVP 완성. `STATUS.md`에 `mvp: shipped` 기록.

---

## 게이트 실패 재시도 프로토콜

1. 실패 항목을 `STATUS.md`의 `gate_failures` 섹션에 구체적으로 기록
2. 원인 에이전트 식별 (애매하면 orchestrator가 판단)
3. 해당 에이전트 재호출 시 프롬프트에 실패 항목 명시
4. 재작업 후 같은 게이트를 다시 돌린다
5. 3회 연속 실패 시 사람이 직접 개입 (에이전트 프롬프트 수정 고려)
