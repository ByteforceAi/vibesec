# WCAG AA Accessibility Checklist

> qa-reviewer 산출물. 2026-04-11 코드 기반 검토.

---

## 1. 키보드 접근성

### 1.1 모든 인터랙티브 요소가 키보드로 접근 가능한가?

- [x] **Pass** - Button.svelte: 네이티브 `<button>` 사용, 키보드 자동 지원
- [x] **Pass** - Card.svelte: interactive 모드에서 `tabindex={0}` 부여, `onkeydown` Enter/Space 처리 (line 37-42)
- [x] **Pass** - ListRow.svelte: interactive 모드에서 `tabindex={0}` 부여, `onkeydown` Enter/Space 처리 (line 33-38)
- [x] **Pass** - TabBar.svelte: 네이티브 `<button>` 사용
- [x] **Pass** - Input.svelte: 네이티브 `<input>` 사용, Enter 키 submit 지원 (line 30-33)

### 1.2 Tab 순서가 논리적인가?

- [x] **Pass** - tabindex 남용 없음. 0 또는 -1만 사용
- [x] **Pass** - TabBar.svelte: 활성 탭은 tabindex=0, 비활성 탭은 tabindex=-1 (line 24)

### 1.3 Esc 키로 모달/시트 닫기 가능?

- [x] **Pass** - Sheet.svelte: `handleKeydown`에서 Escape 처리 (line 26-29)
- [x] **Pass** - Alert.svelte: `handleKeydown`에서 Escape 처리 (line 37-40)

### 1.4 Enter/Space로 버튼 활성화 가능?

- [x] **Pass** - Button.svelte: 네이티브 `<button>` 자동 지원
- [x] **Pass** - Card/ListRow: 커스텀 `onkeydown` 핸들러로 Enter/Space 처리

### 1.5 포커스 인디케이터가 시각적으로 명확한가?

- [x] **Pass** - app.css line 131-134: `:focus-visible` 전역 스타일 정의. `outline: 2px solid var(--color-system-blue); outline-offset: 2px;`
- [ ] **Warning** - Sheet.svelte의 close 버튼 (line 73-86): 30x30px로 focus ring이 좁은 영역에 표시됨. 포커스 가시성은 있으나 작은 타겟

---

## 2. 색 대비

### 2.1 본문 텍스트 배경 대비 4.5:1 이상?

- [x] **Pass (라이트 모드)** - `--color-label: #000000` on `--color-bg-primary: #ffffff` = 21:1 (완벽)
- [x] **Pass (다크 모드)** - `--color-label: #ffffff` on `--color-bg-primary: #000000` = 21:1 (완벽)

### 2.2 보조 텍스트 대비?

- [x] **Pass (라이트)** - `--color-label-secondary: #3c3c43cc` (약 rgba(60,60,67,0.8)). #ffffff 배경 대비 약 5.5:1
- [ ] **Warning (다크)** - `--color-label-tertiary: #ebebf54d` (rgba(235,235,245,0.3)). #000000 배경 대비 약 2.4:1 - caption/hint 텍스트에 사용됨. WCAG AA 미달 가능성

### 2.3 Liquid Glass 반투명 위의 텍스트 대비?

- [ ] **Warning** - `--glass-bg: rgba(255,255,255,0.6)` 위에 `--color-label: #000000` = 배경 투과에 따라 가변적. 밝은 배경 위에서는 OK, 어두운 배경 투과 시 대비 저하 가능
- [ ] **Warning (다크 모드)** - `--glass-bg: rgba(44,44,46,0.6)` 위에 `--color-label: #ffffff` = 동일하게 배경 투과에 따라 가변적

### 2.4 Badge 색 대비?

- [x] **Pass** - critical: `#ff3b30` 배경 + `#ffffff` 텍스트 = 4.5:1 이상
- [ ] **Fail** - warning: `#ffcc00` 배경 + `#000000` 텍스트 = 약 1.9:1. **노란색 배경에 검은 텍스트 대비 부족** (Badge.svelte line 29-33)
- [x] **Pass** - ok: `#34c759` 배경 + `#ffffff` 텍스트 = 약 3.2:1. 큰 텍스트(caption 크기)이므로 3:1 기준 통과

---

## 3. 스크린 리더

### 3.1 이미지 alt 속성?

- [x] **Pass** - 앱에 `<img>` 태그 사용 없음. 모든 아이콘은 emoji/SVG로 `aria-hidden="true"` 처리됨

### 3.2 아이콘 버튼에 aria-label?

