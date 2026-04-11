# 3분 북극성 여정 재현

> qa-reviewer 산출물. 2026-04-11 코드 기반 검토.
> journey.md S0~S7 + 보조 화면(패키지 카탈로그, 패키지 상세) 총 9개 스텝.

---

## 스텝 S0: 앱 실행 (예상 0:00)

**대상 화면**: `app/src/routes/+page.svelte`

**확인 사항**
- [x] 첫 진입 시 `/` 라우트가 렌더링되는가? - Yes
- [x] 최초 방문 시 `/onboarding`으로 리다이렉트되는가? - Yes. line 10-17: localStorage `vibesec_visited` 확인 후 `goto('/onboarding')`
- [x] 재방문 시 홈에 머무는가? - Yes. `vibesec_visited === 'true'`이면 리다이렉트 없음

**발견**
- Pass - 첫 방문 감지 로직이 `$effect()` 안에서 동작. localStorage 체크 후 즉시 리다이렉트
- Warning - `$effect()`는 렌더링 후 실행되므로 홈 화면이 잠깐 보였다가 온보딩으로 전환될 수 있음 (플래시 현상). journey.md의 "1~2초 스플래시" 의도와는 다름 - 별도 스플래시 화면 없음

**예상 체류 시간 vs 실제**
- 예상: 1~2초 (자동 전환)
- 실제: $effect 실행까지 1프레임 + goto 전환 시간. 사실상 즉시 전환이지만 플래시가 눈에 보일 수 있음

---

## 스텝 S1: 환영 화면 / 온보딩 (예상 0:00~0:15)

**대상 화면**: `app/src/routes/onboarding/+page.svelte`

**확인 사항**
- [x] 4단계 온보딩이 구현되어 있는가? - Yes. `steps` 배열에 4개 스텝 정의 (line 14-39)
- [x] CTA "무료 진단 받기"가 첫 화면에서 보이는가? - 아니오. 첫 스텝의 CTA는 `t('onboarding.step_1_welcome.cta', '')` = "시작하기". "무료 진단 받기"는 스텝 3의 CTA
- [x] CTA가 스크롤 없이 보이는가? - Yes. cta-area가 하단에 고정, flex 레이아웃으로 화면 내에 배치
- [x] Skip 버튼이 있는가? - Yes. 마지막 스텝 제외하고 우상단에 Skip 버튼 (line 69-73)
- [x] 온보딩 완료 시 `/diagnose`로 이동? - Yes. `finishOnboarding()` -> `goto('/diagnose')` (line 58-60)
- [x] 진행률 표시(dots)? - Yes. role="progressbar" 적용 (line 88)
- [x] P3 "지금 급한 상황이에요" 링크? - **Fail.** 온보딩에 긴급 분기 링크가 없음

**발견**
- Pass - 온보딩 4스텝 구현 깔끔. 모든 카피가 content/copy/onboarding.md에서 로드
- Fail - journey.md S1에 명시된 "지금 급한 상황이에요" P3 분기 링크가 온보딩 화면에 미구현
- Warning - Skip 버튼 텍스트가 "Skip" (영어). copy-guide.md 한국어 1급 원칙 위반
- Warning - journey.md에서 체류 시간 10~15초를 기대하지만, 4스텝을 전부 넘기려면 최소 4탭 필요. 비개발자가 Skip을 발견 못하면 30초+ 소요

**예상 체류 시간 vs 실제**
- 예상: 10~15초
- 실제: 4스텝 모두 진행 시 20~30초, Skip 사용 시 5초

---

## 스텝 S2: URL 입력 (예상 0:15~0:30)

**대상 화면**: `app/src/routes/diagnose/+page.svelte`

**확인 사항**
- [x] URL 입력란이 화면 중앙에 배치? - Yes. `justify-content: center` (line 178)
- [x] 플레이스홀더가 안내 역할? - Yes. "github.com/my-project" (line 103)
- [x] 빈 값 제출 시 에러? - Yes. `validateUrl`에서 빈 값 처리 (line 42-44)
- [x] 잘못된 URL 에러? - Yes. 정규식 검증 후 에러 표시 (line 46-49)
- [x] "진단 시작" 버튼이 빈 입력 시 비활성화? - Yes. `disabled={!url.trim()}` (line 125)
- [x] 안심 문구("코드를 저장하지 않아요") 표시? - Yes. line 117-118에 safety-note 노출

