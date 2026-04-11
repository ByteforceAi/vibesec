# 에지 케이스 검토

> qa-reviewer 산출물. 2026-04-11 코드 기반 검토.

---

## 1. 빈 상태 (Empty States)

### 1.1 스캔 히스토리 0건일 때

- **처리됨** - `app/src/routes/+page.svelte` line 99-108: 빈 상태 UI + "첫 진단 받기" CTA
- **처리됨** - `app/src/routes/report/+page.svelte` line 52-65: 빈 상태 UI + "첫 진단 받기" CTA
- 카피: `content/copy/empty-states.md`의 "진단 기록 없음"에서 로드

### 1.2 장바구니 비었을 때

- **처리됨** - `app/src/routes/checkout/+page.svelte` line 104-116: 빈 카트 UI + "처방 둘러보기" CTA
- 카피: `content/copy/empty-states.md`의 "장바구니 비어있음"에서 로드

### 1.3 검색 결과 0건일 때

- **처리됨** - `app/src/routes/packages/+page.svelte` line 229-235: "찾으시는 게 없어요" + 필터 초기화 버튼
- 카피: `content/copy/empty-states.md`의 "검색 결과 없음"에서 로드

### 1.4 특정 scanId가 히스토리에 없을 때

- **처리됨** - `app/src/routes/report/[scanId]/+page.svelte` line 194-206: "찾으시는 페이지가 없어요" + 진단 CTA

### 1.5 특정 package ID가 없을 때

- **처리됨** - `app/src/routes/packages/[id]/+page.svelte` line 208-217: "찾으시는 페이지가 없어요" + 패키지 목록 CTA

---

## 2. 오프라인

### 2.1 네트워크 없이 앱 실행 시 첫 진입 가능?

- **미처리** - 오프라인 감지 로직 없음. navigator.onLine 체크나 Service Worker 미구현
- **부분 처리** - localStorage 기반 데이터(스캔 히스토리, 장바구니)는 오프라인에서도 접근 가능
- **미처리** - content/copy/empty-states.md에 "오프라인 상태" 카피가 준비되어 있으나 (`t('empty_states.offline.title', '')` 등) 앱에서 사용하는 화면 없음

### 2.2 오프라인에서 스캔 시도 시?

- **미처리** - fakeScan은 로컬 데이터만 사용하므로 오프라인에서도 동작하긴 하나, 실제 스캔 엔진으로 교체 시 오프라인 에러 처리 필요
- journey.md S2 명시: "진단하려면 인터넷이 필요해요" - 미구현

### 2.3 과거 리포트 열람이 오프라인에서 가능한가?

- **처리됨** - scan.ts에서 localStorage에 최대 20건 저장 (line 67-68). 오프라인에서도 읽기 가능
- **미처리** - 오프라인임을 사용자에게 알리는 UI 없음

---

## 3. 긴 텍스트

### 3.1 매우 긴 GitHub URL 입력

- **처리됨** - report/[scanId] line 262: `word-break: break-all` 적용하여 긴 URL이 줄바꿈됨
- **처리됨** - ListRow 제목: `text-overflow: ellipsis; white-space: nowrap` (line 118-119)
- **처리됨** - 홈 화면 scan-target: `text-overflow: ellipsis` (line 190)

### 3.2 패키지 description_kr이 매우 긴 경우

- **부분 처리** - packages/[id] line 286-290: `line-height: 1.6`으로 가독성 확보하지만, 길이 제한이나 "더 보기" 없음
- content-curator가 "40자 x 3줄 이내" 규칙을 따랐다면 문제 없으나, 312개 패키지 전체 검증 필요

### 3.3 symptoms 배열에 10개 이상 있을 때

- **미처리** - packages/[id]의 symptom-list에 접기/펼치기 없음. 많은 증상이 있으면 화면이 길어짐
- 현재 content/packages 스키마상 symptoms는 보통 2~3개이므로 실질적 문제는 적음

### 3.4 패키지 이름 최대 길이

- **처리됨** - ListRow의 list-row__title에 `text-overflow: ellipsis` 적용
- content-curator가 name_kr을 7자 이내로 제한했으므로 문제 없음 (STATUS.md 확인)

---

## 4. 느린 네트워크

### 4.1 로딩 스피너가 적절한 시점에 노출?

- **부분 처리** - Button.svelte에 loading 상태 + spinner 구현 (line 49-54). 하지만 diagnose 페이지에서 Button의 loading prop을 사용하지 않고 별도 ProgressIndicator를 사용
- **미처리** - "500ms 이후 스피너 노출" 같은 딜레이 로직 없음. 스캔 시작 즉시 프로그레스 UI로 전환

### 4.2 스캔이 예상보다 오래 걸릴 때

- **처리됨** - 10개 프로그레스 메시지가 순환 표시
- **미처리** - 타임아웃 처리 없음. fakeScan에 타임아웃 로직 미구현. content/copy/errors.md에 "시간 초과" 카피가 준비되어 있으나 사용되지 않음

### 4.3 패키지 index.json(312개) 초기 로드 시간

- **처리됨** - Vite의 eager import로 빌드 타임에 번들링. 런타임 네트워크 요청 없음
- **처리됨** - IntersectionObserver로 DOM 렌더링을 20개씩 지연

---

## 5. 잘못된 입력

### 5.1 GitHub URL이 아닌 문자열

