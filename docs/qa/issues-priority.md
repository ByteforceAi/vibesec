# QA Issues -- Priority List

> qa-reviewer 산출물. 2026-04-11.
> 세 리뷰 문서(accessibility.md, flows.md, edge-cases.md)에서 발견된 이슈를 우선순위별로 정리.

---

## CRITICAL (MVP 출시 차단)

### ISSUE-001: incident 페이지 증상 라벨이 영어 ID로 노출

- **Source**: `docs/qa/flows.md` S7, `app/src/routes/incident/+page.svelte` line 80
- **Impact**: P3 페르소나("이미 털린 사람")가 새벽에 긴급 도움을 받으러 왔는데 증상 선택이 "billing", "data", "site", "account", "other"로 표시됨. 한국어를 기대하는 비개발자에게 즉시 이탈 유발. P3 여정 완전 차단.
- **Fix hint**: incident 전용 카피를 `content/copy/incident.md`에 추가하고, symptoms 배열의 각 id를 i18n key로 매핑하여 한국어 라벨 로드. journey.md 기대값: "요금이 이상해요", "데이터가 사라졌어요", "사이트가 이상해요", "계정이 털린 것 같아요", "기타"
- **담당**: screen-builder + content-curator
- **Estimated effort**: 1시간

### ISSUE-002: incident 페이지 핵심 카피가 잘못된 키 사용

- **Source**: `docs/qa/flows.md` S7, `app/src/routes/incident/+page.svelte` line 64, 93
- **Impact**: 긴급 페이지 제목이 `t('errors.general_error.body', '')` = "예상치 못한 문제가 생겼어요..."로 표시. journey.md 기대값 "괜찮아요, 도와드릴게요"와 완전 불일치. 응급 안내 영역도 네트워크 에러 카피 사용 중. P3 사용자가 공감 없이 이탈.
- **Fix hint**: incident 전용 카피 파일 생성. 또는 기존 카피에 incident 섹션 추가. 제목 = "괜찮아요, 도와드릴게요", 응급 안내 = "카드사에 전화해서 결제를 막아두세요" (billing 선택 시 조건부)
- **담당**: screen-builder + content-curator
- **Estimated effort**: 1시간

### ISSUE-003: 뒤로가기 버튼에 스크린 리더 접근성 없음 (5곳)

- **Source**: `docs/qa/accessibility.md` 3.2
- **Impact**: 5개 화면(report/[scanId], packages/[id], checkout, incident, report 목록에서 back)의 뒤로가기 버튼이 `<` 문자만 사용. 스크린 리더가 "less than"으로 읽음. 시각장애 사용자 탐색 불가.
- **Fix hint**: 각 Button에 `ariaLabel="뒤로가기"` 추가. 또는 SVG 화살표 아이콘으로 교체하고 aria-label 부여.
  - `app/src/routes/report/[scanId]/+page.svelte` line 81
  - `app/src/routes/packages/[id]/+page.svelte` line 96
  - `app/src/routes/checkout/+page.svelte` line 83
  - `app/src/routes/incident/+page.svelte` line 37
- **담당**: screen-builder
- **Estimated effort**: 30분

### ISSUE-004: 심각도 Badge가 색에만 의존하여 색맹 사용자 배제

- **Source**: `docs/qa/accessibility.md` 3.4, WCAG 1.4.1 "Use of Color"
- **Impact**: Badge.svelte에서 심각도를 배경색으로만 구분. 색맹 사용자 약 8%가 critical/warning/ok를 구별 불가. WCAG AA 위반.
- **Fix hint**: Badge 컴포넌트에 severity별 기본 텍스트/아이콘 내장. 예: critical = "!" + "급해요", warning = "~" + "조심", ok = "v" + "안전". 또는 Badge에 시각적 형태 차이(삼각형/원/체크) 추가.
  - `app/src/lib/components/Badge.svelte`
- **담당**: design-system-engineer
- **Estimated effort**: 1.5시간

---

## WARNING (출시 후 빠르게 수정)

### ISSUE-005: TabBar 라벨이 모두 영어

- **Source**: `docs/qa/edge-cases.md` 9.2, `docs/qa/flows.md` 보조 화면
- **Impact**: "Home", "Diagnose", "Report", "Packages" -- 비개발자가 매일 보는 네비게이션에 영어만 사용. CLAUDE.md 한국어 1급 원칙 위반.
- **Fix hint**: TabBar items 정의를 한국어로 변경. journey.md 기대값: 홈, 진단, 검진표, 패키지. 모든 라우트 파일에서 tabs 배열 업데이트 필요.
  - `app/src/routes/+page.svelte` line 22-26
  - `app/src/routes/report/+page.svelte` line 21-26
  - `app/src/routes/packages/+page.svelte` line 137-142