**발견**
- Pass - URL 입력 흐름이 journey.md S2 스펙과 일치
- Warning - 플레이스홀더가 "github.com/my-project" (영어). 비개발자에게 더 친절한 한국어 예시가 필요할 수 있음. journey.md는 "깃허브 주소나 사이트 주소를 붙여넣으세요"를 기대
- Warning - 안심 문구(safety-note)가 hint와 동일한 텍스트를 재사용 (`t('diagnosis.url_input_prompt.hint', '')`). diagnosis.md에서 hint = "깃허브 주소나 배포된 사이트 주소 모두 가능해요"인데, journey.md 기대값은 "코드를 저장하지 않아요"
- Pass - URL 정규식이 github.com, .com/.io/.dev 등 다양한 도메인 허용. 비개발자가 "https://" 없이 붙여넣어도 자동 보완 (line 60-63)

**예상 체류 시간 vs 실제**
- 예상: 10~15초
- 실제: URL 붙여넣기 + 버튼 탭 = 10초 이내 가능

---

## 스텝 S3: 진단 중 (예상 0:30~1:30)

**대상 화면**: `app/src/routes/diagnose/+page.svelte` (scanning 상태)

**확인 사항**
- [x] 프로그레스 바 표시? - Yes. circular + linear ProgressIndicator 모두 표시 (line 145-157)
- [x] 단계별 메시지가 바뀌는가? - Yes. `progressMessages`에서 10개 변주 로드, `onProgress` 콜백으로 갱신
- [x] 60초 이내 완료? - Yes. fake-scanner.ts의 총 지연 = (300~700ms) x 10단계 + 500ms = 약 3.5~7.5초
- [x] 완료 후 자동으로 report로 이동? - Yes. `goto(/report/${result.scanId})` (line 73)

**발견**
- Pass - 스캔 시뮬레이션이 3~8초로 체감상 적절. 10개 카피 메시지가 순차 노출
- Pass - 진단 실패 시 에러 메시지 + 재시도 버튼 구현
- Warning - 스캔 중 "뒤로가기" 처리가 없음. 사용자가 브라우저 뒤로가기를 누르면 스캔이 백그라운드에서 계속 진행되고, 완료 시 report로 goto 시도할 수 있음
- Warning - 오프라인 상태 감지가 없음. journey.md S3에 명시된 "인터넷이 끊겼어요" 메시지 미구현

**예상 체류 시간 vs 실제**
- 예상: 30~60초
- 실제: 3~8초 (mock이므로 정상)

---

## 스텝 S4: 건강검진표 (예상 1:30~2:00)

**대상 화면**: `app/src/routes/report/[scanId]/+page.svelte`

**확인 사항**
- [x] 요약 카드 (critical/warning/ok 개수)? - Yes. summary-badges 섹션 (line 92-105)
- [x] 항목 리스트 심각도순 정렬? - Yes. fake-scanner.ts에서 severity 기준 정렬 (line 151)
- [x] 각 항목 클릭 시 상세 Sheet? - Yes. `openFinding` -> Sheet 컴포넌트 (line 166-193)
- [x] "추천 처방 보기" CTA? - 부분적. 추천 패키지 섹션이 바로 아래에 표시됨. 별도 CTA 탭 없이 스크롤로 접근
- [x] 스캔 결과 없을 때 처리? - Yes. not-found 섹션에서 에러 안내 + CTA (line 195-206)

**발견**
- Pass - 요약 배지 + 항목 리스트 + 추천 패키지가 한 화면에 통합
- Warning - journey.md S4와 S5를 한 라우트에서 처리. S5 "추천 처방"이 별도 화면이 아닌 하단 섹션. UX상 괜찮지만 journey.md 명세와 다소 차이
- Warning - Badge에 심각도 텍스트 라벨이 있으나 (`급해요`, `조심해요`, `괜찮아요` 식 텍스트), 이는 Badge 옆의 badge-label span에만 있음. 항목 리스트의 각 Finding에는 `!`, `~`, `-` 기호만 사용. P1 페르소나가 이 기호의 의미를 직관적으로 이해하기 어려울 수 있음
- Fail - Finding 상세 Sheet에서 severity가 영어 원문("critical", "high", "medium" 등)으로 노출됨 (line 170). copy-guide 금지어는 아니지만, 비개발자에게 "critical"은 낯선 단어

**예상 체류 시간 vs 실제**
- 예상: 20~30초
- 실제: 항목 수에 따라 다름. 5~12개 항목 + 추천 패키지까지 20~40초

---

## 스텝 S5: 추천 처방 (예상 2:00~2:30)

