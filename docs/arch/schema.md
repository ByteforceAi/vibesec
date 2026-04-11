# 데이터 스키마 (ADR-002 상세)

> architect 산출물. content-curator, screen-builder, security-curator가 참조합니다.
> 모든 엔티티는 TypeScript interface로 정의됩니다.

---

## 설계 원칙

1. **오프라인 우선**: 모든 데이터는 로컬에 저장 가능해야 함 (IndexedDB 또는 Tauri fs)
2. **JSON 직렬화 가능**: 네트워크 전송 없이도 파일로 저장/복원 가능
3. **한국어 필드 분리**: name과 name_kr을 분리하여 i18n 대응
4. **content-curator 스키마와 1:1 매칭**: CONTRACTS.md의 Package JSON 예시를 기준

---

## 엔티티 정의

### Package (패키지 카탈로그 항목)

content-curator가 생성하는 `content/packages/*.json`과 정확히 일치합니다.

```typescript
interface Package {
  /** 고유 ID. 형식: PKG-{CATEGORY}-{SLUG} */
  id: string;
  /** 8개 카테고리 중 하나 */
  category: 'SECRETS' | 'AUTH' | 'DATA' | 'NETWORK' | 'INJECTION' | 'INFRA' | 'MONITOR' | 'RESPONSE';
  /** 영문 패키지명 */
  name: string;
  /** 한국어 패키지명 */
  name_kr: string;
  /** 한국어 부제 (20자 이내) */
  subtitle_kr: string;
  /** 심각도 */
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  /** 원화 가격. 0이면 무료 */
  price_krw: number;
  /** 작업 소요 시간 (한국어 표기) */
  duration: string;
  /** 이 패키지가 해결하는 증상 목록 (비개발자 언어) */
  symptoms: string[];
  /** 비개발자도 이해할 수 있는 2-3문장 설명 */
  description_kr: string;
  /** 이 패키지가 수리하는 취약점 ID 목록 */
  fixes_vulns: string[];
  /** 패키지에 포함된 작업 항목 */
  includes: string[];
  /** A/S 보증 일수. 0이면 보증 없음 */
  warranty_days: number;
}
```

### Vulnerability (취약점 DB 항목)

security-curator가 생성하는 `content/security/vulnerabilities.json`과 일치합니다.

```typescript
interface Vulnerability {
  /** 고유 ID. 형식: VULN-NNN */
  id: string;
  /** URL-safe 슬러그 */
  slug: string;
  /** 한국어 제목 (비개발자 언어) */
  title_kr: string;
  /** 비유 (비개발자 언어) */
  metaphor_kr: string;
  /** 심각도 */
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  /** 소속 카테고리 */
  category: 'SECRETS' | 'AUTH' | 'DATA' | 'NETWORK' | 'INJECTION' | 'INFRA' | 'MONITOR' | 'RESPONSE';
  /** 탐지 방법 (내부용) */
  how_to_detect: string;
  /** 예상 피해 설명 (비개발자 언어) */
  example_damage_kr: string;
  /** 추천 패키지 ID 목록 */
  recommended_packages: string[];
}
```

### Scan (진단 실행 기록)

사용자가 URL을 입력하고 진단을 시작하면 생성됩니다.

```typescript
interface Scan {
  /** 고유 ID. UUID v4 */
  scanId: string;
  /** 진단 유형 */
  type: 'github-url' | 'deployed-url' | 'local-zip';
  /** 입력된 URL 또는 파일 경로 */
  target: string;
  /** 진단 시작 시각 (ISO 8601) */
  startedAt: string;
  /** 진단 완료 시각. 진행 중이면 null */
  finishedAt: string | null;
  /** 진단 상태 */
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  /** 예상 소요 시간 (초) */
  estimatedSeconds: number;
}
```

### Finding (개별 진단 발견 항목)

Scan 결과에 포함되는 개별 발견 사항입니다.