- **담당**: screen-builder
- **Estimated effort**: 30분

### ISSUE-006: 패키지 카탈로그 카테고리 탭이 영어

- **Source**: `docs/qa/flows.md` 보조 화면, `app/src/routes/packages/+page.svelte` line 20-30
- **Impact**: "Secrets", "Auth", "Data" 등 영어 카테고리명. journey.md 기대값: "비밀 보관소", "출입 관리" 등. P1 페르소나 블랙리스트에 "Authentication"이 있는데, "Auth"도 이해 불가.
- **Fix hint**: categories 배열의 label을 한국어로 변경. journey.md 패키지 카탈로그 참조: 비밀 보관소, 출입 관리, 금고 관리, 울타리 관리, 침입 방지, 건물 관리, 감시 카메라, 긴급출동. 가격 필터도 한국어로.
- **담당**: screen-builder
- **Estimated effort**: 30분

### ISSUE-007: 온보딩 Skip 버튼이 영어

- **Source**: `docs/qa/flows.md` S1, `app/src/routes/onboarding/+page.svelte` line 71
- **Impact**: 비개발자 사용자에게 "Skip"이 직관적이지 않을 수 있음. 한국어 1급 원칙 위반.
- **Fix hint**: "건너뛰기"로 변경. i18n 키 사용 권장.
- **담당**: screen-builder
- **Estimated effort**: 10분

### ISSUE-008: Warning Badge 색 대비 부족 (WCAG AA 미달)

- **Source**: `docs/qa/accessibility.md` 2.4
- **Impact**: warning severity Badge의 `#ffcc00` 배경 + `#000000` 텍스트 대비가 약 1.9:1. WCAG AA 최소 4.5:1 (소형 텍스트) 미달. 노란 Badge의 내용을 읽기 어려움.
- **Fix hint**: Badge.svelte의 severityTextColor.warning을 더 어두운 색(`#5a4a00` 등)으로 변경하거나, 배경을 더 어두운 노란색(`#b59000`)으로 조정.
  - `app/src/lib/components/Badge.svelte` line 30
- **담당**: design-system-engineer
- **Estimated effort**: 30분

### ISSUE-009: 스캔 진행 메시지에 aria-live 미적용

- **Source**: `docs/qa/accessibility.md` 3.5
- **Impact**: 스크린 리더 사용자가 스캔 중 진행 상황 변경을 인지하지 못함.
- **Fix hint**: `app/src/routes/diagnose/+page.svelte`의 `.progress-message` p 태그에 `aria-live="polite"` 추가.
- **담당**: screen-builder
- **Estimated effort**: 5분

### ISSUE-010: 온보딩에 P3 긴급 분기 링크 누락

- **Source**: `docs/qa/flows.md` S1, journey.md S1 P3 전용 분기
- **Impact**: P3 페르소나("이미 털린 사람")가 온보딩에서 긴급 진입점을 찾을 수 없음. 4스텝 온보딩을 모두 지나야 함.
- **Fix hint**: 온보딩 하단에 "지금 급한 상황이에요" 텍스트 링크 추가, 탭 시 `/incident`로 goto.
  - `app/src/routes/onboarding/+page.svelte`
- **담당**: screen-builder
- **Estimated effort**: 20분

### ISSUE-011: 장바구니 담기 버튼이 "+" 한 글자 (2곳)

- **Source**: `docs/qa/flows.md` S5, `docs/qa/accessibility.md` 3.2
- **Impact**: 비개발자가 `+`가 "장바구니 담기"라는 것을 직감적으로 이해하기 어려움. aria-label도 없어 스크린 리더 접근성 위반.
- **Fix hint**: "담기" 또는 장바구니 아이콘 + aria-label="장바구니에 담기" 추가.
  - `app/src/routes/report/[scanId]/+page.svelte` line 144
  - `app/src/routes/packages/[id]/+page.svelte` line 199
- **담당**: screen-builder
- **Estimated effort**: 20분

### ISSUE-012: checkout 뒤로가기의 goto(-1) 타입 안전성

