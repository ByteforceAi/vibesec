<script lang="ts">
  import { scanHistory } from '$lib/stores/scan';
  import type { ScanResult } from '$lib/stores/scan';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  // --- Phase machine ---
  // ember -> drawing -> drawn -> glow -> text -> hold -> morph -> appbar -> skeleton -> crossfade -> alive
  let phase = $state<
    'black'|'ember'|'ember-pulse'|'drawing'|'drawn'|'glow'|'text'|'hold'|
    'morph'|'appbar'|'skeleton'|'crossfade'|'alive'
  >('black');

  // --- Hero typing ---
  const heroLines = ['AI\uAC00 \uC9C0\uC740 \uC9D1,', '\uBCBD\uC740 \uC81C\uAC00 \uB450\uB4DC\uB824\uBCFC\uAC8C\uC694.'];
  let typedChars = $state(0);
  const totalChars = heroLines.join('').length;
  let typingLine = $state(0);
  let typingDone = $state(false);

  // --- Sub-element visibility ---
  let showSubtext = $state(false);
  let showTools = $state(false);
  let showCta = $state(false);
  let showStat0 = $state(false);
  let showStat1 = $state(false);
  let showStat2 = $state(false);
  let showRecent = $state(false);

  // --- Skeleton stagger ---
  let skelTitle = $state(false);
  let skelText = $state(false);
  let skelBtn = $state(false);

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
  let revisitMode = $state<'first'|'recent'|'returning'>('first');

  $effect(() => {
    const unsub = scanHistory.subscribe((h) => { history = h; });
    return unsub;
  });

  $effect(() => {
    if (typeof window !== 'undefined') {
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Check revisit
      const lastVisit = localStorage.getItem('byteforce_lastVisit');
      if (lastVisit) {
        const elapsed = Date.now() - parseInt(lastVisit, 10);
        const h24 = 24 * 60 * 60 * 1000;
        if (elapsed < h24) {
          revisitMode = 'recent';
        } else {
          revisitMode = 'returning';
        }
      }
      localStorage.setItem('byteforce_lastVisit', String(Date.now()));
    }

    if (reducedMotion) {
      phase = 'alive';
      typedChars = totalChars;
      typingDone = true;
      typingLine = 1;
      canvasOpacity = 0.5;
      showSubtext = true;
      showTools = true;
      showCta = true;
      showStat0 = true;
      showStat1 = true;
      showStat2 = true;
      showRecent = true;
      skelTitle = true;
      skelText = true;
      skelBtn = true;
      return;
    }

    if (revisitMode === 'recent') {
      startRecentSequence();
    } else if (revisitMode === 'returning') {
      startReturningSequence();
    } else {
      startFullSequence();
    }
  });

  // --- Full first-visit sequence (~8s total) ---
  function startFullSequence() {
    // 1st beat: Ember
    setTimeout(() => { phase = 'ember'; }, 300);
    setTimeout(() => { phase = 'ember-pulse'; }, 800);

    // 2nd beat: Symbol drawing
    setTimeout(() => {
      phase = 'drawing';
      animateDrawProgress(800);
    }, 1500);

    // Drawn + glow
    setTimeout(() => { phase = 'drawn'; }, 2300);
    setTimeout(() => { phase = 'glow'; }, 2500);

    // Text: "Two-deu-ryeo-bwat-seumnida"
    setTimeout(() => { phase = 'text'; }, 2800);

    // BYTEFORCE SECURITY sub
    setTimeout(() => { phase = 'hold'; }, 3200);

    // 3rd beat: Morph to appbar
    setTimeout(() => {
      phase = 'morph';
      animateCanvasOpacity();
    }, 3500);

    // Appbar appears
    setTimeout(() => { phase = 'appbar'; }, 4300);

    // Skeleton
    setTimeout(() => {
      phase = 'skeleton';
      skelTitle = true;
    }, 4600);
    setTimeout(() => { skelText = true; }, 4750);
    setTimeout(() => { skelBtn = true; }, 4900);

    // Crossfade
    setTimeout(() => { phase = 'crossfade'; }, 5500);

    // Alive + typing
    setTimeout(() => {
      phase = 'alive';
      startTypingLine1();
    }, 5800);
  }

  // Recent revisit: symbol only 0.5s then home
  function startRecentSequence() {
    setTimeout(() => { phase = 'drawn'; }, 100);
    setTimeout(() => {
      phase = 'morph';
      animateCanvasOpacity();
    }, 500);
    setTimeout(() => { phase = 'appbar'; }, 800);
    setTimeout(() => {
      phase = 'alive';
      typedChars = totalChars;
      typingDone = true;
      typingLine = 1;
      showSubtext = true;
      showTools = true;
      showCta = true;
      showStat0 = true;
      showStat1 = true;
      showStat2 = true;
      showRecent = true;
    }, 1000);
  }

  // Returning: skip 1st beat, start from drawing
  function startReturningSequence() {
    setTimeout(() => {
      phase = 'drawing';
      animateDrawProgress(600);
    }, 200);
    setTimeout(() => { phase = 'drawn'; }, 800);
    setTimeout(() => { phase = 'glow'; }, 1000);
    setTimeout(() => { phase = 'text'; }, 1200);
    setTimeout(() => {
      phase = 'morph';
      animateCanvasOpacity();
    }, 1800);
    setTimeout(() => { phase = 'appbar'; }, 2400);
    setTimeout(() => {
      phase = 'skeleton';
      skelTitle = true;
    }, 2600);
    setTimeout(() => { skelText = true; }, 2700);
    setTimeout(() => { skelBtn = true; }, 2800);
    setTimeout(() => { phase = 'crossfade'; }, 3200);
    setTimeout(() => {
      phase = 'alive';
      startTypingLine1();
    }, 3500);
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

  function startTypingLine1() {
    const line1 = heroLines[0];
    let c = 0;
    const timer = setInterval(() => {
      c++;
      typedChars = c;
      if (c >= line1.length) {
        clearInterval(timer);
        typingLine = 0;
        setTimeout(() => {
          typingLine = 1;
          startTypingLine2();
        }, 400);
      }
    }, 60);
  }

  function startTypingLine2() {
    const line1len = heroLines[0].length;
    const line2 = heroLines[1];
    let c = 0;
    const timer = setInterval(() => {
      c++;
      typedChars = line1len + c;
      if (c >= line2.length) {
        clearInterval(timer);
        typingDone = true;
        setTimeout(() => { showSubtext = true; }, 100);
        setTimeout(() => { showTools = true; }, 300);
        setTimeout(() => { showCta = true; }, 800);
        setTimeout(() => { showStat0 = true; }, 1200);
        setTimeout(() => { showStat1 = true; }, 1300);
        setTimeout(() => { showStat2 = true; }, 1400);
        setTimeout(() => { showRecent = true; }, 1600);
      }
    }, 60);
  }

  function animateCanvasOpacity() {
    const start = performance.now();
    const duration = 1000;
    function tick() {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      canvasOpacity = t * 0.5;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function getTyped(): { l1: string; l2: string } {
    const a = heroLines[0];
    const b = heroLines[1];
    if (typedChars <= a.length) return { l1: a.slice(0, typedChars), l2: '' };
    return { l1: a, l2: b.slice(0, typedChars - a.length) };
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
      const n = Math.min(Math.floor((w * h) / 9000), 100);
      for (let i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
          r: Math.random() * 1 + 0.3, a: Math.random() * 0.12 + 0.03,
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
          if (dist < 90) {
            ctx!.beginPath();
            ctx!.moveTo(dots[i].x, dots[i].y);
            ctx!.lineTo(dots[j].x, dots[j].y);
            ctx!.strokeStyle = `rgba(255,149,0,${0.02 * (1 - dist / 90)})`;
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

  // Shield path total length (approximate)
  const shieldPathLen = 220;
  const checkPathLen = 40;

  function shieldDashOffset(): number {
    return shieldPathLen * (1 - drawProgress);
  }
  function checkDashOffset(): number {
    // Check draws in last 30% of progress
    const t = Math.max(0, (drawProgress - 0.7) / 0.3);
    return checkPathLen * (1 - t);
  }

  // Splash visible phases
  const splashPhases = ['black','ember','ember-pulse','drawing','drawn','glow','text','hold','morph'];

  function isSplashVisible(): boolean {
    return splashPhases.includes(phase);
  }
  function isAppVisible(): boolean {
    return ['appbar','skeleton','crossfade','alive'].includes(phase);
  }
</script>

<div class="page">
  <canvas
    class="particles"
    bind:this={canvasEl}
    style="opacity: {canvasOpacity}"
  ></canvas>

  <!-- ===== SPLASH: "The 3 Beats" ===== -->
  {#if isSplashVisible()}
    <div
      class="splash"
      class:splash--morph={phase === 'morph'}
    >
      <!-- 1st beat: Ember dot -->
      {#if phase === 'ember' || phase === 'ember-pulse'}
        <div class="ember" class:ember--pulse={phase === 'ember-pulse'}></div>
      {/if}

      <!-- 2nd beat: Symbol drawing -->
      {#if phase === 'drawing' || phase === 'drawn' || phase === 'glow' || phase === 'text' || phase === 'hold' || phase === 'morph'}
        <div
          class="emblem"
          class:emblem--glow={phase === 'glow' || phase === 'text' || phase === 'hold'}
          class:emblem--morph={phase === 'morph'}
        >
          <svg class="shield" viewBox="0 0 64 76" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Shield outline (drawn via stroke-dashoffset) -->
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
            <!-- Check mark -->
            <path
              d="M26 38l6 6 12-14"
              stroke="rgba(240,240,245,0.8)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-dasharray="{checkPathLen}"
              stroke-dashoffset="{checkDashOffset()}"
            />
            <!-- Hammer dent marks -->
            <!-- Dent 1: top-left small circle -->
            <circle cx="20" cy="25" r="3" fill="none" stroke="rgba(255,149,0,0.25)" stroke-width="0.8" opacity={drawProgress > 0.5 ? 1 : 0}/>
            <line x1="17" y1="23" x2="15.5" y2="21.5" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.5 ? 1 : 0}/>
            <line x1="22" y1="22.5" x2="23.5" y2="21" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.5 ? 1 : 0}/>
            <!-- Dent 2: center large circle -->
            <circle cx="32" cy="40" r="4" fill="none" stroke="rgba(255,149,0,0.3)" stroke-width="0.8" opacity={drawProgress > 0.6 ? 1 : 0}/>
            <line x1="28.5" y1="37" x2="27" y2="35" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.6 ? 1 : 0}/>
            <line x1="35.5" y1="37" x2="37" y2="35" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.6 ? 1 : 0}/>
            <line x1="29" y1="43.5" x2="27.5" y2="45.5" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.6 ? 1 : 0}/>
            <line x1="35" y1="43.5" x2="36.5" y2="45.5" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.6 ? 1 : 0}/>
            <!-- Dent 3: bottom-right ellipse -->
            <ellipse cx="44" cy="55" rx="4" ry="2" fill="none" stroke="rgba(255,149,0,0.25)" stroke-width="0.8" opacity={drawProgress > 0.7 ? 1 : 0}/>
            <line x1="47" y1="53.5" x2="49" y2="52" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.7 ? 1 : 0}/>
            <line x1="41" y1="56.5" x2="39" y2="58" stroke="rgba(255,149,0,0.15)" stroke-width="0.5" opacity={drawProgress > 0.7 ? 1 : 0}/>
          </svg>

          <!-- Splash text -->
          {#if phase === 'text' || phase === 'hold' || phase === 'morph'}
            <span class="emblem-text"
              class:emblem-text--in={phase === 'text' || phase === 'hold' || phase === 'morph'}
            >{'\uB450\uB4DC\uB824\uBD24\uC2B5\uB2C8\uB2E4.'}</span>
          {/if}
          {#if phase === 'hold' || phase === 'morph'}
            <span class="emblem-sub"
              class:emblem-sub--in={phase === 'hold' || phase === 'morph'}
            >BYTEFORCE SECURITY</span>
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
    <header
      class="bar"
      class:bar--in={isAppVisible()}
    >
      <div class="bar-logo">
        <svg class="bar-shield" viewBox="0 0 64 76" fill="none">
          <path d="M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z" stroke="rgba(255,149,0,0.3)" stroke-width="1.5" fill="none"/>
          <path d="M26 38l6 6 12-14" stroke="rgba(255,149,0,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="20" cy="25" r="2.5" fill="none" stroke="rgba(255,149,0,0.15)" stroke-width="0.5"/>
          <circle cx="32" cy="40" r="3" fill="none" stroke="rgba(255,149,0,0.2)" stroke-width="0.5"/>
          <ellipse cx="44" cy="55" rx="3" ry="1.5" fill="none" stroke="rgba(255,149,0,0.15)" stroke-width="0.5"/>
        </svg>
        <span class="bar-brand">BYTEFORCE</span>
      </div>
      <button class="bar-action" onclick={() => goto(`${base}/incident`)}>{'\uC0C1\uB2F4 \uC608\uC57D'}</button>
    </header>

    <div class="content">
      <!-- HERO -->
      <section class="hero">
        {#if phase === 'alive'}
          <h1 class="hero-title">
            <span class="hero-line">{getTyped().l1}<span class="cursor" class:cursor--blink={typingDone}>|</span></span>
            {#if getTyped().l2}<br/><span class="hero-line">{getTyped().l2}</span>{/if}
          </h1>
        {:else if phase === 'crossfade'}
          <div class="skel skel--title skel--fading"></div>
          <div class="skel skel--title skel--short skel--fading"></div>
        {:else if phase === 'skeleton'}
          <div class="skel skel--title" class:skel--stagger-in={skelTitle}></div>
          <div class="skel skel--title skel--short" class:skel--stagger-in={skelTitle}></div>
        {/if}

        {#if phase === 'alive'}
          {#if showSubtext}
            <p class="hero-sub elem-fade-in">{'\uBC30\uD3EC \uC804 \uBCF4\uC548 \uC810\uAC80. \uBC14\uC774\uBE0C\uCF54\uB354\uB97C \uC704\uD574 \uB9CC\uB4E4\uC5C8\uC2B5\uB2C8\uB2E4.'}</p>
          {/if}
          {#if showTools}
            <p class="hero-tools elem-fade-in">Cursor &middot; Claude Code &middot; v0 &middot; Lovable &middot; bolt.new</p>
          {/if}
          {#if showCta}
            <button class="hero-cta elem-rise-in" onclick={() => goto(`${base}/diagnose`)}>{'\uB0B4 \uD504\uB85C\uC81D\uD2B8 \uC810\uAC80 \uBC1B\uAE30'}</button>
          {/if}
        {:else if phase === 'crossfade'}
          <div class="skel skel--text skel--fading"></div>
          <div class="skel skel--btn skel--fading"></div>
        {:else if phase === 'skeleton'}
          {#if skelText}<div class="skel skel--text skel--stagger-in"></div>{/if}
          {#if skelBtn}<div class="skel skel--btn skel--stagger-in"></div>{/if}
        {/if}
      </section>

      <!-- STATS -->
      <section class="stats">
        {#if phase === 'alive'}
          <div class="stat-row">
            {#if showStat0}<div class="stat elem-fade-in"><span class="stat-num">847</span><span class="stat-lbl">{'\uB178\uCD9C \uD0A4'}</span></div>{/if}
            {#if showStat1}<div class="stat elem-fade-in"><span class="stat-num">62%</span><span class="stat-lbl">RLS {'\uBBF8\uC124\uC815'}</span></div>{/if}
            {#if showStat2}<div class="stat elem-fade-in"><span class="stat-num">{'\x31\x31\uC77C'}</span><span class="stat-lbl">{'\uD3C9\uADE0 \uD0D0\uC9C0'}</span></div>{/if}
          </div>
          {#if showStat2}
            <p class="stat-src elem-fade-in">2026 3~8{'\uC6D4'}, 312{'\uAC1C \uB808\uD3EC \uAE30\uC900'}</p>
          {/if}
        {:else if phase === 'skeleton' || phase === 'crossfade'}
          <div class="skel-row">
            <div class="skel skel--stat" class:skel--fading={phase === 'crossfade'}></div>
            <div class="skel skel--stat" class:skel--fading={phase === 'crossfade'}></div>
            <div class="skel skel--stat" class:skel--fading={phase === 'crossfade'}></div>
          </div>
        {/if}
      </section>

      <!-- RECENT -->
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
      {:else if (phase === 'skeleton' || phase === 'crossfade') && skelBtn}
        <div class="skel skel--row" class:skel--fading={phase === 'crossfade'}></div>
        <div class="skel skel--row" class:skel--fading={phase === 'crossfade'}></div>
      {/if}
    </div>

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
    --bk: #0a0a0f; --s1: #0e0e14; --s2: #141420;
    --tx: #f0f0f5; --tx2: #a0a0a8; --tx3: #4a4a4f;
    --amber: #ff9500; --amber-light: #ffab33; --amber-dim: rgba(255,149,0,0.15);
    --brd: rgba(255,149,0,0.08);
    --ok: #32d74b; --wn: #ff9500; --cr: #ff453a;
    --f: "Instrument Sans","Pretendard Variable",-apple-system,sans-serif;
    --m: "JetBrains Mono","SF Mono",monospace;
    --ease: cubic-bezier(0.16,1,0.3,1);
    --ease-overshoot: cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative; min-height: 100dvh;
    background: var(--bk); color: var(--tx); font-family: var(--f);
    overflow: hidden; -webkit-font-smoothing: antialiased;
  }

  .particles {
    position: fixed; inset: 0; width: 100%; height: 100%;
    z-index: 0; pointer-events: none;
    opacity: 0;
  }

  /* ===== SPLASH ===== */
  .splash {
    position: fixed; inset: 0; z-index: 200;
    display: flex; align-items: center; justify-content: center;
    background: var(--bk);
    transition: opacity 0.8s var(--ease);
  }
  .splash--morph {
    opacity: 0;
    pointer-events: none;
  }

  /* 1st beat: Ember */
  .ember {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--amber);
    box-shadow: 0 0 20px rgba(255,149,0,0.4), 0 0 60px rgba(255,149,0,0.15);
    opacity: 0;
    animation: emberIn 0.5s ease-out forwards;
  }
  .ember--pulse {
    animation: emberIn 0.5s ease-out forwards, emberPulse 0.6s ease-in-out 0.5s;
  }
  @keyframes emberIn {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes emberPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); box-shadow: 0 0 30px rgba(255,149,0,0.6), 0 0 80px rgba(255,149,0,0.25); }
    100% { transform: scale(1); }
  }

  /* Emblem container */
  .emblem {
    display: flex; flex-direction: column; align-items: center; gap: 14px;
    position: relative;
    transition: opacity 0.8s var(--ease), transform 0.8s var(--ease);
  }
  .emblem--glow .shield {
    filter: drop-shadow(0 0 20px rgba(255,149,0,0.3)) drop-shadow(0 0 50px rgba(255,149,0,0.1));
    transition: filter 0.6s var(--ease);
  }
  .emblem--morph {
    opacity: 0; transform: scale(0.5) translateY(-80px);
  }

  .shield {
    width: 72px; height: 86px;
    filter: drop-shadow(0 0 12px rgba(255,149,0,0.1));
    position: relative; z-index: 1;
    transition: filter 0.4s var(--ease);
  }

  /* Splash text */
  .emblem-text {
    font-size: 15px; font-weight: 400;
    letter-spacing: 0.1em; color: var(--tx);
    opacity: 0; transform: translateY(6px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  }
  .emblem-text--in {
    opacity: 1; transform: translateY(0);
  }

  .emblem-sub {
    font-size: 11px; font-weight: 500; letter-spacing: 0.2em; color: var(--tx3);
    opacity: 0;
    transition: opacity 0.4s var(--ease);
  }
  .emblem-sub--in { opacity: 1; }

  /* ===== APP ===== */
  .app {
    position: relative; z-index: 10; min-height: 100dvh;
    display: flex; flex-direction: column;
    opacity: 0;
    transition: opacity 0.3s var(--ease);
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
  .bar--in {
    opacity: 1; transform: translateY(0);
  }

  .bar-logo { display: flex; align-items: center; gap: 8px; }
  .bar-shield { width: 18px; height: 22px; opacity: 0.6; }
  .bar-brand { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--tx3); }
  .bar-action {
    font-family: var(--f); font-size: 12px; font-weight: 500; color: var(--amber);
    background: none; border: 1px solid rgba(255,149,0,0.3); border-radius: 6px;
    padding: 5px 14px; cursor: pointer; transition: color 0.2s, border-color 0.2s, background 0.2s;
  }
  .bar-action:hover { color: var(--amber-light); border-color: rgba(255,149,0,0.5); background: rgba(255,149,0,0.05); }

  /* Content */
  .content { flex: 1; padding: 40px 20px 100px; max-width: 600px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 40px; }

  /* Hero */
  .hero { display: flex; flex-direction: column; gap: 16px; min-height: 200px; }
  .hero-title { font-size: 34px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.25; margin: 0; color: var(--tx); }
  .hero-line { display: inline; }
  .cursor { color: var(--amber); font-weight: 300; }
  .cursor--blink { animation: blink 1s step-end infinite; }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  .hero-sub { font-size: 15px; color: var(--tx2); line-height: 1.5; margin: 0; }
  .hero-tools { font-family: var(--m); font-size: 12px; color: var(--tx3); letter-spacing: 0.02em; }
  .hero-cta {
    align-self: flex-start; padding: 11px 28px; border-radius: 6px; border: none;
    background: var(--amber); color: var(--bk); font-family: var(--f);
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 20px rgba(255,149,0,0.15);
  }
  .hero-cta:hover { background: var(--amber-light); transform: translateY(-1px); box-shadow: 0 0 30px rgba(255,149,0,0.25); }

  /* Element-level fade in */
  .elem-fade-in {
    animation: elemFadeIn 0.4s var(--ease) forwards;
  }
  .elem-rise-in {
    animation: elemRiseIn 0.4s var(--ease) forwards;
  }
  @keyframes elemFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes elemRiseIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Stats */
  .stats { display: flex; flex-direction: column; gap: 8px; }
  .stat-row { display: flex; gap: 28px; }
  .stat { display: flex; flex-direction: column; gap: 3px; }
  .stat-num { font-family: var(--m); font-size: 22px; font-weight: 500; font-variant-numeric: tabular-nums; color: var(--amber); }
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
    border-radius: 6px;
    opacity: 0;
  }
  .skel--stagger-in {
    opacity: 1;
    animation: shimmer 1.5s ease-in-out infinite;
    transition: opacity 0.2s var(--ease);
  }
  .skel--fading {
    opacity: 0;
    transition: opacity 0.3s var(--ease);
    animation: shimmer 1.5s ease-in-out infinite;
  }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .skel--title { height: 38px; width: 70%; }
  .skel--short { width: 50%; margin-top: 8px; }
  .skel--text { height: 16px; width: 80%; margin-top: 8px; }
  .skel--btn { height: 42px; width: 140px; margin-top: 12px; }
  .skel-row { display: flex; gap: 20px; }
  .skel--stat { height: 48px; width: 80px; opacity: 1; animation: shimmer 1.5s ease-in-out infinite; }
  .skel--row { height: 48px; width: 100%; margin-top: 8px; opacity: 1; animation: shimmer 1.5s ease-in-out infinite; }

  /* Nav */
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
    .hero-title { font-size: 28px; }
    .shield { width: 56px; height: 68px; }
    .content { padding: 32px 16px 100px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .splash, .emblem, .emblem-text, .emblem-sub, .app, .bar,
    .elem-fade-in, .elem-rise-in, .skel, .ember {
      animation: none !important;
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .skel--stagger-in { opacity: 1 !important; }
    .skel--fading { opacity: 0 !important; }
  }
</style>
