<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  interface Feature { label: string; starter: string; pro: string; full: string }

  const plans = [
    {
      id: 'check',
      name: '기본 점검',
      desc: '1:1 대면. 레포 전체 보안 스캔 + 리포트.',
      price: 390000,
      priceLabel: '390,000',
      period: '/ 1회',
      cta: '점검 예약',
      details: '소요 2~3시간. 마곡 방문 또는 화상.',
    },
    {
      id: 'pro',
      name: '정밀 점검',
      desc: '점검 + 수정 가이드 + 코드 리뷰.',
      price: 890000,
      priceLabel: '890,000',
      period: '/ 프로젝트',
      cta: '정밀 점검 예약',
      popular: true,
      details: '소요 1~2일. 수정 가이드 PDF 포함.',
    },
    {
      id: 'full',
      name: '풀 정비',
      desc: '엔지니어가 직접 고칩니다. 배포까지.',
      price: 1900000,
      priceLabel: '1,900,000',
      period: '/ 프로젝트',
      cta: '상담 후 진행',
      details: '소요 3~7일. 30일 모니터링 포함.',
    },
  ];

  const extras = [
    { name: '긴급 점검', price: '490,000', desc: '24시간 이내 긴급 대응. 주말/공휴일 가능.', period: '/ 1회' },
    { name: '출장 점검', price: '+150,000', desc: '서울/경기 출장. 해운대/부산 별도 협의.', period: '/ 출장비' },
    { name: '월 관리', price: '590,000', desc: '월 1회 정기 점검 + 실시간 모니터링 + 긴급 대응.', period: '/ 월' },
    { name: '세부 단품', price: '39,000~', desc: '312개 세부 메뉴에서 필요한 것만. 상담 시 안내.', period: '/ 항목' },
  ];

  const features: Feature[] = [
    { label: '1:1 대면 점검',         starter: 'check', pro: 'check',           full: 'check' },
    { label: '취약점 리포트',          starter: '요약',   pro: '상세',            full: '상세 + 라인 번호' },
    { label: '비밀키 노출 검사',       starter: 'check', pro: 'check',           full: 'check' },
    { label: '인증 체계 점검',         starter: 'minus', pro: 'check',           full: 'check' },
    { label: '데이터베이스 보안 (RLS)', starter: 'minus', pro: 'check',           full: 'check' },
    { label: 'API 엔드포인트 검증',    starter: 'minus', pro: 'check',           full: 'check' },
    { label: '의존성 취약점 분석',      starter: 'minus', pro: 'check',           full: 'check' },
    { label: '수정 가이드',            starter: 'minus', pro: 'PDF',            full: '1:1 화면 공유' },
    { label: '엔지니어 직접 수정',      starter: 'minus', pro: 'minus',           full: 'check' },
    { label: '배포 후 모니터링',       starter: 'minus', pro: '7일',             full: '30일' },
    { label: '긴급 대응 SLA',         starter: 'minus', pro: 'minus',           full: '4시간 이내' },
    { label: '재점검 보증',            starter: 'minus', pro: '14일',            full: '30일' },
  ];

  const faqs = [
    { q: '바이브코딩이 뭔가요?', a: 'Cursor, Claude Code, v0, Lovable 같은 AI 도구로 소프트웨어를 만드는 방식입니다. 빠르게 만들 수 있지만, AI가 보안까지 알아서 챙겨주진 않습니다. 그게 저희가 하는 일입니다.' },
    { q: '개발을 못 해도 쓸 수 있나요?', a: '비개발자를 위해 만들었습니다. 프로젝트 URL만 넣으면 자동으로 점검하고, 결과도 기술 용어 없이 설명합니다.' },
    { q: '무료 스캔으로 뭘 알 수 있나요?', a: 'API 키 노출, .env 파일 유출, 공개된 데이터베이스 엔드포인트, 기본 인증 설정. 하룻밤 사이에 요금 폭탄이 나올 수 있는 것들입니다.' },
    { q: 'Pro와 Full Audit 차이가 뭔가요?', a: 'Pro는 자동 스캔 + PDF 수정 가이드. Full Audit은 엔지니어가 직접 코드를 읽고, 고치고, 30일간 지켜봅니다.' },
    { q: '문제가 없으면요?', a: '그러면 자신 있게 배포하시면 됩니다. 점검한 레포 대부분에서 3~7개 이슈가 나옵니다. 0개는 드물지만 있긴 합니다.' },
    { q: '환불 되나요?', a: '스캔 시작 전이면 전액 환불. 리포트 전달 후에는 환불이 어렵습니다. 이미 결과물을 받으셨으니까요.' },
  ];

  let activePlan = $state(1); // 0=기본, 1=정밀, 2=풀
  let openFaq = $state<number | null>(null);
  let loaded = $state(false);

  $effect(() => { loaded = true; });

  function toggleFaq(i: number) { openFaq = openFaq === i ? null : i; }
  function getVal(feat: Feature): string {
    return activePlan === 0 ? feat.starter : activePlan === 1 ? feat.pro : feat.full;
  }