- **처리됨** - diagnose/+page.svelte의 `validateUrl`에서 정규식 검증 (line 47). URL-like 패턴 불일치 시 에러 표시
- 에러 카피: "주소 형식이 맞지 않는 것 같아요. 다시 확인해주세요"

### 5.2 존재하지 않는 레포 URL

- **미처리** - fakeScan은 URL 유효성을 검증하지 않고 항상 결과 반환. 실제 스캔 엔진에서는 처리 필요

### 5.3 사설 레포 URL

- **미처리** - 접근 불가 레포에 대한 별도 에러 처리 없음
- journey.md S2에 명시: "이 프로젝트는 비공개라 접근이 안 돼요" - 미구현

### 5.4 HTML/스크립트 삽입 시도

- **처리됨** - Svelte의 기본 텍스트 이스케이핑으로 XSS 방지. `{@html}` 사용 없음

---

## 6. 다크 모드 전환

### 6.1 런타임에 라이트/다크 전환 시 Liquid Glass가 깨지지 않는가?

- **처리됨** - app.css에서 `@media (prefers-color-scheme: dark)` 미디어 쿼리로 모든 CSS 변수 재정의. Glass 관련 변수도 다크 모드용 재설정됨 (line 85-104)
- **미처리** - 수동 테마 토글 UI 없음. OS 설정에만 의존

---

## 7. localStorage

### 7.1 localStorage 꽉 찼을 때

- **처리됨** - scan.ts line 68-71: `try/catch`로 저장 실패 무시
- **처리됨** - cart.ts line 33-37: 동일하게 `try/catch`
- **미처리** - 저장 실패 시 사용자에게 알림 없음. 조용히 실패하므로 데이터 손실 가능

### 7.2 localStorage 비활성화(시크릿 모드 등)

- **처리됨** - scan.ts line 55: `typeof localStorage === 'undefined'` 체크. undefined 시 빈 배열 반환
- **처리됨** - 앱은 localStorage 없이도 기본 동작은 가능 (데이터 영속성만 없음)

### 7.3 localStorage 데이터 손상

- **처리됨** - scan.ts line 59: JSON.parse 실패 시 빈 배열 반환
- **처리됨** - cart.ts line 27: 동일 처리

---

## 8. 반복 조작

### 8.1 뒤로가기 연타

- **미처리** - SvelteKit 기본 히스토리 관리에 의존. 스캔 중 뒤로가기 시 스캔 상태가 유지된 채로 이전 화면 표시 후, 스캔 완료 시 report로 강제 이동 시도 가능
- **미처리** - checkout에서 `goto(-1)` 타입 캐스팅 문제 (flows.md 참조)

### 8.2 같은 패키지를 여러 번 장바구니에 담기

- **처리됨** - cart.ts `addToCart` line 57-58: 이미 있으면 quantity를 1 증가. 중복 아이템 생성 없음
- **미처리** - quantity 증가에 대한 UI 피드백 없음. 사용자가 `+` 버튼을 여러 번 누르면 수량만 조용히 증가하고 시각적 확인 불가
- **미처리** - 보안 패키지 특성상 같은 패키지를 2개 이상 주문하는 것이 의미가 있는지 비즈니스 로직 미검토

### 8.3 스캔 중 다른 화면으로 이동 후 돌아오기

- **미처리** - scanState가 전역 store이므로 scanning 상태가 유지됨. diagnose 페이지로 돌아오면 프로그레스 UI가 표시되지만, fakeScan의 async 함수가 이미 실행 완료되었을 수 있음. 결과 화면으로의 goto가 다른 페이지에서 실행될 수 있음

### 8.4 진단 버튼 더블 클릭

- **미처리** - handleStartScan에 중복 실행 방지 로직 없음. 빠르게 두 번 클릭하면 두 개의 fakeScan이 병렬 실행될 수 있음

---

## 9. TabBar 일관성

### 9.1 모든 주요 화면에 TabBar가 있는가?

- 홈 (`/`): **있음**
- 진단 (`/diagnose`): **없음** - 진단 화면에는 TabBar 미배치
- 검진표 목록 (`/report`): **있음**
- 패키지 (`/packages`): **있음**
- 패키지 상세 (`/packages/[id]`): **없음** - 상세 화면이므로 정상
- 리포트 상세 (`/report/[scanId]`): **없음** - 상세 화면이므로 정상
- 체크아웃 (`/checkout`): **없음** - 결제 흐름이므로 정상
- 긴급출동 (`/incident`): **없음** - 긴급 흐름이므로 정상

### 9.2 TabBar 라벨이 한국어인가?

- **Fail** - TabBar 라벨: "Home", "Diagnose", "Report", "Packages" (모두 영어)
- journey.md 기대값: "홈", "진단", "검진표", "패키지"

---

## 요약

| 카테고리 | 처리됨 | 부분 처리 | 미처리 |
|----------|--------|----------|--------|
| 빈 상태 | 5 | 0 | 0 |
| 오프라인 | 1 | 1 | 3 |
| 긴 텍스트 | 3 | 1 | 1 |
| 느린 네트워크 | 2 | 1 | 1 |
| 잘못된 입력 | 2 | 0 | 2 |
| 다크 모드 | 1 | 0 | 1 |
| localStorage | 3 | 0 | 1 |
| 반복 조작 | 1 | 0 | 3 |
| TabBar | 0 | 0 | 1 |
| **합계** | **18** | **3** | **13** |