- **Source**: `docs/qa/flows.md` S6, `app/src/routes/checkout/+page.svelte` line 83
- **Impact**: `goto(-1 as unknown as string)` -- SvelteKit의 goto 함수는 문자열 경로만 받음. `-1`을 `as unknown as string`으로 캐스팅하여 런타임 에러 가능성. 뒤로가기가 안 되면 사용자 갇힘.
- **Fix hint**: `history.back()` 사용 또는 `goto('/report')` 등 명시적 경로 지정.
- **담당**: screen-builder
- **Estimated effort**: 10분

### ISSUE-013: checkout Alert 버튼 텍스트 영어 ("OK", "Cancel")

- **Source**: `docs/qa/flows.md` S6, `app/src/routes/checkout/+page.svelte` line 179-180
- **Impact**: 삭제 확인 Alert의 OK/Cancel 버튼이 영어. 한국어 1급 원칙 위반.
- **Fix hint**: "확인" / "취소"로 변경.
- **담당**: screen-builder
- **Estimated effort**: 5분

### ISSUE-014: 터치 타겟 44pt 미달 (3곳)

- **Source**: `docs/qa/accessibility.md` 4.1
- **Impact**: 카테고리 탭(36px), 필터 칩(30px), 삭제 버튼(32px)이 44pt 최소 터치 타겟 미달. 터치 정확도 낮은 사용자(노인, 운동 장애)에게 조작 어려움.
- **Fix hint**:
  - `app/src/routes/packages/+page.svelte` .cat-tab: min-height를 44px로
  - `app/src/routes/packages/+page.svelte` .filter-chip: min-height를 44px로
  - `app/src/routes/checkout/+page.svelte` .remove-btn: 44x44px으로
- **담당**: screen-builder + design-system-engineer
- **Estimated effort**: 30분

---

## NICE-TO-HAVE (백로그)

### ISSUE-015: 첫 방문 시 홈 화면 플래시 후 온보딩 전환

- **Source**: `docs/qa/flows.md` S0
- **Impact**: $effect가 렌더 후 실행되므로 홈 화면이 1프레임 보인 후 온보딩 전환. 사소하지만 첫 인상에 영향.
- **Fix hint**: SvelteKit의 load 함수에서 서버사이드 리다이렉트 또는 `+page.ts`에서 redirect 처리. 또는 스플래시 오버레이 추가.
- **담당**: screen-builder
- **Estimated effort**: 30분

### ISSUE-016: Liquid Glass 위 텍스트 대비 보장 불확실

- **Source**: `docs/qa/accessibility.md` 2.3
- **Impact**: glass-bg(rgba 60% 투명)의 특성상 배경 색에 따라 대비가 가변적. 대부분 상황에서는 OK이나 극단적 배경 투과 시 대비 저하 가능.
- **Fix hint**: Glass 카드 내 텍스트에 `text-shadow: 0 0 4px rgba(255,255,255,0.5)` (라이트) 또는 그림자 추가로 가독성 보강.
- **담당**: design-system-engineer
- **Estimated effort**: 1시간

### ISSUE-017: Finding 상세 Sheet에서 severity 영어 원문 노출

- **Source**: `docs/qa/flows.md` S4
- **Impact**: Sheet에서 Badge 안에 "critical", "high", "medium" 등 영어 severity가 노출됨. 비개발자에게 낯선 용어.
- **Fix hint**: severity를 한국어 매핑. critical/high -> "급해요", medium -> "조심해요", low/info -> "괜찮아요".
  - `app/src/routes/report/[scanId]/+page.svelte` line 170
- **담당**: screen-builder
- **Estimated effort**: 15분

### ISSUE-018: 묶음 할인 표시 미구현

- **Source**: `docs/qa/flows.md` S5, journey.md S5
- **Impact**: "같이 하면 N% 할인" 표시가 없음. 전환율에 영향을 줄 수 있으나 MVP 차단은 아님.
- **Fix hint**: 장바구니에 2개 이상일 때 할인 로직 + UI 추가.
- **담당**: screen-builder
- **Estimated effort**: 2시간

### ISSUE-019: 오프라인 감지 및 안내 UI 미구현

- **Source**: `docs/qa/edge-cases.md` 2.1-2.3
- **Impact**: PROJECT.md 기술 제약 "오프라인 우선" 미충족. content/copy/empty-states.md에 카피가 준비되어 있으나 사용되지 않음.
- **Fix hint**: navigator.onLine 감지 + 온/오프라인 전환 이벤트 리스너. 오프라인 시 toast 또는 banner 표시.
- **담당**: screen-builder
- **Estimated effort**: 2시간

### ISSUE-020: 스캔 중 뒤로가기/화면 이탈 시 비정상 동작

