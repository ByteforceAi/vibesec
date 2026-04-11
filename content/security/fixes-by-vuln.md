# 취약점별 수정 레시피 (Fixes by Vulnerability)

> 각 취약점의 구체적 수정 방법입니다.
> 기술적 세부사항이 포함되어 있습니다 (내부 참조용 + 수리 작업자용).

---

## SECRETS 카테고리

### VULN-001 수정 레시피 — AI 서비스 비밀번호 노출

**관련 패키지**: PKG-SECRETS-KEY-RESCUE

1. **긴급**: OpenAI 대시보드(platform.openai.com)에서 노출된 키 즉시 revoke
2. 새 키를 발급받기
3. 프론트엔드에서 해당 호출을 백엔드 프록시 라우트로 이전:
   - Next.js: `app/api/chat/route.ts` 생성
   - SvelteKit: `src/routes/api/chat/+server.ts` 생성
4. 새 키를 서버 환경변수로 설정 (Vercel/Netlify/Railway 대시보드)
5. `.env*` 파일이 `.gitignore`에 있는지 확인
6. git history cleanup: `git filter-repo --path .env --invert-paths`
7. API 호출에 rate limit 추가 (abuse 방지)

**예상 소요**: 1-2시간

---

### VULN-002 수정 레시피 — 데이터베이스 관리자 비밀번호 노출

**관련 패키지**: PKG-SECRETS-KEY-RESCUE

1. **긴급**: Supabase 대시보드에서 service_role 키 재생성
2. 프론트엔드 코드에서 service_role 키 제거, anon 키만 사용
3. 서버 사이드에서만 service_role 키를 사용하도록 아키텍처 변경
4. RLS(Row Level Security) 활성화하여 anon 키로도 안전하게
5. git history에서 이전 키 흔적 제거

**예상 소요**: 2-3시간

---

### VULN-003 수정 레시피 — 비밀번호 파일 깃허브 노출

**관련 패키지**: PKG-SECRETS-GIT-CLEAN

1. `.gitignore`에 `.env*` 추가
2. `git rm --cached .env .env.local .env.production` 실행
3. 커밋 후 push
4. git history cleanup: `git filter-repo --path .env --invert-paths` (모든 브랜치)
5. GitHub 토큰/비밀번호가 포함됐다면 해당 서비스에서 키 재발급
6. Force push 후 팀원에게 fresh clone 안내

**예상 소요**: 30분-1시간

---

### VULN-004 수정 레시피 — 결제 비밀번호 노출

**관련 패키지**: PKG-SECRETS-KEY-RESCUE-PRO

1. **긴급**: Stripe 대시보드에서 노출된 키 즉시 roll
2. 최근 결제/환불 내역 확인하여 이상 거래 여부 점검
3. 새 키를 서버 환경변수로만 설정
4. 프론트엔드에는 Publishable Key(pk_live_)만 사용
5. Webhook 서명 검증 추가

**예상 소요**: 1-2시간 (이상 거래 점검 별도)

---

### VULN-005 수정 레시피 — 하드코딩된 비밀번호

**관련 패키지**: PKG-SECRETS-SECRET-VAULT

1. 코드에 직접 적힌 비밀번호를 모두 찾기
2. 각 값을 환경변수로 이동 (`process.env.XXX`)
3. `.env` 파일에 값 설정
4. `.gitignore`에 `.env*` 추가 확인
5. 배포 환경(Vercel/Netlify)에도 환경변수 설정

**예상 소요**: 30분-1시간

---

### VULN-006 수정 레시피 — git history에 남은 비밀번호

**관련 패키지**: PKG-SECRETS-GIT-CLEAN

1. `git filter-repo` 또는 BFG Repo-Cleaner로 히스토리 정리
2. 노출된 모든 키 재발급 (히스토리에 남은 키는 이미 유출된 것으로 간주)
3. Force push 후 팀원 fresh clone

**예상 소요**: 1시간

---

### VULN-007 수정 레시피 — 채팅으로 공유한 비밀번호

**관련 패키지**: PKG-SECRETS-KEY-SAFE-SHARE

1. 채팅에서 공유된 키 즉시 재발급
2. 1Password, Doppler 같은 시크릿 공유 도구 도입
3. 팀 내 시크릿 공유 가이드라인 수립

