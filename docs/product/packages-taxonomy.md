# 패키지 분류 체계 (Packages Taxonomy)

> product-strategist 산출물. content-curator가 이 문서를 설계도로 삼아 312개 패키지를 만듭니다.
> 모든 카테고리명과 증상명은 비개발자 언어로 작성되어 있습니다.

---

## 전체 구조 요약

```
바이브코딩 보안센터 패키지 카탈로그 (312개)
|
+-- 1. 비밀 보관소 (SECRETS) ............. ~40개
+-- 2. 출입 관리 (AUTH) .................. ~40개
+-- 3. 금고 관리 (DATA) .................. ~40개
+-- 4. 울타리 관리 (NETWORK) ............. ~40개
+-- 5. 침입 방지 (INJECTION) ............. ~40개
+-- 6. 건물 관리 (INFRA) ................. ~35개
+-- 7. 감시 카메라 (MONITOR) ............. ~35개
+-- 8. 긴급출동 (RESPONSE) ............... ~40개
```

---

## 가격 사다리 (전 카테고리 공통)

| 가격대 | 역할 | 이 가격대가 존재하는 이유 |
|--------|------|--------------------------|
| 무료 | 진입/체험 | 부담 없이 진단받게 해서 신뢰를 쌓는다 |
| 3~9만원 | 단일 증상 수리 | "이것 하나만 고치면 돼요"인 경우 |
| 10~19만원 | 영역 패키지 | 한 분야를 통째로 점검+수리 |
| 30~50만원 | 풀 감사 | 전체 건강검진. P2 창업자의 주요 선택지 |
| 80만원+ | 긴급/복구 | P3 "털린 사람"용. 즉시 대응 |
| 월 19만원+ | 구독 | 매달 정기 점검. 단골 관리 계약 |

각 카테고리 내에서 이 6단계가 반복됩니다. 즉 8 x 6 = 48개 기본 골격에 증상별 변주와 번들이 더해져 312개가 됩니다.

---

## 1. 비밀 보관소 (SECRETS)

**개발자 용어**: API 키, 환경변수, 시크릿 노출
**비개발자 설명**: 가게 비밀번호를 어디에 보관하느냐의 문제예요. 문 앞에 붙여놨으면 누구나 들어올 수 있어요.
**왜 이 카테고리가 있나**: 바이브코딩으로 만든 앱의 가장 흔한 사고가 "비밀번호(키)가 그대로 노출된 것"이에요. 특히 OpenAI, Supabase 키가 코드에 그대로 남아 있는 경우가 많아요.

### 하위 증상 목록

| # | 증상 (비개발자 언어) | 심각도 | 패키지 후보 이름 |
|---|---------------------|--------|-----------------|
| 1 | OpenAI 키가 코드에 그대로 보여요 | :red_circle: | KEY RESCUE |
| 2 | Supabase 비밀번호가 코드에 들어있어요 | :red_circle: | KEY RESCUE |
| 3 | Stripe 결제 키가 노출돼 있어요 | :red_circle: | KEY RESCUE PRO |
| 4 | 깃허브에 비밀번호 파일이 올라갔어요 | :red_circle: | GIT CLEAN |
| 5 | 비밀번호 파일이 있는지 모르겠어요 | :yellow_circle: | SECRET SCAN |
| 6 | 키가 여러 곳에 복사돼 있어요 | :yellow_circle: | KEY ORGANIZE |
| 7 | 오래된 키를 바꾼 적이 없어요 | :yellow_circle: | KEY REFRESH |
| 8 | 키를 팀원과 카톡으로 공유했어요 | :yellow_circle: | KEY SAFE SHARE |
| 9 | 어떤 키가 있는지 목록이 없어요 | :yellow_circle: | KEY INVENTORY |
| 10 | 테스트용 키와 실제 키가 섞여 있어요 | :yellow_circle: | KEY SEPARATOR |
| 11 | 키가 만료되면 알림이 안 와요 | :green_circle: | KEY WATCH |
| 12 | 비밀번호 보관 방법을 모르겠어요 | :green_circle: | SECRET GUIDE |
| 13 | 배포할 때 키가 제대로 들어가는지 불안해요 | :green_circle: | DEPLOY CHECK |
| 14 | 외부 서비스 키가 너무 많아요 | :green_circle: | KEY DASHBOARD |
| 15 | 키 관리 자동화하고 싶어요 | :green_circle: | KEY AUTO |