**대상 화면**: `app/src/routes/report/[scanId]/+page.svelte` (하단 섹션)

**확인 사항**
- [x] 추천 패키지 카드 1~5개? - Yes. `recommendedPkgs` 최대 5개 (line 37)
- [x] 패키지 이름 + 가격 표시? - Yes. name_kr + formatPrice (line 140-143)
- [x] "접수하기" 버튼? - Yes. 하단에 checkout CTA (line 152-154)
- [x] "전체 패키지 둘러보기" 링크? - Yes. ghost 버튼으로 `/packages` 이동 (line 157-159)
- [x] 장바구니에 담기? - Yes. `+` 버튼으로 addToCart (line 144-145)

**발견**
- Pass - 추천 패키지가 스캔 결과 기반으로 자동 생성
- Warning - 장바구니 담기 버튼이 `+` 한 글자. 비개발자에게 이것이 "장바구니 담기"임을 직관적으로 알기 어려움. aria-label도 없음
- Warning - 묶음 할인 표시가 미구현. journey.md S5에 "같이 하면 N% 할인" 명시되어 있으나 코드에 없음

**예상 체류 시간 vs 실제**
- 예상: 20~30초
- 실제: 패키지 카드 읽기 + 담기/접수 = 15~25초

---

## 스텝 S6: 접수/결제 (예상 2:30~3:00)

**대상 화면**: `app/src/routes/checkout/+page.svelte`

**확인 사항**
- [x] 선택한 패키지 요약 표시? - Yes. cart items 리스트 (line 120-143)
- [x] 총 금액 표시? - Yes. total-section (line 146-153)
- [x] 결제 버튼 (모킹)? - Yes. handleMockPayment (line 63-66)
- [x] "카톡으로 상담하기" 대안 버튼? - Yes. handleKakaoConsult (line 69-72)
- [x] "30일 A/S 보증" 안내? - Yes. warranty-text (line 156)
- [x] 장바구니 비었을 때 처리? - Yes. empty 상태 UI (line 104-116)
- [x] 결제 완료 상태? - Yes. orderComplete 시 완료 화면 (line 91-103)
- [x] 항목 삭제 확인? - Yes. Alert 컴포넌트로 삭제 확인 (line 174-183)

**발견**
- Pass - 체크아웃 플로우가 journey.md S6 스펙과 잘 일치
- Warning - 뒤로가기 버튼에서 `goto(-1 as unknown as string)` 사용 (line 83). 타입 캐스팅이 불안정하고, SvelteKit의 goto는 숫자를 지원하지 않을 수 있음. 런타임 에러 가능성
- Warning - Alert의 OK/Cancel 버튼 텍스트가 영어 (line 179-180). 한국어 1급 원칙 위반
- Pass - 삭제 확인 메시지는 content/copy/checkout.md에서 한국어로 로드

**예상 체류 시간 vs 실제**
- 예상: 30~60초
- 실제: 확인 + 결제 탭 = 15~30초 (모킹이므로 빠름)

---

## 스텝 S7: 긴급출동 (P3 전용)

**대상 화면**: `app/src/routes/incident/+page.svelte`

**확인 사항**
- [x] 큰 제목 "괜찮아요, 도와드릴게요"? - 부분적. `t('errors.general_error.body', '')` 사용. errors.md에서 general_error.body = "예상치 못한 문제가 생겼어요. 잠시 후 다시 시도해주세요." - **journey.md 기대 카피와 완전히 다름**
- [x] 증상 선택 5개? - Yes. 5개 증상 (billing, data, site, account, other)
- [ ] **Fail** - 증상 라벨이 영어 ID로 표시. line 80: `{symptom.id}` = "billing", "data", "site", "account", "other". **한국어 라벨 미구현**. journey.md 기대값: "요금이 이상해요", "데이터가 사라졌어요" 등
- [x] 선택 후 CTA 활성화? - Yes. `disabled={!selectedSymptom}` (line 103, 112)
- [x] 카톡 상담 CTA? - Yes. line 98-106
- [ ] **Fail** - 응급 안내("카드사에 전화해서 결제를 막아두세요")가 조건부로 표시되지 않음. emergency-tip에 `t('errors.network_error.body', '')` = "인터넷이 잠깐 끊긴 것 같아요" 를 사용 중 - **완전히 잘못된 카피**

