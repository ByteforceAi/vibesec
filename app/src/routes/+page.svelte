<script lang="ts">
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

  // --- Reduced motion ---
  let reducedMotion = $state(false);

  // --- Revisit mode ---
  let revisitMode = $state<'first'|'recent'>('first');

  // --- Glow pulse for revisit ---
  let glowPulse = $state(false);

  // --- Clock for statusbar ---
  let clock = $state('');

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

<svelte:head>
  <title>Byteforce Security -- 바이브코딩 보안 점검</title>
  <meta name="description" content="AI 코딩 도구로 만든 서비스의 보안을 사람 엔지니어가 직접 점검합니다. Cursor, Claude Code, v0 전문." />
  <meta property="og:title" content="Byteforce Security -- 바이브코딩 보안 점검" />
  <meta property="og:description" content="AI 코딩 도구로 만든 서비스의 보안을 사람 엔지니어가 직접 점검합니다. Cursor, Claude Code, v0 전문." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://byteforceai.github.io/vibesec/" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Byteforce Security -- 바이브코딩 보안 점검" />
  <meta name="twitter:description" content="AI 코딩 도구로 만든 서비스의 보안을 사람 엔지니어가 직접 점검합니다. Cursor, Claude Code, v0 전문." />
</svelte:head>

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
        <button class="menubar-btn" onclick={() => goto(`${base}/contact`)}>{'\uC0C1\uB2F4 \uC608\uC57D'}</button>
      </div>
    </header>

    <!-- Workspace -->
    <div class="workspace">
      <!-- Side Dock -->
      <aside class="dock">
        <button class="dock-item dock-item--active" onclick={() => goto(`${base}/`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span class="dock-tooltip">{'\uD648'}</span>
        </button>
        <button class="dock-item" onclick={() => goto(`${base}/check`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <span class="dock-tooltip">{'\uC790\uAC00\uC9C4\uB2E8'}</span>
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
        <button class="dock-item" onclick={() => goto(`${base}/contact`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>
          </svg>
          <span class="dock-tooltip">{'\uC0C1\uB2F4\uC608\uC57D'}</span>
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
            <button class="hero-cta elem-rise-in" onclick={() => goto(`${base}/contact`)}>{'\uB0B4 \uD504\uB85C\uC81D\uD2B8 \uC810\uAC80 \uBC1B\uAE30'}</button>
          {/if}
        </section>

        <!-- ===== SERVICE CARDS ===== -->
        <section class="cards">
          {#if phase === 'alive' && showCard0}
            <button class="service-card service-card--blue elem-rise-in" onclick={() => goto(`${base}/contact`)}>
              <div class="card-glow card-glow--blue"></div>
              <div class="card-top">
                <div class="card-objet card-objet--blue">
                  <svg viewBox="0 0 64 76" fill="none" width="28" height="28">
                    <path d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M26 38l6 6 12-14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-dot status-dot--green"></span>
                  <span class="status-label">ONLINE</span>
                </div>
              </div>
              <div class="card-info">
                <h3 class="card-title">{'1:1 \uB300\uBA74 \uC810\uAC80'}</h3>
                <p class="card-desc">{'\uB9C8\uACE1 \uBC29\uBB38 \uB610\uB294 \uD654\uC0C1. \uD575\uC2EC \uD56D\uBAA9 \uC704\uC8FC \uBCF4\uC548 \uC810\uAC80.'}</p>
              </div>
              <div class="card-bottom">
                <span class="card-price">{'\u20A9390,000'}</span>
                <span class="card-cta">{'\uC608\uC57D\uD558\uAE30 \u2192'}</span>
              </div>
            </button>
          {/if}

          {#if phase === 'alive' && showCard1}
            <button class="service-card service-card--coral service-card--urgent elem-rise-in" onclick={() => goto(`${base}/contact`)}>
              <div class="card-glow card-glow--coral"></div>
              <div class="card-top">
                <div class="card-objet card-objet--coral">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
                    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-dot status-dot--coral status-dot--pulse"></span>
                  <span class="status-label">STANDBY</span>
                </div>
              </div>
              <div class="card-info">
                <h3 class="card-title">{'\uAE34\uAE09 \uC810\uAC80'}</h3>
                <p class="card-desc">{'24\uC2DC\uAC04 \uC774\uB0B4 \uB300\uC751. \uC9C0\uAE08 \uBB38\uC81C\uAC00 \uC0DD\uACBC\uB2E4\uBA74 \uBC14\uB85C \uC5F0\uB77D\uD558\uC138\uC694.'}</p>
              </div>
              <div class="card-bottom">
                <span class="card-price">{'\u20A9790,000'}</span>
                <span class="card-cta">{'\uAE34\uAE09 \uC694\uCCAD \u2192'}</span>
              </div>
            </button>
          {/if}

          {#if phase === 'alive' && showCard2}
            <button class="service-card service-card--green elem-rise-in" onclick={() => goto(`${base}/packages`)}>
              <div class="card-glow card-glow--green"></div>
              <div class="card-top">
                <div class="card-objet card-objet--green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <rect x="8" y="14" width="3" height="3" rx="0.5"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-dot status-dot--blue"></span>
                  <span class="status-label">SCHEDULED</span>
                </div>
              </div>
              <div class="card-info">
                <h3 class="card-title">{'\uC6D4 \uAD00\uB9AC'}</h3>
                <p class="card-desc">{'\uC815\uAE30 \uC810\uAC80 + \uBAA8\uB2C8\uD130\uB9C1. \uBB38\uC81C\uAC00 \uC0DD\uAE30\uAE30 \uC804\uC5D0 \uBBF8\uB9AC \uBC29\uC9C0.'}</p>
              </div>
              <div class="card-bottom">
                <span class="card-price">{'\uC6D4 \u20A9190,000'}</span>
                <span class="card-cta">{'\uC790\uC138\uD788 \uBCF4\uAE30 \u2192'}</span>
              </div>
            </button>
          {/if}
        </section>

        <!-- ===== REPORT PREVIEW ===== -->
        {#if phase === 'alive' && showRecent}
          <section class="report-preview elem-fade-in">
            <h2 class="section-label">{'\uBCF4\uACE0\uC11C \uBBF8\uB9AC\uBCF4\uAE30'}</h2>

            <div class="report-card">
              <div class="report-header">
                <div class="report-brand">
                  <span class="report-logo">BYTEFORCE</span>
                  <span class="report-type">{'\uBCF4\uC548 \uC810\uAC80 \uBCF4\uACE0\uC11C'}</span>
                </div>
                <div class="report-meta">
                  <span>{'\uD504\uB85C\uC81D\uD2B8: \uC1FC\uD551\uBAB0 MVP (\uC0D8\uD50C)'}</span>
                  <span>{'\uC810\uAC80\uC77C: 2026.03.15'}</span>
                  <span>{'\uC810\uAC80\uC790: \uAE40\uBCF4\uC548 \uC2DC\uB2C8\uC5B4 \uC5D4\uC9C0\uB2C8\uC5B4'}</span>
                </div>
              </div>

              <div class="report-summary">
                {'\uCD1D 5\uAC74\uC758 \uD655\uC778 \uC0AC\uD56D. \uC774 \uC911 1\uAC74\uC740 \uC989\uC2DC \uC870\uCE58\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.'}
              </div>

              <div class="report-badges">
                <div class="badge badge--critical">
                  <span class="badge-num">1</span>
                  <span class="badge-label">{'\uAE34\uAE09'}</span>
                </div>
                <div class="badge badge--warning">
                  <span class="badge-num">2</span>
                  <span class="badge-label">{'\uC8FC\uC758'}</span>
                </div>
                <div class="badge badge--ok">
                  <span class="badge-num">2</span>
                  <span class="badge-label">{'\uC548\uC804'}</span>
                </div>
              </div>

              <div class="report-finding">
                <span class="finding-severity finding-severity--critical">{'\uAE34\uAE09'}</span>
                <div class="finding-body">
                  <h4 class="finding-title">{'\uBE44\uBC00\uBC88\uD638\uAC00 \uBB38 \uC55E\uC5D0 \uB193\uC5EC \uC788\uC5B4\uC694'}</h4>
                  <p class="finding-desc">{'.env \uD30C\uC77C\uC774 GitHub\uC5D0 \uC62C\uB77C\uAC00 \uC788\uC2B5\uB2C8\uB2E4. OpenAI API \uD0A4\uAC00 \uB204\uAD6C\uB098 \uBCFC \uC218 \uC788\uB294 \uC0C1\uD0DC\uC785\uB2C8\uB2E4.'}</p>
                </div>
              </div>

              <div class="report-fade"></div>

              <div class="report-cta">
                <button class="report-btn report-btn--outline" onclick={() => goto(`${base}/sample`)}>{'\uC804\uCCB4 \uBCF4\uACE0\uC11C \uBCF4\uAE30 \u2192'}</button>
                <button class="report-btn report-btn--fill" onclick={() => goto(`${base}/contact`)}>{'\uB0B4 \uD504\uB85C\uC81D\uD2B8\uB3C4 \uC810\uAC80 \uBC1B\uAE30'}</button>
              </div>
            </div>
          </section>
        {/if}
      </main>
    </div>

    <!-- Statusbar -->
    <footer class="statusbar">
      <div class="statusbar-left">
        <span class="sb-dot sb-dot--pulse"></span>
        <span class="sb-text">ONLINE</span>
        <span class="sb-sep"> &middot; </span>
        <span class="sb-text">BYTEFORCE SECURITY</span>
      </div>
      <div class="statusbar-right">
        <span class="sb-clock">{clock}</span>
      </div>
    </footer>

    <!-- Bottom nav -->
    <nav class="nav">
      <button class="nav-i nav-i--on" onclick={() => goto(`${base}/`)}>
        <span class="nav-indicator"></span>
        {'\uD648'}
      </button>
      <button class="nav-i" onclick={() => goto(`${base}/check`)}>{'\uC790\uAC00\uC9C4\uB2E8'}</button>
      <button class="nav-i" onclick={() => goto(`${base}/packages`)}>{'\uC694\uAE08\uC81C'}</button>
      <button class="nav-i" onclick={() => goto(`${base}/contact`)}>{'\uC0C1\uB2F4\uC608\uC57D'}</button>
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

  /* ===== SERVICE CARDS (vybe style) ===== */
  .cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .service-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 28px;
    border-radius: 20px;
    border: 1px solid rgba(10, 132, 255, 0.12);
    background: linear-gradient(165deg, rgba(13, 21, 40, 0.8) 0%, rgba(10, 14, 26, 0.9) 100%);
    backdrop-filter: blur(8px);
    overflow: hidden;
    cursor: pointer;
    text-align: left;
    color: var(--text-primary);
    font-family: var(--font);
    width: 100%;
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Glowing border on hover */
  .service-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(10,132,255,0.2) 0%, transparent 50%, rgba(10,132,255,0.1) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s;
  }
  .service-card--blue:hover::after {
    opacity: 1;
  }
  .service-card--coral::after {
    background: linear-gradient(135deg, rgba(255,107,71,0.2) 0%, transparent 50%, rgba(255,107,71,0.1) 100%);
  }
  .service-card--coral:hover::after {
    opacity: 1;
  }
  .service-card--green::after {
    background: linear-gradient(135deg, rgba(50,215,75,0.2) 0%, transparent 50%, rgba(50,215,75,0.1) 100%);
  }
  .service-card--green:hover::after {
    opacity: 1;
  }

  /* Hover: card lifts */
  .service-card:hover {
    transform: translateY(-6px) scale(1.01);
    border-color: rgba(10, 132, 255, 0.3);
    box-shadow:
      0 0 40px rgba(10, 132, 255, 0.1),
      0 20px 60px rgba(0, 20, 60, 0.3);
  }

  /* Urgent (coral) card */
  .service-card--urgent {
    background: linear-gradient(165deg, rgba(30, 18, 14, 0.8) 0%, rgba(10, 14, 26, 0.9) 100%);
    border-color: rgba(255, 107, 71, 0.12);
  }
  .service-card--urgent:hover {
    border-color: rgba(255, 107, 71, 0.3);
    box-shadow:
      0 0 40px rgba(255, 107, 71, 0.1),
      0 20px 60px rgba(60, 15, 0, 0.3);
  }

  /* Green card */
  .service-card--green {
    border-color: rgba(50, 215, 75, 0.1);
  }
  .service-card--green:hover {
    border-color: rgba(50, 215, 75, 0.3);
    box-shadow:
      0 0 40px rgba(50, 215, 75, 0.08),
      0 20px 60px rgba(0, 40, 20, 0.3);
  }

  /* Background glow layer */
  .card-glow {
    position: absolute;
    top: -50%;
    right: -30%;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    pointer-events: none;
    transition: opacity 0.5s;
    opacity: 0.5;
  }
  .card-glow--blue {
    background: radial-gradient(circle, rgba(10,132,255,0.08) 0%, transparent 70%);
  }
  .card-glow--coral {
    background: radial-gradient(circle, rgba(255,107,71,0.08) 0%, transparent 70%);
  }
  .card-glow--green {
    background: radial-gradient(circle, rgba(50,215,75,0.06) 0%, transparent 70%);
  }
  .service-card:hover .card-glow {
    opacity: 1;
  }

  /* Card top row: objet + status */
  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;
  }

  /* Objet icon (56px) */
  .card-objet {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: transform 0.4s var(--ease-organic), box-shadow 0.4s var(--ease-organic);
  }
  .card-objet::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 40%;
    background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
    border-radius: 16px 16px 50% 50%;
    pointer-events: none;
  }
  .card-objet svg {
    position: relative;
    z-index: 1;
  }
  .card-objet--blue {
    color: #fff;
    background: linear-gradient(155deg, #1a5aaa 0%, #0a3d7a 100%);
    box-shadow: 0 4px 12px rgba(10,132,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .card-objet--coral {
    color: #fff;
    background: linear-gradient(155deg, #a83a20 0%, #6e2010 100%);
    box-shadow: 0 4px 12px rgba(255,107,71,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .card-objet--green {
    color: #fff;
    background: linear-gradient(155deg, #1a8a3a 0%, #0a5a22 100%);
    box-shadow: 0 4px 12px rgba(50,215,75,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .service-card:hover .card-objet {
    transform: scale(1.06);
  }
  .service-card:hover .card-objet--blue {
    box-shadow: 0 4px 12px rgba(10,132,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 24px rgba(10,132,255,0.3);
  }
  .service-card:hover .card-objet--coral {
    box-shadow: 0 4px 12px rgba(255,107,71,0.25), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 24px rgba(255,107,71,0.3);
  }
  .service-card:hover .card-objet--green {
    box-shadow: 0 4px 12px rgba(50,215,75,0.25), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 24px rgba(50,215,75,0.3);
  }

  /* Status indicator */
  .card-status {
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
    z-index: 1;
  }
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .status-dot--green { background: #32d74b; }
  .status-dot--coral { background: var(--coral-alert); }
  .status-dot--blue { background: var(--blue-core); }
  .status-dot--pulse {
    animation: urgent-pulse 1.2s var(--ease-pulse) infinite;
  }
  .status-label {
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

  /* Card info (title + desc) */
  .card-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: relative;
    z-index: 1;
  }
  .card-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
  .card-desc {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
    margin: 0;
  }

  /* Card bottom (price + CTA) */
  .card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;
  }
  .card-price {
    font-family: var(--mono);
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }
  .card-cta {
    font-size: 13px;
    font-weight: 500;
    color: var(--blue-core);
    transition: transform 0.3s;
  }
  .service-card--coral .card-cta { color: var(--coral-alert); }
  .service-card--green .card-cta { color: #32d74b; }
  .service-card:hover .card-cta {
    transform: translateX(4px);
  }

  /* ===== REPORT PREVIEW ===== */
  .report-preview {
    display: flex;
    flex-direction: column;
  }
  .section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin: 0 0 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-dim);
  }

  .report-card {
    background: linear-gradient(180deg, #0a0e1a 0%, #080c16 100%);
    border: 1px solid rgba(10,132,255,0.1);
    border-radius: 16px;
    padding: 32px;
    position: relative;
    overflow: hidden;
  }

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(120,160,220,0.06);
    margin-bottom: 20px;
  }
  .report-brand {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .report-logo {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: var(--blue-core);
  }
  .report-type {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }
  .report-meta {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-tertiary);
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: right;
  }

  .report-summary {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 20px;
    line-height: 1.5;
  }

  /* Badges */
  .report-badges {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }
  .badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid;
    background: transparent;
  }
  .badge--critical { border-color: rgba(255,69,58,0.2); background: rgba(255,69,58,0.06); }
  .badge--warning { border-color: rgba(255,159,10,0.2); background: rgba(255,159,10,0.06); }
  .badge--ok { border-color: rgba(50,215,75,0.2); background: rgba(50,215,75,0.06); }
  .badge-num {
    font-family: var(--mono);
    font-size: 20px;
    font-weight: 600;
  }
  .badge--critical .badge-num { color: #FF453A; }
  .badge--warning .badge-num { color: #FF9F0A; }
  .badge--ok .badge-num { color: #32d74b; }
  .badge-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  /* Finding item */
  .report-finding {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: rgba(255,69,58,0.04);
    border-left: 3px solid #FF453A;
    border-radius: 0 8px 8px 0;
  }
  .finding-severity {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 2px 8px;
    border-radius: 4px;
    align-self: flex-start;
    flex-shrink: 0;
  }
  .finding-severity--critical {
    background: rgba(255,69,58,0.15);
    color: #FF453A;
  }
  .finding-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .finding-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
  .finding-desc {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
    margin: 0;
  }

  /* Fade out (report cutoff effect) */
  .report-fade {
    height: 60px;
    background: linear-gradient(180deg, transparent 0%, #080c16 100%);
    margin: -20px -32px 0;
    padding: 0 32px;
  }

  /* Report CTA */
  .report-cta {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }
  .report-btn {
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s var(--ease-organic);
  }
  .report-btn--outline {
    border: 1px solid rgba(10,132,255,0.3);
    background: transparent;
    color: var(--blue-core);
  }
  .report-btn--outline:hover {
    border-color: rgba(10,132,255,0.5);
    background: rgba(10,132,255,0.06);
  }
  .report-btn--fill {
    border: none;
    background: var(--blue-core);
    color: #fff;
  }
  .report-btn--fill:hover {
    background: var(--blue-glow);
    box-shadow: 0 0 20px rgba(10,132,255,0.3);
  }

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
    .service-card { padding: 22px; gap: 16px; }
    .card-objet { width: 48px; height: 48px; border-radius: 14px; }
    .card-price { font-size: 16px; }
    .report-card { padding: 20px; }
    .report-header { flex-direction: column; gap: 12px; }
    .report-meta { text-align: left; }
    .report-badges { flex-wrap: wrap; }
    .report-cta { flex-direction: column; }
    .report-cta button { width: 100%; }
    .report-fade { margin: -20px -20px 0; padding: 0 20px; }
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
    .service-card,
    .status-dot--pulse,
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
