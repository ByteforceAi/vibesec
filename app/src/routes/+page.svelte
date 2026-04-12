<script lang="ts">
  import { scanHistory } from '$lib/stores/scan';
  import type { ScanResult } from '$lib/stores/scan';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  // --- Splash sequence ---
  let phase = $state<'splash'|'reveal'|'ready'>('splash');
  let logoChars = 'BYTEFORCE'.split('');
  let tagline = 'SECURITY';
  let charRevealed = $state(0);
  let tagRevealed = $state(false);
  let particlesReady = $state(false);

  // --- Hero typing ---
  const heroLines = [
    '바이브코딩 보안.',
    '그게 저희 일입니다.',
  ];
  let typedChars = $state(0);
  const totalChars = heroLines.join('').length;

  // --- Canvas ---
  let canvasEl: HTMLCanvasElement | undefined = $state(undefined);

  // --- State ---
  let activeTab = $state('home');
  let history = $state<ScanResult[]>([]);

  $effect(() => {
    const unsub = scanHistory.subscribe((h) => { history = h; });
    return unsub;
  });

  // --- Splash timing ---
  $effect(() => {
    // Phase 1: Logo char-by-char (50ms each)
    let t = 0;
    const logoTimer = setInterval(() => {
      t++;
      charRevealed = t;
      if (t >= logoChars.length) {
        clearInterval(logoTimer);
        setTimeout(() => { tagRevealed = true; }, 200);
        setTimeout(() => { phase = 'reveal'; }, 800);
        setTimeout(() => {
          phase = 'ready';
          startHeroTyping();
        }, 1400);
      }
    }, 70);
    particlesReady = true;
    return () => clearInterval(logoTimer);
  });

  function startHeroTyping() {
    let c = 0;
    const timer = setInterval(() => {
      c++;
      typedChars = c;
      if (c >= totalChars) clearInterval(timer);
    }, 40);
  }

  // --- Particles ---
  $effect(() => {
    if (!canvasEl || !particlesReady) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;

    interface Particle { x: number; y: number; vx: number; vy: number; r: number; a: number; }
    let dots: Particle[] = [];

    function resize() {
      w = canvasEl!.clientWidth;
      h = canvasEl!.clientHeight;
      canvasEl!.width = w;
      canvasEl!.height = h;
    }

    function init() {
      resize();
      dots = [];
      const count = Math.min(Math.floor((w * h) / 8000), 120);
      for (let i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: Math.random() * 1.2 + 0.3,
          a: Math.random() * 0.4 + 0.1,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = w;
        if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h;
        if (d.y > h) d.y = 0;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${d.a})`;
        ctx!.fill();
      }

      // Draw faint lines between close particles
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx!.beginPath();
            ctx!.moveTo(dots[i].x, dots[i].y);
            ctx!.lineTo(dots[j].x, dots[j].y);
            ctx!.strokeStyle = `rgba(255,255,255,${0.03 * (1 - dist / 100)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', () => { resize(); });

    return () => {
      cancelAnimationFrame(animId);
    };
  });

  // --- Hero text extraction ---
  function getTypedText(): { line1: string; line2: string } {
    const l1 = heroLines[0];
    const l2 = heroLines[1];
    if (typedChars <= l1.length) {
      return { line1: l1.slice(0, typedChars), line2: '' };
    }
    return { line1: l1, line2: l2.slice(0, typedChars - l1.length) };
  }

  function navTo(tab: string) {
    activeTab = tab;
    if (tab === 'home') goto(`${base}/`);
    else goto(`${base}/${tab}`);
  }

  function formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  }
</script>

<div class="page">

  <!-- Particle canvas -->
  <canvas class="particles" bind:this={canvasEl}></canvas>

  <!-- Splash overlay -->
  {#if phase === 'splash'}
    <div class="splash">
      <div class="splash-logo">
        {#each logoChars as char, i}
          <span class="splash-char" class:splash-char--on={i < charRevealed}>{char}</span>
        {/each}
      </div>
      <span class="splash-tag" class:splash-tag--on={tagRevealed}>{tagline}</span>
    </div>
  {/if}

  <!-- Main content (appears after splash) -->
  <div class="main-wrap" class:main-wrap--in={phase === 'reveal' || phase === 'ready'}>

    <header class="bar">
      <span class="bar-brand">BYTEFORCE SECURITY</span>
      <button class="bar-action" onclick={() => goto(`${base}/incident`)}>상담 예약</button>
    </header>

    <div class="content">

      <!-- Hero with typing effect -->
      <section class="hero">
        <h1 class="hero-title">
          <span class="hero-line">{getTypedText().line1}<span class="cursor" class:cursor--blink={typedChars >= totalChars}>|</span></span>
          {#if getTypedText().line2}
            <br/><span class="hero-line">{getTypedText().line2}</span>
          {/if}
        </h1>
        <p class="hero-sub" class:hero-sub--in={phase === 'ready'}>배포 전 보안 점검. 바이브코더를 위해 만들었습니다.</p>
        <div class="hero-tools" class:hero-tools--in={phase === 'ready'}>
          Cursor &middot; Claude Code &middot; v0 &middot; Lovable &middot; bolt.new
        </div>
        <button class="hero-cta" class:hero-cta--in={phase === 'ready'} onclick={() => goto(`${base}/diagnose`)}>
          레포 점검 시작
        </button>
      </section>

      <!-- Stats -->
      <section class="stats" class:stats--in={phase === 'ready'}>
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-num">847</span>
            <span class="stat-label">노출 키 발견</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">62%</span>
            <span class="stat-label">RLS 미설정</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">11일</span>
            <span class="stat-label">평균 탐지</span>
          </div>
        </div>
        <p class="stat-source">2026 3~8월, 312개 레포 기준</p>
      </section>

      <!-- Recent scans -->
      {#if history.length > 0}
        <section class="recent" class:recent--in={phase === 'ready'}>
          <h2 class="section-head">최근 점검</h2>
          {#each history.slice(0, 5) as scan}
            <button class="scan-row" onclick={() => goto(`${base}/report/${scan.scanId}`)}>
              <div class="scan-info">
                <span class="scan-target">{scan.target}</span>
                <span class="scan-date">{formatDate(scan.finishedAt)}</span>
              </div>
              <div class="scan-stats">
                {#if scan.summary.critical > 0}<span class="st st--c">{scan.summary.critical}</span>{/if}
                {#if scan.summary.warning > 0}<span class="st st--w">{scan.summary.warning}</span>{/if}
                {#if scan.summary.ok > 0}<span class="st st--o">{scan.summary.ok}</span>{/if}
              </div>
            </button>
          {/each}
        </section>
      {/if}

    </div>

    <nav class="nav">
      <button class="nav-item nav-item--on" onclick={() => navTo('home')}>홈</button>
      <button class="nav-item" onclick={() => navTo('diagnose')}>진단</button>
      <button class="nav-item" onclick={() => navTo('report')}>리포트</button>
      <button class="nav-item" onclick={() => navTo('packages')}>요금제</button>
    </nav>

  </div>
</div>

<style>
  .page {
    --black: #000000;
    --s1: #060608;
    --s2: #0c0c0e;
    --tx: #ffffff;
    --tx2: #9a9a9f;
    --tx3: #4a4a4f;
    --brd: rgba(255,255,255,0.055);
    --ok: #32d74b;
    --warn-c: #ff9500;
    --crit-c: #ff453a;
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
    --mono: "JetBrains Mono", "SF Mono", monospace;
    --ease: cubic-bezier(0.16, 1, 0.3, 1);

    position: relative;
    min-height: 100dvh;
    background: var(--black);
    color: var(--tx);
    font-family: var(--font);
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* --- Particles --- */
  .particles {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  /* --- Splash --- */
  .splash {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: var(--black);
  }

  .splash-logo {
    display: flex;
    gap: 3px;
  }

  .splash-char {
    font-family: var(--font);
    font-size: 48px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--tx);
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s var(--ease), transform 0.3s var(--ease);
  }
  .splash-char--on {
    opacity: 1;
    transform: translateY(0);
  }

  .splash-tag {
    font-family: var(--font);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.3em;
    color: var(--tx3);
    opacity: 0;
    transition: opacity 0.5s var(--ease);
  }
  .splash-tag--on { opacity: 1; }

  /* --- Main wrap --- */
  .main-wrap {
    position: relative;
    z-index: 10;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.8s var(--ease), transform 0.8s var(--ease);
  }
  .main-wrap--in {
    opacity: 1;
    transform: translateY(0);
  }

  /* --- Bar --- */
  .bar {
    position: sticky;
    top: 0;
    z-index: 90;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--brd);
  }

  .bar-brand {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: var(--tx3);
  }

  .bar-action {
    font-family: var(--font);
    font-size: 12px;
    font-weight: 500;
    color: var(--tx2);
    background: none;
    border: 1px solid var(--brd);
    border-radius: 6px;
    padding: 5px 14px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .bar-action:hover { color: var(--tx); border-color: rgba(255,255,255,0.15); }

  /* --- Content --- */
  .content {
    flex: 1;
    padding: 48px 24px 100px;
    display: flex;
    flex-direction: column;
    gap: 48px;
    max-width: 640px;
    margin: 0 auto;
    width: 100%;
  }

  /* --- Hero --- */
  .hero {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 32px 0;
  }

  .hero-title {
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin: 0;
    min-height: 90px;
  }

  .hero-line {
    display: inline;
  }

  .cursor {
    color: var(--tx2);
    font-weight: 300;
    animation: none;
  }
  .cursor--blink {
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .hero-sub {
    font-size: 16px;
    color: var(--tx2);
    line-height: 1.5;
    margin: 0;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.5s var(--ease) 0.2s, transform 0.5s var(--ease) 0.2s;
  }
  .hero-sub--in { opacity: 1; transform: translateY(0); }

  .hero-tools {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--tx3);
    letter-spacing: 0.02em;
    opacity: 0;
    transition: opacity 0.5s var(--ease) 0.4s;
  }
  .hero-tools--in { opacity: 1; }

  .hero-cta {
    align-self: flex-start;
    padding: 12px 32px;
    border-radius: 6px;
    border: none;
    background: var(--tx);
    color: var(--black);
    font-family: var(--font);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.4s var(--ease) 0.6s, transform 0.4s var(--ease) 0.6s, background 0.2s;
  }
  .hero-cta--in { opacity: 1; transform: translateY(0); }
  .hero-cta:hover { background: #e0e0e0; }

  /* --- Stats --- */
  .stats {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s var(--ease) 0.8s, transform 0.5s var(--ease) 0.8s;
  }
  .stats--in { opacity: 1; transform: translateY(0); }

  .stat-row {
    display: flex;
    gap: 32px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-num {
    font-family: var(--mono);
    font-size: 24px;
    font-weight: 500;
    color: var(--tx);
    font-variant-numeric: tabular-nums;
  }

  .stat-label {
    font-size: 11px;
    color: var(--tx3);
  }

  .stat-source {
    font-size: 10px;
    color: var(--tx3);
    margin: 8px 0 0;
    font-style: italic;
  }

  /* --- Recent --- */
  .recent {
    display: flex;
    flex-direction: column;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s var(--ease) 1s, transform 0.5s var(--ease) 1s;
  }
  .recent--in { opacity: 1; transform: translateY(0); }

  .section-head {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--tx3);
    margin: 0 0 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--brd);
  }

  .scan-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--brd);
    background: none;
    border-left: none; border-right: none; border-top: none;
    width: 100%;
    font-family: var(--font);
    cursor: pointer;
    text-align: left;
    color: var(--tx);
    transition: background 0.15s;
  }
  .scan-row:hover { background: var(--s1); }

  .scan-info { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
  .scan-target { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .scan-date { font-size: 11px; color: var(--tx3); }
  .scan-stats { display: flex; gap: 6px; flex-shrink: 0; }

  .st {
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 3px;
    border: 1px solid var(--brd);
    background: var(--s2);
  }
  .st--c { color: var(--crit-c); }
  .st--w { color: var(--warn-c); }
  .st--o { color: var(--ok); }

  /* --- Nav --- */
  .nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    display: flex;
    background: rgba(6,6,8,0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--brd);
  }

  .nav-item {
    flex: 1;
    padding: 12px 0;
    background: none;
    border: none;
    font-family: var(--font);
    font-size: 12px;
    font-weight: 500;
    color: var(--tx3);
    cursor: pointer;
    transition: color 0.15s;
  }
  .nav-item:hover { color: var(--tx2); }
  .nav-item--on { color: var(--tx); }

  @media (max-width: 768px) {
    .hero-title { font-size: 28px; min-height: 72px; }
    .splash-char { font-size: 36px; }
    .stat-row { gap: 20px; }
    .stat-num { font-size: 20px; }
    .content { padding: 32px 16px 100px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .splash-char { transition: none; opacity: 1; transform: none; }
    .splash-tag { transition: none; }
    .main-wrap { transition: none; opacity: 1; transform: none; }
    .hero-sub, .hero-tools, .hero-cta, .stats, .recent { transition: none; opacity: 1; transform: none; }
    .cursor { animation: none; }
  }
</style>