</script>

<!-- macOS-style app window -->
<div class="app-window" class:app-window--loaded={loaded}>

  <!-- Title bar -->
  <header class="titlebar">
    <div class="titlebar-dots">
      <span class="dot dot--red"></span>
      <span class="dot dot--yellow"></span>
      <span class="dot dot--green"></span>
    </div>
    <span class="titlebar-title">Byteforce Security — 요금제</span>
    <div class="titlebar-spacer"></div>
  </header>

  <div class="app-body">

    <!-- Sidebar -->
    <nav class="sidebar">
      <div class="sidebar-section">
        <span class="sidebar-label">점검 메뉴</span>
        {#each plans as plan, i}
          <button
            class="sidebar-item"
            class:sidebar-item--active={activePlan === i}
            onclick={() => { activePlan = i; }}
          >
            <span class="sidebar-icon">{i === 0 ? '⬡' : i === 1 ? '⬢' : '◉'}</span>
            <span class="sidebar-text">{plan.name}</span>
            {#if plan.popular}
              <span class="sidebar-badge">추천</span>
            {/if}
          </button>
        {/each}
      </div>
      <div class="sidebar-section">
        <span class="sidebar-label">추가</span>
        {#each extras as extra}
          <button class="sidebar-item" onclick={() => goto(`${base}/incident`)}>
            <span class="sidebar-text">{extra.name}</span>
            <span class="sidebar-price">₩{extra.price}</span>
          </button>
        {/each}
      </div>
      <div class="sidebar-section">
        <span class="sidebar-label">안내</span>
        <button class="sidebar-item" onclick={() => { const el = document.getElementById('faq'); el?.scrollIntoView({behavior:'smooth'}); }}>
          <span class="sidebar-text">자주 묻는 질문</span>
        </button>
        <button class="sidebar-item" onclick={() => { const el = document.getElementById('location'); el?.scrollIntoView({behavior:'smooth'}); }}>
          <span class="sidebar-text">오시는 곳</span>
        </button>
      </div>
    </nav>

    <!-- Main content -->
    <main class="main">

      <!-- Plan detail pane -->
      <section class="pane">
        <div class="pane-header">
          <!-- Segmented control -->
          <div class="segmented">
            {#each plans as plan, i}
              <button
                class="seg-btn"
                class:seg-btn--active={activePlan === i}
                onclick={() => { activePlan = i; }}
              >{plan.name}</button>
            {/each}
          </div>
        </div>

        <!-- Plan info -->
        <div class="plan-hero">
          <div class="plan-hero-left">
            <h1 class="plan-title">{plans[activePlan].name}</h1>
            <p class="plan-desc">{plans[activePlan].desc}</p>
            <p class="plan-details">{plans[activePlan].details}</p>
          </div>
          <div class="plan-hero-right">
            <span class="plan-currency">₩</span>
            <span class="plan-amount">{plans[activePlan].priceLabel}</span>
            <span class="plan-period">{plans[activePlan].period}</span>
          </div>
        </div>

        <button class="plan-cta" class:plan-cta--popular={plans[activePlan].popular} onclick={() => goto(`${base}/incident`)}>
          {plans[activePlan].cta}
        </button>

        <!-- Feature list (grouped rows like iOS Settings) -->
        <div class="group">
          <div class="group-title">포함 항목</div>
          <div class="group-list">
            {#each features as feat, i}
              {@const val = getVal(feat)}
              <div class="row" style="animation-delay: {i * 40}ms">
                <span class="row-label">{feat.label}</span>
                <span class="row-value" class:row-value--check={val === 'check'} class:row-value--minus={val === 'minus'}>
                  {#if val === 'check'}
                    <svg class="row-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  {:else if val === 'minus'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>
                  {:else}
                    <span class="row-text-val">{val}</span>
                  {/if}
                </span>
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- Terminal threat demo -->
      <section class="pane terminal-pane">
        <div class="terminal">
          <div class="terminal-bar">
            <span class="dot dot--red dot--sm"></span>
            <span class="dot dot--yellow dot--sm"></span>
            <span class="dot dot--green dot--sm"></span>
            <span class="terminal-title">byteforce scan — .env 점검 예시</span>
          </div>
          <pre class="terminal-body"><code><span class="t-prompt">$</span> <span class="t-cmd">byteforce scan</span> --check-secrets
<span class="t-dim">[scan]</span> Checking .env files...
<span class="t-dim">[scan]</span> Found <span class="t-file">.env</span> in repository root

<span class="t-key">OPENAI_API_KEY</span>=sk-proj-4f8a...9c2d
<span class="t-key">SUPABASE_SERVICE_ROLE</span>=eyJhbGci...kX9s
<span class="t-alert">STRIPE_SECRET_KEY</span>=sk_live_51N...rYz  <span class="t-comment"># committed at a3f7b2</span>
<span class="t-key">DATABASE_URL</span>=postgresql://admin:pass123@...

<span class="t-warn">⚠ 3 secrets exposed in commit history</span>
<span class="t-ok">✓ Scan complete. 3 issues found.</span></code></pre>
        </div>
        <p class="terminal-caption">2026년 3~8월 점검한 레포 312개 중 62%에서 유사 이슈 발견</p>
      </section>

      <!-- Extras -->
      <section class="pane" id="extras">
        <div class="group">
          <div class="group-title">추가 메뉴</div>
          <div class="group-list">
            {#each extras as extra}
              <div class="row">
                <div class="row-col">
                  <span class="row-label">{extra.name}</span>
                  <span class="row-sub">{extra.desc}</span>
                </div>
                <span class="row-price">₩{extra.price} <span class="row-period">{extra.period}</span></span>
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- Location -->
      <section class="pane" id="location">
        <div class="group">
          <div class="group-title">오시는 곳</div>
          <div class="group-list">
            <div class="row">
              <div class="row-col">
                <span class="row-label">서울 마곡</span>
                <span class="row-sub">노트북 들고 오시면 바로 점검. 2~3시간, 당일 리포트.</span>
              </div>
            </div>
            <div class="row">
              <div class="row-col">
                <span class="row-label">부산 해운대</span>
                <span class="row-sub">출장 점검 가능. 출장비 별도 협의. 사전 예약 필수.</span>
              </div>
            </div>
            <div class="row">
              <div class="row-col">
                <span class="row-label">화상 점검</span>
                <span class="row-sub">Zoom / Google Meet. 화면 공유로 원격 점검. 전국 어디서든.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="pane" id="faq">
        <div class="group">
          <div class="group-title">자주 묻는 질문</div>
          <div class="group-list">
            {#each faqs as faq, i}
              <button class="row row--faq" onclick={() => toggleFaq(i)} aria-expanded={openFaq === i}>
                <span class="row-label">{faq.q}</span>
                <svg class="faq-chev" class:faq-chev--open={openFaq === i} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {#if openFaq === i}
                <div class="faq-answer">{faq.a}</div>
              {/if}
            {/each}
          </div>
        </div>
      </section>

      <!-- Footer CTA -->
      <section class="pane pane--cta">
        <p class="cta-text">뭐가 필요한지 모르겠으면 일단 오세요.<br/>보고 말씀드리겠습니다.</p>
        <button class="cta-btn" onclick={() => goto(`${base}/incident`)}>상담 예약</button>
      </section>

    </main>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

  /* ─── OS Tokens ─── */
  .app-window {
    --bg: #ececec;
    --surface: #ffffff;
    --surface-inset: #f6f6f6;
    --sidebar-bg: #f2f2f7;
    --sidebar-active: rgba(0,0,0,0.06);
    --titlebar-bg: #e8e8ed;
    --text: #1d1d1f;
    --text-2: #6e6e73;
    --text-3: #aeaeb2;
    --border: rgba(0,0,0,0.09);
    --accent: #007aff;
    --accent-hover: #0066d6;
    --green: #34c759;
    --red: #ff3b30;
    --yellow: #ffcc00;
    --orange: #ff9500;
    --font: -apple-system, "SF Pro Text", "Pretendard Variable", system-ui, sans-serif;
    --mono: "JetBrains Mono", "SF Mono", "Menlo", monospace;
    --r: 10px;
    --r-sm: 6px;
    --r-lg: 12px;
    --shadow-window: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 0.5px rgba(0,0,0,0.1);
    --shadow-group: 0 0.5px 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06);
    --ease: cubic-bezier(0.4, 0, 0.2, 1);

    font-family: var(--font);
    color: var(--text);
    background: #d2d2d7;
    min-height: 100dvh;
    padding: 24px;
    -webkit-font-smoothing: antialiased;
    opacity: 0;
    transform: scale(0.97);
    transition: opacity 0.5s var(--ease), transform 0.5s var(--ease);
  }

  .app-window--loaded {
    opacity: 1;
    transform: scale(1);
  }

  /* ─── Title bar ─── */
  .titlebar {
    display: flex;
    align-items: center;
    height: 52px;
    padding: 0 16px;
    background: var(--titlebar-bg);
    border-radius: var(--r-lg) var(--r-lg) 0 0;
    border-bottom: 0.5px solid var(--border);
    user-select: none;
  }

  .titlebar-dots {
    display: flex;
    gap: 8px;
    margin-right: 16px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .dot--sm { width: 10px; height: 10px; }
  .dot--red { background: var(--red); }
  .dot--yellow { background: var(--yellow); }
  .dot--green { background: var(--green); }

  .titlebar-title {
    flex: 1;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-2);
  }

  .titlebar-spacer { width: 60px; }

  /* ─── App body (sidebar + main) ─── */
  .app-body {
    display: flex;
    background: var(--surface);
    border-radius: 0 0 var(--r-lg) var(--r-lg);
    box-shadow: var(--shadow-window);
    min-height: calc(100dvh - 100px);
    overflow: hidden;
  }

  /* ─── Sidebar ─── */
  .sidebar {
    width: 220px;
    flex-shrink: 0;
    background: var(--sidebar-bg);
    border-right: 0.5px solid var(--border);
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-bottom: 16px;
  }

  .sidebar-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-3);
    padding: 8px 8px 4px;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 8px;
    border: none;
    background: transparent;
    border-radius: var(--r-sm);
    font-family: var(--font);
    font-size: 13px;
    color: var(--text);
    cursor: pointer;
    transition: background 0.15s var(--ease);
    text-align: left;
    width: 100%;
  }
  .sidebar-item:hover { background: var(--sidebar-active); }
  .sidebar-item--active {
    background: var(--accent) !important;
    color: white;
  }

  .sidebar-icon {
    font-size: 14px;
    width: 20px;
    text-align: center;
    opacity: 0.6;
  }
  .sidebar-item--active .sidebar-icon { opacity: 1; }

  .sidebar-text { flex: 1; }

  .sidebar-badge {
    font-size: 10px;
    font-weight: 600;
    background: var(--accent);
    color: white;
    padding: 1px 6px;
    border-radius: 4px;
  }
  .sidebar-item--active .sidebar-badge {
    background: rgba(255,255,255,0.3);
  }

  .sidebar-price {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-3);
  }
  .sidebar-item--active .sidebar-price { color: rgba(255,255,255,0.8); }

  /* ─── Main content ─── */
  .main {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: var(--surface-inset);
  }

  /* ─── Pane ─── */
  .pane {
    background: var(--surface);
    border-radius: var(--r);
    box-shadow: var(--shadow-group);
    overflow: hidden;
  }

  .pane-header {
    padding: 20px 24px 0;
  }

  /* ─── Segmented Control ─── */
  .segmented {
    display: inline-flex;
    background: rgba(0,0,0,0.05);
    border-radius: 8px;
    padding: 2px;
  }

  .seg-btn {
    padding: 6px 20px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.2s var(--ease);
  }
  .seg-btn--active {
    background: var(--surface);
    color: var(--text);
    box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0.5px 1px rgba(0,0,0,0.04);
  }

  /* ─── Plan hero ─── */
  .plan-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px 24px 16px;
    gap: 24px;
  }

  .plan-title {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
  }

  .plan-desc {
    font-size: 15px;
    color: var(--text-2);
    margin: 0 0 4px;
    line-height: 1.4;
  }

  .plan-details {
    font-size: 13px;
    color: var(--text-3);
    margin: 0;
  }

  .plan-hero-right {
    display: flex;
    align-items: baseline;
    flex-shrink: 0;
  }

  .plan-currency {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-3);
    margin-right: 2px;
    align-self: flex-start;
    margin-top: 6px;
  }

  .plan-amount {
    font-family: var(--mono);
    font-size: 40px;
    font-weight: 600;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--text);
  }

  .plan-period {
    font-size: 13px;
    color: var(--text-3);
    margin-left: 4px;
  }

  /* ─── Plan CTA ─── */
  .plan-cta {
    margin: 0 24px 20px;
    padding: 10px 24px;
    border-radius: 8px;
    border: none;
    font-family: var(--font);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    background: rgba(0,0,0,0.05);
    color: var(--accent);
    transition: background 0.2s var(--ease);
  }
  .plan-cta:hover { background: rgba(0,0,0,0.08); }
  .plan-cta--popular {
    background: var(--accent);
    color: white;
  }
  .plan-cta--popular:hover { background: var(--accent-hover); }

  /* ─── Grouped list (iOS Settings style) ─── */
  .group {
    padding: 0;
  }

  .group-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-3);
    padding: 16px 24px 8px;
  }

  .group-list {
    display: flex;
    flex-direction: column;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-top: 0.5px solid var(--border);
    font-size: 14px;
    animation: rowIn 0.3s var(--ease) both;
  }

  @keyframes rowIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .row--faq {
    cursor: pointer;
    background: none;
    border-left: none;
    border-right: none;
    border-bottom: none;
    width: 100%;
    font-family: var(--font);
    text-align: left;
  }
  .row--faq:hover { background: var(--surface-inset); }

  .row-col {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .row-label {
    font-size: 14px;
    color: var(--text);
    font-weight: 400;
  }

  .row-sub {
    font-size: 12px;
    color: var(--text-3);
    line-height: 1.4;
  }

  .row-value {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
  }
  .row-value--check { color: var(--green); }
  .row-value--minus { color: var(--text-3); }

  .row-check {
    color: var(--green);
  }

  .row-text-val {
    font-size: 12px;
    font-weight: 500;
    padding: 2px 8px;
    background: rgba(0,122,255,0.08);
    color: var(--accent);
    border-radius: 4px;
  }

  .row-price {
    font-family: var(--mono);
    font-size: 14px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--text);
    text-align: right;
  }

  .row-period {
    font-size: 11px;
    color: var(--text-3);
    font-family: var(--font);
  }

  /* ─── Terminal ─── */
  .terminal-pane {
    background: transparent;
    box-shadow: none;
  }

  .terminal {
    background: #1e1e1e;
    border-radius: var(--r);
    overflow: hidden;
    box-shadow: var(--shadow-group);
  }

  .terminal-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #2d2d2d;
    border-bottom: 0.5px solid rgba(255,255,255,0.06);
  }

  .terminal-title {
    flex: 1;
    text-align: center;
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    font-weight: 500;
  }

  .terminal-body {
    padding: 16px 20px;
    margin: 0;
    overflow-x: auto;
    font-family: var(--mono);
    font-size: 13px;
    line-height: 1.7;
    color: #d4d4d4;
  }

  .t-prompt { color: var(--green); font-weight: 600; }
  .t-cmd { color: #56b6c2; }
  .t-dim { color: #6a6a6a; }
  .t-key { color: #9cdcfe; }
  .t-alert { color: var(--red); font-weight: 500; }
  .t-comment { color: #6a9955; font-style: italic; }
  .t-warn { color: var(--orange); }
  .t-ok { color: var(--green); }
  .t-file { color: #ce9178; }

  .terminal-caption {
    font-size: 12px;
    color: var(--text-3);
    text-align: center;
    margin: 8px 0 0;
    font-style: italic;
  }

  /* ─── FAQ ─── */
  .faq-chev {
    flex-shrink: 0;
    color: var(--text-3);
    transition: transform 0.2s var(--ease);
  }
  .faq-chev--open { transform: rotate(180deg); }

  .faq-answer {
    padding: 0 24px 16px;
    font-size: 14px;
    color: var(--text-2);
    line-height: 1.6;
    border-top: none;
  }

  /* ─── Footer CTA ─── */
  .pane--cta {
    text-align: center;
    padding: 48px 24px;
    background: var(--surface);
  }

  .cta-text {
    font-size: 18px;
    font-weight: 500;
    color: var(--text);
    margin: 0 0 20px;
    line-height: 1.5;
    word-break: keep-all;
  }

  .cta-btn {
    padding: 10px 28px;
    border-radius: 8px;
    border: none;
    background: var(--accent);
    color: white;
    font-family: var(--font);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s var(--ease);
  }
  .cta-btn:hover { background: var(--accent-hover); }

  /* ─── Responsive ─── */
  @media (max-width: 768px) {
    .app-window { padding: 0; }
    .titlebar { border-radius: 0; }
    .app-body { flex-direction: column; border-radius: 0; min-height: 100dvh; }
    .sidebar {
      width: 100%;
      flex-direction: row;
      overflow-x: auto;
      padding: 8px;
      gap: 4px;
      border-right: none;
      border-bottom: 0.5px solid var(--border);
    }
    .sidebar-section { flex-direction: row; gap: 4px; margin-bottom: 0; }
    .sidebar-label { display: none; }
    .sidebar-icon { display: none; }
    .sidebar-item { white-space: nowrap; padding: 6px 12px; }
    .sidebar-price { display: none; }
    .main { padding: 16px; }
    .plan-hero { flex-direction: column; gap: 12px; }
    .plan-amount { font-size: 32px; }
    .segmented { width: 100%; }
    .seg-btn { flex: 1; font-size: 12px; padding: 6px 8px; }
  }
</style>