**예상 소요**: 1-2시간 (도구 셋업 포함)

---

### VULN-008 수정 레시피 — 키 미교체

**관련 패키지**: PKG-SECRETS-KEY-REFRESH

1. 90일 이상 된 키 목록 작성
2. 각 서비스에서 새 키 발급
3. 서버 환경변수 업데이트
4. 이전 키 revoke
5. 키 교체 주기 알림 설정 (90일마다)

**예상 소요**: 키 1개당 15분

---

### VULN-009 수정 레시피 — 테스트/운영 키 혼재

**관련 패키지**: PKG-SECRETS-KEY-SEPARATOR

1. `.env.development`와 `.env.production` 파일 분리
2. 테스트 키는 `.env.development`에만, 운영 키는 배포 환경에만
3. 로컬에서는 절대 운영 키를 사용하지 않도록 가이드

**예상 소요**: 30분

---

### VULN-058 수정 레시피 — Anthropic 키 노출

**관련 패키지**: PKG-SECRETS-KEY-RESCUE

1. Anthropic Console에서 노출된 키 즉시 비활성화
2. 새 키 발급
3. 백엔드 프록시로 이전 (VULN-001과 동일 절차)

**예상 소요**: 1시간

---

### VULN-059 수정 레시피 — AWS 키 노출

**관련 패키지**: PKG-SECRETS-KEY-RESCUE-PRO

1. **긴급**: AWS IAM에서 노출된 Access Key 즉시 비활성화
2. CloudTrail에서 해당 키로 수행된 작업 이력 확인
3. 이상 리소스(EC2 인스턴스, Lambda 등) 생성 여부 점검
4. 새 IAM 사용자/역할 생성, 최소 권한 원칙 적용
5. AWS Billing 알림 설정

**예상 소요**: 2-4시간 (감사 포함)

---

### VULN-060 수정 레시피 — .gitignore 미설정

**관련 패키지**: PKG-SECRETS-GIT-CLEAN

1. `.gitignore`에 다음 추가:
   ```
   .env*
   !.env.example
   ```
2. 이미 추적 중인 .env 파일 제거: `git rm --cached .env*`
3. `.env.example` 템플릿 파일 생성 (값은 빈칸)

**예상 소요**: 10분

---

## AUTH 카테고리

### VULN-010 수정 레시피 — 인증 우회

**관련 패키지**: PKG-AUTH-AUTH-WALL

1. 모든 보호 대상 라우트에 인증 미들웨어 추가
2. Next.js: `middleware.ts`에서 matcher로 보호 경로 지정
3. SvelteKit: `hooks.server.ts`에서 session 확인
4. API 라우트 전체에 인증 체크 추가
5. 테스트: 토큰 없이 각 보호 라우트 접근 시 401 응답 확인

**예상 소요**: 2-4시간

---

### VULN-011 수정 레시피 — 관리자 페이지 무방비

**관련 패키지**: PKG-AUTH-ADMIN-LOCK

1. 관리자 라우트에 role 기반 접근 제어 추가
2. 관리자 계정에만 `role: admin` 부여
3. /admin 경로를 예측 불가능한 경로로 변경 (선택)
4. IP 화이트리스트 적용 (선택)

**예상 소요**: 2-3시간

---

### VULN-012 수정 레시피 — 약한 JWT 시크릿

**관련 패키지**: PKG-AUTH-AUTH-FIX

1. 강력한 랜덤 키 생성: `openssl rand -base64 64`
2. 환경변수로 설정
3. 기존 토큰 모두 무효화 (사용자 재로그인 필요)
4. RS256 알고리즘 전환 고려 (비대칭 키)

**예상 소요**: 1시간

---

### VULN-013 수정 레시피 — 세션 미만료

**관련 패키지**: PKG-AUTH-SESSION-TIMER

1. JWT: `expiresIn` 설정 (권장: access token 15분, refresh token 7일)
2. 세션 쿠키: `maxAge` 설정
3. Refresh token rotation 구현
4. 로그아웃 시 서버 사이드에서도 토큰 무효화

**예상 소요**: 2-3시간

---

### VULN-014 수정 레시피 — 로그인 무제한 시도

**관련 패키지**: PKG-AUTH-LOGIN-GUARD

