<script lang="ts">
  import { scanHistory } from '$lib/stores/scan';
  import type { ScanResult } from '$lib/stores/scan';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  // --- Phase machine ---
  // black → emblem → morph → skeleton → alive
  let phase = $state<'black'|'emblem'|'morph'|'skeleton'|'alive'>('black');

  // --- Hero typing ---
  const heroLines = ['바이브코딩 보안.', '그게 저희 일입니다.'];
  let typedChars = $state(0);
  const totalChars = heroLines.join('').length;

  // --- Skeleton pulse ---
  let skeletonVisible = $state(false);

  // --- Canvas ---
  let canvasEl: HTMLCanvasElement | undefined = $state(undefined);

  // --- Data ---
  let activeTab = $state('home');
  let history = $state<ScanResult[]>([]);

  $effect(() => {
    const unsub = scanHistory.subscribe((h) => { history = h; });
    return unsub;
  });

  // --- Sequence timer ---
  $effect(() => {
    // 0.0s: black
    setTimeout(() => { phase = 'emblem'; }, 300);      // 0.3s: emblem appears
    setTimeout(() => { phase = 'morph'; }, 1200);       // 1.2s: emblem morphs to bar
    setTimeout(() => {
      phase = 'skeleton';
      skeletonVisible = true;
    }, 1600);                                           // 1.6s: skeleton layout
    setTimeout(() => {
      phase = 'alive';
      startTyping();
    }, 2200);                                           // 2.2s: content alive
  });

  function startTyping() {
    let c = 0;
    const timer = setInterval(() => {
      c++;
      typedChars = c;
      if (c >= totalChars) clearInterval(timer);
    }, 35);
  }

  function getTyped(): { l1: string; l2: string } {
    const a = heroLines[0];
    const b = heroLines[1];
    if (typedChars <= a.length) return { l1: a.slice(0, typedChars), l2: '' };
    return { l1: a, l2: b.slice(0, typedChars - a.length) };
  }

  // --- Particles ---
  $effect(() => {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let w = 0, h = 0;
    interface P { x: number; y: number; vx: number; vy: number; r: number; a: number; }
    let dots: P[] = [];

    function resize() {
      w = canvasEl!.clientWidth; h = canvasEl!.clientHeight;
      canvasEl!.width = w; canvasEl!.height = h;
    }
    function init() {
      resize();
      dots = [];
      const n = Math.min(Math.floor((w * h) / 9000), 100);
      for (let i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
          r: Math.random() * 1 + 0.3, a: Math.random() * 0.35 + 0.05,
        });
      }
    }
    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${d.a})`;
        ctx!.fill();
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx!.beginPath();
            ctx!.moveTo(dots[i].x, dots[i].y);
            ctx!.lineTo(dots[j].x, dots[j].y);
            ctx!.strokeStyle = `rgba(255,255,255,${0.025 * (1 - dist / 90)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    init(); draw();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  });

  function navTo(tab: string) {
    activeTab = tab;
    if (tab === 'home') goto(`${base}/`);
    else goto(`${base}/${tab}`);
  }

  function fmtDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  }
</script>