### 가격대별 패키지 변주

- **무료**: SECRET SCAN BASIC (키 노출 여부만 확인)
- **39,000원**: SECRET SCAN (전체 코드 비밀번호 탐색)
- **89,000원**: KEY RESCUE (노출 키 즉시 회수 + 교체)
- **149,000원**: SECRET VAULT (비밀번호 보관소 구축)
- **350,000원**: SECRET FULL AUDIT (전체 비밀 관리 감사)
- **890,000원**: SECRET 911 (키 유출 긴급 대응)
- **월 49,000원**: SECRET WATCH (매주 키 노출 모니터링)

---

## 2. 출입 관리 (AUTH)

**개발자 용어**: 로그인, 세션, JWT, OAuth
**비개발자 설명**: 누가 우리 가게에 들어올 수 있는지, 손님인지 도둑인지 구분하는 체계예요.
**왜 이 카테고리가 있나**: 로그인 기능을 붙였는데 "아무나 다른 사람 행세를 할 수 있는 상태"인 경우가 많아요. 특히 소셜 로그인만 붙이고 나머지를 안 한 경우가 위험해요.

### 하위 증상 목록

| # | 증상 (비개발자 언어) | 심각도 | 패키지 후보 이름 |
|---|---------------------|--------|-----------------|
| 1 | 다른 사람 행세로 로그인할 수 있어요 | :red_circle: | AUTH FIX |
| 2 | 로그인 없이 개인 페이지에 들어갈 수 있어요 | :red_circle: | AUTH WALL |
| 3 | 로그인 상태가 너무 오래 유지돼요 | :yellow_circle: | SESSION TIMER |
| 4 | 비밀번호 찾기가 안전한지 모르겠어요 | :yellow_circle: | PASSWORD GUARD |
| 5 | 구글 로그인만 있고 다른 건 없어요 | :yellow_circle: | AUTH EXPAND |
| 6 | 관리자 페이지에 아무나 들어갈 수 있어요 | :red_circle: | ADMIN LOCK |
| 7 | 회원가입 시 이메일 확인을 안 해요 | :yellow_circle: | EMAIL VERIFY |
| 8 | 로그인 시도 횟수 제한이 없어요 | :yellow_circle: | LOGIN GUARD |
| 9 | 탈퇴 기능이 없어요 | :yellow_circle: | ACCOUNT DELETE |
| 10 | 동시 로그인 관리가 안 돼요 | :green_circle: | SESSION MANAGER |
| 11 | 자동 로그인이 안전한지 모르겠어요 | :green_circle: | AUTO LOGIN CHECK |
| 12 | 소셜 로그인 설정이 맞는지 불안해요 | :green_circle: | SOCIAL AUTH CHECK |
| 13 | 2단계 인증을 넣고 싶어요 | :green_circle: | TWO STEP |
| 14 | 로그인 기록을 보고 싶어요 | :green_circle: | LOGIN LOG |
| 15 | 권한 분리가 필요해요 (관리자/일반) | :green_circle: | ROLE SETUP |

### 가격대별 패키지 변주

- **무료**: AUTH SCAN BASIC (로그인 상태 간단 점검)
- **59,000원**: AUTH CHECK (로그인 체계 전수 점검)
- **129,000원**: AUTH FIX (로그인 보안 수리)
- **169,000원**: AUTH FORTRESS (출입 관리 풀 세트)
- **390,000원**: AUTH FULL AUDIT (인증 체계 전면 감사)
- **890,000원**: AUTH 911 (계정 탈취 긴급 대응)
- **월 59,000원**: AUTH WATCH (매주 로그인 이상 감지)