1. 로그인 API에 rate limiter 추가 (예: IP당 5회/분)
2. 실패 횟수 누적 시 지수 백오프(10초 → 30초 → 1분 대기)
3. 10회 연속 실패 시 계정 임시 잠금 (15분)
4. CAPTCHA 추가 (5회 실패 후)

**예상 소요**: 2-3시간

---

### VULN-015 수정 레시피 — 이메일 미인증

**관련 패키지**: PKG-AUTH-EMAIL-VERIFY

1. Supabase/Firebase에서 이메일 인증 활성화
2. 가입 후 인증 완료 전까지 주요 기능 접근 제한
3. 인증 이메일 재발송 기능 추가

**예상 소요**: 1-2시간

---

### VULN-016 수정 레시피 — 탈퇴 기능 부재

**관련 패키지**: PKG-AUTH-ACCOUNT-DELETE

1. 탈퇴 API 구현 (계정 비활성화 또는 삭제)
2. 관련 데이터 삭제/익명화 처리
3. 30일 유예 기간 설정 (실수 방지)
4. 탈퇴 확인 이메일 발송

**예상 소요**: 3-4시간

---

### VULN-017 수정 레시피 — localStorage에 비밀번호 저장

**관련 패키지**: PKG-AUTH-AUTH-FIX

1. localStorage에서 민감 정보 제거
2. 인증 토큰은 HttpOnly 쿠키로 이전
3. 또는 메모리(변수)에만 보관하고 refresh token으로 갱신

**예상 소요**: 2-3시간

---

### VULN-018 수정 레시피 — OAuth 설정 오류

**관련 패키지**: PKG-AUTH-AUTH-FIX

1. OAuth 제공자(Google, GitHub 등) 대시보드에서 redirect URI를 정확한 도메인만 허용
2. localhost는 개발 환경에서만 허용
3. state 파라미터 검증 구현 (CSRF 방지)

**예상 소요**: 1시간

---

### VULN-061 수정 레시피 — 역할 구분 없음

**관련 패키지**: PKG-AUTH-ROLE-SETUP

1. 사용자 모델에 role 필드 추가 (admin, user)
2. 관리자 전용 API에 역할 확인 미들웨어 추가
3. UI에서도 역할에 따라 메뉴/기능 분기

**예상 소요**: 3-5시간

---

## DATA 카테고리

### VULN-019 수정 레시피 — RLS 미설정

**관련 패키지**: PKG-DATA-RLS-LOCKDOWN

1. 모든 테이블에 RLS 활성화: `ALTER TABLE xxx ENABLE ROW LEVEL SECURITY;`
2. 각 테이블에 적절한 정책 추가:
   ```sql
   CREATE POLICY "Users can only see own data"
   ON users FOR SELECT
   USING (auth.uid() = id);
   ```
3. anon 사용자 접근 정책 검토
4. 테스트: 다른 사용자 데이터 접근 시 빈 결과 확인

**예상 소요**: 2-4시간 (테이블 수에 비례)

---

### VULN-020 수정 레시피 — Firebase 규칙 완전 개방

**관련 패키지**: PKG-DATA-RLS-LOCKDOWN

1. `firestore.rules`에서 `allow read, write: if true` 제거
2. 인증된 사용자만 자기 데이터에 접근하도록 규칙 작성:
   ```
   match /users/{userId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   ```
3. Firebase Emulator에서 규칙 테스트
4. 배포

**예상 소요**: 2-3시간

---

### VULN-021 수정 레시피 — DB 기본 비밀번호

**관련 패키지**: PKG-DATA-DB-PASSWORD

1. 강력한 비밀번호 생성 (20자 이상, 특수문자 포함)
2. DB 호스팅 서비스에서 비밀번호 변경
3. 서버 환경변수 업데이트
4. 접속 확인

**예상 소요**: 15-30분

---

### VULN-022 수정 레시피 — 데이터 미암호화

**관련 패키지**: PKG-DATA-DATA-ENCRYPT

1. 민감 데이터 필드 식별 (이메일, 전화번호, 주소 등)
2. 암호화 라이브러리 도입 (bcrypt for password, AES for other fields)
3. 기존 데이터 마이그레이션
4. 읽기/쓰기 시 복호화/암호화 로직 추가

**예상 소요**: 4-8시간 (데이터 양에 비례)

---

### VULN-023 수정 레시피 — 백업 없음