- [ ] **Fail** - `+page.svelte` (홈) line 68-69: "긴급" 버튼에 `t('errors.general_error.title', '')` 사용 - 이 키가 "뭔가 잘못됐어요"를 반환하는데, 긴급 출동 용도와 맞지 않음. aria-label도 별도 미제공
- [ ] **Fail** - report/[scanId]/+page.svelte line 80-82: 뒤로가기 버튼 텍스트가 `<` (꺾쇠 문자). 스크린 리더가 "less than"으로 읽음. aria-label 없음
- [ ] **Fail** - packages/[id]/+page.svelte line 95-97: 동일하게 뒤로가기 `<` 문자
- [ ] **Fail** - checkout/+page.svelte line 83: 뒤로가기 `<` 문자
- [ ] **Fail** - incident/+page.svelte line 37: 뒤로가기 `<` 문자
- [ ] **Fail** - packages/[id]/+page.svelte line 199: 장바구니 담기 버튼 텍스트가 `+`. aria-label 없음
- [ ] **Fail** - checkout/+page.svelte line 134: 삭제 버튼 텍스트 `x`, aria-label은 "Remove" (영어)

### 3.3 폼 input에 label 또는 aria-label?

- [x] **Pass** - Input.svelte: `ariaLabel` prop 지원. diagnose/+page.svelte에서 `ariaLabel={inputPrompt}` 전달
- [x] **Pass** - packages/+page.svelte 검색: `ariaLabel="Search packages"` (단, 영어)

### 3.4 심각도가 색만으로 전달되지 않는가?

- [ ] **Fail** - Badge.svelte: 심각도(critical/warning/ok)가 **배경색으로만** 구분됨. 텍스트 라벨이나 아이콘이 Badge 자체에 내장되어 있지 않음
  - report/[scanId] 리스트에서 Badge 안에 `!`, `~`, `-` 문자를 넣어 부분적으로 보완했으나, 이는 직관적이지 않음
  - 패키지 목록에서는 Badge에 카테고리 약자(SE, AU 등)만 표시
  - **색맹 사용자(약 8% 남성)가 심각도를 구분할 수 없음**

### 3.5 aria-live가 스캔 진행 상태에 적용?

- [ ] **Fail** - diagnose/+page.svelte: 스캔 중 진행 메시지(`progress-message` p 태그)에 `aria-live` 미적용. 스크린 리더가 진행 상황 변경을 인지하지 못함
- [x] **Pass** - ProgressIndicator.svelte: `role="progressbar"` + `aria-valuenow` 적용
- [x] **Pass** - 에러 메시지에 `role="alert"` 적용 (diagnose/+page.svelte line 109, 113)

---

## 4. 터치 타겟

### 4.1 모든 탭 가능한 요소가 44x44pt 이상?

- [x] **Pass** - Button --md: min-height 44px
- [x] **Pass** - Button --lg: min-height 50px
- [ ] **Warning** - Button --sm: min-height 36px. 온보딩 Skip 버튼, 뒤로가기 버튼 등에 사용. 44pt 미달
- [x] **Pass** - TabBar item: min-height 44px
- [x] **Pass** - ListRow: min-height 44px
- [x] **Pass** - Input: min-height 44px
- [ ] **Fail** - packages/+page.svelte 카테고리 탭 (cat-tab): min-height 36px. 44pt 미달
- [ ] **Fail** - packages/+page.svelte 필터 칩 (filter-chip): min-height 30px. 44pt 미달
- [ ] **Fail** - checkout/+page.svelte 삭제 버튼 (remove-btn): 32x32px. 44pt 미달
- [ ] **Warning** - Sheet.svelte close 버튼: 30x30px. 44pt 미달

### 4.2 버튼 간 간격 8pt 이상?

- [x] **Pass** - 대부분의 버튼 간격이 gap: var(--space-sm) = 8px 이상

---

## 5. 모션 민감성

### 5.1 prefers-reduced-motion 반영?

- [x] **Pass** - app.css line 137-145: 전역 `prefers-reduced-motion: reduce` 미디어 쿼리. 모든 animation/transition을 0.01ms로 축소
- [x] **Pass** - 개별 컴포넌트(Button, Card, Sheet, Alert, ProgressIndicator, ListRow, TabBar, onboarding dots)에서도 개별적으로 reduced-motion 처리

### 5.2 자동재생 비디오/GIF 없음?

- [x] **Pass** - 비디오/GIF 사용 없음

---

## 6. 언어

### 6.1 html lang="ko" 설정?

- [x] **Pass** - app.html line 2: `<html lang="ko">`

---

## 7. 폼

### 7.1 label 연결?

- [ ] **Warning** - Input.svelte: 네이티브 `<label>` 대신 `aria-label`만 사용. 시각적 label이 없어 일부 보조 기술에서 연결이 약할 수 있음

### 7.2 에러 메시지 접근성?

- [x] **Pass** - diagnose/+page.svelte: 에러 메시지에 `role="alert"` 적용

---

## 요약

| 영역 | Pass | Fail | Warning |
|------|------|------|---------|
| 키보드 접근성 | 10 | 0 | 1 |
| 색 대비 | 4 | 1 | 3 |
| 스크린 리더 | 5 | 7 | 0 |
| 터치 타겟 | 5 | 3 | 2 |
| 모션 민감성 | 2 | 0 | 0 |
| 언어 | 1 | 0 | 0 |
| 폼 | 1 | 0 | 1 |
| **합계** | **28** | **11** | **7** |