---

## 3. 금고 관리 (DATA)

**개발자 용어**: DB, RLS, 백업, 유출 방지
**비개발자 설명**: 고객 정보가 담긴 금고를 어떻게 관리하느냐의 문제예요. 금고 문이 열려있으면 아무나 꺼내갈 수 있어요.
**왜 이 카테고리가 있나**: Supabase, Firebase 같은 서비스를 쓸 때 "데이터 접근 규칙"을 제대로 안 걸면 모든 사용자 정보가 공개 상태가 돼요.

### 하위 증상 목록

| # | 증상 (비개발자 언어) | 심각도 | 패키지 후보 이름 |
|---|---------------------|--------|-----------------|
| 1 | 아무나 다른 사람 데이터를 볼 수 있어요 | :red_circle: | RLS LOCKDOWN |
| 2 | 데이터베이스 비밀번호가 기본값이에요 | :red_circle: | DB PASSWORD |
| 3 | 고객 정보가 암호화 안 돼 있어요 | :red_circle: | DATA ENCRYPT |
| 4 | 백업이 한 번도 없어요 | :red_circle: | BACKUP START |
| 5 | 삭제한 데이터가 진짜 삭제됐는지 모르겠어요 | :yellow_circle: | DATA CLEAN |
| 6 | 누가 데이터를 열어봤는지 기록이 없어요 | :yellow_circle: | DATA LOG |
| 7 | 테스트 데이터와 실제 데이터가 섞여 있어요 | :yellow_circle: | DATA SEPARATOR |
| 8 | 데이터를 내보내기 하는 기능이 누구나 써요 | :yellow_circle: | EXPORT LOCK |
| 9 | 개인정보를 너무 많이 수집하고 있어요 | :yellow_circle: | DATA DIET |
| 10 | 탈퇴한 고객 데이터가 남아있어요 | :yellow_circle: | DATA FAREWELL |
| 11 | 데이터베이스 접속 기록이 없어요 | :green_circle: | DB ACCESS LOG |
| 12 | 백업 복구를 한 번도 테스트 안 해봤어요 | :green_circle: | BACKUP TEST |
| 13 | 어떤 데이터를 어디에 저장하는지 모르겠어요 | :green_circle: | DATA MAP |
| 14 | 개인정보처리방침이 없어요 | :green_circle: | PRIVACY SETUP |
| 15 | 데이터 보관 기간 정책이 없어요 | :green_circle: | DATA POLICY |

### 가격대별 패키지 변주

- **무료**: DATA SCAN BASIC (금고 상태 간단 점검)
- **59,000원**: DATA CHECK (데이터 접근 규칙 점검)
- **149,000원**: RLS LOCKDOWN (금고 잠금 장치 설치)
- **189,000원**: DATA FORTRESS (금고 관리 풀 세트)
- **450,000원**: DATA FULL AUDIT (데이터 전면 감사)
- **950,000원**: DATA 911 (데이터 유출 긴급 대응)
- **월 69,000원**: DATA WATCH (매일 금고 상태 모니터링)

---

## 4. 울타리 관리 (NETWORK)

**개발자 용어**: CORS, CSP, Rate Limit, DDoS
**비개발자 설명**: 가게 주변에 울타리를 치는 것처럼, 어디서 누가 우리 서비스에 접근할 수 있는지 관리하는 거예요.
**왜 이 카테고리가 있나**: "CORS 에러 나서 전부 허용했어요"가 비개발자의 전형적 대처예요. 이러면 아무 곳에서나 우리 서비스에 요청을 보낼 수 있어요.

### 하위 증상 목록

