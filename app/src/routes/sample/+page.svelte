<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  let reducedMotion = $state(false);

  if (typeof window !== 'undefined') {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  const ANIM_MS = reducedMotion ? 0 : 400;

  interface Finding {
    severity: 'critical' | 'warning' | 'ok';
    icon: string;
    title: string;
    detail: string;
    fixTime: string;
  }

  const findings: Finding[] = [
    {
      severity: 'critical',
      icon: '\u25CF',
      title: '비밀번호가 문 앞에 놓여 있어요',
      detail: '.env 파일이 GitHub에 올라가 있습니다.',
      fixTime: '지금 고치면: 10분',
    },
    {
      severity: 'warning',
      icon: '\u25B2',
      title: '금고 문이 열려 있어요',
      detail: '데이터베이스 접근 제한이 설정되지 않았습니다.',
      fixTime: '지금 고치면: 30분',
    },
    {
      severity: 'warning',
      icon: '\u25B2',
      title: '출입증 없이 들어올 수 있어요',
      detail: 'API 엔드포인트에 인증이 적용되지 않았습니다.',
      fixTime: '지금 고치면: 1시간',
    },
    {
      severity: 'ok',
      icon: '\u2713',
      title: 'HTTPS 연결이 잘 되어 있어요',
      detail: 'SSL 인증서가 정상적으로 설정되어 있습니다.',
      fixTime: '',
    },
    {
      severity: 'ok',
      icon: '\u2713',
      title: '기본 보안 헤더가 설정되어 있어요',
      detail: 'X-Frame-Options, CSP 헤더가 적용되어 있습니다.',
      fixTime: '',
    },
  ];

  const todoItems = [
    'GitHub에서 .env 파일 삭제',
    'API 키 재발급',
    '데이터베이스 접근 제한 설정',
  ];

  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const okCount = findings.filter((f) => f.severity === 'ok').length;
</script>

<svelte:head>
  <title>보고서 샘플 | Byteforce Security</title>
  <meta name="description" content="실제 보안 점검 보고서는 이렇게 생겼습니다. 기술 용어 없이, 비유로 설명하는 보고서." />
  <meta property="og:title" content="보고서 샘플 | Byteforce Security" />
  <meta property="og:description" content="실제 보안 점검 보고서는 이렇게 생겼습니다. 기술 용어 없이, 비유로 설명하는 보고서." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://byteforceai.github.io/vibesec/sample" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="보고서 샘플 | Byteforce Security" />
  <meta name="twitter:description" content="실제 보안 점검 보고서는 이렇게 생겼습니다. 기술 용어 없이, 비유로 설명하는 보고서." />
</svelte:head>

<div class="page">

  <!-- App bar -->
  <header class="bar">
    <button class="bar-back" onclick={() => goto(`${base}/`)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
    </button>
    <span class="bar-title">BYTEFORCE</span>
    <span class="bar-spacer"></span>
  </header>

  <!-- Content -->
  <div class="content">

    <!-- Document Objet -->
    <div class="objet-wrap fade-in" style="animation-delay: 0s;">
      <div class="objet-doc">
        <div class="doc-body">
          <div class="doc-fold"></div>
          <!-- Mini content lines -->
          <div class="doc-line doc-line--title"></div>
          <div class="doc-line doc-line--text"></div>
          <div class="doc-line doc-line--text doc-line--short"></div>
          <div class="doc-line doc-line--gap"></div>
          <div class="doc-line doc-line--badge doc-line--badge-red"></div>
          <div class="doc-line doc-line--text"></div>
          <div class="doc-line doc-line--badge doc-line--badge-green"></div>
          <div class="doc-line doc-line--text doc-line--short"></div>
        </div>
      </div>
    </div>

    <p class="page-label fade-in" style="animation-delay: 0.1s;">보고서 미리보기</p>
    <h1 class="page-heading fade-in" style="animation-delay: 0.2s;">이런 보고서를 받게 됩니다</h1>

    <!-- Report document -->
    <div class="report fade-in" style="animation-delay: 0.3s;">

      <!-- Report header -->
      <div class="report-header">
        <div class="report-logo">BYTEFORCE SECURITY</div>
        <h2 class="report-title">보안 점검 보고서</h2>
        <div class="report-meta">
          <div class="meta-row">
            <span class="meta-key">프로젝트</span>
            <span class="meta-val">(샘플) 쇼핑몰 MVP</span>
          </div>
          <div class="meta-row">
            <span class="meta-key">점검일</span>
            <span class="meta-val">2026년 3월 15일</span>
          </div>
          <div class="meta-row">
            <span class="meta-key">점검자</span>
            <span class="meta-val">김보안 시니어 엔지니어</span>
          </div>
        </div>
      </div>

      <div class="report-divider"></div>

      <!-- Summary -->
      <div class="report-section">
        <h3 class="section-label">한 줄 요약</h3>
        <p class="summary-text">총 5건의 확인 사항이 발견되었습니다. 이 중 1건은 즉시 조치가 필요합니다.</p>
      </div>

      <div class="report-divider"></div>

      <!-- Health check -->
      <div class="report-section">
        <h3 class="section-label">건강검진표</h3>
        <div class="health-bar">
          <span class="health-item health-item--critical">긴급 {criticalCount}건</span>
          <span class="health-item health-item--warning">주의 {warningCount}건</span>
          <span class="health-item health-item--ok">안전 {okCount}건</span>
        </div>
      </div>

      <div class="report-divider"></div>

      <!-- Findings -->
      <div class="report-section">
        <h3 class="section-label">발견 항목</h3>
        <div class="findings">
          {#each findings as finding, i}
            <div class="finding finding--{finding.severity}" style="animation-delay: {i * 80}ms; animation-duration: {ANIM_MS}ms;">
              <div class="finding-header">
                <span class="finding-badge finding-badge--{finding.severity}">
                  {#if finding.severity === 'critical'}긴급{:else if finding.severity === 'warning'}주의{:else}안전{/if}
                </span>
                <span class="finding-title">{finding.title}</span>
              </div>
              <p class="finding-detail">{finding.detail}</p>
              {#if finding.fixTime}
                <span class="finding-fix">{finding.fixTime}</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <div class="report-divider"></div>

      <!-- Action items -->
      <div class="report-section">
        <h3 class="section-label">지금 당장 할 일</h3>
        <ol class="todo-list">
          {#each todoItems as item}
            <li class="todo-item">{item}</li>
          {/each}
        </ol>
      </div>

    </div>

    <!-- CTA -->
    <div class="cta-area fade-in" style="animation-delay: 0.4s;">
      <button class="cta-btn cta-btn--full" onclick={() => goto(`${base}/packages`)}>
        전체 보고서 보기
      </button>
      <button class="cta-btn cta-btn--primary" onclick={() => goto(`${base}/contact`)}>
        내 프로젝트도 점검 받기
      </button>
    </div>

  </div>

  <!-- Bottom nav -->
  <nav class="nav">
    <button class="nav-i" onclick={() => goto(`${base}/`)}>홈</button>
    <button class="nav-i" onclick={() => goto(`${base}/check`)}>자가진단</button>
    <button class="nav-i" onclick={() => goto(`${base}/packages`)}>요금제</button>
    <button class="nav-i" onclick={() => goto(`${base}/contact`)}>상담예약</button>
  </nav>
</div>

<style>
  .page {
    --bg-void: #05060A;
    --bg-abyss: #0A0E1A;
    --bg-deep: #0D1528;
    --border-dim: rgba(120, 160, 220, 0.08);
    --border-active: rgba(10, 132, 255, 0.45);
    --blue-core: #0A84FF;
    --blue-glow: #3BA0FF;
    --coral-alert: #FF6B47;
    --amber-warn: #FFD60A;
    --green-ok: #32D74B;
    --text-primary: #EAF2FF;
    --text-secondary: rgba(234, 242, 255, 0.62);
    --text-tertiary: rgba(234, 242, 255, 0.38);
    --ease-organic: cubic-bezier(0.22, 1, 0.36, 1);
    --mono: "JetBrains Mono", "SF Mono", monospace;
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;

    display: flex; flex-direction: column; min-height: 100dvh;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10, 132, 255, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0, 71, 179, 0.08) 0%, transparent 50%),
      var(--bg-void);
    color: var(--text-primary); font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }

  /* Page entry animation */
  .fade-in {
    opacity: 0;
    transform: translateY(8px);
    animation: pageIn 0.5s var(--ease-organic) forwards;
  }
  @keyframes pageIn {
    to { opacity: 1; transform: translateY(0); }
  }

  /* Document Objet */
  .objet-wrap {
    display: flex;
    justify-content: center;
    padding: 12px 0 8px;
  }
  .objet-doc {
    animation: docFloat 4s ease-in-out infinite;
    filter: drop-shadow(0 6px 20px rgba(10, 132, 255, 0.15));
  }
  @keyframes docFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-4px) rotate(0.5deg); }
  }
  .doc-body {
    width: 64px;
    height: 80px;
    background: linear-gradient(165deg, var(--bg-deep) 0%, var(--bg-abyss) 100%);
    border: 1px solid rgba(10, 132, 255, 0.25);
    border-radius: 6px;
    position: relative;
    padding: 14px 8px 8px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow: hidden;
  }
  .doc-fold {
    position: absolute;
    top: 0;
    right: 0;
    width: 14px;
    height: 14px;
    background: linear-gradient(135deg, transparent 50%, rgba(10, 132, 255, 0.12) 50%);
    border-bottom-left-radius: 4px;
  }
  .doc-fold::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 14px;
    height: 14px;
    background: linear-gradient(135deg, var(--bg-void) 50%, transparent 50%);
  }
  .doc-line {
    height: 2px;
    border-radius: 1px;
  }
  .doc-line--title {
    width: 60%;
    background: rgba(10, 132, 255, 0.5);
    height: 3px;
    margin-bottom: 2px;
  }
  .doc-line--text {
    width: 90%;
    background: rgba(234, 242, 255, 0.1);
  }
  .doc-line--short {
    width: 60%;
  }
  .doc-line--gap {
    height: 4px;
  }
  .doc-line--badge {
    width: 24px;
    height: 4px;
    border-radius: 2px;
  }
  .doc-line--badge-red {
    background: rgba(255, 107, 71, 0.6);
  }
  .doc-line--badge-green {
    background: rgba(50, 215, 75, 0.5);
  }

  /* App bar */
  .bar {
    position: sticky; top: 0; z-index: 90; height: 48px;
    display: flex; align-items: center; gap: 12px;
    padding: 0 24px; flex-shrink: 0;
    background: rgba(5,6,10,0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-dim);
  }
  .bar-back {
    background: none; border: none; color: var(--text-secondary); cursor: pointer;
    display: flex; align-items: center; padding: 4px; transition: color 0.15s;
  }
  .bar-back:hover { color: var(--text-primary); }
  .bar-back:active { transform: scale(0.95); }
  .bar-title {
    font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
    color: var(--text-secondary);
  }
  .bar-spacer { flex: 1; }

  /* Content */
  .content {
    flex: 1;
    padding: 24px 20px;
    max-width: 640px; margin: 0 auto; width: 100%;
  }

  .page-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    color: var(--blue-core); margin: 0 0 8px;
    text-transform: uppercase;
  }
  .page-heading {
    font-size: 28px; font-weight: 700; margin: 0 0 24px;
    line-height: 1.3;
  }

  /* Report card */
  .report {
    background: linear-gradient(165deg, var(--bg-deep) 0%, var(--bg-abyss) 100%);
    border: 1px solid rgba(10, 132, 255, 0.12);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(10, 132, 255, 0.04);
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .report:hover {
    border-color: rgba(10, 132, 255, 0.3);
    box-shadow: 0 0 30px rgba(10, 132, 255, 0.1), 0 12px 40px rgba(0, 20, 60, 0.2);
  }

  .report-header {
    padding: 32px 32px 24px;
    border-bottom: 1px solid var(--border-dim);
  }
  .report-logo {
    font-family: var(--mono);
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.15em;
    color: var(--text-tertiary);
    margin-bottom: 12px;
  }
  .report-title {
    font-size: 20px; font-weight: 700;
    margin: 0 0 16px;
  }
  .report-meta {
    display: flex; flex-direction: column; gap: 6px;
  }
  .meta-row {
    display: flex; gap: 12px; font-size: 13px;
  }
  .meta-key {
    color: var(--text-tertiary); min-width: 60px;
  }
  .meta-val {
    color: var(--text-secondary);
  }

  .report-divider {
    height: 1px;
    background: var(--border-dim);
  }

  .report-section {
    padding: 24px 32px;
  }
  .section-label {
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
    margin: 0 0 14px;
    text-transform: uppercase;
  }
  .summary-text {
    font-size: 15px; line-height: 1.6;
    color: var(--text-primary);
    margin: 0;
  }

  /* Health bar */
  .health-bar {
    display: flex; gap: 12px; flex-wrap: wrap;
  }
  .health-item {
    font-size: 14px; font-weight: 600;
    padding: 8px 16px; border-radius: 10px;
  }
  .health-item--critical {
    background: rgba(255, 107, 71, 0.12);
    color: var(--coral-alert);
    border: 1px solid rgba(255, 107, 71, 0.25);
  }
  .health-item--warning {
    background: rgba(255, 214, 10, 0.08);
    color: var(--amber-warn);
    border: 1px solid rgba(255, 214, 10, 0.2);
  }
  .health-item--ok {
    background: rgba(50, 215, 75, 0.08);
    color: var(--green-ok);
    border: 1px solid rgba(50, 215, 75, 0.2);
  }

  /* Findings */
  .findings {
    display: flex; flex-direction: column; gap: 16px;
  }
  .finding {
    padding: 20px;
    border-radius: 12px;
    border: 1px solid var(--border-dim);
    background: rgba(5, 6, 10, 0.5);
    animation: findingIn var(--ease-organic) forwards;
    opacity: 0;
    transition: background 0.2s;
  }
  .finding:hover {
    background: rgba(10, 132, 255, 0.03);
  }
  @keyframes findingIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .finding--critical { border-left: 3px solid var(--coral-alert); box-shadow: -4px 0 12px rgba(255, 107, 71, 0.08); }
  .finding--warning { border-left: 3px solid var(--amber-warn); box-shadow: -4px 0 12px rgba(255, 214, 10, 0.06); }
  .finding--ok { border-left: 3px solid var(--green-ok); box-shadow: -4px 0 12px rgba(50, 215, 75, 0.06); }

  .finding-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 8px;
  }
  .finding-badge {
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.03em;
    padding: 3px 10px;
    border-radius: 6px;
    flex-shrink: 0;
  }
  .finding-badge--critical {
    background: rgba(255, 107, 71, 0.15);
    color: var(--coral-alert);
  }
  .finding-badge--warning {
    background: rgba(255, 214, 10, 0.1);
    color: var(--amber-warn);
  }
  .finding-badge--ok {
    background: rgba(50, 215, 75, 0.1);
    color: var(--green-ok);
  }

  .finding-title {
    font-size: 15px; font-weight: 600;
  }
  .finding-detail {
    font-size: 13px; line-height: 1.5;
    color: var(--text-secondary);
    margin: 0 0 4px; padding-left: 0;
  }
  .finding-fix {
    font-size: 12px;
    color: var(--blue-core);
    font-weight: 500;
  }

  /* Todo */
  .todo-list {
    margin: 0; padding-left: 20px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .todo-item {
    font-size: 14px; line-height: 1.5;
    color: var(--text-primary);
  }
  .todo-item::marker {
    color: var(--blue-core);
  }

  /* CTA */
  .cta-area {
    padding: 32px 0 16px;
    display: flex; flex-direction: column; gap: 12px;
    align-items: stretch;
  }
  .cta-btn {
    padding: 14px 36px; border-radius: 980px; border: none;
    font-family: var(--font); font-size: 16px; font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.3s, transform 0.15s;
    text-align: center;
  }
  .cta-btn:active { transform: scale(0.97); }
  .cta-btn--primary {
    background: var(--blue-core); color: #fff;
    box-shadow: 0 0 20px rgba(10, 132, 255, 0.15);
  }
  .cta-btn--primary:hover {
    background: var(--blue-glow);
    box-shadow: 0 0 30px rgba(10, 132, 255, 0.25);
    transform: translateY(-1px);
  }
  .cta-btn--full {
    background: transparent; color: var(--text-secondary);
    border: 1px solid var(--border-dim);
  }
  .cta-btn--full:hover {
    color: var(--text-primary);
    border-color: var(--border-active);
    box-shadow: 0 0 20px rgba(10, 132, 255, 0.1);
    transform: translateY(-1px);
  }

  /* Bottom nav */
  .nav {
    position: sticky; bottom: 0;
    display: flex; justify-content: space-around;
    height: 52px; align-items: center;
    background: rgba(5,6,10,0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border-dim);
    flex-shrink: 0;
    z-index: 90;
  }
  .nav-i {
    background: none; border: none;
    border-top: 2px solid transparent;
    font-family: var(--font); font-size: 13px; font-weight: 500;
    color: var(--text-tertiary); cursor: pointer;
    transition: color 0.15s;
    padding: 8px 16px 6px;
  }
  .nav-i:hover { color: var(--text-secondary); }
  .nav-i--on {
    color: var(--blue-core);
    border-top-color: var(--blue-core);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0s !important;
      transition-duration: 0.01ms !important;
    }
    .fade-in {
      opacity: 1;
      transform: none;
    }
  }
</style>
