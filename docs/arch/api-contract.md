# API 컨트랙트 (프론트 <-> 백 인터페이스)

> architect 산출물. screen-builder, design-system-engineer가 참조합니다.
> MVP에서 백엔드는 `fake-scanner.ts`로 모킹되지만, 인터페이스는 실제 Tauri IPC 형태로 설계합니다.

---

## 설계 원칙

1. **Tauri IPC 커맨드 형태**: 향후 Rust 백엔드로 전환 시 인터페이스 변경 최소화
2. **비동기 우선**: 모든 커맨드는 Promise를 반환
3. **오프라인 대응**: 네트워크 없이도 과거 데이터 조회 가능
4. **타입 안전**: 모든 요청/응답이 TypeScript interface로 정의됨

---

## 1. 진단 (Scan) API

### scan_project - 진단 시작

```typescript
/** 진단 요청 */
interface ScanRequest {
  /** 진단 유형 */
  type: 'github-url' | 'deployed-url' | 'local-zip';
  /** 대상 URL 또는 파일 경로 */
  target: string;
}

/** 진단 시작 응답 */
interface ScanResponse {
  /** 생성된 스캔 ID */
  scanId: string;
  /** 시작 시각 (ISO 8601) */
  startedAt: string;
  /** 예상 소요 시간 (초) */
  estimatedSeconds: number;
}

// Tauri IPC 커맨드
// invoke('scan_project', { request: ScanRequest }): Promise<ScanResponse>
```

### get_scan_progress - 진단 진행률 조회

```typescript
/** 진행률 응답 */
interface ScanProgress {
  scanId: string;
  /** 0~100 */
  percent: number;
  /** 현재 단계 */
  currentStep: 'secrets' | 'auth' | 'data' | 'network' | 'infra' | 'finalizing';
  /** 현재 단계 한국어 메시지 */
  stepMessage_kr: string;
}

// invoke('get_scan_progress', { scanId: string }): Promise<ScanProgress>
```

### get_report - 진단 결과 조회

```typescript
/** Report 엔티티를 그대로 반환 (schema.md 참조) */
// invoke('get_report', { scanId: string }): Promise<Report | null>
```

### list_scans - 진단 기록 목록

```typescript
interface ScanListItem {
  scanId: string;
  target: string;
  startedAt: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  summary: {
    critical: number;
    warning: number;
    ok: number;
  } | null;
}

// invoke('list_scans'): Promise<ScanListItem[]>
```

---

## 2. 패키지 (Package) API

### list_packages - 패키지 목록 조회

```typescript
interface PackageFilter {
  /** 카테고리 필터 (null이면 전체) */
  category?: 'SECRETS' | 'AUTH' | 'DATA' | 'NETWORK' | 'INJECTION' | 'INFRA' | 'MONITOR' | 'RESPONSE';
  /** 심각도 필터 */
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  /** 가격대 필터 */
  priceRange?: {
    min: number;
    max: number;
  };
  /** 검색 키워드 (name_kr, subtitle_kr, symptoms에서 검색) */
  search?: string;
}

/** Package 배열 반환 (schema.md의 Package interface) */
// invoke('list_packages', { filter?: PackageFilter }): Promise<Package[]>
```

### get_package - 패키지 상세 조회

```typescript
// invoke('get_package', { packageId: string }): Promise<Package | null>
```

### get_recommended_packages - 스캔 결과 기반 추천 패키지

```typescript
interface RecommendedPackages {
  /** 필수 추천 (critical/high 대응) */
  essential: Package[];
  /** 권장 추천 (medium 대응) */
  recommended: Package[];
  /** 번들 할인 가능 조합 */
  bundles: {
    name: string;
    name_kr: string;
    packages: Package[];
    originalPrice: number;
    discountedPrice: number;
    discountPercent: number;
  }[];
}

// invoke('get_recommended_packages', { scanId: string }): Promise<RecommendedPackages>
```

---

## 3. 장바구니/주문 (Cart/Order) API

### add_to_cart - 장바구니에 추가