```typescript
interface Finding {
  /** 고유 ID. 형식: FIND-{scanId 앞 8자}-NNN */
  id: string;
  /** 관련 취약점 ID */
  vulnId: string;
  /** 심각도 (취약점에서 상속되지만 컨텍스트에 따라 조정 가능) */
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  /** 한 줄 제목 (비개발자 언어) */
  title_kr: string;
  /** 비유 포함 설명 (비개발자 언어) */
  description_kr: string;
  /** 발견 위치 (파일 경로 또는 URL 경로) */
  location: string;
  /** 추천 패키지 ID 목록 */
  recommendedPackageIds: string[];
}
```

### Report (건강검진표)

Scan 완료 후 생성되는 결과 리포트입니다.

```typescript
interface Report {
  /** Scan ID와 동일 */
  scanId: string;
  /** 리포트 생성 시각 (ISO 8601) */
  createdAt: string;
  /** 요약 통계 */
  summary: {
    /** 급해요 (critical + high) */
    critical: number;
    /** 조심해요 (medium) */
    warning: number;
    /** 괜찮아요 (low + info) */
    ok: number;
    /** 총 점검 항목 수 */
    total: number;
  };
  /** 발견 항목 목록 (심각도 순 정렬) */
  findings: Finding[];
  /** 추천 패키지 ID 목록 (중복 제거, 우선순위 순) */
  recommendedPackageIds: string[];
  /** 종합 상태 메시지 (비개발자 언어) */
  statusMessage_kr: string;
}
```

### User (로컬 사용자)

익명 기본. 로컬에만 저장됩니다.

```typescript
interface User {
  /** 로컬 고유 ID. UUID v4. 앱 최초 실행 시 생성 */
  userId: string;
  /** 생성 시각 */
  createdAt: string;
  /** 마지막 활동 시각 */
  lastActiveAt: string;
  /** 온보딩 완료 여부 */
  onboardingCompleted: boolean;
  /** 진단 기록 ID 목록 (최신순) */
  scanHistory: string[];
  /** 설정 */
  preferences: {
    /** 언어 (현재 ko만 지원) */
    language: 'ko' | 'en';
    /** 알림 허용 여부 */
    notificationsEnabled: boolean;
  };
}
```

### CartItem (장바구니 항목)

```typescript
interface CartItem {
  /** 패키지 ID */
  packageId: string;
  /** 수량 (보통 1) */
  quantity: number;
  /** 추가 시각 */
  addedAt: string;
  /** 연관 스캔 ID (진단 결과에서 추가한 경우) */
  fromScanId: string | null;
}
```

### Order (주문 — MVP에서 모킹)

```typescript
interface Order {
  /** 주문 ID. UUID v4 */
  orderId: string;
  /** 주문 시각 */
  createdAt: string;
  /** 주문 상태 */
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed';
  /** 포함 패키지 목록 */
  items: CartItem[];
  /** 총 금액 (원) */
  totalKrw: number;
  /** 할인 금액 (원) */
  discountKrw: number;
  /** 연관 스캔 ID */
  scanId: string | null;
  /** 결제 방식 (MVP에서 모킹) */
  paymentMethod: 'card' | 'kakao' | 'toss' | 'mock';
}
```

---

## 엔티티 관계

```
User
  |-- scanHistory[] --> Scan
                          |-- Report
                               |-- findings[] --> Finding
                                                    |-- vulnId --> Vulnerability
                                                    |-- recommendedPackageIds[] --> Package
                               |-- recommendedPackageIds[] --> Package

User (implicit)
  |-- cart --> CartItem[]
                  |-- packageId --> Package
  |-- orders --> Order[]
                   |-- items[] --> CartItem
```

---

## 저장소 전략

| 데이터 | 저장 위치 | 이유 |
|--------|----------|------|
| Package (312개) | `content/packages/*.json` (앱 번들) | 오프라인 접근, 변경 빈도 낮음 |
| Vulnerability (50+) | `content/security/vulnerabilities.json` (앱 번들) | 오프라인 접근 |
| Scan, Report | IndexedDB (Tauri 앱 내) | 사용자 개인 데이터, 로컬 저장 |
| User | IndexedDB (Tauri 앱 내) | 개인 설정, 로컬 저장 |
| CartItem, Order | IndexedDB (Tauri 앱 내) | 세션 데이터 |