**관련 패키지**: PKG-DATA-BACKUP-START

1. DB 호스팅 서비스의 자동 백업 활성화
2. 일일 백업 스케줄 설정
3. 백업 보관 기간 설정 (최소 30일)
4. 복구 테스트 1회 수행

**예상 소요**: 1시간

---

### VULN-024 수정 레시피 — 데이터 내보내기 무제한

**관련 패키지**: PKG-DATA-EXPORT-LOCK

1. 내보내기 API에 인증 및 관리자 권한 확인 추가
2. 한 번에 내보낼 수 있는 양 제한 (페이징)
3. 내보내기 이력 로깅
4. Rate limit 추가

**예상 소요**: 2-3시간

---

### VULN-025 수정 레시피 — 탈퇴 사용자 데이터 미삭제

**관련 패키지**: PKG-DATA-DATA-FAREWELL

1. 탈퇴 시 관련 테이블에서 개인정보 삭제/익명화
2. 법적 보존 의무가 있는 데이터는 분리 보관
3. 삭제 확인 로그 기록

**예상 소요**: 2-4시간

---

### VULN-026 수정 레시피 — 개인정보처리방침 없음

**관련 패키지**: PKG-DATA-PRIVACY-SETUP

1. 개인정보처리방침 문서 작성 (수집 항목, 목적, 보관 기간 등)
2. 사이트 footer에 링크 추가
3. 회원가입 시 동의 체크박스 추가

**예상 소요**: 2-3시간 (문서 작성 포함)

---

### VULN-062 수정 레시피 — 과도한 개인정보 수집

**관련 패키지**: PKG-DATA-DATA-DIET

1. 수집 중인 개인정보 목록 작성
2. 서비스에 불필요한 항목 제거
3. 필수/선택 구분 명확히 표시
4. 개인정보처리방침 업데이트

**예상 소요**: 1-2시간

---

## NETWORK 카테고리

### VULN-027 수정 레시피 — CORS 와일드카드

**관련 패키지**: PKG-NETWORK-CORS-FIX

1. `cors({ origin: '*' })` 대신 허용할 도메인 목록 지정
2. 예: `cors({ origin: ['https://myapp.com', 'https://www.myapp.com'] })`
3. credentials 사용 시 와일드카드 사용 불가임을 확인
4. 프리플라이트 요청(OPTIONS) 처리 확인

**예상 소요**: 30분-1시간

---

### VULN-028 수정 레시피 — Rate Limit 없음

**관련 패키지**: PKG-NETWORK-RATE-SHIELD

1. Express: `express-rate-limit` 패키지 설치
2. Next.js: Vercel의 Edge Config 또는 upstash/ratelimit 사용
3. 일반 API: IP당 100회/분
4. 로그인 API: IP당 5회/분
5. 초과 시 429 응답 반환

**예상 소요**: 1-2시간

---

### VULN-029 수정 레시피 — CSP 없음

**관련 패키지**: PKG-NETWORK-CSP-SETUP

1. 서버 응답에 Content-Security-Policy 헤더 추가
2. 기본 정책 예시:
   ```
   default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
   ```
3. 필요한 외부 도메인만 추가 허용
4. report-uri 설정으로 위반 사항 모니터링

**예상 소요**: 1-2시간

---

### VULN-030 수정 레시피 — DDoS 무방비

**관련 패키지**: PKG-NETWORK-TRAFFIC-GUARD

1. Cloudflare 무료 플랜 연결 (DNS 프록시)
2. 또는 Vercel/Netlify의 내장 보호 기능 확인
3. 자체 서버라면 fail2ban 등 설정

**예상 소요**: 30분-1시간

---

### VULN-031 수정 레시피 — 서버 정보 노출

**관련 패키지**: PKG-NETWORK-HEADER-CLEAN

1. Express: `app.disable('x-powered-by')`
2. 또는 `helmet` 패키지 설치 (여러 보안 헤더 한 번에 설정)
3. Server 헤더 제거 또는 변경

**예상 소요**: 15분

---

### VULN-032 수정 레시피 — 웹훅 서명 미검증

**관련 패키지**: PKG-NETWORK-NETWORK-FORTRESS

1. Stripe: `stripe.webhooks.constructEvent(body, sig, secret)` 사용
2. GitHub: `crypto.timingSafeEqual`로 서명 비교
3. 서명 검증 실패 시 400 응답 반환

