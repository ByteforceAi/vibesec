<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  interface Finding {
    severity: 'critical' | 'warning' | 'ok';
    title: string;
    detail: string;
    fixTime: string;
  }

  const findings: Finding[] = [
    {
      severity: 'critical',
      title: '비밀번호가 문 앞에 놓여 있어요',
      detail: '.env 파일이 GitHub 커밋 히스토리에 포함되어 있습니다. OpenAI API 키(sk-proj-***), Supabase 서비스 키가 공개 상태입니다. 이 키를 가진 누구나 본인 명의로 API를 호출할 수 있으며, 요금이 청구됩니다.',
      fixTime: '10분',
    },
    {
      severity: 'warning',
      title: '금고 문이 열려 있어요',
      detail: 'Supabase 프로젝트의 Row Level Security(RLS)가 비활성화되어 있습니다. anon 키만 있으면 모든 테이블의 데이터를 읽고, 쓰고, 삭제할 수 있는 상태입니다.',
      fixTime: '30분',
    },
    {
      severity: 'warning',
      title: '출입증 없이 들어올 수 있어요',
      detail: '/api/admin 엔드포인트에 인증 미들웨어가 적용되지 않았습니다. URL을 아는 사람은 누구나 관리자 기능에 접근할 수 있습니다.',
      fixTime: '1시간',
    },
    {
      severity: 'ok',
      title: 'HTTPS 연결이 잘 되어 있어요',
      detail: 'Vercel 배포를 통해 SSL 인증서가 자동으로 적용되어 있습니다. 전송 중 데이터 도청 위험은 없습니다.',
      fixTime: '',
    },
    {
      severity: 'ok',
      title: '기본 보안 헤더가 설정되어 있어요',
      detail: 'X-Frame-Options, Content-Security-Policy 헤더가 Vercel 기본값으로 적용되어 있습니다.',
      fixTime: '',
    },
  ];

  const actions = [
    { step: '01', text: 'GitHub에서 .env 파일을 삭제하고, 커밋 히스토리에서도 제거', priority: 'critical' },
    { step: '02', text: 'OpenAI, Supabase 대시보드에서 기존 키를 폐기하고 재발급', priority: 'critical' },
    { step: '03', text: 'Supabase에서 RLS를 활성화하고, 테이블별 정책 설정', priority: 'warning' },
  ];

  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  const okCount = findings.filter(f => f.severity === 'ok').length;

  // Labor Illusion: document loading sequence
  let docReady = $state(false);
  let loadStep = $state(0);
  const loadSteps = ['보고서를 불러오고 있습니다', '내용을 복호화하고 있습니다', '열람 준비 완료'];

  $effect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      docReady = true;
      return;
    }

    // Already viewed this session? Skip loading
    if (sessionStorage.getItem('bf_sample_viewed')) {
      docReady = true;
      return;
    }

    loadStep = 0;
    const timers = [
      setTimeout(() => { loadStep = 1; }, 800),
      setTimeout(() => { loadStep = 2; }, 1500),
      setTimeout(() => {
        docReady = true;
        sessionStorage.setItem('bf_sample_viewed', '1');
      }, 2000),
    ];

    return () => timers.forEach(clearTimeout);
  });
</script>

<svelte:head>
  <title>보고서 샘플 | Byteforce Security</title>
  <meta name="description" content="실제 보안 점검 보고서는 이렇게 생겼습니다. 기술 용어 없이, 비유로 설명하는 보고서." />
  <meta property="og:title" content="보고서 샘플 | Byteforce Security" />
  <meta property="og:description" content="실제 보안 점검 보고서는 이렇게 생겼습니다." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://byteforceai.github.io/vibesec/sample" />
</svelte:head>