| # | 증상 (비개발자 언어) | 심각도 | 패키지 후보 이름 |
|---|---------------------|--------|-----------------|
| 1 | 아무 사이트에서나 우리 서버에 요청을 보낼 수 있어요 | :red_circle: | CORS FIX |
| 2 | 한 사람이 무한으로 요청을 보내도 막지 못해요 | :red_circle: | RATE SHIELD |
| 3 | 우리 사이트에 이상한 스크립트가 들어올 수 있어요 | :red_circle: | CSP SETUP |
| 4 | 서버가 갑자기 느려지면 대책이 없어요 | :yellow_circle: | TRAFFIC GUARD |
| 5 | 어디서 접속하는지 모르겠어요 | :yellow_circle: | ACCESS MAP |
| 6 | 해외에서 접속 차단하고 싶어요 | :yellow_circle: | GEO FENCE |
| 7 | 봇 트래픽이 많은 것 같아요 | :yellow_circle: | BOT BLOCKER |
| 8 | 서비스 주소가 이상한 곳에서 쓰이고 있어요 | :yellow_circle: | LINK MONITOR |
| 9 | API를 누가 쓰고 있는지 모르겠어요 | :yellow_circle: | API TRACKER |
| 10 | 비정상 트래픽을 구분 못 해요 | :yellow_circle: | TRAFFIC FILTER |
| 11 | 네트워크 설정이 맞는지 모르겠어요 | :green_circle: | NETWORK CHECK |
| 12 | CDN 설정을 안 했어요 | :green_circle: | CDN SETUP |
| 13 | 웹소켓 연결이 안전한지 모르겠어요 | :green_circle: | SOCKET CHECK |
| 14 | 리다이렉트가 이상한 곳으로 가요 | :green_circle: | REDIRECT FIX |
| 15 | 서버 정보가 외부에 노출돼요 | :green_circle: | HEADER CLEAN |

### 가격대별 패키지 변주

- **무료**: NETWORK SCAN BASIC (울타리 상태 간단 점검)
- **49,000원**: NETWORK CHECK (울타리 전수 점검)
- **129,000원**: CORS FIX + RATE SHIELD 번들
- **179,000원**: NETWORK FORTRESS (울타리 풀 세트)
- **390,000원**: NETWORK FULL AUDIT (네트워크 전면 감사)
- **850,000원**: DDOS 911 (대량 공격 긴급 대응)
- **월 49,000원**: NETWORK WATCH (트래픽 이상 실시간 감지)

---

## 5. 침입 방지 (INJECTION)

**개발자 용어**: SQL Injection, NoSQL Injection, Prompt Injection, XSS
**비개발자 설명**: 방문자가 우리 가게 입력란에 이상한 명령어를 넣어서 가게를 조종하는 걸 막는 거예요.
**왜 이 카테고리가 있나**: 검색창, 로그인 창, 댓글 창 같은 "입력란"은 해커가 가장 좋아하는 침입 경로예요. 이걸 막지 않으면 데이터가 통째로 빠져나갈 수 있어요.

### 하위 증상 목록

| # | 증상 (비개발자 언어) | 심각도 | 패키지 후보 이름 |
|---|---------------------|--------|-----------------|
| 1 | 입력란에 이상한 코드를 넣으면 데이터가 나와요 | :red_circle: | INPUT GUARD |
| 2 | 검색창에 명령어를 치면 데이터베이스가 반응해요 | :red_circle: | SEARCH SHIELD |
| 3 | 댓글에 코드를 넣으면 다른 사람 화면에서 실행돼요 | :red_circle: | XSS BLOCKER |
| 4 | AI 기능에 이상한 질문을 하면 시스템 정보가 나와요 | :red_circle: | PROMPT GUARD |
| 5 | 파일 업로드에 아무 파일이나 올릴 수 있어요 | :red_circle: | UPLOAD FILTER |
| 6 | 주소창을 조작하면 다른 페이지가 보여요 | :yellow_circle: | URL GUARD |
| 7 | 폼에 긴 글을 넣으면 화면이 깨져요 | :yellow_circle: | FORM VALIDATOR |
| 8 | 이메일 입력란에 아무거나 넣어도 돼요 | :yellow_circle: | INPUT CHECKER |
| 9 | 사용자 입력을 그대로 저장하고 있어요 | :yellow_circle: | SANITIZE |
| 10 | 에러 메시지에 시스템 정보가 나와요 | :yellow_circle: | ERROR MASK |
| 11 | AI 답변이 이상한 내용을 말해요 | :yellow_circle: | AI FILTER |
| 12 | 입력 길이 제한이 없어요 | :green_circle: | INPUT LIMIT |
| 13 | 특수문자 처리를 안 하고 있어요 | :green_circle: | CHAR FILTER |
| 14 | 입력 검증이 화면에서만 되고 서버에선 안 돼요 | :green_circle: | SERVER CHECK |
| 15 | HTML 태그가 그대로 저장돼요 | :green_circle: | TAG CLEANER |

