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

  // --- Scanline position (0..1) ---
  let scanlineY = $state(0);

  // --- Data ---
  let activeTab = $state('home');
  let history = $state<ScanResult[]>([]);

  // --- Reduced motion ---
  let reducedMotion = $state(false);

  // --- Revisit mode ---
  let revisitMode = $state<'first'|'recent'>('first');

  // --- Glow pulse for revisit ---
  let glowPulse = $state(false);

  // --- Clock for statusbar ---
  let clock = $state('');

  $effect(() => {
    const unsub = scanHistory.subscribe((h) => { history = h; });
    return unsub;
  });

  // --- Clock updater ---
  $effect(() => {
    function updateClock() {
      const now = new Date();
      clock = now.toLocaleTimeString('ko-KR', { hour12: false });
    }
    updateClock();
    const iv = setInterval(updateClock, 1000);
    return () => clearInterval(iv);
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

  // --- Scanline animation ---
  $effect(() => {
    if (reducedMotion) return;
    if (phase !== 'alive' && phase !== 'home-in') return;
    let animId: number;
    const duration = 4000;
    const start = performance.now();
    function tick() {
      const elapsed = (performance.now() - start) % duration;
      const t = elapsed / duration;
      // ping-pong: 0->1->0
      scanlineY = t < 0.5 ? t * 2 : 2 - t * 2;
      animId = requestAnimationFrame(tick);
    }
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
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

  // --- Binary Rain Canvas (ascending) ---
  $effect(() => {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let w = 0, h = 0;

    const LANE_WIDTH = 140;
    const FONT_SIZE = 13;
    const CHAR_GAP = 18;
    const SPEED_MIN = 0.3;
    const SPEED_MAX = 0.9;
    const BASE_COLOR = 'rgba(58, 160, 255, 0.14)';
    const HEAD_COLOR = 'rgba(90, 200, 250, 0.55)';

    interface Lane {
      x: number;
      y: number;
      speed: number;
      chars: string[];
      len: number;
    }
    let lanes: Lane[] = [];

    function makeChars(len: number): string[] {
      const arr: string[] = [];
      for (let i = 0; i < len; i++) {
        arr.push(Math.random() > 0.5 ? '1' : '0');
      }
      return arr;
    }

    function resetLane(lane: Lane) {
      lane.y = h + Math.random() * h * 0.5;
      lane.speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
      lane.len = 8 + Math.floor(Math.random() * 12);
      lane.chars = makeChars(lane.len);
    }

    function resize() {
      w = canvasEl!.clientWidth;
      h = canvasEl!.clientHeight;
      canvasEl!.width = w;
      canvasEl!.height = h;
    }

    function init() {
      resize();
      lanes = [];
      let numLanes = Math.floor(w / LANE_WIDTH);
      numLanes = Math.max(4, Math.min(10, numLanes));
      const spacing = w / numLanes;
      for (let i = 0; i < numLanes; i++) {
        const jitter = (Math.random() - 0.5) * 0.3 * spacing;
        const lane: Lane = {
          x: spacing * (i + 0.5) + jitter,
          y: h + Math.random() * h,
          speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
          len: 8 + Math.floor(Math.random() * 12),
          chars: [],
        };
        lane.chars = makeChars(lane.len);
        lanes.push(lane);
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.font = `${FONT_SIZE}px "JetBrains Mono","SF Mono",monospace`;
      ctx!.textAlign = 'center';

      for (const lane of lanes) {
        // Move upward
        lane.y -= lane.speed;

        for (let i = 0; i < lane.chars.length; i++) {
          // 2% chance to flip
          if (Math.random() < 0.02) {
            lane.chars[i] = lane.chars[i] === '0' ? '1' : '0';
          }

          const charY = lane.y - i * CHAR_GAP;
          if (charY < -20 || charY > h + 20) continue;

          // First char (lowest index = bottom, head of ascending stream) is bright
          const isHead = i === 0;
          ctx!.fillStyle = isHead ? HEAD_COLOR : BASE_COLOR;
          ctx!.fillText(lane.chars[i], lane.x, charY);
        }

        // Reset when entire lane has risen above viewport
        const lastCharY = lane.y - (lane.chars.length - 1) * CHAR_GAP;
        if (lastCharY < -40) {
          resetLane(lane);
        }
      }

      if (reducedMotion) return; // static render: one frame only
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

<div class="os-shell">
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
    <!-- Menubar -->
    <header class="menubar" class:menubar--in={isAppVisible()}>
      <div class="menubar-left">
        <div class="traffic-lights">
          <span class="tl tl--red"></span>
          <span class="tl tl--yellow"></span>
          <span class="tl tl--green"></span>
        </div>
        <span class="menubar-sep"></span>
        <span class="menubar-word">BYTEFORCE</span>
        <span class="menubar-dot"> &middot; </span>
        <span class="menubar-sub">{'\uBC14\uC774\uBE0C\uC139'}</span>
      </div>
      <div class="menubar-right">
        <span class="menubar-kbd">{'\u2318K'}</span>
        <button class="menubar-btn" onclick={() => goto(`${base}/incident`)}>{'\uC0C1\uB2F4 \uC608\uC57D'}</button>
      </div>
    </header>

    <!-- Workspace -->
    <div class="workspace">
      <!-- Side Dock -->
      <aside class="dock">
        <button class="dock-item dock-item--active" onclick={() => navTo('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span class="dock-tooltip">{'\uD648'}</span>
        </button>
        <button class="dock-item" onclick={() => goto(`${base}/incident`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>
          </svg>
          <span class="dock-tooltip">{'\uAE34\uAE09'}</span>
        </button>
        <button class="dock-item" onclick={() => goto(`${base}/packages`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span class="dock-tooltip">{'\uC694\uAE08\uC81C'}</span>
        </button>
        <button class="dock-item" onclick={() => navTo('report')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <line x1="12" y1="20" x2="12" y2="10"/>
            <line x1="18" y1="20" x2="18" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="16"/>
          </svg>
          <span class="dock-tooltip">{'\uB9AC\uD3EC\uD2B8'}</span>
        </button>
        <div class="dock-spacer"></div>
        <button class="dock-item" onclick={() => goto(`${base}/packages`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2m0 18v2m-9-11h2m18 0h2m-3.3-6.7-1.4 1.4m-11.6 11.6-1.4 1.4m0-14.4 1.4 1.4m11.6 11.6 1.4 1.4"/>
          </svg>
          <span class="dock-tooltip">{'\uC124\uC815'}</span>
        </button>
      </aside>

      <!-- Main Content -->
      <main class="content">
        <!-- ===== HERO ===== -->
        <section class="hero">
          <div class="core-wrap" class:core-wrap--pulse={glowPulse}>
            <!-- Outer orbit ring -->
            <div class="outer-ring"></div>

            <!-- Naisser-style soft core objet -->
            <div class="core-objet">
              <!-- Ambient glow layer -->
              <div class="core-ambient"></div>
              <!-- Main sphere -->
              <div class="core-sphere">
                <!-- Inner light -->
                <div class="core-inner"></div>
                <!-- Scanline sweeping across -->
                <div class="core-scanline" style="top: {10 + scanlineY * 80}%"></div>
                <!-- Check icon -->
                <svg class="core-icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <!-- Rim highlight -->
              <div class="core-rim"></div>
            </div>
          </div>

          {#if phase === 'alive' && showStatus}
            <p class="status-text elem-fade-in"><span class="status-prompt">&gt;</span> {'\uC544\uC9C1 \uC810\uAC80 \uC804\uC785\uB2C8\uB2E4'}<span class="cursor-blink"></span></p>
          {/if}

          {#if phase === 'alive' && showCta}
            <button class="hero-cta elem-rise-in" onclick={() => goto(`${base}/diagnose`)}>{'\uB0B4 \uD504\uB85C\uC81D\uD2B8 \uC810\uAC80 \uBC1B\uAE30'}</button>
          {/if}
        </section>

        <!-- ===== SERVICE CARDS ===== -->
        <section class="cards">
          {#if phase === 'alive' && showCard0}
            <button class="card card--blue elem-rise-in" onclick={() => goto(`${base}/packages`)}>
              <div class="card-status-dot dot--green">
                <span class="dot-circle dot-circle--green"></span>
                <span class="dot-label">ONLINE</span>
              </div>
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
            <button class="card card--coral card--urgent elem-rise-in" onclick={() => goto(`${base}/incident`)}>
              <div class="card-status-dot dot--coral">
                <span class="dot-circle dot-circle--coral dot-circle--pulse"></span>
                <span class="dot-label">STANDBY</span>
              </div>
              <div class="card-body">
                <div class="card-icon card-icon--coral">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>
                  </svg>
                </div>
                <div class="card-text">
                  <span class="card-title">{'\uAE34\uAE09 \uC810\uAC80'}</span>
                  <span class="card-sub">{'24\uC2DC\uAC04 \uC774\uB0B4 \uB300\uC751'}</span>
                </div>
              </div>
              <span class="card-link card-link--coral">{'\uAE34\uAE09 \uC694\uCCAD'} &gt;</span>
            </button>
          {/if}

          {#if phase === 'alive' && showCard2}
            <button class="card card--green elem-rise-in" onclick={() => goto(`${base}/packages`)}>
              <div class="card-status-dot dot--blue">
                <span class="dot-circle dot-circle--blue"></span>
                <span class="dot-label">SCHEDULED</span>
              </div>
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

        <!-- ===== RECENT SCANS - TERMINAL LOG ===== -->
        {#if phase === 'alive' && showRecent}
          <section class="recent elem-fade-in">
            <h2 class="sec-head">{'\uCD5C\uADFC \uC810\uAC80'}</h2>
            <div class="terminal-log">
              <div class="log-line">
                <span class="log-ts">[2026.04.13 00:18]</span>
                <span class="log-status">SCAN COMPLETE</span>
              </div>
              <div class="log-tree">
                <span class="tree-char">{'\u2514\u2500'}</span>
                <a class="log-url" href="https://github.com/hangyeolalmighty/TeacherConnect" target="_blank" rel="noopener">https://github.com/hangyeolalmighty/TeacherConnect</a>
              </div>
              <div class="log-tree log-tree--sub">
                <span class="tree-char">{'\u251C\u2500'}</span>
                <span class="log-detail"><span class="badge badge--blue">6</span> issues detected</span>
              </div>
              <div class="log-tree log-tree--sub">
                <span class="tree-char">{'\u2514\u2500'}</span>
                <span class="log-detail"><span class="badge badge--coral">1</span> critical</span>
              </div>
            </div>

            {#if history.length > 0}
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
            {/if}
          </section>
        {/if}
      </main>
    </div>

    <!-- Statusbar -->
    <footer class="statusbar">
      <div class="statusbar-left">
        <span class="sb-dot sb-dot--pulse"></span>
        <span class="sb-text">STANDBY</span>
        <span class="sb-sep"> &middot; </span>
        <span class="sb-text">3 agents ready</span>
        <span class="sb-sep"> &middot; </span>
        <span class="sb-text">v0.1.2</span>
      </div>
      <div class="statusbar-right">
        <span class="sb-clock">{clock}</span>
      </div>
    </footer>

    <!-- Bottom nav -->
    <nav class="nav">
      <button class="nav-i nav-i--on" onclick={() => navTo('home')}>
        <span class="nav-indicator"></span>
        {'\uD648'}
      </button>
      <button class="nav-i" onclick={() => navTo('diagnose')}>{'\uC9C4\uB2E8'}</button>
      <button class="nav-i" onclick={() => navTo('report')}>{'\uB9AC\uD3EC\uD2B8'}</button>
      <button class="nav-i" onclick={() => navTo('packages')}>{'\uC694\uAE08\uC81C'}</button>
    </nav>
  </div>
</div>

<style>
  .os-shell {
    --bg-void: #05060A;
    --bg-abyss: #0A0E1A;
    --bg-deep: #0D1528;
    --border-dim: rgba(120, 160, 220, 0.08);
    --border-active: rgba(10, 132, 255, 0.45);
    --blue-core: #0A84FF;
    --blue-glow: #3BA0FF;
    --blue-deep: #0047B3;
    --cyan-scan: #5AC8FA;
    --coral-alert: #FF6B47;
    --coral-glow: rgba(255, 107, 71, 0.35);
    --text-primary: #EAF2FF;
    --text-secondary: rgba(234, 242, 255, 0.62);
    --text-tertiary: rgba(234, 242, 255, 0.38);
    --ease-organic: cubic-bezier(0.22, 1, 0.36, 1);
    --ease-pulse: cubic-bezier(0.4, 0, 0.2, 1);
    --mono: "JetBrains Mono", "SF Mono", monospace;
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;

    position: relative;
    min-height: 100dvh;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10, 132, 255, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0, 71, 179, 0.08) 0%, transparent 50%),
      var(--bg-void);
    color: var(--text-primary);
    font-family: var(--font);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* ===== BINARY RAIN CANVAS ===== */
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
    background: var(--bg-void);
    transition: opacity 0.5s var(--ease-organic);
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
    animation: splashShieldIn 0.5s var(--ease-organic) forwards;
    filter: drop-shadow(0 0 30px rgba(10,132,255,0.35));
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
    transition: opacity 0.4s var(--ease-organic), transform 0.4s var(--ease-organic);
  }
  .splash-label--in {
    opacity: 1;
    transform: translateY(0);
  }

  .splash-brand {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    color: var(--text-tertiary);
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.4s var(--ease-organic), transform 0.4s var(--ease-organic);
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
    transition: opacity 0.4s var(--ease-organic);
  }
  .app--visible {
    opacity: 1;
  }

  /* ===== MENUBAR (replaces .bar) ===== */
  .menubar {
    height: 32px;
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    background: rgba(5, 6, 10, 0.72);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border-bottom: 1px solid var(--border-dim);
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 0.4s var(--ease-organic), transform 0.4s var(--ease-organic);
  }
  .menubar--in {
    opacity: 1;
    transform: translateY(0);
  }

  .menubar-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .traffic-lights {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tl {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .tl--red { background: #FF5F57; }
  .tl--yellow { background: #FEBC2E; }
  .tl--green { background: #28C840; }

  .menubar-sep {
    display: inline-block;
    width: 1px;
    height: 14px;
    background: var(--border-dim);
    margin: 0 4px;
  }

  .menubar-word {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--text-primary);
  }
  .menubar-dot {
    font-size: 11px;
    color: var(--text-tertiary);
  }
  .menubar-sub {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .menubar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .menubar-kbd {
    font-family: var(--mono);
    font-size: 11px;
    padding: 3px 8px;
    border: 1px solid var(--border-dim);
    border-radius: 4px;
    color: var(--text-tertiary);
  }
  .menubar-btn {
    font-family: var(--font);
    font-size: 12px;
    font-weight: 500;
    color: var(--blue-core);
    background: none;
    border: 1px solid rgba(10,132,255,0.3);
    border-radius: 6px;
    padding: 2px 12px;
    height: 22px;
    cursor: pointer;
    transition: color 0.4s var(--ease-organic), border-color 0.4s var(--ease-organic), background 0.4s var(--ease-organic);
  }
  .menubar-btn:hover {
    color: var(--blue-glow);
    border-color: rgba(10,132,255,0.5);
    background: rgba(10,132,255,0.05);
  }

  /* ===== WORKSPACE ===== */
  .workspace {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  /* ===== DOCK ===== */
  .dock {
    width: 56px;
    flex-shrink: 0;
    background: rgba(5, 6, 10, 0.5);
    border-right: 1px solid var(--border-dim);
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .dock-item {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    position: relative;
    transition: all 0.3s var(--ease-organic);
    padding: 0;
  }
  .dock-item svg {
    width: 24px;
    height: 24px;
  }
  .dock-item:hover {
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
  }
  .dock-item--active {
    background: rgba(10, 132, 255, 0.12);
    color: var(--blue-glow);
  }
  .dock-item--active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 20px;
    background: var(--blue-core);
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px var(--blue-core);
  }

  .dock-tooltip {
    position: absolute;
    left: 56px;
    top: 50%;
    transform: translateY(-50%);
    padding: 4px 10px;
    background: var(--bg-deep);
    border: 1px solid var(--border-dim);
    border-radius: 6px;
    font-size: 12px;
    color: var(--text-primary);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }
  .dock-item:hover .dock-tooltip {
    opacity: 1;
  }

  .dock-spacer {
    flex: 1;
  }

  /* ===== CONTENT ===== */
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 48px 64px;
    max-width: clamp(560px, 61.8vw, 920px);
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* ===== STATUSBAR ===== */
  .statusbar {
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    background: rgba(5, 6, 10, 0.92);
    border-top: 1px solid var(--border-dim);
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-tertiary);
    flex-shrink: 0;
  }
  .statusbar-left {
    display: flex;
    align-items: center;
    gap: 0;
  }
  .statusbar-right {
    display: flex;
    align-items: center;
  }
  .sb-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--coral-alert);
    margin-right: 8px;
  }
  .sb-dot--pulse {
    animation: urgent-pulse 1.2s var(--ease-pulse) infinite;
  }
  .sb-text {
    color: var(--text-tertiary);
  }
  .sb-sep {
    color: var(--text-tertiary);
    margin: 0 2px;
  }
  .sb-clock {
    font-variant-numeric: tabular-nums;
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

  /* Shield wrapper */
  .core-wrap {
    position: relative;
    width: 220px;
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .core-wrap--pulse .core-sphere {
    animation: glowPulseAnim 0.6s var(--ease-pulse);
  }
  @keyframes glowPulseAnim {
    0% { box-shadow: 0 0 40px rgba(10,132,255,0.15); }
    50% { box-shadow: 0 0 80px rgba(10,132,255,0.4); }
    100% { box-shadow: 0 0 40px rgba(10,132,255,0.15); }
  }

  /* Naisser-style soft core objet */
  .core-objet {
    position: relative;
    z-index: 2;
    width: 120px;
    height: 120px;
  }

  /* Ambient glow behind sphere */
  .core-ambient {
    position: absolute;
    inset: -30px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(10,132,255,0.15) 0%, transparent 70%);
    animation: ambientPulse 3s var(--ease-pulse) infinite;
  }
  @keyframes ambientPulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }

  /* Main sphere */
  .core-sphere {
    width: 100%;
    height: 100%;
    border-radius: 28px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(155deg,
      #1a3a6e 0%,
      #0d2040 30%,
      #081830 60%,
      #0a2248 100%
    );
    box-shadow:
      0 4px 12px rgba(0,0,0,0.5),
      0 12px 32px rgba(0,0,0,0.35),
      0 24px 56px rgba(0,10,50,0.4),
      inset 0 1px 0 rgba(255,255,255,0.1),
      inset 0 -2px 4px rgba(0,0,0,0.3),
      0 0 60px rgba(10,132,255,0.12);
    transition: transform 0.5s var(--ease-organic), box-shadow 0.5s var(--ease-organic);
  }

  .core-objet:hover .core-sphere {
    transform: translateY(-4px) scale(1.03);
    box-shadow:
      0 8px 20px rgba(0,0,0,0.5),
      0 20px 48px rgba(0,0,0,0.4),
      0 32px 72px rgba(0,10,50,0.45),
      inset 0 1px 0 rgba(255,255,255,0.12),
      inset 0 -2px 4px rgba(0,0,0,0.3),
      0 0 100px rgba(10,132,255,0.22);
  }

  /* Glass top reflection */
  .core-sphere::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 45%;
    background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    border-radius: 28px 28px 50% 50%;
    pointer-events: none;
    z-index: 3;
  }

  /* Inner core light */
  .core-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50px;
    height: 50px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,160,255,0.5) 0%, rgba(10,132,255,0.15) 50%, transparent 70%);
    animation: corePulse 2.5s var(--ease-pulse) infinite;
  }

  /* Scanline */
  .core-scanline {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, var(--cyan-scan) 30%, var(--cyan-scan) 70%, transparent 100%);
    opacity: 0.4;
    filter: blur(1px);
    z-index: 4;
    pointer-events: none;
  }

  /* Check icon */
  .core-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    z-index: 5;
    filter: drop-shadow(0 0 8px rgba(255,255,255,0.3));
  }

  /* Rim highlight */
  .core-rim {
    position: absolute;
    inset: -1px;
    border-radius: 29px;
    border: 1px solid rgba(90,170,255,0.15);
    pointer-events: none;
    z-index: 6;
  }
  .core-objet:hover .core-rim {
    border-color: rgba(90,170,255,0.3);
  }

  /* Core pulse */
  .core-pulse {
    animation: corePulse 2.5s var(--ease-pulse) infinite;
    transform-origin: 32px 40px;
  }
  @keyframes corePulse {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.15); opacity: 1; }
  }

  /* Outer dashed ring */
  .outer-ring {
    position: absolute;
    width: 200px;
    height: 200px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1px dashed rgba(10,132,255,0.15);
    animation: ringRotate 20s linear infinite;
    pointer-events: none;
  }
  @keyframes ringRotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  /* Halo synced with core pulse — on sphere */
  .core-sphere {
    animation: haloSync 2.5s var(--ease-pulse) infinite;
  }
  @keyframes haloSync {
    0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.35), 0 24px 56px rgba(0,10,50,0.4), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3), 0 0 50px rgba(10,132,255,0.1); }
    50% { box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.35), 0 24px 56px rgba(0,10,50,0.4), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3), 0 0 90px rgba(10,132,255,0.22); }
  }

  /* Status text with terminal style */
  .status-text {
    font-size: 16px;
    font-weight: 400;
    font-family: var(--mono);
    color: var(--text-secondary);
    text-align: center;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0;
  }
  .status-prompt {
    color: var(--blue-core);
    margin-right: 8px;
  }
  .cursor-blink {
    display: inline-block;
    width: 8px;
    height: 16px;
    background: var(--blue-core);
    margin-left: 4px;
    animation: cursorBlink 1s step-end infinite;
  }
  @keyframes cursorBlink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  /* CTA Button - pill */
  .hero-cta {
    padding: 13px 40px;
    border-radius: 980px;
    border: none;
    background: var(--blue-core);
    color: #fff;
    font-family: var(--font);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.4s var(--ease-organic), transform 0.4s var(--ease-organic), box-shadow 0.4s var(--ease-organic);
    box-shadow: 0 0 30px rgba(10,132,255,0.2);
  }
  .hero-cta:hover {
    background: var(--blue-glow);
    transform: translateY(-1px);
    box-shadow: 0 0 50px rgba(10,132,255,0.35);
  }

  /* Element animations */
  .elem-fade-in {
    animation: elemFadeIn 0.4s var(--ease-organic) forwards;
  }
  .elem-rise-in {
    animation: elemRiseIn 0.5s var(--ease-organic) forwards;
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
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: linear-gradient(165deg, #0D1528 0%, #0A0E1A 100%);
    border: 1px solid var(--border-dim);
    border-radius: 14px;
    padding: 24px;
    cursor: pointer;
    text-align: left;
    color: var(--text-primary);
    font-family: var(--font);
    width: 100%;
    overflow: hidden;
    transition: transform 0.4s var(--ease-organic), border-color 0.4s var(--ease-organic), background 0.4s var(--ease-organic), box-shadow 0.4s var(--ease-organic);
  }

  /* Left light bar (::before) */
  .card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
    transform: scaleY(0);
    transform-origin: center;
    transition: transform 0.4s var(--ease-organic), box-shadow 0.4s var(--ease-organic);
  }
  .card--blue::before {
    background: var(--blue-core);
    box-shadow: 0 0 12px rgba(10, 132, 255, 0.4);
  }
  .card--coral::before {
    background: var(--coral-alert);
    box-shadow: 0 0 12px var(--coral-glow);
  }
  .card--green::before {
    background: #32d74b;
    box-shadow: 0 0 12px rgba(50, 215, 75, 0.4);
  }
  .card:hover::before {
    transform: scaleY(1);
  }

  /* Card binary pattern overlay (::after) */
  .card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 17px,
      rgba(58, 160, 255, 0.02) 17px,
      rgba(58, 160, 255, 0.02) 18px
    );
    opacity: 0.3;
    transition: opacity 0.5s var(--ease-organic);
    border-radius: inherit;
    pointer-events: none;
  }
  .card:hover::after {
    opacity: 0.8;
  }

  /* Card hover */
  .card:hover {
    transform: translateY(-4px);
    border-color: var(--border-active);
    background: linear-gradient(165deg, #112041 0%, #0A0E1A 100%);
    box-shadow:
      0 12px 40px rgba(0, 71, 179, 0.25),
      0 0 0 1px rgba(10, 132, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  /* Icon hover */
  .card:hover .card-icon--blue {
    filter: drop-shadow(0 0 12px var(--blue-glow));
    transform: scale(1.08);
  }
  .card:hover .card-icon--coral {
    filter: drop-shadow(0 0 12px var(--coral-alert));
    transform: scale(1.08);
  }
  .card:hover .card-icon--green {
    filter: drop-shadow(0 0 12px #32d74b);
    transform: scale(1.08);
  }

  /* Urgent card (coral) special */
  .card--urgent {
    background: linear-gradient(165deg, #1F1410 0%, #0A0E1A 100%);
  }
  .card--urgent:hover {
    background: linear-gradient(165deg, #2A1A14 0%, #0A0E1A 100%);
    box-shadow:
      0 12px 40px rgba(255, 107, 71, 0.15),
      0 0 0 1px rgba(255, 107, 71, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  /* Status dots */
  .card-status-dot {
    position: absolute;
    top: 12px;
    right: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    z-index: 1;
  }
  .dot-circle {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .dot-circle--green {
    background: #32d74b;
  }
  .dot-circle--coral {
    background: var(--coral-alert);
  }
  .dot-circle--blue {
    background: var(--blue-core);
  }
  .dot-circle--pulse {
    animation: urgent-pulse 1.2s var(--ease-pulse) infinite;
  }
  .dot-label {
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.08em;
    color: var(--text-tertiary);
  }

  @keyframes urgent-pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 107, 71, 0.6); }
    70% { box-shadow: 0 0 0 10px rgba(255, 107, 71, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 107, 71, 0); }
  }

  .card-body {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 1;
  }

  .card-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: filter 0.4s var(--ease-organic), transform 0.4s var(--ease-organic);
  }
  .card-icon svg {
    width: 100%;
    height: 100%;
  }
  .card-icon--blue { color: var(--blue-core); }
  .card-icon--coral { color: var(--coral-alert); }
  .card-icon--green { color: #32d74b; }

  .card-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    z-index: 1;
  }
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
  .card-sub {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .card-link {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;
    position: relative;
    z-index: 1;
  }
  .card-link--blue { color: var(--blue-core); }
  .card-link--coral { color: var(--coral-alert); }
  .card-link--green { color: #32d74b; }

  /* ===== RECENT - TERMINAL LOG ===== */
  .recent {
    display: flex;
    flex-direction: column;
  }
  .sec-head {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin: 0 0 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-dim);
  }

  .terminal-log {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--text-secondary);
    padding: 16px;
    background: rgba(10, 14, 26, 0.6);
    border: 1px solid var(--border-dim);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }
  .log-line {
    display: flex;
    gap: 10px;
  }
  .log-ts {
    color: var(--text-tertiary);
  }
  .log-status {
    color: var(--blue-core);
    font-weight: 500;
  }
  .log-tree {
    display: flex;
    gap: 6px;
    padding-left: 4px;
  }
  .log-tree--sub {
    padding-left: 28px;
  }
  .tree-char {
    color: var(--text-tertiary);
  }
  .log-url {
    color: var(--text-secondary);
    text-decoration: none;
    position: relative;
    transition: color 0.4s var(--ease-organic);
  }
  .log-url::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--blue-core);
    transition: width 0.4s var(--ease-organic);
  }
  .log-url:hover {
    color: var(--blue-glow);
  }
  .log-url:hover::after {
    width: 100%;
  }
  .log-detail {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .badge {
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 4px;
  }
  .badge--blue {
    color: var(--blue-core);
    background: rgba(10, 132, 255, 0.12);
  }
  .badge--coral {
    color: var(--coral-alert);
    background: rgba(255, 107, 71, 0.12);
  }

  .scan-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-dim);
    background: none;
    width: 100%;
    font-family: var(--font);
    cursor: pointer;
    text-align: left;
    color: var(--text-primary);
    border-left: none;
    border-right: none;
    border-top: none;
    transition: background 0.4s var(--ease-organic);
  }
  .scan-row:hover {
    background: rgba(13, 21, 40, 0.5);
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
    color: var(--text-tertiary);
  }
  .scan-tags {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  .tag {
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 3px;
    border: 1px solid var(--border-dim);
    background: var(--bg-deep);
  }
  .tag--c { color: var(--coral-alert); }
  .tag--w { color: #ff9500; }
  .tag--o { color: #32d74b; }

  /* ===== BOTTOM NAV ===== */
  .nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    display: flex;
    background: rgba(5, 6, 10, 0.85);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-top: 1px solid var(--border-dim);
  }
  .nav-i {
    flex: 1;
    padding: 12px 0;
    background: none;
    border: none;
    font-family: var(--font);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: color 0.4s var(--ease-organic);
    position: relative;
  }
  .nav-i:hover {
    color: var(--text-secondary);
  }
  .nav-i--on {
    color: var(--blue-core);
  }
  .nav-indicator {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 2px;
    background: var(--blue-core);
    border-radius: 0 0 2px 2px;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 768px) {
    .dock { display: none; }
    .menubar-dot, .menubar-sub { display: none; }
    .hero {
      min-height: 300px;
      padding-top: 24px;
    }
    .core-objet {
      width: 100px;
      height: 100px;
    }
    .core-wrap {
      width: 180px;
      height: 180px;
    }
    .outer-ring {
      width: 170px;
      height: 170px;
    }
    .status-text { font-size: 14px; }
    .content { padding: 32px 16px 100px; }
  }

  @media (min-width: 1200px) {
    .content { padding: 64px 96px; }
  }

  /* ===== REDUCED MOTION ===== */
  @media (prefers-reduced-motion: reduce) {
    .splash, .splash-shield, .splash-label, .splash-brand,
    .app, .menubar, .elem-fade-in, .elem-rise-in,
    .core-wrap--pulse .core-sphere,
    .outer-ring,
    .core-inner,
    .core-ambient,
    .core-sphere,
    .card,
    .dot-circle--pulse,
    .cursor-blink,
    .sb-dot--pulse,
    .dock-item,
    .dock-tooltip {
      animation: none !important;
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .outer-ring {
      transform: translate(-50%, -50%) !important;
    }
  }
</style>