```typescript
interface AddToCartRequest {
  packageId: string;
  fromScanId?: string;
}

// invoke('add_to_cart', { request: AddToCartRequest }): Promise<CartItem[]>
```

### get_cart - 장바구니 조회

```typescript
interface CartSummary {
  items: (CartItem & { package: Package })[];
  subtotalKrw: number;
  discountKrw: number;
  totalKrw: number;
}

// invoke('get_cart'): Promise<CartSummary>
```

### remove_from_cart - 장바구니에서 제거

```typescript
// invoke('remove_from_cart', { packageId: string }): Promise<CartItem[]>
```

### create_order - 주문 생성 (MVP: 모킹)

```typescript
interface CreateOrderRequest {
  paymentMethod: 'card' | 'kakao' | 'toss' | 'mock';
}

// invoke('create_order', { request: CreateOrderRequest }): Promise<Order>
```

---

## 4. 사용자 (User) API

### get_user - 현재 사용자 조회

```typescript
// invoke('get_user'): Promise<User>
```

### update_preferences - 설정 변경

```typescript
interface UpdatePreferencesRequest {
  language?: 'ko' | 'en';
  notificationsEnabled?: boolean;
}

// invoke('update_preferences', { request: UpdatePreferencesRequest }): Promise<User>
```

### complete_onboarding - 온보딩 완료 표시

```typescript
// invoke('complete_onboarding'): Promise<void>
```

---

## 5. 취약점 (Vulnerability) API

### list_vulnerabilities - 취약점 목록 조회

```typescript
interface VulnerabilityFilter {
  category?: string;
  severity?: string;
}

// invoke('list_vulnerabilities', { filter?: VulnerabilityFilter }): Promise<Vulnerability[]>
```

### get_vulnerability - 취약점 상세 조회

```typescript
// invoke('get_vulnerability', { vulnId: string }): Promise<Vulnerability | null>
```

---

## MVP 모킹 전략

MVP에서는 위 모든 커맨드를 `app/src/lib/mock/fake-scanner.ts`에서 구현합니다.

```typescript
// fake-scanner.ts 구조 (screen-builder가 구현)
export async function scanProject(request: ScanRequest): Promise<ScanResponse> {
  // 1. UUID 생성
  // 2. 30~60초 타이머 시작 (시뮬레이션)
  // 3. content/security/vulnerabilities.json에서 랜덤 취약점 선택
  // 4. content/packages/에서 대응 패키지 매칭
  // 5. 결과를 IndexedDB에 저장
}
```

### 모킹 데이터 생성 규칙

1. **스캔 결과**: 취약점 DB에서 5~15개를 랜덤 선택하여 Finding 생성
2. **심각도 분포**: critical 1~3개, high 2~4개, medium 3~5개, low+info 나머지
3. **추천 패키지**: Finding의 recommendedPackageIds를 종합하여 중복 제거
4. **번들 추천**: 같은 카테고리 패키지 2개 이상이면 번들 할인 제안
5. **진행률 시뮬레이션**: 0.5초 간격으로 percent를 증가시키며 step 전환

---

## 에러 처리

모든 커맨드에서 발생할 수 있는 에러 유형:

```typescript
interface ApiError {
  /** 에러 코드 */
  code: 'NOT_FOUND' | 'INVALID_INPUT' | 'NETWORK_ERROR' | 'SCAN_FAILED' | 'STORAGE_ERROR';
  /** 내부용 메시지 (영문) */
  message: string;
  /** 사용자 표시용 메시지 (한국어) */
  userMessage_kr: string;
}
```

### 에러 메시지 매핑

| 코드 | 사용자 메시지 |
|------|-------------|
| NOT_FOUND | "찾을 수 없어요. 다시 확인해주세요." |
| INVALID_INPUT | "입력을 다시 확인해주세요." |
| NETWORK_ERROR | "인터넷 연결을 확인해주세요." |
| SCAN_FAILED | "진단 중 문제가 생겼어요. 다시 해볼게요." |
| STORAGE_ERROR | "저장 중 문제가 생겼어요. 잠시 후 다시 시도해주세요." |