### 가격대별 패키지 변주

- **무료**: INJECTION SCAN BASIC (입력란 위험도 간단 점검)
- **49,000원**: INPUT CHECK (전체 입력란 점검)
- **129,000원**: INPUT GUARD (입력란 보호 장치 설치)
- **179,000원**: INJECTION FORTRESS (침입 방지 풀 세트)
- **390,000원**: INJECTION FULL AUDIT (전면 침입 경로 감사)
- **890,000원**: INJECTION 911 (침입 발생 긴급 대응)
- **월 49,000원**: INJECTION WATCH (입력란 이상 행위 감지)

---

## 6. 건물 관리 (INFRA)

**개발자 용어**: 배포, 도메인, HTTPS, 의존성
**비개발자 설명**: 가게 건물 자체가 튼튼한지, 문은 제대로 잠기는지, 간판은 진짜인지 확인하는 거예요.
**왜 이 카테고리가 있나**: Vercel, Netlify 등에 배포했지만 HTTPS가 꺼져있거나, 오래된 부품(라이브러리)을 쓰고 있으면 건물 자체가 위험해요.

### 하위 증상 목록

| # | 증상 (비개발자 언어) | 심각도 | 패키지 후보 이름 |
|---|---------------------|--------|-----------------|
| 1 | 사이트 주소에 자물쇠가 안 떠요 (HTTPS 없음) | :red_circle: | HTTPS SETUP |
| 2 | 오래된 부품을 쓰고 있어서 위험해요 | :red_circle: | DEPENDENCY FIX |
| 3 | 서버 설정 파일이 공개돼 있어요 | :red_circle: | CONFIG HIDE |
| 4 | 도메인이 만료될 뻔했어요 | :yellow_circle: | DOMAIN GUARD |
| 5 | 배포 설정이 맞는지 모르겠어요 | :yellow_circle: | DEPLOY CHECK |
| 6 | 에러 페이지에 시스템 정보가 나와요 | :yellow_circle: | ERROR PAGE |
| 7 | 사용하지 않는 페이지가 공개돼 있어요 | :yellow_circle: | PAGE CLEAN |
| 8 | 개발용 도구가 운영 사이트에 켜져 있어요 | :yellow_circle: | DEV TOOL OFF |
| 9 | 파일 목록이 브라우저에서 보여요 | :yellow_circle: | DIRECTORY LOCK |
| 10 | 자동 배포가 안전한지 모르겠어요 | :yellow_circle: | CI CHECK |
| 11 | 사이트 성능이 느려요 | :green_circle: | SPEED UP |
| 12 | SSL 인증서 만료일을 모르겠어요 | :green_circle: | SSL WATCH |
| 13 | 여러 환경(개발/운영) 분리가 안 돼요 | :green_circle: | ENV SEPARATOR |
| 14 | 로그 파일이 쌓여서 디스크가 찼어요 | :green_circle: | LOG CLEAN |
| 15 | 서버 업데이트를 안 한 지 오래됐어요 | :green_circle: | SERVER UPDATE |

### 가격대별 패키지 변주