- **Source**: `docs/qa/edge-cases.md` 8.1, 8.3
- **Impact**: async fakeScan이 완료되면 goto가 다른 페이지에서 실행될 수 있음. UX 혼란.
- **Fix hint**: AbortController 패턴 또는 scanState의 status를 체크하여 현재 페이지가 /diagnose가 아니면 goto 호출 방지.
- **담당**: screen-builder
- **Estimated effort**: 1시간

### ISSUE-021: 진단 버튼 더블 클릭 방지 없음

- **Source**: `docs/qa/edge-cases.md` 8.4
- **Impact**: 빠른 더블 클릭으로 fakeScan 두 개가 병렬 실행될 수 있음.
- **Fix hint**: handleStartScan 시작 시 scanning 상태 체크 또는 버튼의 loading prop 활용.
- **담당**: screen-builder
- **Estimated effort**: 10분

### ISSUE-022: Packages 페이지 Toolbar 제목 영어 ("Packages")

- **Source**: `docs/qa/flows.md` 보조 화면, `app/src/routes/packages/+page.svelte` line 151
- **Impact**: 한국어 1급 원칙 위반. "패키지" 또는 "처방 목록"으로 변경 필요.
- **Fix hint**: i18n 키 사용 또는 직접 한국어 문자열.
- **담당**: screen-builder
- **Estimated effort**: 5분

### ISSUE-023: 다크 모드 label-tertiary 대비 부족

- **Source**: `docs/qa/accessibility.md` 2.2
- **Impact**: `--color-label-tertiary`가 다크 모드에서 약 2.4:1 대비. caption/hint 텍스트에 사용되므로 가독성 저하.
- **Fix hint**: 다크 모드 `--color-label-tertiary`를 `#ebebf57a` (약 4.5:1) 정도로 올리기.
  - `app/src/app.css` line 89
- **담당**: design-system-engineer
- **Estimated effort**: 10분

### ISSUE-024: 패키지 상세 장바구니 담기 시 수량 증가 피드백 없음

- **Source**: `docs/qa/edge-cases.md` 8.2
- **Impact**: 같은 패키지를 여러 번 담으면 수량만 조용히 증가. 사용자가 담겼는지 확인 불가.
- **Fix hint**: addToCart 호출 후 toast 또는 Badge 카운트 애니메이션 표시.
- **담당**: screen-builder
- **Estimated effort**: 1시간

### ISSUE-025: checkout 삭제 버튼 aria-label이 영어 ("Remove")

- **Source**: `docs/qa/accessibility.md` 3.2, `app/src/routes/checkout/+page.svelte` line 134
- **Impact**: 스크린 리더가 "Remove"로 읽음. 한국어 기대.
- **Fix hint**: aria-label="삭제"로 변경.
- **담당**: screen-builder
- **Estimated effort**: 5분

### ISSUE-026: 검색 Input aria-label이 영어 ("Search packages")

- **Source**: `docs/qa/accessibility.md` 3.3, `app/src/routes/packages/+page.svelte` line 161
- **Impact**: 스크린 리더 접근성은 확보되나 영어.
- **Fix hint**: "패키지 검색"으로 변경.
- **담당**: screen-builder
- **Estimated effort**: 5분

### ISSUE-027: 타임아웃 처리 미구현

- **Source**: `docs/qa/edge-cases.md` 4.2
- **Impact**: 실제 스캔 엔진 연동 시 타임아웃 처리 필요. content/copy/errors.md에 "시간 초과" 카피 준비됨.
- **Fix hint**: fakeScan에 Promise.race로 타임아웃 래퍼 추가.
- **담당**: screen-builder
- **Estimated effort**: 30분

---

## 통계 요약

| 우선순위 | 이슈 수 |
|---------|---------|
| CRITICAL | 4 |
| WARNING | 10 |
| NICE-TO-HAVE | 13 |
| **합계** | **27** |

## MVP 게이트 판정

CRITICAL 이슈 4건이 존재하므로 **MVP 출시 차단** 상태.

핵심 차단 사유:
1. P3 페르소나의 긴급출동 여정이 작동하지 않음 (ISSUE-001, ISSUE-002)
2. 스크린 리더 접근성 위반 (ISSUE-003, ISSUE-004)

ISSUE-001, ISSUE-002는 함께 수정 가능 (incident 카피 전면 교체, 약 1시간).
ISSUE-003은 aria-label 추가로 30분 이내 수정 가능.
ISSUE-004는 Badge 컴포넌트 수정으로 1.5시간 이내 수정 가능.

**총 예상 차단 해소 시간: 약 3시간**
