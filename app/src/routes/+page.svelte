<script lang="ts">
  import { scanHistory } from '$lib/stores/scan';
  import type { ScanResult } from '$lib/stores/scan';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  // --- Phase machine (simplified: 3s splash) ---
  let phase = $state<
    'black'|'shield-in'|'check-draw'|'splash-text'|'fade-out'|'home-in'|'alive'
  >('black');

  // --- Sub-element visibility ---
  let showStatus = $state(false);
  let showCta = $state(false);
  let showCard0 = $state(false);
  let showCard1 = $state(false);
  let showCard2 = $state(false);
  let showRecent = $state(false);

  // --- Canvas opacity ---
  let canvasOpacity = $state(0);

  // --- Canvas ---
  let canvasEl: HTMLCanvasElement | undefined = $state(undefined);

  // --- SVG draw progress ---
  let drawProgress = $state(0);

  // --- Data ---
  let activeTab = $state('home');
  let history = $state<ScanResult[]>([]);

  // --- Reduced motion ---
  let reducedMotion = $state(false);

  // --- Revisit mode ---
  let revisitMode = $state<'first'|'recent'>('first');

  // --- Glow pulse for revisit ---
  let glowPulse = $state(false);

  $effect(() => {
    const unsub = scanHistory.subscribe((h) => { history = h; });
    return unsub;
  });

  $effect(() => {
    if (typeof window !== 'undefined') {
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const lastVisit = localStorage.getItem('byteforce_lastVisit');
      if (lastVisit) {
        revisitMode = 'recent';
      }
      localStorage.setItem('byteforce_lastVisit', String(Date.now()));
    }

    if (reducedMotion) {
      phase = 'alive';
      drawProgress = 1;
      canvasOpacity = 0.5;
      showStatus = true;
      showCta = true;
      showCard0 = true;
      showCard1 = true;
      showCard2 = true;
      showRecent = true;
      return;
    }

    if (revisitMode === 'recent') {
      startRecentSequence();
    } else {
      startFullSequence();
    }
  });

  // --- Full first-visit sequence (~3s splash + home reveal) ---
  function startFullSequence() {
    // 0.3s: shield fade in (scale 0.7 -> 1)
    setTimeout(() => { phase = 'shield-in'; }, 300);

    // 0.8s: check draw begins
    setTimeout(() => {
      phase = 'check-draw';
      animateDrawProgress(400);
    }, 800);

    // 1.2s: splash text
    setTimeout(() => { phase = 'splash-text'; }, 1200);

    // 1.8s: splash fade out
    setTimeout(() => { phase = 'fade-out'; }, 1800);

    // 2.2s: home fades in
    setTimeout(() => {
      phase = 'home-in';
      animateCanvasOpacity();
    }, 2200);

    // 2.5s: alive with stagger
    setTimeout(() => {
      phase = 'alive';
      showStatus = true;
    }, 2500);
    setTimeout(() => { showCta = true; }, 2700);
    setTimeout(() => { showCard0 = true; }, 2900);
    setTimeout(() => { showCard1 = true; }, 3050);
    setTimeout(() => { showCard2 = true; }, 3200);
    setTimeout(() => { showRecent = true; }, 3400);
  }

  // Recent revisit: skip splash, glow pulse only
  function startRecentSequence() {
    drawProgress = 1;
    phase = 'home-in';
    canvasOpacity = 0.5;
    glowPulse = true;
    setTimeout(() => {
      phase = 'alive';
      showStatus = true;
      showCta = true;
      showCard0 = true;
      showCard1 = true;
      showCard2 = true;
      showRecent = true;
    }, 300);
    setTimeout(() => { glowPulse = false; }, 600);
  }

  function animateDrawProgress(duration: number) {
    const start = performance.now();
    function tick() {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      drawProgress = t;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateCanvasOpacity() {
    const start = performance.now();
    const duration = 800;
    function tick() {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      canvasOpacity = t * 0.5;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // --- Particles (amber-tinted) ---
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
      const n = Math.min(Math.floor((w * h) / 12000), 80);
      for (let i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.1, vy: (Math.random() - 0.5) * 0.1,
          r: Math.random() * 0.8 + 0.3, a: Math.random() * 0.07 + 0.03,
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
        ctx!.fillStyle = `rgba(255,149,0,${d.a})`;
        ctx!.fill();
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx!.beginPath();
            ctx!.moveTo(dots[i].x, dots[i].y);
            ctx!.lineTo(dots[j].x, dots[j].y);
            ctx!.strokeStyle = `rgba(255,149,0,${0.015 * (1 - dist / 80)})`;
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

  // Shield path lengths (approximate)
  const shieldPathLen = 220;
  const checkPathLen = 40;

  function shieldDashOffset(): number {
    return shieldPathLen * (1 - drawProgress);
  }
  function checkDashOffset(): number {
    const t = Math.max(0, (drawProgress - 0.5) / 0.5);
    return checkPathLen * (1 - t);
  }

  // Splash visible phases
  function isSplashVisible(): boolean {
    return ['black','shield-in','check-draw','splash-text','fade-out'].includes(phase);
  }
  function isAppVisible(): boolean {
    return ['home-in','alive'].includes(phase);
  }
</script>

<div class="page">
  <canvas
    class="particles"
    bind:this={canvasEl}
    style="opacity: {canvasOpacity}"
  ></canvas>

  <!-- ===== SPLASH (3s) ===== -->
  {#if isSplashVisible()}
    <div
      class="splash"
      class:splash--fade={phase === 'fade-out'}
    >
      {#if phase !== 'black'}
        <div class="splash-center">
          <svg
            class="splash-shield"
            class:splash-shield--in={phase !== 'black'}
            viewBox="0 0 64 76" fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z"
              stroke="rgba(255,149,0,0.7)"
              stroke-width="1.5"
              fill="none"
              stroke-dasharray="{shieldPathLen}"
              stroke-dashoffset="{shieldDashOffset()}"
            />
            <path
              d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z"
              fill="rgba(255,149,0,0.03)"
            />
            <!-- Check mark (amber stroke-draw) -->
            <path
              d="M26 38l6 6 12-14"
              stroke="#ff9500"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-dasharray="{checkPathLen}"
              stroke-dashoffset="{checkDashOffset()}"
            />
            <!-- Hammer dent marks -->
            <circle cx="20" cy="25" r="3" fill="none" stroke="rgba(255,149,0,0.25)" stroke-width="0.8" opacity={drawProgress > 0.3 ? 1 : 0}/>
            <line x1="17" y1="23" x2="15.5" y2="21.5" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.3 ? 1 : 0}/>
            <line x1="22" y1="22.5" x2="23.5" y2="21" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.3 ? 1 : 0}/>
            <circle cx="44" cy="30" r="2.5" fill="none" stroke="rgba(255,149,0,0.2)" stroke-width="0.8" opacity={drawProgress > 0.4 ? 1 : 0}/>
            <line x1="46" y1="28" x2="47.5" y2="26.5" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.4 ? 1 : 0}/>
            <ellipse cx="38" cy="55" rx="4" ry="2" fill="none" stroke="rgba(255,149,0,0.2)" stroke-width="0.8" opacity={drawProgress > 0.5 ? 1 : 0}/>
            <line x1="41" y1="53.5" x2="43" y2="52" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.5 ? 1 : 0}/>
          </svg>
          {#if phase === 'splash-text' || phase === 'fade-out'}
            <span class="splash-label splash-label--in">{'\uB450\uB4DC\uB824\uBD24\uC2B5\uB2C8\uB2E4.'}</span>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <!-- ===== MAIN APP ===== -->
  <div
    class="app"
    class:app--visible={isAppVisible()}
  >
    <!-- Appbar (48px) -->
    <header class="bar" class:bar--in={isAppVisible()}>
      <div class="bar-logo">
        <svg class="bar-shield" viewBox="0 0 64 76" fill="none">
          <path d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z" stroke="rgba(255,149,0,0.3)" stroke-width="1.5" fill="none"/>
          <path d="M26 38l6 6 12-14" stroke="rgba(255,149,0,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="20" cy="25" r="2.5" fill="none" stroke="rgba(255,149,0,0.15)" stroke-width="0.5"/>
          <circle cx="44" cy="30" r="2" fill="none" stroke="rgba(255,149,0,0.12)" stroke-width="0.5"/>
          <ellipse cx="38" cy="55" rx="3" ry="1.5" fill="none" stroke="rgba(255,149,0,0.12)" stroke-width="0.5"/>
        </svg>
        <span class="bar-brand">BYTEFORCE</span>
      </div>
      <button class="bar-action" onclick={() => goto(`${base}/incident`)}>{'\uC0C1\uB2F4 \uC608\uC57D'}</button>
    </header>

    <div class="content">
      <!-- ===== HERO: Norton-style status dashboard ===== -->
      <section class="hero">
        <!-- Big shield with orbital rings -->
        <div class="shield-wrap" class:shield-wrap--pulse={glowPulse}>
          <!-- Orbital rings -->
          <div class="orbit orbit--1"></div>
          <div class="orbit orbit--2"></div>
          <div class="orbit orbit--3"></div>

          <!-- Main shield SVG (160x190) -->
          <svg class="hero-shield" viewBox="0 0 64 76" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Shield body fill -->
            <path
              d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z"
              fill="rgba(255,149,0,0.04)"
            />
            <!-- Shield outline -->
            <path
              d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z"
              stroke="rgba(255,149,0,0.5)"
              stroke-width="1.2"
              fill="none"
            />
            <!-- Amber check mark -->
            <path
              d="M26 38l6 6 12-14"
              stroke="#ff9500"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <!-- Dent 1: top-left -->
            <circle cx="20" cy="25" r="3" fill="none" stroke="rgba(255,149,0,0.2)" stroke-width="0.8"/>
            <line x1="17" y1="23" x2="15.5" y2="21.5" stroke="rgba(255,149,0,0.12)" stroke-width="0.5"/>
            <line x1="22" y1="22.5" x2="23.5" y2="21" stroke="rgba(255,149,0,0.12)" stroke-width="0.5"/>
            <!-- Dent 2: top-right -->
            <circle cx="44" cy="30" r="2.5" fill="none" stroke="rgba(255,149,0,0.18)" stroke-width="0.8"/>
            <line x1="46" y1="28" x2="47.5" y2="26.5" stroke="rgba(255,149,0,0.12)" stroke-width="0.5"/>
            <!-- Dent 3: bottom -->
            <ellipse cx="38" cy="55" rx="4" ry="2" fill="none" stroke="rgba(255,149,0,0.18)" stroke-width="0.8"/>
            <line x1="41" y1="53.5" x2="43" y2="52" stroke="rgba(255,149,0,0.12)" stroke-width="0.5"/>
            <line x1="35" y1="56.5" x2="33" y2="58" stroke="rgba(255,149,0,0.12)" stroke-width="0.5"/>
          </svg>
        </div>

        <!-- Status text below shield -->
        {#if phase === 'alive' && showStatus}
          <p class="status-text elem-fade-in">{'\uC544\uC9C1 \uC810\uAC80 \uC804\uC785\uB2C8\uB2E4'}</p>
        {/if}

        <!-- CTA Button -->
        {#if phase === 'alive' && showCta}
          <button class="hero-cta elem-rise-in" onclick={() => goto(`${base}/diagnose`)}>{'\uB0B4 \uD504\uB85C\uC81D\uD2B8 \uC810\uAC80 \uBC1B\uAE30'}</button>
        {/if}
      </section>

      <!-- ===== SERVICE CARDS (Norton-style) ===== -->
      <section class="cards">
        {#if phase === 'alive' && showCard0}
          <button class="card elem-rise-in" onclick={() => goto(`${base}/packages`)}>
            <div class="card-body">
              <div class="card-text">
                <span class="card-title">{'1:1 \uB300\uBA74 \uC810\uAC80'}</span>
                <span class="card-sub">{'\uB9C8\uACE1 \uBC29\uBB38 \uB610\uB294 \uD654\uC0C1'}</span>
              </div>
              <div class="card-icon card-icon--amber">
                <svg viewBox="0 0 64 76" fill="none">
                  <path d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M26 38l6 6 12-14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <span class="card-link">{'\uC608\uC57D\uD558\uAE30'} &gt;</span>
          </button>
        {/if}

        {#if phase === 'alive' && showCard1}
          <button class="card elem-rise-in" onclick={() => goto(`${base}/incident`)}>
            <div class="card-body">
              <div class="card-text">
                <span class="card-title">{'\uAE34\uAE09 \uC810\uAC80'}</span>
                <span class="card-sub">{'24\uC2DC\uAC04 \uC774\uB0B4 \uB300\uC751'}</span>
              </div>
              <div class="card-icon card-icon--coral">
                <!-- Lightning bolt -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>
                </svg>
              </div>
            </div>
            <span class="card-link card-link--coral">{'\uAE34\uAE09 \uC694\uCCAD'} &gt;</span>
          </button>
        {/if}

        {#if phase === 'alive' && showCard2}
          <button class="card elem-rise-in" onclick={() => goto(`${base}/packages`)}>
            <div class="card-body">
              <div class="card-text">
                <span class="card-title">{'\uC6D4 \uAD00\uB9AC'}</span>
                <span class="card-sub">{'\uC815\uAE30 \uC810\uAC80 + \uBAA8\uB2C8\uD130\uB9C1'}</span>
              </div>
              <div class="card-icon card-icon--emerald">
                <!-- Calendar icon -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <rect x="8" y="14" width="3" height="3" rx="0.5"/>
                </svg>
              </div>
            </div>
            <span class="card-link card-link--emerald">{'\uC790\uC138\uD788 \uBCF4\uAE30'} &gt;</span>
          </button>
        {/if}
      </section>

      <!-- ===== RECENT SCANS ===== -->
      {#if phase === 'alive' && showRecent && history.length > 0}
        <section class="recent elem-fade-in">
          <h2 class="sec-head">{'\uCD5C\uADFC \uC810\uAC80'}</h2>
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
      {/if}
    </div>

    <!-- Bottom nav -->
    <nav class="nav">
      <button class="nav-i nav-i--on" onclick={() => navTo('home')}>{'\uD648'}</button>
      <button class="nav-i" onclick={() => navTo('diagnose')}>{'\uC9C4\uB2E8'}</button>
      <button class="nav-i" onclick={() => navTo('report')}>{'\uB9AC\uD3EC\uD2B8'}</button>
      <button class="nav-i" onclick={() => navTo('packages')}>{'\uC694\uAE08\uC81C'}</button>
    </nav>
  </div>
</div>

<style>
  .page {
    --bk: #0a0a0f; --s1: #111116; --s2: #18181d;
    --tx: #f0f0f5; --tx2: #8a8a8f; --tx3: #4a4a4f;
    --amber: #ff9500; --amber-light: #ffab33; --amber-dim: rgba(255,149,0,0.15);
    --brd: rgba(255,255,255,0.06);
    --ok: #32d74b; --wn: #ff9500; --cr: #ff453a;
    --f: "Instrument Sans","Pretendard Variable",-apple-system,sans-serif;
    --m: "JetBrains Mono","SF Mono",monospace;
    --ease: cubic-bezier(0.16,1,0.3,1);
    position: relative; min-height: 100dvh;
    background: var(--bk); color: var(--tx); font-family: var(--f);
    overflow-x: hidden; -webkit-font-smoothing: antialiased;
  }

  .particles {
    position: fixed; inset: 0; width: 100%; height: 100%;
    z-index: 0; pointer-events: none; opacity: 0;
  }

  /* ===== SPLASH ===== */
  .splash {
    position: fixed; inset: 0; z-index: 200;
    display: flex; align-items: center; justify-content: center;
    background: var(--bk);
    transition: opacity 0.5s ease-out;
  }
  .splash--fade {
    opacity: 0; pointer-events: none;
  }

  .splash-center {
    display: flex; flex-direction: column; align-items: center; gap: 16px;
  }

  .splash-shield {
    width: 80px; height: 95px;
    opacity: 0; transform: scale(0.7);
    animation: splashShieldIn 0.5s var(--ease) forwards;
    filter: drop-shadow(0 0 20px rgba(255,149,0,0.2));
  }
  @keyframes splashShieldIn {
    from { opacity: 0; transform: scale(0.7); }
    to { opacity: 1; transform: scale(1); }
  }

  .splash-label {
    font-size: 15px; font-weight: 400; letter-spacing: 0.08em;
    color: var(--tx); opacity: 0; transform: translateY(6px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  }
  .splash-label--in { opacity: 1; transform: translateY(0); }

  /* ===== APP ===== */
  .app {
    position: relative; z-index: 10; min-height: 100dvh;
    display: flex; flex-direction: column;
    opacity: 0; transition: opacity 0.4s var(--ease);
  }
  .app--visible { opacity: 1; }

  /* Appbar */
  .bar {
    position: sticky; top: 0; z-index: 90; height: 48px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px; background: rgba(10,10,15,0.85);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--brd);
    opacity: 0; transform: translateY(-8px);
    transition: opacity 0.4s var(--ease), transform 0.4s var(--ease);
  }
  .bar--in { opacity: 1; transform: translateY(0); }

  .bar-logo { display: flex; align-items: center; gap: 8px; }
  .bar-shield { width: 18px; height: 22px; opacity: 0.6; }
  .bar-brand {
    font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
    color: #6a6a6f;
  }
  .bar-action {
    font-family: var(--f); font-size: 12px; font-weight: 500; color: var(--amber);
    background: none; border: 1px solid rgba(255,149,0,0.3); border-radius: 6px;
    padding: 5px 14px; cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }
  .bar-action:hover {
    color: var(--amber-light); border-color: rgba(255,149,0,0.5);
    background: rgba(255,149,0,0.05);
  }

  /* Content */
  .content {
    flex: 1; padding: 0 20px 100px; max-width: 600px;
    margin: 0 auto; width: 100%;
    display: flex; flex-direction: column; gap: 32px;
  }

  /* ===== HERO: Norton dashboard style ===== */
  .hero {
    display: flex; flex-direction: column; align-items: center;
    gap: 16px; padding-top: 32px; padding-bottom: 16px;
    min-height: 340px; justify-content: center;
  }

  /* Shield wrapper with orbital rings */
  .shield-wrap {
    position: relative; width: 220px; height: 220px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .shield-wrap--pulse .hero-shield {
    animation: glowPulseAnim 0.6s ease-in-out;
  }
  @keyframes glowPulseAnim {
    0% { filter: drop-shadow(0 0 30px rgba(255,149,0,0.1)); }
    50% { filter: drop-shadow(0 0 60px rgba(255,149,0,0.35)); }
    100% { filter: drop-shadow(0 0 30px rgba(255,149,0,0.1)); }
  }

  .hero-shield {
    width: 160px; height: 190px; position: relative; z-index: 2;
    filter: drop-shadow(0 0 30px rgba(255,149,0,0.1));
  }

  /* Orbital rings */
  .orbit {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(255,149,0,0.06);
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .orbit--1 { width: 200px; height: 200px; border-color: rgba(255,149,0,0.07); }
  .orbit--2 { width: 240px; height: 240px; border-color: rgba(255,149,0,0.04); }
  .orbit--3 { width: 280px; height: 280px; border-color: rgba(255,149,0,0.025); }

  /* Status text */
  .status-text {
    font-size: 20px; font-weight: 600; color: var(--tx);
    text-align: center; margin: 0;
  }

  /* CTA Button - pill shape */
  .hero-cta {
    padding: 13px 40px; border-radius: 980px; border: none;
    background: var(--amber); color: var(--bk); font-family: var(--f);
    font-size: 15px; font-weight: 600; cursor: pointer;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 30px rgba(255,149,0,0.15);
  }
  .hero-cta:hover {
    background: var(--amber-light); transform: translateY(-1px);
    box-shadow: 0 0 40px rgba(255,149,0,0.25);
  }

  /* Element animations */
  .elem-fade-in { animation: elemFadeIn 0.4s var(--ease) forwards; }
  .elem-rise-in { animation: elemRiseIn 0.5s var(--ease) forwards; }
  @keyframes elemFadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes elemRiseIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ===== SERVICE CARDS ===== */
  .cards {
    display: flex; flex-direction: column; gap: 12px;
  }

  .card {
    display: flex; flex-direction: column; gap: 14px;
    background: var(--s1); border: 1px solid var(--brd);
    border-radius: 16px; padding: 20px;
    cursor: pointer; text-align: left; color: var(--tx);
    font-family: var(--f); width: 100%;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .card:hover {
    border-color: rgba(255,255,255,0.12);
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }

  .card-body {
    display: flex; align-items: center; justify-content: space-between;
  }

  .card-text {
    display: flex; flex-direction: column; gap: 4px;
  }
  .card-title {
    font-size: 16px; font-weight: 600; color: var(--tx);
  }
  .card-sub {
    font-size: 13px; color: var(--tx2);
  }

  .card-icon {
    width: 40px; height: 40px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .card-icon svg {
    width: 100%; height: 100%;
  }
  .card-icon--amber { color: var(--amber); }
  .card-icon--coral { color: var(--cr); }
  .card-icon--emerald { color: var(--ok); }

  .card-link {
    font-size: 13px; font-weight: 500; color: var(--amber);
    letter-spacing: 0.01em;
  }
  .card-link--coral { color: var(--cr); }
  .card-link--emerald { color: var(--ok); }

  /* ===== RECENT ===== */
  .recent { display: flex; flex-direction: column; }
  .sec-head {
    font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--tx3);
    margin: 0 0 8px; padding-bottom: 8px;
    border-bottom: 1px solid var(--brd);
  }
  .scan-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid var(--brd);
    background: none; width: 100%; font-family: var(--f);
    cursor: pointer; text-align: left; color: var(--tx);
    border-left: none; border-right: none; border-top: none;
    transition: background 0.15s;
  }
  .scan-row:hover { background: var(--s1); }
  .scan-info { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
  .scan-url { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .scan-date { font-size: 11px; color: var(--tx3); }
  .scan-tags { display: flex; gap: 6px; flex-shrink: 0; }
  .tag {
    font-family: var(--m); font-size: 11px; font-weight: 500;
    padding: 2px 7px; border-radius: 3px;
    border: 1px solid var(--brd); background: var(--s2);
  }
  .tag--c { color: var(--cr); }
  .tag--w { color: var(--wn); }
  .tag--o { color: var(--ok); }

  /* ===== NAV ===== */
  .nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    display: flex; background: rgba(10,10,15,0.9);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--brd);
  }
  .nav-i {
    flex: 1; padding: 12px 0; background: none; border: none;
    font-family: var(--f); font-size: 12px; font-weight: 500;
    color: var(--tx3); cursor: pointer; transition: color 0.15s;
  }
  .nav-i:hover { color: var(--tx2); }
  .nav-i--on { color: var(--amber); }

  @media (max-width: 768px) {
    .hero { min-height: 300px; padding-top: 24px; }
    .hero-shield { width: 130px; height: 155px; }
    .shield-wrap { width: 180px; height: 180px; }
    .orbit--1 { width: 160px; height: 160px; }
    .orbit--2 { width: 200px; height: 200px; }
    .orbit--3 { width: 240px; height: 240px; }
    .status-text { font-size: 18px; }
    .content { padding: 0 16px 100px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .splash, .splash-shield, .splash-label, .app, .bar,
    .elem-fade-in, .elem-rise-in, .shield-wrap--pulse .hero-shield {
      animation: none !important;
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
</style>