- **무료**: INFRA SCAN BASIC (건물 상태 간단 점검)
- **39,000원**: INFRA CHECK (건물 전수 점검)
- **89,000원**: HTTPS SETUP + DEPENDENCY FIX 번들
- **159,000원**: INFRA FORTRESS (건물 관리 풀 세트)
- **350,000원**: INFRA FULL AUDIT (인프라 전면 감사)
- **890,000원**: INFRA 911 (서버 장애 긴급 복구)
- **월 39,000원**: INFRA WATCH (건물 상태 정기 점검)

---

## 7. 감시 카메라 (MONITOR)

**개발자 용어**: 로그, 알림, 침해 감지
**비개발자 설명**: 가게에 CCTV를 달아서 누가 언제 들어왔는지, 이상한 행동을 하는지 기록하고 알려주는 거예요.
**왜 이 카테고리가 있나**: 문제가 생겨도 "언제 뭐가 일어났는지" 모르면 대처할 수가 없어요. 로그와 알림은 사고 후 유일한 증거예요.

### 하위 증상 목록

| # | 증상 (비개발자 언어) | 심각도 | 패키지 후보 이름 |
|---|---------------------|--------|-----------------|
| 1 | 누가 접속했는지 기록이 전혀 없어요 | :red_circle: | LOG START |
| 2 | 이상한 접근이 있어도 알림이 안 와요 | :red_circle: | ALERT SETUP |
| 3 | 로그가 있는데 읽을 수가 없어요 | :yellow_circle: | LOG READER |
| 4 | 에러가 나도 알 방법이 없어요 | :yellow_circle: | ERROR ALERT |
| 5 | 사용자 행동을 파악할 수 없어요 | :yellow_circle: | ACTIVITY LOG |
| 6 | 서버 상태를 실시간으로 모르겠어요 | :yellow_circle: | STATUS BOARD |
| 7 | 로그가 너무 많아서 중요한 걸 못 찾겠어요 | :yellow_circle: | LOG FILTER |
| 8 | 로그 보관 기간이 정해져 있지 않아요 | :green_circle: | LOG POLICY |
| 9 | 알림이 너무 많아서 다 무시해요 | :green_circle: | ALERT TUNE |
| 10 | 보안 이벤트 대시보드가 없어요 | :green_circle: | SECURITY DASH |
| 11 | 접속 통계를 보고 싶어요 | :green_circle: | TRAFFIC STAT |
| 12 | 특정 행동을 감지하고 싶어요 | :green_circle: | BEHAVIOR WATCH |

### 가격대별 패키지 변주

- **무료**: MONITOR SCAN BASIC (감시 체계 간단 점검)
- **49,000원**: MONITOR CHECK (감시 체계 전수 점검)
- **129,000원**: LOG START + ALERT SETUP 번들
- **169,000원**: MONITOR FORTRESS (감시 카메라 풀 세트)
- **350,000원**: MONITOR FULL AUDIT (감시 체계 전면 감사)
- **890,000원**: MONITOR 911 (침입 흔적 긴급 추적)
- **월 69,000원**: MONITOR WATCH (24시간 감시 서비스)

---

## 8. 긴급출동 (RESPONSE)

**개발자 용어**: 사고 대응, 복구, 포렌식
**비개발자 설명**: 이미 사고가 났을 때 119처럼 달려가서 불 끄고, 원인 찾고, 다시 안 나게 하는 거예요.
**왜 이 카테고리가 있나**: P3("이미 털린 사람")가 가장 먼저 찾는 카테고리예요. 새벽이든 주말이든 "지금 당장" 도와줘야 해요.

### 하위 증상 목록

