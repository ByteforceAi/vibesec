<script lang="ts">
  import { scanHistory } from '$lib/stores/scan';
  import type { ScanResult } from '$lib/stores/scan';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  // --- Phase machine ---
  let phase = $state<
    'black'|'shield-in'|'check-draw'|'splash-text'|'brand-text'|'fade-out'|'home-in'|'alive'
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
      canvasOpacity = 0.6;
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
    setTimeout(() => { phase = 'shield-in'; }, 500);

    setTimeout(() => {
      phase = 'check-draw';
      animateDrawProgress(400);
    }, 800);

    setTimeout(() => { phase = 'splash-text'; }, 1200);

    setTimeout(() => { phase = 'brand-text'; }, 1500);

    setTimeout(() => { phase = 'fade-out'; }, 2000);

    setTimeout(() => {
      phase = 'home-in';
      animateCanvasOpacity();
    }, 2200);

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
    canvasOpacity = 0.6;
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
      canvasOpacity = t * 0.6;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // --- Binary Matrix Rain (canvas) ---
  $effect(() => {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let w = 0, h = 0;

    const COL_GAP = 20;
    const FONT_SIZE = 11;
    const SPEED_MIN = 0.5;
    const SPEED_MAX = 1.5;
    const CHAR_OPACITY_TOP = 0.08;
    const CHAR_OPACITY_BOTTOM = 0.02;

    interface Column {
      x: number;
      y: number;
      speed: number;
      chars: string[];
      len: number;
    }
    let columns: Column[] = [];

    function makeChars(len: number): string[] {
      const arr: string[] = [];
      for (let i = 0; i < len; i++) {
        arr.push(Math.random() > 0.5 ? '1' : '0');
      }
      return arr;
    }

    function resetColumn(col: Column) {
      col.y = -Math.random() * h * 0.5;
      col.speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
      col.len = 5 + Math.floor(Math.random() * 11);
      col.chars = makeChars(col.len);
    }

    function resize() {
      w = canvasEl!.clientWidth;
      h = canvasEl!.clientHeight;
      canvasEl!.width = w;
      canvasEl!.height = h;
    }

    function init() {
      resize();
      columns = [];
      const numCols = Math.floor(w / COL_GAP);
      for (let i = 0; i < numCols; i++) {
        const col: Column = {
          x: i * COL_GAP + COL_GAP / 2,
          y: -Math.random() * h,
          speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
          len: 5 + Math.floor(Math.random() * 11),
          chars: [],
        };
        col.chars = makeChars(col.len);
        columns.push(col);
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.font = `${FONT_SIZE}px "JetBrains Mono","SF Mono",monospace`;
      ctx!.textAlign = 'center';

      for (const col of columns) {
        col.y += col.speed;

        for (let i = 0; i < col.chars.length; i++) {
          const charY = col.y + i * (FONT_SIZE + 2);
          if (charY < 0 || charY > h) continue;

          const yRatio = charY / h;
          const alpha = CHAR_OPACITY_TOP + (CHAR_OPACITY_BOTTOM - CHAR_OPACITY_TOP) * yRatio;

          ctx!.fillStyle = `rgba(10,132,255,${alpha})`;
          ctx!.fillText(col.chars[i], col.x, charY);
        }

        const lastCharY = col.y + col.chars.length * (FONT_SIZE + 2);
        if (lastCharY > h + 100) {
          resetColumn(col);
        }
      }

      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    const onResize = () => init();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
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

  const shieldPathLen = 220;
  const checkPathLen = 40;

  function shieldDashOffset(): number {
    return shieldPathLen * (1 - drawProgress);
  }
  function checkDashOffset(): number {
    const t = Math.max(0, (drawProgress - 0.5) / 0.5);
    return checkPathLen * (1 - t);
  }

  function isSplashVisible(): boolean {
    return ['black','shield-in','check-draw','splash-text','brand-text','fade-out'].includes(phase);
  }
  function isAppVisible(): boolean {
    return ['home-in','alive'].includes(phase);
  }
</script>

<div class="page">
  <canvas
    class="matrix-canvas"
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
              stroke="rgba(10,132,255,0.7)"
              stroke-width="1.5"
              fill="none"
              stroke-dasharray="{shieldPathLen}"
              stroke-dashoffset="{shieldDashOffset()}"
            />
            <path
              d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z"
              fill="rgba(10,132,255,0.03)"
            />
            <path
              d="M26 38l6 6 12-14"
              stroke="#0A84FF"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-dasharray="{checkPathLen}"
              stroke-dashoffset="{checkDashOffset()}"
            />
            <circle cx="20" cy="25" r="3" fill="none" stroke="rgba(10,132,255,0.25)" stroke-width="0.8" opacity={drawProgress > 0.3 ? 1 : 0}/>
            <line x1="17" y1="23" x2="15.5" y2="21.5" stroke="rgba(10,132,255,0.15)" stroke-width="0.5" opacity={drawProgress > 0.3 ? 1 : 0}/>
            <line x1="22" y1="22.5" x2="23.5" y2="21" stroke="rgba(10,132,255,0.15)" stroke-width="0.5" opacity={drawProgress > 0.3 ? 1 : 0}/>
            <circle cx="44" cy="30" r="2.5" fill="none" stroke="rgba(10,132,255,0.2)" stroke-width="0.8" opacity={drawProgress > 0.4 ? 1 : 0}/>
            <line x1="46" y1="28" x2="47.5" y2="26.5" stroke="rgba(10,132,255,0.15)" stroke-width="0.5" opacity={drawProgress > 0.4 ? 1 : 0}/>
            <ellipse cx="38" cy="55" rx="4" ry="2" fill="none" stroke="rgba(10,132,255,0.2)" stroke-width="0.8" opacity={drawProgress > 0.5 ? 1 : 0}/>
            <line x1="41" y1="53.5" x2="43" y2="52" stroke="rgba(10,132,255,0.15)" stroke-width="0.5" opacity={drawProgress > 0.5 ? 1 : 0}/>
          </svg>
          {#if phase === 'splash-text' || phase === 'brand-text' || phase === 'fade-out'}
            <span class="splash-label splash-label--in">{'\uB450\uB4DC\uB824\uBD24\uC2B5\uB2C8\uB2E4.'}</span>
          {/if}
          {#if phase === 'brand-text' || phase === 'fade-out'}
            <span class="splash-brand splash-brand--in">BYTEFORCE SECURITY</span>
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
    <!-- Appbar -->
    <header class="bar" class:bar--in={isAppVisible()}>
      <div class="bar-logo">
        <svg class="bar-shield" viewBox="0 0 64 76" fill="none">
          <path d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z" stroke="rgba(10,132,255,0.3)" stroke-width="1.5" fill="none"/>
          <path d="M26 38l6 6 12-14" stroke="rgba(10,132,255,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="20" cy="25" r="2.5" fill="none" stroke="rgba(10,132,255,0.15)" stroke-width="0.5"/>
          <circle cx="44" cy="30" r="2" fill="none" stroke="rgba(10,132,255,0.12)" stroke-width="0.5"/>
          <ellipse cx="38" cy="55" rx="3" ry="1.5" fill="none" stroke="rgba(10,132,255,0.12)" stroke-width="0.5"/>
        </svg>
        <span class="bar-brand">BYTEFORCE</span>
      </div>
      <button class="bar-action" onclick={() => goto(`${base}/incident`)}>{'\uC0C1\uB2F4 \uC608\uC57D'}</button>
    </header>

    <div class="content">
      <!-- ===== HERO ===== -->
      <section class="hero">
        <div class="shield-wrap" class:shield-wrap--pulse={glowPulse}>
          <!-- Orbital rings (rotating) -->
          <div class="orbit orbit--1"></div>
          <div class="orbit orbit--2"></div>
          <div class="orbit orbit--3"></div>

          <svg class="hero-shield" viewBox="0 0 64 76" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z"
              fill="rgba(10,132,255,0.04)"
            />
            <path
              d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z"
              stroke="rgba(10,132,255,0.5)"
              stroke-width="1.2"
              fill="none"
            />
            <path
              d="M26 38l6 6 12-14"
              stroke="#0A84FF"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="20" cy="25" r="3" fill="none" stroke="rgba(10,132,255,0.2)" stroke-width="0.8"/>
            <line x1="17" y1="23" x2="15.5" y2="21.5" stroke="rgba(10,132,255,0.12)" stroke-width="0.5"/>
            <line x1="22" y1="22.5" x2="23.5" y2="21" stroke="rgba(10,132,255,0.12)" stroke-width="0.5"/>
            <circle cx="44" cy="30" r="2.5" fill="none" stroke="rgba(10,132,255,0.18)" stroke-width="0.8"/>
            <line x1="46" y1="28" x2="47.5" y2="26.5" stroke="rgba(10,132,255,0.12)" stroke-width="0.5"/>
            <ellipse cx="38" cy="55" rx="4" ry="2" fill="none" stroke="rgba(10,132,255,0.18)" stroke-width="0.8"/>
            <line x1="41" y1="53.5" x2="43" y2="52" stroke="rgba(10,132,255,0.12)" stroke-width="0.5"/>
            <line x1="35" y1="56.5" x2="33" y2="58" stroke="rgba(10,132,255,0.12)" stroke-width="0.5"/>
          </svg>
        </div>

        {#if phase === 'alive' && showStatus}
          <p class="status-text elem-fade-in">{'\uC544\uC9C1 \uC810\uAC80 \uC804\uC785\uB2C8\uB2E4'}</p>
        {/if}

        {#if phase === 'alive' && showCta}
          <button class="hero-cta elem-rise-in" onclick={() => goto(`${base}/diagnose`)}>{'\uB0B4 \uD504\uB85C\uC81D\uD2B8 \uC810\uAC80 \uBC1B\uAE30'}</button>
        {/if}
      </section>

      <!-- ===== SERVICE CARDS ===== -->
      <section class="cards">
        {#if phase === 'alive' && showCard0}
          <button class="card card--blue elem-rise-in" onclick={() => goto(`${base}/packages`)}>
            <div class="card-body">
              <div class="card-icon card-icon--blue">
                <svg viewBox="0 0 64 76" fill="none">
                  <path d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M26 38l6 6 12-14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="card-text">
                <span class="card-title">{'1:1 \uB300\uBA74 \uC810\uAC80'}</span>
                <span class="card-sub">{'\uB9C8\uACE1 \uBC29\uBB38 \uB610\uB294 \uD654\uC0C1'}</span>
              </div>
            </div>
            <span class="card-link card-link--blue">{'\uC608\uC57D\uD558\uAE30'} &gt;</span>
          </button>
        {/if}

        {#if phase === 'alive' && showCard1}
          <button class="card card--red elem-rise-in" onclick={() => goto(`${base}/incident`)}>
            <div class="card-body">
              <div class="card-icon card-icon--red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>
                </svg>
              </div>
              <div class="card-text">
                <span class="card-title">{'\uAE34\uAE09 \uC810\uAC80'}</span>
                <span class="card-sub">{'24\uC2DC\uAC04 \uC774\uB0B4 \uB300\uC751'}</span>
              </div>
            </div>
            <span class="card-link card-link--red">{'\uAE34\uAE09 \uC694\uCCAD'} &gt;</span>
          </button>
        {/if}

        {#if phase === 'alive' && showCard2}
          <button class="card card--green elem-rise-in" onclick={() => goto(`${base}/packages`)}>
            <div class="card-body">
              <div class="card-icon card-icon--green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <rect x="8" y="14" width="3" height="3" rx="0.5"/>
                </svg>
              </div>
              <div class="card-text">
                <span class="card-title">{'\uC6D4 \uAD00\uB9AC'}</span>
                <span class="card-sub">{'\uC815\uAE30 \uC810\uAC80 + \uBAA8\uB2C8\uD130\uB9C1'}</span>
              </div>
            </div>
            <span class="card-link card-link--green">{'\uC790\uC138\uD788 \uBCF4\uAE30'} &gt;</span>
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
    --bg:        #050510;
    --surface:   #0a0a1a;
    --surface-2: #0f0f24;
    --text:      #e8e8f0;
    --text-2:    #8888a0;
    --text-3:    #4a4a60;
    --blue:      #0A84FF;
    --blue-glow: rgba(10,132,255,0.15);
    --blue-dim:  rgba(10,132,255,0.06);
    --green:     #32d74b;
    --red:       #ff453a;
    --border:    rgba(10,132,255,0.08);
    --f: "Instrument Sans","Pretendard Variable",-apple-system,sans-serif;
    --m: "JetBrains Mono","SF Mono",monospace;
    --ease: cubic-bezier(0.16,1,0.3,1);

    position: relative;
    min-height: 100dvh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--f);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* ===== BINARY MATRIX CANVAS ===== */
  .matrix-canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    opacity: 0;
  }

  /* ===== SPLASH ===== */
  .splash {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    transition: opacity 0.5s ease-out;
  }
  .splash--fade {
    opacity: 0;
    pointer-events: none;
  }

  .splash-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .splash-shield {
    width: 80px;
    height: 95px;
    opacity: 0;
    transform: scale(0.6);
    animation: splashShieldIn 0.5s var(--ease) forwards;
    filter: drop-shadow(0 0 30px rgba(10,132,255,0.25));
  }
  @keyframes splashShieldIn {
    from { opacity: 0; transform: scale(0.6); }
    to { opacity: 1; transform: scale(1); }
  }

  .splash-label {
    font-size: 15px;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: rgba(10,132,255,0.8);
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  }
  .splash-label--in {
    opacity: 1;
    transform: translateY(0);
  }

  .splash-brand {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    color: var(--text-3);
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  }
  .splash-brand--in {
    opacity: 1;
    transform: translateY(0);
  }

  /* ===== APP ===== */
  .app {
    position: relative;
    z-index: 10;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    opacity: 0;
    transition: opacity 0.4s var(--ease);
  }
  .app--visible {
    opacity: 1;
  }

  /* ===== APPBAR ===== */
  .bar {
    position: sticky;
    top: 0;
    z-index: 90;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: rgba(5,5,16,0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 0.4s var(--ease), transform 0.4s var(--ease);
  }
  .bar--in {
    opacity: 1;
    transform: translateY(0);
  }

  .bar-logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .bar-shield {
    width: 18px;
    height: 22px;
    opacity: 0.6;
  }
  .bar-brand {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: var(--text-3);
  }
  .bar-action {
    font-family: var(--f);
    font-size: 12px;
    font-weight: 500;
    color: var(--blue);
    background: none;
    border: 1px solid rgba(10,132,255,0.3);
    border-radius: 6px;
    padding: 5px 14px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }
  .bar-action:hover {
    color: #3da0ff;
    border-color: rgba(10,132,255,0.5);
    background: rgba(10,132,255,0.05);
  }

  /* ===== CONTENT ===== */
  .content {
    flex: 1;
    padding: 0 20px 100px;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* ===== HERO ===== */
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding-top: 32px;
    padding-bottom: 16px;
    min-height: 340px;
    justify-content: center;
  }

  /* Shield wrapper with orbital rings */
  .shield-wrap {
    position: relative;
    width: 220px;
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .shield-wrap--pulse .hero-shield {
    animation: glowPulseAnim 0.6s ease-in-out;
  }
  @keyframes glowPulseAnim {
    0% { filter: drop-shadow(0 0 30px rgba(10,132,255,0.1)); }
    50% { filter: drop-shadow(0 0 60px rgba(10,132,255,0.4)); }
    100% { filter: drop-shadow(0 0 30px rgba(10,132,255,0.1)); }
  }

  .hero-shield {
    width: 160px;
    height: 190px;
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 0 60px rgba(10,132,255,0.2));
  }

  /* Orbital rings - slowly rotating */
  .orbit {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(10,132,255,0.08);
    top: 50%;
    left: 50%;
    pointer-events: none;
  }
  .orbit--1 {
    width: 200px;
    height: 200px;
    border-color: rgba(10,132,255,0.1);
    transform: translate(-50%, -50%);
    animation: orbitRotate1 30s linear infinite;
  }
  .orbit--2 {
    width: 240px;
    height: 240px;
    border-color: rgba(10,132,255,0.06);
    transform: translate(-50%, -50%);
    animation: orbitRotate2 60s linear infinite;
  }
  .orbit--3 {
    width: 280px;
    height: 280px;
    border-color: rgba(10,132,255,0.035);
    transform: translate(-50%, -50%);
    animation: orbitRotate3 90s linear infinite;
  }

  @keyframes orbitRotate1 {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes orbitRotate2 {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(-360deg); }
  }
  @keyframes orbitRotate3 {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  /* Status text */
  .status-text {
    font-size: 20px;
    font-weight: 600;
    color: var(--text);
    text-align: center;
    margin: 0;
  }

  /* CTA Button - pill */
  .hero-cta {
    padding: 13px 40px;
    border-radius: 980px;
    border: none;
    background: var(--blue);
    color: #fff;
    font-family: var(--f);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 30px rgba(10,132,255,0.2);
  }
  .hero-cta:hover {
    background: #3da0ff;
    transform: translateY(-1px);
    box-shadow: 0 0 50px rgba(10,132,255,0.35);
  }

  /* Element animations */
  .elem-fade-in {
    animation: elemFadeIn 0.4s var(--ease) forwards;
  }
  .elem-rise-in {
    animation: elemRiseIn 0.5s var(--ease) forwards;
  }
  @keyframes elemFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes elemRiseIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ===== SERVICE CARDS ===== */
  .cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 24px;
    cursor: pointer;
    text-align: left;
    color: var(--text);
    font-family: var(--f);
    width: 100%;
    transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
    animation: breathe 4s ease-in-out infinite;
  }

  /* Breathing animation per card */
  .card--blue {
    border-left: 3px solid var(--blue);
    animation-delay: 0s;
  }
  .card--red {
    border-left: 3px solid var(--red);
    animation-delay: 1s;
  }
  .card--green {
    border-left: 3px solid var(--green);
    animation-delay: 2s;
  }

  @keyframes breathe {
    0%, 100% { box-shadow: 0 0 0 rgba(10,132,255,0); }
    50% { box-shadow: 0 0 20px rgba(10,132,255,0.06); }
  }

  .card:hover {
    border-color: rgba(10,132,255,0.25);
    transform: scale(1.01) translateY(-2px);
    box-shadow: 0 0 30px rgba(10,132,255,0.12);
  }
  .card--red:hover {
    border-color: rgba(255,69,58,0.25);
    box-shadow: 0 0 30px rgba(255,69,58,0.1);
  }
  .card--green:hover {
    border-color: rgba(50,215,75,0.25);
    box-shadow: 0 0 30px rgba(50,215,75,0.1);
  }

  .card-body {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .card-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s;
  }
  .card-icon svg {
    width: 100%;
    height: 100%;
  }
  .card-icon--blue { color: var(--blue); }
  .card-icon--red { color: var(--red); }
  .card-icon--green { color: var(--green); }

  .card:hover .card-icon--blue { color: #3da0ff; }
  .card:hover .card-icon--red { color: #ff6b63; }
  .card:hover .card-icon--green { color: #5ee66d; }

  .card-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
  }
  .card-sub {
    font-size: 13px;
    color: var(--text-2);
  }

  .card-link {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;
  }
  .card-link--blue { color: var(--blue); }
  .card-link--red { color: var(--red); }
  .card-link--green { color: var(--green); }

  /* ===== RECENT ===== */
  .recent {
    display: flex;
    flex-direction: column;
  }
  .sec-head {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-3);
    margin: 0 0 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }
  .scan-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    background: none;
    width: 100%;
    font-family: var(--f);
    cursor: pointer;
    text-align: left;
    color: var(--text);
    border-left: none;
    border-right: none;
    border-top: none;
    transition: background 0.15s;
  }
  .scan-row:hover {
    background: var(--surface);
  }
  .scan-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }
  .scan-url {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .scan-date {
    font-size: 11px;
    color: var(--text-3);
  }
  .scan-tags {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  .tag {
    font-family: var(--m);
    font-size: 11px;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 3px;
    border: 1px solid var(--border);
    background: var(--surface-2);
  }
  .tag--c { color: var(--red); }
  .tag--w { color: #ff9500; }
  .tag--o { color: var(--green); }

  /* ===== BOTTOM NAV ===== */
  .nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    display: flex;
    background: rgba(5,5,16,0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--border);
  }
  .nav-i {
    flex: 1;
    padding: 12px 0;
    background: none;
    border: none;
    font-family: var(--f);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-3);
    cursor: pointer;
    transition: color 0.15s;
  }
  .nav-i:hover {
    color: var(--text-2);
  }
  .nav-i--on {
    color: var(--blue);
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 768px) {
    .hero {
      min-height: 300px;
      padding-top: 24px;
    }
    .hero-shield {
      width: 130px;
      height: 155px;
    }
    .shield-wrap {
      width: 180px;
      height: 180px;
    }
    .orbit--1 { width: 160px; height: 160px; }
    .orbit--2 { width: 200px; height: 200px; }
    .orbit--3 { width: 240px; height: 240px; }
    .status-text { font-size: 18px; }
    .content { padding: 0 16px 100px; }
  }

  /* ===== REDUCED MOTION ===== */
  @media (prefers-reduced-motion: reduce) {
    .splash, .splash-shield, .splash-label, .splash-brand,
    .app, .bar, .elem-fade-in, .elem-rise-in,
    .shield-wrap--pulse .hero-shield,
    .orbit, .orbit--1, .orbit--2, .orbit--3,
    .card {
      animation: none !important;
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .orbit--1, .orbit--2, .orbit--3 {
      transform: translate(-50%, -50%) !important;
    }
  }
</style>