**예상 소요**: 1시간

---

### VULN-033 수정 레시피 — 오픈 리다이렉트

**관련 패키지**: PKG-NETWORK-REDIRECT-FIX

1. 리다이렉트 URL을 화이트리스트 기반으로 검증
2. 외부 URL로의 리다이렉트 차단
3. 상대 경로만 허용하거나 허용 도메인 목록 관리

**예상 소요**: 1시간

---

## INJECTION 카테고리

### VULN-034 수정 레시피 — SQL 인젝션

**관련 패키지**: PKG-INJECTION-INPUT-GUARD

1. 모든 SQL 쿼리를 Prepared Statement / Parameterized Query로 변환
2. ORM 사용 권장 (Prisma, Drizzle 등)
3. 사용자 입력이 직접 쿼리에 들어가는 부분 모두 제거
4. WAF(Web Application Firewall) 도입 검토

**예상 소요**: 2-4시간 (쿼리 수에 비례)

---

### VULN-035 수정 레시피 — XSS (저장형)

**관련 패키지**: PKG-INJECTION-XSS-BLOCKER

1. 사용자 입력을 HTML에 렌더링할 때 반드시 이스케이프
2. React: JSX가 기본 이스케이프 (dangerouslySetInnerHTML 사용 금지)
3. Svelte: `{@html}` 사용 시 반드시 DOMPurify로 정화
4. CSP 헤더 추가 (script-src 제한)

**예상 소요**: 1-3시간

---

### VULN-036 수정 레시피 — 프롬프트 인젝션

**관련 패키지**: PKG-INJECTION-PROMPT-GUARD

1. 시스템 프롬프트와 사용자 입력 분리
2. 사용자 입력에 대한 필터링 추가 (금지 패턴)
3. 출력에서 시스템 프롬프트 유출 방지 필터
4. 모니터링 및 로깅 추가

**예상 소요**: 2-4시간

---

### VULN-037 수정 레시피 — 무제한 파일 업로드

**관련 패키지**: PKG-INJECTION-UPLOAD-FILTER

1. 허용 확장자 화이트리스트 (jpg, png, gif, pdf 등)
2. MIME 타입 검증 (매직 바이트 확인)
3. 파일 크기 제한 (예: 5MB)
4. 업로드 파일명 랜덤화 (경로 추측 방지)
5. 업로드 디렉토리에서 스크립트 실행 금지

**예상 소요**: 2-3시간

---

### VULN-038 수정 레시피 — 입력 미검증

**관련 패키지**: PKG-INJECTION-SANITIZE

1. zod, yup, joi 등 검증 라이브러리 도입
2. 서버 사이드에서 모든 입력 검증
3. 검증 실패 시 명확한 에러 반환
4. XSS 방지용 HTML 태그 제거/이스케이프

**예상 소요**: 2-4시간

---

### VULN-039 수정 레시피 — 상세 에러 메시지 노출

**관련 패키지**: PKG-INJECTION-ERROR-MASK

1. 프로덕션에서 에러 스택 트레이스 숨기기
2. 사용자에게는 일반 에러 메시지만 표시: "문제가 발생했어요. 잠시 후 다시 시도해주세요."
3. 상세 에러는 서버 로그에만 기록
4. Express: `app.use((err, req, res, next) => ...)` 글로벌 에러 핸들러

**예상 소요**: 1시간

---

### VULN-040 수정 레시피 — 클라이언트만 검증

**관련 패키지**: PKG-INJECTION-SERVER-CHECK

1. 프론트엔드 검증과 동일한 규칙을 서버에도 구현
2. zod 스키마를 프론트/서버에서 공유하면 효율적
3. 서버 검증 실패 시 400 응답 + 에러 메시지

**예상 소요**: 2-3시간

---

### VULN-063 수정 레시피 — NoSQL 인젝션

**관련 패키지**: PKG-INJECTION-SEARCH-SHIELD

1. MongoDB 쿼리에 사용자 입력 직접 사용 금지
2. `mongo-sanitize` 패키지로 입력 정화
3. 쿼리 연산자($gt, $ne 등)가 사용자 입력에 포함되지 않도록 필터

**예상 소요**: 1-2시간

---

### VULN-067 수정 레시피 — AI 출력 미필터링