| # | 증상 (비개발자 언어) | 심각도 | 패키지 후보 이름 |
|---|---------------------|--------|-----------------|
| 1 | OpenAI 요금이 갑자기 폭발했어요 | :red_circle: | COST 911 |
| 2 | 데이터베이스 내용이 사라졌어요 | :red_circle: | DATA RESCUE |
| 3 | 사이트에 이상한 페이지가 떠요 | :red_circle: | SITE RESCUE |
| 4 | 고객한테 이상한 메일이 갔어요 | :red_circle: | MAIL 911 |
| 5 | 누군가 관리자로 로그인한 것 같아요 | :red_circle: | ACCOUNT 911 |
| 6 | 서비스가 완전히 멈췄어요 | :red_circle: | SERVICE RESCUE |
| 7 | 무슨 일이 있었는지 알고 싶어요 (원인 분석) | :yellow_circle: | INCIDENT REPORT |
| 8 | 같은 일이 다시 안 일어나게 해주세요 | :yellow_circle: | PREVENTION SETUP |
| 9 | 고객에게 공지를 보내야 할까요? | :yellow_circle: | NOTICE GUIDE |
| 10 | 법적으로 신고해야 하는 건가요? | :yellow_circle: | LEGAL GUIDE |
| 11 | 데이터를 복구할 수 있나요? | :yellow_circle: | DATA RECOVERY |
| 12 | 보험 같은 게 있나요? | :green_circle: | SECURITY INSURANCE |
| 13 | 사고 대응 매뉴얼을 만들고 싶어요 | :green_circle: | RESPONSE MANUAL |
| 14 | 정기적으로 모의 훈련하고 싶어요 | :green_circle: | DRILL SETUP |
| 15 | 사고 후 전체 점검을 받고 싶어요 | :green_circle: | POST INCIDENT AUDIT |

### 가격대별 패키지 변주

- **무료**: 긴급 상담 (15분 전화/카톡)
- **89,000원**: INCIDENT REPORT (사고 원인 분석 리포트)
- **149,000원**: PREVENTION SETUP (재발 방지 조치)
- **189,000원**: RESPONSE KIT (사고 대응 기본 세트)
- **490,000원**: FULL RECOVERY (전면 복구 + 재발 방지)
- **950,000원**: INCIDENT 911 (긴급출동 풀 서비스)
- **월 89,000원**: RESPONSE READY (24시간 긴급출동 대기)

---

## 번들 패키지 (카테고리 횡단)

위 8개 카테고리를 묶어 만드는 특별 패키지로, 312개 중 약 40개를 차지합니다.

### 주요 번들

| 번들 이름 | 포함 카테고리 | 대상 페르소나 | 가격대 |
|----------|-------------|-------------|--------|
| STARTER SHIELD | SECRETS + AUTH + DATA 기본 | P1 | 149,000원 |
| LAUNCH READY | SECRETS + AUTH + DATA + NETWORK + INJECTION | P2 | 390,000원 |
| FULL AUDIT | 전 카테고리 감사 | P2 | 490,000원 |
| 911 BUNDLE | RESPONSE + SECRETS + AUTH 긴급 | P3 | 1,290,000원 |
| MONTHLY BASIC | 전 카테고리 기본 모니터링 | P1~P2 | 월 99,000원 |
| MONTHLY PRO | 전 카테고리 심화 모니터링 | P2 | 월 199,000원 |
| MONTHLY ENTERPRISE | 전 카테고리 + 전담 매니저 | P2 대형 | 월 490,000원 |

---

## 312개 산출 근거

| 카테고리 | 단일 증상 패키지 | 가격 티어 변주 | 번들 포함분 | 소계 |
|---------|----------------|--------------|-----------|------|
| SECRETS | 15 | x2.5 (기본+심화) | 3 | ~40 |
| AUTH | 15 | x2.5 | 3 | ~40 |
| DATA | 15 | x2.5 | 3 | ~40 |
| NETWORK | 15 | x2.5 | 3 | ~40 |
| INJECTION | 15 | x2.5 | 3 | ~40 |
| INFRA | 15 | x2.0 | 3 | ~35 |
| MONITOR | 12 | x2.5 | 3 | ~35 |
| RESPONSE | 15 | x2.5 | 3 | ~40 |
| 횡단 번들 | — | — | — | ~7 |
| **합계** | | | | **~317** (content-curator가 정리하여 312로 확정) |

> content-curator는 이 트리에서 각 증상 x 가격 티어 조합을 JSON으로 만들되, 
> 최종 312개에 맞추어 중복을 병합하거나 세분화합니다.