<div class="report-page">
  <header class="bar">
    <span class="bar-brand">BYTEFORCE</span>
    <button class="bar-link" onclick={() => goto(`${base}/`)}>홈으로</button>
  </header>

  {#if !docReady}
    <!-- Document loading: Labor Illusion -->
    <div class="doc-loading">
      <div class="dl-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="4" width="28" height="40" rx="4" stroke="rgba(10,132,255,0.3)" stroke-width="1.5" fill="rgba(10,132,255,0.04)"/>
          <line x1="16" y1="16" x2="32" y2="16" stroke="rgba(10,132,255,0.2)" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="16" y1="22" x2="28" y2="22" stroke="rgba(10,132,255,0.15)" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="16" y1="28" x2="30" y2="28" stroke="rgba(10,132,255,0.1)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="dl-text">{loadSteps[loadStep]}</p>
      <div class="dl-bar">
        <div class="dl-fill" style="width: {((loadStep + 1) / loadSteps.length) * 100}%"></div>
      </div>
      <span class="dl-badge">CONFIDENTIAL</span>
    </div>
  {:else}

  <article class="document">

    <!-- Document header -->
    <header class="doc-header">
      <div class="doc-header-top">
        <span class="doc-org">BYTEFORCE SECURITY</span>
        <span class="doc-type">보안 점검 보고서</span>
      </div>
      <div class="doc-divider"></div>

      <h1 class="doc-project">쇼핑몰 MVP</h1>
      <span class="doc-sample-badge">SAMPLE</span>

      <dl class="doc-meta">
        <div class="meta-row">
          <dt>프로젝트</dt>
          <dd>쇼핑몰 MVP (샘플)</dd>
        </div>
        <div class="meta-row">
          <dt>점검일</dt>
          <dd>2026. 03. 15</dd>
        </div>
        <div class="meta-row">
          <dt>점검자</dt>
          <dd>김보안 시니어 엔지니어</dd>
        </div>
        <div class="meta-row">
          <dt>점검 범위</dt>
          <dd>핵심 20+ 항목</dd>
        </div>
        <div class="meta-row">
          <dt>보고서 번호</dt>
          <dd>BF-2026-0315-001</dd>
        </div>
      </dl>
    </header>

    <!-- Executive Summary -->
    <section class="doc-section">
      <h2 class="section-label">Executive Summary</h2>

      <p class="summary-text">
        총 <strong>{criticalCount + warningCount + okCount}건</strong>의 확인 사항이 발견되었습니다.<br/>
        이 중 <strong class="text-critical">{criticalCount}건</strong>은 즉시 조치가 필요합니다.
      </p>

      <div class="summary-stats">
        <div class="stat stat--critical">
          <span class="stat-num">{criticalCount}</span>
          <span class="stat-label">긴급</span>
        </div>
        <div class="stat stat--warning">
          <span class="stat-num">{warningCount}</span>
          <span class="stat-label">주의</span>
        </div>
        <div class="stat stat--ok">
          <span class="stat-num">{okCount}</span>
          <span class="stat-label">안전</span>
        </div>
      </div>
    </section>

    <!-- Findings -->
    <section class="doc-section">
      <h2 class="section-label">Findings</h2>

      {#each findings as finding, i}
        <div class="finding">
          <div class="finding-num">{String(i + 1).padStart(2, '0')}</div>
          <div class="finding-body">
            <div class="finding-head">
              <span class="severity severity--{finding.severity}">
                {finding.severity === 'critical' ? '긴급' : finding.severity === 'warning' ? '주의' : '안전'}
              </span>
            </div>
            <h3 class="finding-title">{finding.title}</h3>
            <p class="finding-detail">{finding.detail}</p>
            {#if finding.fixTime}
              <span class="finding-fix">예상 수정 시간: {finding.fixTime}</span>
            {/if}
          </div>
        </div>
        {#if i < findings.length - 1}
          <div class="finding-divider"></div>
        {/if}
      {/each}
    </section>

    <!-- Immediate Actions -->
    <section class="doc-section">
      <h2 class="section-label">Immediate Actions</h2>

      <p class="actions-intro">아래 항목을 순서대로 진행하시면 긴급 이슈가 해결됩니다.</p>

      <ol class="action-list">
        {#each actions as action}
          <li class="action-item">
            <span class="action-num">{action.step}</span>
            <span class="action-text">{action.text}</span>
            <span class="action-priority action-priority--{action.priority}">
              {action.priority === 'critical' ? '긴급' : '주의'}
            </span>
          </li>
        {/each}
      </ol>
    </section>

    <!-- Next Steps -->
    <section class="doc-section">
      <h2 class="section-label">Next Steps</h2>

      <p class="next-text">
        이 보고서는 <strong>기본 점검</strong>(핵심 20+ 항목) 결과입니다.
        인증 체계, 데이터베이스 보안, API 전수 검증 등 더 깊은 점검이 필요하시면
        <strong>정밀 점검</strong>(60+ 항목)을 추천합니다.
      </p>

      <div class="next-table">
        <div class="next-row">
          <span class="next-plan">기본 점검</span>
          <span class="next-scope">20+ 항목</span>
          <span class="next-tag next-tag--current">현재</span>
        </div>
        <div class="next-row">
          <span class="next-plan">정밀 점검</span>
          <span class="next-scope">60+ 항목</span>
          <span class="next-tag next-tag--rec">추천</span>
        </div>
        <div class="next-row">
          <span class="next-plan">풀 정비</span>
          <span class="next-scope">120+ 항목 + 직접 수정</span>
          <span class="next-tag"></span>
        </div>
      </div>
    </section>

    <!-- Confidentiality -->
    <div class="confidential">
      <p>이 보고서는 샘플입니다. 실제 보고서에는 프로젝트별 상세 분석, 코드 위치, 스크린샷이 포함됩니다.</p>
      <p>CONFIDENTIAL -- BYTEFORCE SECURITY -- BF-2026-0315-001</p>
    </div>

    <!-- CTA -->
    <div class="doc-cta">
      <button class="cta-btn" onclick={() => goto(`${base}/contact`)}>내 프로젝트도 점검 받기</button>
      <span class="cta-sub">24시간 내 견적서 발송</span>
    </div>

  </article>
  {/if}

  <nav class="nav">
    <button class="nav-i" onclick={() => goto(`${base}/`)}>홈</button>
    <button class="nav-i" onclick={() => goto(`${base}/check`)}>자가진단</button>
    <button class="nav-i" onclick={() => goto(`${base}/packages`)}>요금제</button>
    <button class="nav-i" onclick={() => goto(`${base}/contact`)}>상담예약</button>
  </nav>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&display=swap');

  .report-page {
    --bg: #05060A;
    --text-1: #EAF2FF;
    --text-2: rgba(234, 242, 255, 0.62);
    --text-3: rgba(234, 242, 255, 0.32);
    --border: rgba(234, 242, 255, 0.08);
    --critical: #FF453A;
    --warning: #FF9F0A;
    --ok: #32D74B;
    --blue: #0A84FF;
    --mono: "JetBrains Mono", "SF Mono", monospace;
    --serif: "Cormorant Garamond", "Georgia", serif;
    --sans: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
    --ease: cubic-bezier(0.22, 1, 0.36, 1);

    min-height: 100dvh;
    background: var(--bg);
    color: var(--text-1);
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }

  /* Bar */
  .bar {
    position: sticky; top: 0; z-index: 50;
    height: 48px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
    background: rgba(5,6,10,0.85); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    position: relative;
  }
  /* Neon glow on bar bottom edge */
  .bar::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(10, 132, 255, 0.03) 20%,
      rgba(59, 160, 255, 0.15) 45%,
      rgba(90, 200, 250, 0.3) 50%,
      rgba(59, 160, 255, 0.15) 55%,
      rgba(10, 132, 255, 0.03) 80%,
      transparent 100%
    );
    pointer-events: none;
  }
  .bar-brand { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--text-3); }
  .bar-link { font-family: var(--sans); font-size: 13px; color: var(--blue); background: none; border: none; cursor: pointer; }

  /* Document Loading: Labor Illusion */
  .doc-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center;
    gap: 20px;
    min-height: calc(100dvh - 48px - 50px);
    padding: 48px 20px;
    animation: dlFadeIn 0.5s ease-out;
  }
  @keyframes dlFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .dl-icon {
    animation: dlPulse 2s ease-in-out infinite;
  }
  @keyframes dlPulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }

  .dl-text {
    font-size: 14px; color: var(--text-2);
    margin: 0;
    min-height: 20px;
    animation: dlTextFade 0.4s ease-out;
  }
  @keyframes dlTextFade {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .dl-bar {
    width: 200px; height: 2px;
    background: rgba(120, 160, 220, 0.08);
    border-radius: 1px;
    overflow: hidden;
  }
  .dl-fill {
    height: 100%;
    background: var(--blue);
    border-radius: 1px;
    transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: 0 0 6px rgba(10, 132, 255, 0.3);
  }

  .dl-badge {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--text-3);
    opacity: 0.5;
    margin-top: 8px;
  }

  /* Document */
  .document {
    max-width: 680px;
    margin: 0 auto;
    padding: 64px 48px 120px;
  }

  /* Document header */
  .doc-header { margin-bottom: 56px; }

  .doc-header-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 16px;
  }

  .doc-org {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--blue);
  }

  .doc-type {
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--text-3);
  }

  .doc-divider {
    height: 1px;
    background: var(--border);
    margin-bottom: 40px;
  }

  .doc-project {
    font-family: var(--serif);
    font-size: 36px;
    font-weight: 300;
    letter-spacing: -0.01em;
    line-height: 1.2;
    margin: 0 0 12px;
    color: var(--text-1);
  }

  .doc-sample-badge {
    display: inline-block;
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-3);
    border: 1px solid var(--border);
    padding: 2px 8px;
    border-radius: 2px;
    margin-bottom: 32px;
  }

  .doc-meta {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .meta-row {
    display: flex;
    gap: 8px;
    font-family: var(--mono);
    font-size: 12px;
    line-height: 1.5;
  }

  .meta-row dt {
    color: var(--text-3);
    min-width: 80px;
    flex-shrink: 0;
  }
  .meta-row dt::after { content: ''; }

  .meta-row dd {
    margin: 0;
    color: var(--text-2);
  }

  /* Sections */
  .doc-section {
    margin-bottom: 48px;
  }

  .section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-3);
    margin: 0 0 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }

  /* Summary */
  .summary-text {
    font-size: 16px;
    font-weight: 400;
    line-height: 1.7;
    color: var(--text-2);
    margin: 0 0 32px;
  }
  .summary-text strong { color: var(--text-1); font-weight: 500; }
  .text-critical { color: var(--critical); }

  .summary-stats {
    display: flex;
    gap: 48px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-num {
    font-family: var(--mono);
    font-size: 36px;
    font-weight: 400;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .stat--critical .stat-num { color: var(--critical); }
  .stat--warning .stat-num { color: var(--warning); }
  .stat--ok .stat-num { color: var(--ok); }

  .stat-label {
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--text-3);
  }

  /* Findings */
  .finding {
    display: flex;
    gap: 20px;
    padding: 24px 0;
  }

  .finding-num {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-3);
    padding-top: 2px;
    flex-shrink: 0;
    min-width: 20px;
  }

  .finding-body { flex: 1; }

  .finding-head { margin-bottom: 8px; }

  .severity {
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 2px;
  }
  .severity--critical { color: var(--critical); background: rgba(255, 69, 58, 0.1); }
  .severity--warning { color: var(--warning); background: rgba(255, 159, 10, 0.1); }
  .severity--ok { color: var(--ok); background: rgba(50, 215, 75, 0.1); }

  .finding-title {
    font-size: 17px;
    font-weight: 500;
    line-height: 1.4;
    margin: 0 0 8px;
    color: var(--text-1);
  }

  .finding-detail {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.7;
    color: var(--text-2);
    margin: 0 0 8px;
  }

  .finding-fix {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-3);
  }

  .finding-divider {
    height: 1px;
    background: var(--border);
    margin-left: 40px;
  }

  /* Actions */
  .actions-intro {
    font-size: 14px;
    color: var(--text-2);
    margin: 0 0 20px;
    line-height: 1.6;
  }

  .action-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .action-item {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }

  .action-num {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-3);
    flex-shrink: 0;
  }

  .action-text {
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-1);
    flex: 1;
  }

  .action-priority {
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 1px 5px;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .action-priority--critical { color: var(--critical); background: rgba(255,69,58,0.1); }
  .action-priority--warning { color: var(--warning); background: rgba(255,159,10,0.1); }

  /* Next Steps */
  .next-text {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text-2);
    margin: 0 0 24px;
  }
  .next-text strong { color: var(--text-1); font-weight: 500; }

  .next-table {
    display: flex;
    flex-direction: column;
  }

  .next-row {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
    gap: 12px;
  }

  .next-plan {
    font-weight: 500;
    color: var(--text-1);
    min-width: 80px;
  }

  .next-scope {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--text-3);
    flex: 1;
  }

  .next-tag {
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 2px;
    min-width: 32px;
    text-align: center;
  }
  .next-tag--current { color: var(--text-3); border: 1px solid var(--border); }
  .next-tag--rec { color: var(--blue); background: rgba(10,132,255,0.1); }

  /* Confidential */
  .confidential {
    margin: 48px 0 40px;
    padding: 20px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .confidential p {
    font-family: var(--mono);
    font-size: 10px;
    line-height: 1.6;
    color: var(--text-3);
    margin: 0;
    text-align: center;
  }
  .confidential p + p { margin-top: 4px; letter-spacing: 0.06em; }

  /* CTA */
  .doc-cta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 32px 0;
  }

  .cta-btn {
    padding: 14px 40px;
    border-radius: 980px;
    border: none;
    background: var(--blue);
    color: #fff;
    font-family: var(--sans);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 20px rgba(10,132,255,0.15);
  }
  .cta-btn:hover {
    background: #2196ff;
    transform: translateY(-1px);
    box-shadow: 0 0 30px rgba(10,132,255,0.25);
  }

  .cta-sub {
    font-size: 12px;
    color: var(--text-3);
  }

  /* Nav */
  .nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    display: flex;
    background: rgba(5,6,10,0.9); backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    padding-bottom: var(--safe-bottom, 0px);
  }
  .nav-i {
    flex: 1; padding: 12px 0; background: none; border: none;
    font-family: var(--sans); font-size: 12px; font-weight: 500;
    color: var(--text-3); cursor: pointer;
  }
  .nav-i:hover { color: var(--text-2); }

  @media (max-width: 720px) {
    .document { padding: 40px 20px 120px; }
    .doc-project { font-size: 28px; }
    .summary-stats { gap: 32px; }
    .stat-num { font-size: 28px; }
    .doc-header-top { flex-direction: column; gap: 4px; }
    .finding { gap: 12px; }
    .finding-divider { margin-left: 32px; }
  }
</style>