**관련 패키지**: PKG-INJECTION-AI-FILTER

1. LLM 출력에 대한 콘텐츠 필터 추가
2. OpenAI Moderation API 또는 자체 필터 규칙 적용
3. HTML/스크립트 코드 이스케이프
4. 민감 정보(이메일, 전화번호 등) 마스킹

**예상 소요**: 2-3시간

---

## INFRA 카테고리

### VULN-041 수정 레시피 — HTTPS 미적용

**관련 패키지**: PKG-INFRA-HTTPS-SETUP

1. Vercel/Netlify: 기본 HTTPS 제공됨, 커스텀 도메인도 자동 SSL
2. 자체 서버: Let's Encrypt + certbot으로 무료 SSL
3. HTTP → HTTPS 리다이렉트 설정
4. HSTS 헤더 추가

**예상 소요**: 30분-1시간

---

### VULN-042 수정 레시피 — 취약한 의존성

**관련 패키지**: PKG-INFRA-DEPENDENCY-FIX

1. `npm audit fix` 또는 `pnpm audit --fix` 실행
2. 자동 수정 불가능한 것은 수동 업데이트
3. 메이저 버전 업데이트 시 호환성 테스트
4. Dependabot 또는 Renovate 설정 (자동 업데이트 PR)

**예상 소요**: 1-3시간

---

### VULN-043 수정 레시피 — 설정 파일 노출

**관련 패키지**: PKG-INFRA-CONFIG-HIDE

1. 웹 서버 설정에서 .env, .git, config 파일 접근 차단
2. Nginx: `location ~ /\. { deny all; }`
3. Vercel: `vercel.json`에서 rewrites 설정
4. `.htaccess`: `<FilesMatch "^\.env"> ... Deny from all`

**예상 소요**: 30분

---

### VULN-044 수정 레시피 — 도메인 만료 위험

**관련 패키지**: PKG-INFRA-DOMAIN-GUARD

1. 도메인 레지스트라에서 자동 갱신 활성화
2. 갱신 알림 이메일 확인
3. 연락처 이메일이 유효한지 확인

**예상 소요**: 15분

---

### VULN-045 수정 레시피 — 개발 도구 프로덕션 노출

**관련 패키지**: PKG-INFRA-DEV-TOOL-OFF

1. 빌드 시 `NODE_ENV=production` 확인
2. 소스맵 비활성화: `productionSourceMap: false`
3. debug 로그 제거 또는 조건부 처리
4. 불필요한 API 라우트 제거 (테스트용 등)

**예상 소요**: 30분-1시간

---

### VULN-046 수정 레시피 — 디렉토리 리스팅

**관련 패키지**: PKG-INFRA-DIRECTORY-LOCK

1. Apache: `Options -Indexes` 설정
2. Nginx: `autoindex off;`
3. 정적 호스팅: 대부분 기본 비활성화 (확인 필요)

**예상 소요**: 15분

---

### VULN-047 수정 레시피 — 쿠키 보안 설정 미비

**관련 패키지**: PKG-INFRA-INFRA-FORTRESS

1. 쿠키 설정 시 플래그 추가:
   ```javascript
   { httpOnly: true, secure: true, sameSite: 'lax' }
   ```
2. 세션 쿠키에 반드시 적용
3. HTTPS가 활성화되어 있어야 Secure 플래그 동작

**예상 소요**: 30분

---

### VULN-064 수정 레시피 — SSL 만료일 미관리

**관련 패키지**: PKG-INFRA-SSL-WATCH

1. SSL 인증서 만료 알림 설정
2. Let's Encrypt: 자동 갱신 cron job 확인
3. 유료 인증서: 갱신일 캘린더 등록

**예상 소요**: 15분

---

### VULN-065 수정 레시피 — 환경 미분리

**관련 패키지**: PKG-INFRA-ENV-SEPARATOR

1. 개발/스테이징/프로덕션 환경 분리
2. 각 환경에 별도 DB, 별도 API 키 사용
3. 환경별 환경변수 파일 분리

**예상 소요**: 2-4시간

---

## MONITOR 카테고리

### VULN-048 수정 레시피 — 로그 없음

**관련 패키지**: PKG-MONITOR-LOG-START

