# 기술 스택 선택 (ADR-001 상세)

> architect 산출물. design-system-engineer, screen-builder, layout-verifier가 참조합니다.

---

## 최종 선택 요약

| 레이어 | 선택 | 버전 |
|------|------|------|
| 앱 쉘 | Tauri 2 | ^2 |
| 프론트엔드 프레임워크 | Svelte 5 (runes) | ^5 |
| 라우팅 | SvelteKit + adapter-static | ^2 |
| 디자인 시스템 | @ios26_design_system/svelte | latest |
| 디자인 토큰 | @ios26_design_system/tokens | latest |
| 텍스트 측정 | @chenglou/pretext | latest |
| 상태 관리 | Svelte 5 runes ($state, $derived, $effect) | 내장 |
| 언어 | TypeScript strict | ^5 |
| 패키지 매니저 | pnpm workspaces | ^9 |

---

## 대안 비교

### 옵션 A: Tauri 2 + Svelte 5 (채택)

**장점**:
- ios26-design-system이 Svelte 5를 1급 시민으로 지원 (전용 컴포넌트 패키지 존재)
- Tauri 2는 Electron 대비 번들 크기가 1/10 이하 (~10MB vs ~150MB+)
- Rust 백엔드로 로컬 파일 I/O, 오프라인 데이터 저장이 안전하고 빠름
- Svelte 5 runes는 별도 상태 관리 라이브러리 불필요
- SvelteKit adapter-static으로 정적 빌드 후 Tauri WebView에 로드 가능
- pretext가 JS/TS 라이브러리이므로 웹 기반 프론트에서 자연스럽게 사용

**단점**:
- Tauri 2 생태계가 Electron보다 작음 (일부 플러그인 미비 가능)
- Svelte 5 runes가 비교적 최신이라 레퍼런스가 적을 수 있음

### 옵션 B: Electron + React

**장점**:
- Electron 생태계 성숙, 레퍼런스 풍부
- React 개발자 풀이 큼

**단점**:
- ios26-design-system이 React용 컴포넌트를 제공하지 않음 (웹 컴포넌트로 래핑 필요)
- Electron 번들 크기 150MB+ -> 비개발자에게 "앱 설치 경험" 저하
- React는 상태 관리에 별도 라이브러리(zustand, jotai 등) 필요 -> 복잡도 증가
- PROJECT.md의 "네이티브 느낌" 요구사항과 맞지 않음

**탈락 이유**: ios26-design-system 1급 지원 부재, 번들 크기 과다

### 옵션 C: Flutter + ios26_design_system (Flutter 바인딩)

**장점**:
- 진짜 네이티브 위젯 렌더링
- iOS 느낌이 가장 자연스러움

**단점**:
- pretext가 JS/TS 전용이므로 Flutter에서 사용 불가 -> layout-verifier 파이프라인 깨짐
- ios26-design-system의 Flutter 바인딩 성숙도 불확실
- Dart 언어 -> 기존 하네스의 TypeScript 중심 설계와 불일치
- content/ JSON 로딩에 추가 작업 필요

**탈락 이유**: pretext 호환 불가, 하네스 TypeScript 전제 위반

### 옵션 D: Tauri 2 + Vue 3

**장점**:
- Vue 3 Composition API가 Svelte runes와 유사한 반응성
- 커뮤니티 규모가 Svelte보다 큼

**단점**:
- ios26-design-system이 Vue 전용 컴포넌트를 제공하지 않음
- Svelte 대비 번들 크기가 더 큼 (런타임 포함)

**탈락 이유**: ios26-design-system 1급 지원 부재

---

## 기술 제약 매핑

| PROJECT.md 제약 | 스택에서의 해결 |
|----------------|---------------|
| 프론트에 외부 API 키 금지 | Tauri Rust 백엔드에서 민감 정보 처리. 프론트 번들에 키 미포함 |
| 오프라인 우선 | Tauri 로컬 파일시스템 접근. content/ JSON을 앱에 번들. IndexedDB로 스캔 기록 보존 |
| 데이터 최소 수집 | URL 입력 전까지 텔레메트리 없음. Tauri의 sandboxed 환경 |
| iOS 26 Liquid Glass | @ios26_design_system/svelte 토큰과 컴포넌트 직접 사용 |
| 한국어 1급 | content/copy/*.md에서 텍스트 로드. i18n 키 구조 유지 |

---

## 핵심 의존성 설명

### @ios26_design_system/svelte
iOS 26 디자인 언어(Liquid Glass)를 Svelte 5 컴포넌트로 구현한 디자인 시스템.
토큰(색상, 타이포, 간격), Liquid Glass 효과(blur, refraction, depth), 
기본 컴포넌트(Button, Card, TabBar, Sheet 등)를 제공.

### @ios26_design_system/tokens
디자인 토큰만 분리된 패키지. CSS 변수 또는 JS 객체로 소비 가능.
design-system-engineer가 이 토큰을 기반으로 앱 전용 토큰을 확장.

### @chenglou/pretext
AI 개발 시점에서 텍스트 레이아웃을 검증하는 라이브러리.
layout-verifier가 이 라이브러리로 312개 패키지의 한국어 텍스트가
UI 컴포넌트 폭 안에 들어가는지 빌드 타임에 검증.

### @tauri-apps/api
Tauri IPC 브릿지. 프론트엔드에서 Rust 백엔드 커맨드를 호출할 때 사용.
MVP에서는 대부분 모킹이지만 인터페이스는 실제 IPC 형태로 설계.

---

## 빌드 파이프라인

```
pnpm install
  -> SvelteKit dev server (개발)
  -> SvelteKit build (adapter-static -> app/build/)
  -> Tauri build (app/build/를 WebView에 번들 -> .dmg/.exe/.AppImage)
```

개발 시에는 `pnpm dev`로 SvelteKit dev server만 띄워서 빠른 HMR 확인.
프로덕션 빌드 시 `pnpm build && pnpm tauri build`로 네이티브 앱 생성.