<div class="page">
  <canvas class="particles" bind:this={canvasEl}></canvas>

  <!-- ===== EMBLEM SPLASH ===== -->
  {#if phase === 'black' || phase === 'emblem'}
    <div class="splash" class:splash--show={phase === 'emblem'}>
      <!-- Shield SVG -->
      <div class="emblem" class:emblem--in={phase === 'emblem'}>
        <svg class="shield" viewBox="0 0 64 76" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" fill="none"/>
          <path d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z" fill="rgba(255,255,255,0.03)"/>
          <path d="M26 38l6 6 12-14" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-path"/>
        </svg>
        <span class="emblem-text" class:emblem-text--in={phase === 'emblem'}>BYTEFORCE</span>
        <span class="emblem-sub" class:emblem-sub--in={phase === 'emblem'}>SECURITY</span>
      </div>
    </div>
  {/if}

  <!-- ===== MAIN APP ===== -->
  <div class="app" class:app--morphing={phase === 'morph'} class:app--visible={phase === 'skeleton' || phase === 'alive'}>

    <!-- Bar (emblem morphs here) -->
    <header class="bar">
      <div class="bar-logo">
        <svg class="bar-shield" viewBox="0 0 64 76" fill="none"><path d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" fill="none"/><path d="M26 38l6 6 12-14" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="bar-brand">BYTEFORCE</span>
      </div>
      <button class="bar-action" onclick={() => goto(`${base}/incident`)}>상담 예약</button>
    </header>

    <div class="content">

      <!-- HERO -->
      <section class="hero">
        {#if phase === 'alive'}
          <h1 class="hero-title">
            <span>{getTyped().l1}<span class="cursor" class:cursor--blink={typedChars >= totalChars}>|</span></span>
            {#if getTyped().l2}<br/><span>{getTyped().l2}</span>{/if}
          </h1>
        {:else if skeletonVisible}
          <div class="skel skel--title"></div>
          <div class="skel skel--title skel--short"></div>
        {/if}

        {#if phase === 'alive'}
          <p class="hero-sub fade-in" style="animation-delay:0.3s">배포 전 보안 점검. 바이브코더를 위해 만들었습니다.</p>
          <p class="hero-tools fade-in" style="animation-delay:0.5s">Cursor &middot; Claude Code &middot; v0 &middot; Lovable &middot; bolt.new</p>
          <button class="hero-cta fade-in" style="animation-delay:0.7s" onclick={() => goto(`${base}/diagnose`)}>레포 점검 시작</button>
        {:else if skeletonVisible}
          <div class="skel skel--text"></div>
          <div class="skel skel--btn"></div>
        {/if}
      </section>

      <!-- STATS -->
      <section class="stats">
        {#if phase === 'alive'}
          <div class="stat-row fade-in" style="animation-delay:0.9s">
            <div class="stat"><span class="stat-num">847</span><span class="stat-lbl">노출 키</span></div>
            <div class="stat"><span class="stat-num">62%</span><span class="stat-lbl">RLS 미설정</span></div>
            <div class="stat"><span class="stat-num">11일</span><span class="stat-lbl">평균 탐지</span></div>
          </div>
          <p class="stat-src fade-in" style="animation-delay:1.1s">2026 3~8월, 312개 레포 기준</p>
        {:else if skeletonVisible}
          <div class="skel-row">
            <div class="skel skel--stat"></div>
            <div class="skel skel--stat"></div>
            <div class="skel skel--stat"></div>
          </div>
        {/if}
      </section>

      <!-- RECENT -->
      {#if phase === 'alive' && history.length > 0}
        <section class="recent fade-in" style="animation-delay:1.3s">
          <h2 class="sec-head">최근 점검</h2>
          {#each history.slice(0, 5) as scan}
            <button class="scan-row" onclick={() => goto(`${base}/report/${scan.scanId}`)}>
              <div class="scan-info">
                <span class="scan-url">{scan.target}</span>
                <span class="scan-date">{fmtDate(scan.finishedAt)}</span>
              </div>
              <div class="scan-tags">
                {#if scan.summary.critical > 0}<span class="tag tag--c">{scan.summary.critical}</span>{/if}
                {#if scan.summary.warning > 0}<span class="tag tag--w">{scan.summary.warning}</span>{/if}
                {#if scan.summary.ok > 0}<span class="tag tag--o">{scan.summary.ok}</span>{/if}
              </div>
            </button>
          {/each}
        </section>
      {:else if skeletonVisible}
        <div class="skel skel--row"></div>
        <div class="skel skel--row"></div>
      {/if}

    </div>

    <nav class="nav">
      <button class="nav-i nav-i--on" onclick={() => navTo('home')}>홈</button>
      <button class="nav-i" onclick={() => navTo('diagnose')}>진단</button>
      <button class="nav-i" onclick={() => navTo('report')}>리포트</button>
      <button class="nav-i" onclick={() => navTo('packages')}>요금제</button>
    </nav>
  </div>
</div>

<style>
  .page {
    --bk: #000; --s1: #060608; --s2: #0c0c0e;
    --tx: #fff; --tx2: #ababaf; --tx3: #4a4a4f;
    --brd: rgba(255,255,255,0.055);
    --ok: #32d74b; --wn: #ff9500; --cr: #ff453a;
    --f: "Instrument Sans","Pretendard Variable",-apple-system,sans-serif;
    --m: "JetBrains Mono","SF Mono",monospace;
    --ease: cubic-bezier(0.16,1,0.3,1);
    position: relative; min-height: 100dvh;
    background: var(--bk); color: var(--tx); font-family: var(--f);
    overflow: hidden; -webkit-font-smoothing: antialiased;
  }

  .particles { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }

  /* ===== SPLASH ===== */
  .splash {
    position: fixed; inset: 0; z-index: 200;
    display: flex; align-items: center; justify-content: center;
    background: var(--bk);
    opacity: 0; transition: opacity 0.3s;
  }
  .splash--show { opacity: 1; }

  .emblem {
    display: flex; flex-direction: column; align-items: center; gap: 16px;
    opacity: 0; transform: scale(0.6);
    transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
  }
  .emblem--in { opacity: 1; transform: scale(1); }

  .shield { width: 72px; height: 86px; filter: drop-shadow(0 0 30px rgba(255,255,255,0.08)); }

  .check-path {
    stroke-dasharray: 40; stroke-dashoffset: 40;
    animation: drawCheck 0.5s ease-out 0.4s forwards;
  }
  @keyframes drawCheck { to { stroke-dashoffset: 0; } }

  .emblem-text {
    font-size: 28px; font-weight: 700; letter-spacing: 0.15em; color: var(--tx);
    opacity: 0; transform: translateY(8px);
    transition: opacity 0.4s var(--ease) 0.3s, transform 0.4s var(--ease) 0.3s;
  }
  .emblem-text--in { opacity: 1; transform: translateY(0); }

  .emblem-sub {
    font-size: 12px; font-weight: 500; letter-spacing: 0.35em; color: var(--tx3);
    opacity: 0; transition: opacity 0.4s var(--ease) 0.6s;
  }
  .emblem-sub--in { opacity: 1; }

  /* ===== APP ===== */
  .app {
    position: relative; z-index: 10; min-height: 100dvh;
    display: flex; flex-direction: column;
    opacity: 0; transform: translateY(16px);
    transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
  }
  .app--morphing { opacity: 0.3; transform: translateY(8px); }
  .app--visible { opacity: 1; transform: translateY(0); }

  /* Bar */
  .bar {
    position: sticky; top: 0; z-index: 90; height: 48px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px; background: rgba(0,0,0,0.85);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--brd);
  }
  .bar-logo { display: flex; align-items: center; gap: 8px; }
  .bar-shield { width: 18px; height: 22px; opacity: 0.5; }
  .bar-brand { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--tx3); }
  .bar-action {
    font-family: var(--f); font-size: 12px; font-weight: 500; color: var(--tx2);
    background: none; border: 1px solid var(--brd); border-radius: 6px;
    padding: 5px 14px; cursor: pointer; transition: color 0.2s, border-color 0.2s;
  }
  .bar-action:hover { color: var(--tx); border-color: rgba(255,255,255,0.15); }

  /* Content */
  .content { flex: 1; padding: 40px 20px 100px; max-width: 600px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 40px; }

  /* Hero */
  .hero { display: flex; flex-direction: column; gap: 16px; min-height: 200px; }
  .hero-title { font-size: 34px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.25; margin: 0; }
  .cursor { color: var(--tx2); font-weight: 300; }
  .cursor--blink { animation: blink 1s step-end infinite; }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  .hero-sub { font-size: 15px; color: var(--tx2); line-height: 1.5; margin: 0; }
  .hero-tools { font-family: var(--m); font-size: 12px; color: var(--tx3); letter-spacing: 0.02em; }
  .hero-cta {
    align-self: flex-start; padding: 11px 28px; border-radius: 6px; border: none;
    background: var(--tx); color: var(--bk); font-family: var(--f);
    font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s, transform 0.2s;
  }
  .hero-cta:hover { background: #e0e0e0; transform: translateY(-1px); }

  /* Fade in */
  .fade-in { opacity: 0; transform: translateY(8px); animation: fadeUp 0.5s var(--ease) forwards; }
  @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

  /* Stats */
  .stats { display: flex; flex-direction: column; gap: 8px; }
  .stat-row { display: flex; gap: 28px; }
  .stat { display: flex; flex-direction: column; gap: 3px; }
  .stat-num { font-family: var(--m); font-size: 22px; font-weight: 500; font-variant-numeric: tabular-nums; }
  .stat-lbl { font-size: 11px; color: var(--tx3); }
  .stat-src { font-size: 10px; color: var(--tx3); font-style: italic; margin: 0; }

  /* Recent */
  .recent { display: flex; flex-direction: column; }
  .sec-head { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--tx3); margin: 0 0 8px; padding-bottom: 8px; border-bottom: 1px solid var(--brd); }
  .scan-row {
    display: flex; align-items: center; justify-content: space-between; padding: 12px 0;
    border-bottom: 1px solid var(--brd); background: none; width: 100%;
    font-family: var(--f); cursor: pointer; text-align: left; color: var(--tx);
    border-left: none; border-right: none; border-top: none; transition: background 0.15s;
  }
  .scan-row:hover { background: var(--s1); }
  .scan-info { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
  .scan-url { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .scan-date { font-size: 11px; color: var(--tx3); }
  .scan-tags { display: flex; gap: 6px; flex-shrink: 0; }
  .tag { font-family: var(--m); font-size: 11px; font-weight: 500; padding: 2px 7px; border-radius: 3px; border: 1px solid var(--brd); background: var(--s2); }
  .tag--c { color: var(--cr); } .tag--w { color: var(--wn); } .tag--o { color: var(--ok); }

  /* ===== SKELETON ===== */
  .skel {
    background: linear-gradient(90deg, var(--s1) 25%, var(--s2) 50%, var(--s1) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    border-radius: 6px;
  }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .skel--title { height: 38px; width: 70%; }
  .skel--short { width: 50%; margin-top: 8px; }
  .skel--text { height: 16px; width: 80%; margin-top: 8px; }
  .skel--btn { height: 42px; width: 140px; margin-top: 12px; }
  .skel-row { display: flex; gap: 20px; }
  .skel--stat { height: 48px; width: 80px; }
  .skel--row { height: 48px; width: 100%; margin-top: 8px; }

  /* Nav */
  .nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    display: flex; background: rgba(6,6,8,0.9);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--brd);
  }
  .nav-i {
    flex: 1; padding: 12px 0; background: none; border: none;
    font-family: var(--f); font-size: 12px; font-weight: 500;
    color: var(--tx3); cursor: pointer; transition: color 0.15s;
  }
  .nav-i:hover { color: var(--tx2); }
  .nav-i--on { color: var(--tx); }

  @media (max-width: 768px) {
    .hero-title { font-size: 28px; }
    .emblem-text { font-size: 22px; }
    .shield { width: 56px; height: 68px; }
    .content { padding: 32px 16px 100px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .splash, .emblem, .emblem-text, .emblem-sub, .app, .fade-in, .skel { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; }
    .check-path { stroke-dashoffset: 0; animation: none; }
  }
</style>