**발견**
- Fail - incident 페이지의 카피가 errors.md의 일반 에러 메시지를 재사용하여 긴급 상황과 맥락이 맞지 않음
- Fail - 증상 라벨이 영어 ID 그대로 노출. content/copy에 incident 전용 카피 파일이 없음
- Warning - 홈 화면에서 긴급 버튼이 "destructive" 스타일(빨간색)으로 배치되어 있으나, 버튼 텍스트가 `t('errors.general_error.title', '')` = "뭔가 잘못됐어요". 긴급출동 의도와 맞지 않는 카피

**예상 체류 시간 vs 실제**
- 예상: 15~20초
- 실제: 증상을 영어로 이해해야 해서 P3 페르소나는 혼란스러울 가능성 높음

---

## 보조 화면: 패키지 카탈로그

**대상 화면**: `app/src/routes/packages/+page.svelte`

**확인 사항**
- [x] 8개 카테고리 탭? - Yes. categories 배열에 ALL + 8개 (line 20-30)
- [x] 가격 필터? - Yes. 4개 가격대 (line 34-39)
- [x] 심각도 필터? - Yes. all/critical/warning/ok (line 193-224)
- [x] 검색? - Yes. searchQuery 기반 필터 (line 58-65)
- [x] 312개 패키지 로딩? - Yes. IntersectionObserver로 lazy loading (line 96-113)
- [x] 빈 결과 처리? - Yes. empty-results UI (line 229-235)

**발견**
- Warning - 카테고리 탭 라벨이 영어 ("Secrets", "Auth", "Data" 등). journey.md 기대값은 비개발자 이름: "비밀 보관소", "출입 관리", "금고 관리" 등
- Warning - 가격 필터 라벨이 영어/숫자만 ("All", "Free", "~10", "~30", "30+"). 한국어 라벨 없음
- Warning - Toolbar 제목이 "Packages" (영어, line 151)
- Pass - IntersectionObserver 기반 lazy loading으로 312개 패키지 성능 처리

---

## 보조 화면: 패키지 상세

**대상 화면**: `app/src/routes/packages/[id]/+page.svelte`

**확인 사항**
- [x] 패키지 이름 + 설명? - Yes. name_kr, subtitle_kr, description_kr
- [x] 증상 목록? - Yes. symptoms 배열 렌더 (line 129-139)
- [x] 작업 내용? - Yes. includes 배열 렌더 (line 145-157)
- [x] 가격 + 접수 버튼? - Yes. cta-section (line 193-206)
- [x] 보증 배지? - Yes. warranty_days 표시 (line 161-169)
- [x] 관련 패키지? - Yes. 같은 카테고리 패키지 3개 (line 173-189)

**발견**
- Warning - 장바구니 담기 버튼 텍스트가 `+` 한 글자 (line 199). 비개발자에게 의미 불명확
- Warning - "바로 구매" 버튼 텍스트가 `t('checkout.payment_method.card_payment', '')` = "카드로 접수하기". 맥락에 맞지 않음 (여기서는 "바로 접수하기"가 적절)
- Pass - 패키지 데이터가 content/packages/**/*.json에서 glob import로 로드

---

## 3분 여정 전체 타이밍 분석

| 스텝 | 예상 | 코드 기반 실제 | 판정 |
|------|------|---------------|------|
| S0 앱 실행 | 1~2초 | ~0.5초 (스플래시 없음) | Warning |
| S1 온보딩 | 10~15초 | Skip 시 5초, 전체 시 25초 | Pass (Skip 가능) |
| S2 URL 입력 | 10~15초 | 5~10초 | Pass |
| S3 진단 중 | 30~60초 | 3~8초 (mock) | Pass |
| S4 건강검진표 | 20~30초 | 20~40초 | Pass |
| S5 추천 처방 | 20~30초 | 15~25초 (S4와 통합) | Pass |
| S6 접수/결제 | 30~60초 | 15~30초 | Pass |
| **합계** | **~180초** | **~70~140초** | **Pass** |

3분 여정은 mock 스캐너 기반으로 충분히 달성 가능. 실제 스캔 엔진이 붙으면 S3 단계에서 시간이 늘어날 수 있으나 현재 MVP에서는 문제 없음.

---

## 전체 판정

| 항목 | 상태 |
|------|------|
| 흐름 연결성 (모든 스텝 간 goto 연결) | Pass |
| 3분 내 완료 가능 | Pass |
| P1 페르소나 여정 | Pass (Warning 있음) |
| P2 페르소나 여정 | Pass (Warning 있음) |
| P3 페르소나 여정 | **Fail** (incident 페이지 카피 문제) |
| 카피 한국어 1급 | **Fail** (다수 영어 UI 잔존) |
