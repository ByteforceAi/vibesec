# 바이브코딩 보안센터 — Agent Harness

> Claude Code 서브에이전트 기반 병렬 실행 하네스. 
> 이 폴더는 **프로젝트 자체가 아니라 프로젝트를 만드는 에이전트 시스템**입니다.

## 이게 뭔가요

`바이브코딩 보안센터`는 Cursor/Claude/v0/Lovable 같은 도구로 앱을 뚝딱 만든 **일반인**이 
"내가 만든 거 해킹 당하면 어쩌지?" 하는 걱정을 해결해주는 네이티브 느낌의 iOS 스타일 앱입니다. 
컴퓨터 수리점처럼 **증상 → 진단 → 패키지 처방** 구조로 보안 서비스를 판매합니다.

이 하네스는 그 앱을 완성하기 위한 **8개의 전문 에이전트**와 **검증 게이트**, **상태 보드**로 
구성됩니다. Claude Desktop 내 Claude Code에서 작동하도록 설계되었습니다.

## 핵심 설계 원칙 (Harness Engineering)

1. **Contracts over conversation** — 에이전트 간 통신은 대화가 아니라 파일 산출물
2. **Single responsibility** — 한 에이전트는 하나만 잘한다
3. **Verification gates** — 각 웨이브 종료 시 자동+수동 검증
4. **Observable state** — `harness/STATUS.md`로 실시간 진행 추적
5. **Deterministic scaffolding** — LLM은 비결정적, 그걸 감싸는 파이프라인은 결정적
6. **Human-in-the-loop** — 웨이브 전환 시점마다 사람이 승인
7. **Artifacts are sources of truth** — 누가 뭘 결정했는지는 디스크에 남는다

## 파일 구조

```
vibesec-harness/
├── README.md                  # ← 지금 이 파일
├── CLAUDE.md                  # Claude Code가 매 세션 자동 로드하는 메인 컨텍스트
├── harness/
│   ├── PROJECT.md             # 비전, 타겟, 제약 (불변)
│   ├── WAVE-PLAN.md           # 4개 웨이브 + 의존성 DAG
│   ├── CONTRACTS.md           # 에이전트 I/O 컨트랙트
│   ├── VERIFICATION.md        # 품질 게이트와 체크리스트
│   ├── STATUS.md              # 라이브 상태 보드 (에이전트가 쓰는 곳)
│   └── DECISIONS.md           # ADR 로그 (architect가 주로 쓴다)
└── .claude/
    └── agents/
        ├── product-strategist.md     # (W1) 페르소나·패키지 전략
        ├── architect.md              # (W1) 스택·스키마·ADR
        ├── design-system-engineer.md # (W2) iOS26 토큰·컴포넌트 래핑
        ├── content-curator.md        # (W2) 312개 패키지 카피·카탈로그
        ├── security-curator.md       # (W2) 취약점 지식 베이스
        ├── screen-builder.md         # (W3) 화면 구현 (Svelte)
        ├── layout-verifier.md        # (W4) pretext 기반 텍스트 검증
        └── qa-reviewer.md            # (W4) 접근성·플로우·에지케이스
```

## 설치

이 폴더를 실제 프로젝트 루트로 복사하세요:

```bash
# 1. 프로젝트 폴더 만들기
mkdir vibesec-app && cd vibesec-app
git init

# 2. 이 하네스를 루트에 복사
cp -r /path/to/vibesec-harness/. .

# 3. Claude Desktop의 Claude Code에서 이 폴더 열기
# 4. 세션 시작 후 /agents 로 8개 에이전트가 로드됐는지 확인
```

Claude Code는 `.claude/agents/*.md`를 세션 시작 시 자동으로 로드하고, 
`CLAUDE.md`를 항상 컨텍스트에 포함시킵니다.

## 실행 방법

오케스트레이션은 **메인 Claude Code 세션**이 담당합니다. 서브에이전트를 직접 시키면 됩니다:

### Wave 1 (순차·블로킹)
```
Use the product-strategist subagent on "W1 kickoff: 
    harness/PROJECT.md 읽고 docs/product/*.md 산출물 생성"

Use the architect subagent on "W1 kickoff: 
    harness/PROJECT.md + docs/product/personas.md 읽고 
    스택 결정 ADR 작성 및 docs/arch/*.md 산출물 생성"
```

**게이트**: 사람이 `docs/arch/stack.md`와 `docs/product/packages-catalog.md` 승인

### Wave 2 (3개 병렬)
```
Use the design-system-engineer subagent in the background on "W2"
Use the content-curator subagent in the background on "W2"
Use the security-curator subagent in the background on "W2"
```

**게이트**: `harness/STATUS.md`에서 3개 모두 `done`, `VERIFICATION.md`의 W2 체크리스트 통과

### Wave 3 (순차)
```
Use the screen-builder subagent on "W3: app/ 디렉토리에 모든 화면 구현"
```

### Wave 4 (2개 병렬)
```
Use the layout-verifier subagent in the background on "W4: 
    pretext로 앱 전체 텍스트 레이아웃 검증"
Use the qa-reviewer subagent in the background on "W4: 
    접근성·플로우·에지케이스 리뷰"
```

## 디자인 시스템 참조

- [ios26-design-system](https://github.com/seunghan91/ios26-design-system) — iOS 26 Liquid Glass 토큰/컴포넌트 (Svelte 5 지원)
- [pretext](https://github.com/chenglou/pretext) — DOM reflow 없이 텍스트 레이아웃 측정, AI 개발시 오버플로우 검증에 핵심

## 라이선스

MIT (하네스 자체). 참조 레포들은 각자 라이선스 확인 필요.