1. 서버에 접근 로그 활성화
2. 구조화된 로그 형식 도입 (JSON)
3. 로그 서비스 연동 (Logtail, Datadog, AWS CloudWatch)
4. 중요 이벤트 로깅: 로그인, 데이터 변경, 에러

**예상 소요**: 1-2시간

---

### VULN-049 수정 레시피 — 알림 없음

**관련 패키지**: PKG-MONITOR-ALERT-SETUP

1. 에러 모니터링 도구 연동 (Sentry 무료 플랜)
2. 슬랙/이메일 알림 설정
3. 알림 조건 설정: 500 에러, 비정상 로그인, 높은 에러율

**예상 소요**: 1-2시간

---

### VULN-050 수정 레시피 — 에러 모니터링 없음

**관련 패키지**: PKG-MONITOR-ERROR-ALERT

1. Sentry SDK 설치: `npm install @sentry/node @sentry/svelte`
2. DSN 설정 (서버 환경변수)
3. 에러 발생 시 자동 포착 및 알림 확인

**예상 소요**: 30분-1시간

---

### VULN-051 수정 레시피 — 접속 기록 미확인

**관련 패키지**: PKG-MONITOR-LOG-READER

1. 로그 대시보드 설정 (Grafana, Kibana, Logtail)
2. 주간 로그 리뷰 루틴 수립
3. 이상 패턴 자동 감지 규칙 설정

**예상 소요**: 2-3시간

---

### VULN-052 수정 레시피 — 보안 대시보드 없음

**관련 패키지**: PKG-MONITOR-SECURITY-DASH

1. Grafana 또는 자체 대시보드 구축
2. 주요 지표: 에러율, 비정상 로그인, 트래픽 패턴
3. 일일/주간 자동 리포트 설정

**예상 소요**: 4-8시간

---

### VULN-066 수정 레시피 — 로그 보관 정책 없음

**관련 패키지**: PKG-MONITOR-LOG-POLICY

1. 로그 보관 기간 결정 (권장: 최소 90일)
2. 로그 서비스에서 retention 설정
3. 오래된 로그 자동 삭제 또는 아카이브

**예상 소요**: 30분

---

## RESPONSE 카테고리

### VULN-053 수정 레시피 — 사고 대응 계획 없음

**관련 패키지**: PKG-RESPONSE-RESPONSE-MANUAL

1. 사고 대응 매뉴얼 작성:
   - 사고 분류 기준 (심각도별)
   - 역할 분담 (누가 뭘 하는지)
   - 단계별 절차 (감지 → 격리 → 분석 → 복구 → 보고)
2. 긴급 연락처 목록 작성
3. 매뉴얼 팀 공유

**예상 소요**: 3-4시간

---

### VULN-054 수정 레시피 — 백업 복구 미테스트

**관련 패키지**: PKG-RESPONSE-BACKUP-TEST

1. 테스트 환경에서 최근 백업으로 복구 수행
2. 데이터 무결성 확인
3. 복구에 걸리는 시간 측정
4. 분기별 복구 테스트 일정 수립

**예상 소요**: 1-2시간

---

### VULN-055 수정 레시피 — 긴급 연락 체계 없음

**관련 패키지**: PKG-RESPONSE-RESPONSE-MANUAL

1. 긴급 연락처 목록 작성 (대표, 기술 담당, 법률 담당)
2. 에스컬레이션 절차 수립 (15분 무응답 시 다음 담당자)
3. 팀원 접근 가능한 곳에 문서 공유

**예상 소요**: 1시간

---

### VULN-056 수정 레시피 — 법적 신고 의무 미인지

**관련 패키지**: PKG-RESPONSE-LEGAL-GUIDE

1. 개인정보보호법 신고 의무 확인:
   - 1,000명 이상 유출: 72시간 내 PIPC 신고
   - 이용자 통지 의무
2. 신고 절차 문서화
3. 법률 자문 연락처 확보

**예상 소요**: 2시간 (문서화)

---

### VULN-057 수정 레시피 — 고객 통지 계획 없음

**관련 패키지**: PKG-RESPONSE-NOTICE-GUIDE

1. 사고 유형별 고객 통지 템플릿 작성
2. 통지 채널 결정 (이메일, 앱 내 공지, SMS)
3. 솔직하고 빠른 소통 원칙 수립
4. FAQ 준비 (고객이 물어볼 질문)

**예상 소요**: 2-3시간
