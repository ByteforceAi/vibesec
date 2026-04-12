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

  const termLines = [
    { text: 'OPENAI_API_KEY', val: '=sk-proj-4f8a...9c2d', cls: '', keyCls: '' },
    { text: 'SUPABASE_SERVICE_ROLE', val: '=eyJhbGci...kX9s', cls: '', keyCls: '' },
    { text: 'STRIPE_SECRET_KEY', val: '=sk_live_51N...rYz', cls: 't-ln--warn', keyCls: 't-k--red', comment: '# commit a3f7b2' },
    { text: 'DATABASE_URL', val: '=postgresql://admin:pass123@...5432/prod', cls: '', keyCls: '' },
    { text: '', val: '', cls: 't-ln--result', keyCls: '', result: '3 secrets exposed' },
  ];

  let activePlan = $state(1);
  let openFaq = $state<number | null>(null);
  let loaded = $state(false);
  let scrolled = $state(false);

  // 3. Price countup
  let displayPrice = $state(plans[1].price);
  let priceAnimating = $state(false);

  // 1. Terminal typing
  let termVisible = $state(false);
  let termLineCount = $state(0);
  let termEl: HTMLElement | undefined = $state(undefined);

  // 2. Features stagger
  let featuresKey = $state(0);

  // 6. Scroll reveal
  let revealedSections = $state(new Set<string>());
  let mainEl: HTMLElement | undefined = $state(undefined);

  // Reduced motion check
  let reducedMotion = $state(false);

  $effect(() => {
    loaded = true;
    if (typeof window !== 'undefined') {
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  });

  // 3. Price countup effect (untrack displayPrice to avoid loop)
  let prevPlan = $state(1);
  $effect(() => {
    const planIdx = activePlan;
    if (planIdx === prevPlan) return;
    const target = plans[planIdx].price;
    if (reducedMotion) {
      displayPrice = target;
      prevPlan = planIdx;
      return;
    }
    const start = displayPrice;
    const diff = target - start;
    const duration = 600;
    const startTime = performance.now();
    prevPlan = planIdx;

    function easeOut(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      displayPrice = Math.round(start + diff * easeOut(progress));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  });

  // 2. Features stagger: reset on plan change
  $effect(() => {
    // Track activePlan to trigger
    void activePlan;
    featuresKey++;
  });

  // 1. Terminal IntersectionObserver
  $effect(() => {
    if (!termEl || !mainEl || reducedMotion) {
      if (reducedMotion) { termVisible = true; termLineCount = termLines.length; }
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !termVisible) {
          termVisible = true;
          let count = 0;
          const interval = setInterval(() => {
            count++;
            termLineCount = count;
            if (count >= termLines.length) clearInterval(interval);
          }, 300);
        }
      },
      { threshold: 0.1, root: mainEl }
    );
    observer.observe(termEl);
    return () => observer.disconnect();
  });

  // 6. Scroll reveal observer
  $effect(() => {
    if (!mainEl) return;
    if (reducedMotion) {
      revealedSections = new Set(['features','term','extras','loc','faq','foot']);
      return;
    }

    const targets = mainEl.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.reveal!;
            revealedSections = new Set([...revealedSections, id]);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, root: mainEl }
    );
    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  });

  // Price formatting
  function formatPrice(n: number): string {
    return n.toLocaleString('ko-KR');
  }

  function toggleFaq(i: number) { openFaq = openFaq === i ? null : i; }
  function getVal(feat: Feature): string {
    return activePlan === 0 ? feat.starter : activePlan === 1 ? feat.pro : feat.full;
  }
  function handleScroll(e: Event) {
    const el = e.target as HTMLElement;
    scrolled = el.scrollTop > 8;
  }
</script>

<div class="void" class:void--in={loaded}>

  <!-- App bar -->
  <header class="bar" class:bar--scrolled={scrolled}>
    <span class="bar-brand">Byteforce Security</span>
    <button class="bar-action" onclick={() => goto(`${base}/incident`)}>상담 예약</button>
  </header>

  <div class="shell">

    <!-- Sidebar -->
    <nav class="side">
      <div class="side-group">
        <span class="side-label">점검</span>
        {#each plans as plan, i}
          <button class="side-item" class:side-item--on={activePlan === i} onclick={() => { activePlan = i; }}>
            <span class="side-name">{plan.name}</span>
            {#if plan.popular}<span class="side-tag">추천</span>{/if}
          </button>
        {/each}
      </div>
      <div class="side-group">
        <span class="side-label">추가</span>
        {#each extras as extra}
          <div class="side-item side-item--static">
            <span class="side-name">{extra.name}</span>
            <span class="side-mono">{extra.price}</span>
          </div>
        {/each}
      </div>
      <div class="side-group">
        <span class="side-label">안내</span>
        <button class="side-item" onclick={() => { document.getElementById('loc')?.scrollIntoView({behavior:'smooth'}); }}>
          <span class="side-name">오시는 곳</span>
        </button>
        <button class="side-item" onclick={() => { document.getElementById('faq')?.scrollIntoView({behavior:'smooth'}); }}>
          <span class="side-name">자주 묻는 질문</span>
        </button>
      </div>
    </nav>

    <!-- Main -->
    <main class="main" bind:this={mainEl} onscroll={handleScroll}>

      <!-- 5. Segment with sliding indicator -->
      <div class="seg-wrap">
        <div class="seg-indicator" style="transform: translateX({activePlan * 100}%)"></div>
        {#each plans as plan, i}
          <button class="seg" class:seg--on={activePlan === i} onclick={() => { activePlan = i; }}>{plan.name}</button>
        {/each}
      </div>

      <!-- Plan detail with 3. price countup -->
      {#key activePlan}
      <section class="plan-card">
        <div class="plan-top">
          <div>
            <h1 class="plan-title">{plans[activePlan].name}</h1>
            <p class="plan-desc">{plans[activePlan].desc}</p>
            <p class="plan-meta">{plans[activePlan].details}</p>
          </div>
          <div class="plan-price-block">
            <span class="plan-won">W</span>
            <span class="plan-num">{formatPrice(displayPrice)}</span>
            <span class="plan-period">{plans[activePlan].period}</span>
          </div>
        </div>
        <!-- 8. CTA hover -->
        <button class="plan-cta" class:plan-cta--pop={plans[activePlan].popular} onclick={() => goto(`${base}/incident`)}>
          {plans[activePlan].cta}
        </button>
      </section>
      {/key}

      <!-- 2. Features with stagger animation -->
      <section class="group" data-reveal="features" class:reveal--in={revealedSections.has('features') || reducedMotion}>
        <h2 class="group-head">포함 항목</h2>
        {#key featuresKey}
          {#each features as feat, i}
            {@const val = getVal(feat)}
            <div class="row feat-row" style="--feat-delay:{i * 30}ms">
              <span class="row-key">{feat.label}</span>
              <span class="row-val" class:row-val--ok={val === 'check'} class:row-val--no={val === 'minus'}>
                {#if val === 'check'}
                  <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                {:else if val === 'minus'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>
                {:else}
                  <span class="row-badge">{val}</span>
                {/if}
              </span>
            </div>
          {/each}
        {/key}
      </section>

      <!-- 1. Terminal with typing effect -->
      <section class="term" bind:this={termEl} data-reveal="term" class:reveal--in={revealedSections.has('term') || reducedMotion}>
        <div class="term-head">
          <span class="term-file">.env</span>
          <span class="term-flag">committed to git</span>
        </div>
        <pre class="term-code"><code>{#each termLines as line, i}{#if i < termLineCount}{#if line.result}<span class="t-ln {line.cls}"><span class="t-ok term-blink">{line.result}</span></span>{:else}<span class="t-ln {line.cls}"><span class="t-k {line.keyCls}">{line.text}</span>{line.val}{#if line.comment}  <span class="t-c">{line.comment}</span>{/if}</span>{/if}
{/if}{/each}</code></pre>
        <p class="term-note">312개 레포 점검 기준. 62%에서 유사 이슈 발견.</p>
      </section>

      <!-- Extras -->
      <section class="group" id="extras" data-reveal="extras" class:reveal--in={revealedSections.has('extras') || reducedMotion}>
        <h2 class="group-head">추가 메뉴</h2>
        {#each extras as extra}
          <div class="row">
            <div class="row-col">
              <span class="row-key">{extra.name}</span>
              <span class="row-sub">{extra.desc}</span>
            </div>
            <span class="row-mono">W{extra.price} <span class="row-dim">{extra.period}</span></span>
          </div>
        {/each}
      </section>

      <!-- Location -->
      <section class="group" id="loc" data-reveal="loc" class:reveal--in={revealedSections.has('loc') || reducedMotion}>
        <h2 class="group-head">오시는 곳</h2>
        <div class="row"><div class="row-col"><span class="row-key">서울 마곡</span><span class="row-sub">노트북 들고 오시면 바로 점검. 2~3시간, 당일 리포트.</span></div></div>
        <div class="row"><div class="row-col"><span class="row-key">부산 해운대</span><span class="row-sub">출장 점검 가능. 출장비 별도 협의. 사전 예약 필수.</span></div></div>
        <div class="row"><div class="row-col"><span class="row-key">화상 점검</span><span class="row-sub">Zoom / Google Meet. 전국 어디서든.</span></div></div>
      </section>

      <!-- 4. FAQ with smooth accordion -->
      <section class="group" id="faq" data-reveal="faq" class:reveal--in={revealedSections.has('faq') || reducedMotion}>
        <h2 class="group-head">자주 묻는 질문</h2>
        {#each faqs as faq, i}
          <button class="row row--btn" onclick={() => toggleFaq(i)} aria-expanded={openFaq === i}>
            <span class="row-key">{faq.q}</span>
            <svg class="faq-arr" class:faq-arr--open={openFaq === i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="faq-body" class:faq-body--open={openFaq === i}>
            <div class="faq-inner">{faq.a}</div>
          </div>
        {/each}
      </section>

      <!-- Footer -->
      <section class="foot" data-reveal="foot" class:reveal--in={revealedSections.has('foot') || reducedMotion}>
        <p class="foot-text">뭐가 필요한지 모르겠으면 일단 오세요.<br/>보고 말씀드리겠습니다.</p>
        <button class="foot-btn" onclick={() => goto(`${base}/incident`)}>상담 예약</button>
      </section>

    </main>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .void {
    --black:    #000000;
    --s1:       #060608;
    --s2:       #0c0c0e;
    --s3:       #141416;
    --s4:       #1c1c1f;
    --tx:       #ffffff;
    --tx2:      #9a9a9f;
    --tx3:      #4a4a4f;
    --brd:      rgba(255,255,255,0.055);
    --ok:       #32d74b;
    --warn:     #ff453a;
    --font:     "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
    --mono:     "JetBrains Mono", "SF Mono", monospace;
    --ease:     cubic-bezier(0.16, 1, 0.3, 1);

    font-family: var(--font);
    color: var(--tx);
    background: var(--black);
    background-image: radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px);
    background-size: 24px 24px;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    -webkit-font-smoothing: antialiased;
    opacity: 0;
    transition: opacity 0.6s var(--ease);
  }
  .void--in { opacity: 1; }

  /* ── Bar ── */
  .bar {
    position: sticky;
    top: 0;
    z-index: 90;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background: var(--black);
    border-bottom: 1px solid transparent;
    transition: border-color 0.3s var(--ease);
  }
  .bar--scrolled { border-color: var(--brd); }

  .bar-brand {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--tx3);
  }

  .bar-action {
    font-family: var(--font);
    font-size: 13px;
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

  /* ── Shell ── */
  .shell {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .side {
    width: 200px;
    flex-shrink: 0;
    background: var(--s1);
    border-right: 1px solid var(--brd);
    padding: 16px 10px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .side-group {
    margin-bottom: 20px;
  }

  .side-label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--tx3);
    padding: 6px 10px 4px;
  }

  /* 7. Sidebar hover effect */
  .side-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-family: var(--font);
    font-size: 13px;
    color: var(--tx2);
    cursor: pointer;
    transition: background 0.15s, color 0.15s, transform 0.2s var(--ease), filter 0.2s;
    text-align: left;
  }
  .side-item:hover {
    background: var(--s2);
    color: var(--tx);
    transform: translateX(2px);
    filter: brightness(1.15);
  }
  .side-item--on { background: var(--s3); color: var(--tx); }
  .side-item--static { cursor: default; }
  .side-item--static:hover { background: transparent; color: var(--tx2); transform: none; filter: none; }

  .side-name { flex: 1; }

  .side-tag {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--tx3);
    border: 1px solid var(--brd);
    padding: 1px 5px;
    border-radius: 3px;
  }
  .side-item--on .side-tag { color: var(--tx2); border-color: rgba(255,255,255,0.1); }

  .side-mono {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--tx3);
    font-variant-numeric: tabular-nums;
  }

  /* ── Main ── */
  .main {
    flex: 1;
    overflow-y: auto;
    padding: 32px 40px 64px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* ── 5. Segment with sliding indicator ── */
  .seg-wrap {
    display: inline-flex;
    background: var(--s1);
    border: 1px solid var(--brd);
    border-radius: 8px;
    padding: 3px;
    align-self: flex-start;
    position: relative;
  }

  .seg-indicator {
    position: absolute;
    top: 3px;
    left: 3px;
    width: calc((100% - 6px) / 3);
    height: calc(100% - 6px);
    background: var(--s3);
    border-radius: 5px;
    transition: transform 0.3s var(--ease);
    z-index: 0;
    pointer-events: none;
  }

  .seg {
    padding: 6px 18px;
    border: none;
    background: transparent;
    border-radius: 5px;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    color: var(--tx3);
    cursor: pointer;
    transition: color 0.2s var(--ease);
    position: relative;
    z-index: 1;
  }
  .seg--on {
    color: var(--tx);
  }

  /* ── Plan card ── */
  .plan-card {
    animation: fadeSlide 0.35s var(--ease) both;
  }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .plan-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 32px;
    margin-bottom: 20px;
  }

  .plan-title {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin: 0 0 6px;
    line-height: 1.1;
  }

  .plan-desc {
    font-size: 15px;
    color: var(--tx2);
    margin: 0 0 4px;
    line-height: 1.4;
  }

  .plan-meta {
    font-size: 12px;
    color: var(--tx3);
    margin: 0;
  }

  .plan-price-block {
    display: flex;
    align-items: baseline;
    flex-shrink: 0;
  }

  .plan-won {
    font-family: var(--mono);
    font-size: 16px;
    font-weight: 500;
    color: var(--tx3);
    margin-right: 2px;
    align-self: flex-start;
    margin-top: 6px;
  }

  .plan-num {
    font-family: var(--mono);
    font-size: 44px;
    font-weight: 500;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .plan-period {
    font-size: 12px;
    color: var(--tx3);
    margin-left: 6px;
  }

  /* 8. CTA button hover */
  .plan-cta {
    padding: 10px 24px;
    border-radius: 6px;
    border: 1px solid var(--brd);
    background: transparent;
    color: var(--tx2);
    font-family: var(--font);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s var(--ease);
  }
  .plan-cta:hover {
    color: var(--tx);
    border-color: rgba(255,255,255,0.2);
    transform: translateY(-1px);
  }
  .plan-cta--pop {
    background: var(--tx);
    color: var(--black);
    border-color: var(--tx);
  }
  .plan-cta--pop:hover {
    background: #d8d8d8;
    transform: translateY(-1px);
  }

  /* ── Group ── */
  .group { display: flex; flex-direction: column; }

  .group-head {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--tx3);
    margin: 0 0 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--brd);
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 0;
    border-bottom: 1px solid var(--brd);
    font-size: 14px;
  }

  /* 2. Feature row stagger animation */
  .feat-row {
    opacity: 0;
    transform: translateY(8px);
    animation: featIn 0.3s var(--ease) forwards;
    animation-delay: var(--feat-delay);
  }

  @keyframes featIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* 2. Check icon bounce */
  .check-icon {
    animation: checkBounce 0.35s var(--ease) forwards;
    animation-delay: var(--feat-delay);
  }

  @keyframes checkBounce {
    0% { transform: scale(0.5); opacity: 0; }
    60% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  .row--btn {
    cursor: pointer;
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    border-bottom: 1px solid var(--brd);
    width: 100%;
    font-family: var(--font);
    text-align: left;
    color: var(--tx);
    padding: 11px 0;
  }
  .row--btn:hover { color: var(--tx); }

  .row-col { display: flex; flex-direction: column; gap: 2px; }

  .row-key { color: var(--tx2); font-size: 14px; }
  .row--btn .row-key { color: var(--tx); }
  .row-sub { font-size: 11px; color: var(--tx3); line-height: 1.4; }

  .row-val { display: flex; align-items: center; }
  .row-val--ok { color: var(--ok); }
  .row-val--no { color: var(--tx3); }

  .row-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    background: var(--s2);
    color: var(--tx2);
    border-radius: 4px;
    border: 1px solid var(--brd);
  }

  .row-mono {
    font-family: var(--mono);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: var(--tx2);
    text-align: right;
    white-space: nowrap;
  }

  .row-dim { font-size: 10px; color: var(--tx3); font-family: var(--font); }

  /* ── 4. FAQ smooth accordion ── */
  .faq-arr {
    flex-shrink: 0;
    color: var(--tx3);
    transition: transform 0.25s var(--ease);
  }
  .faq-arr--open { transform: rotate(180deg); }

  .faq-body {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.3s var(--ease);
    border-bottom: 1px solid var(--brd);
  }
  .faq-body--open {
    grid-template-rows: 1fr;
  }

  .faq-inner {
    overflow: hidden;
    font-size: 14px;
    color: var(--tx2);
    line-height: 1.65;
    word-break: keep-all;
    padding: 0 0 0;
    transition: padding 0.3s var(--ease);
  }
  .faq-body--open .faq-inner {
    padding: 0 0 14px;
  }

  /* ── 1. Terminal typing ── */
  .term {
    background: var(--s1);
    border: 1px solid var(--brd);
    border-radius: 8px;
    overflow: hidden;
  }

  .term-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid var(--brd);
  }

  .term-file {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--tx3);
  }

  .term-flag {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--warn);
    opacity: 0.7;
  }

  .term-code {
    padding: 16px;
    margin: 0;
    overflow-x: auto;
    font-family: var(--mono);
    font-size: 12.5px;
    line-height: 1.8;
    color: var(--tx2);
    min-height: 120px;
  }

  .t-ln { display: block; }
  .t-ln--warn { color: var(--warn); opacity: 0.9; }
  .t-ln--result { margin-top: 8px; }
  .t-k { color: rgba(255,255,255,0.5); }
  .t-k--red { color: var(--warn); }
  .t-c { color: var(--tx3); font-style: italic; }
  .t-ok { color: var(--ok); }

  /* 1. Blink for "3 secrets exposed" */
  .term-blink {
    animation: termBlink 1s ease-in-out 3;
  }
  @keyframes termBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .term-note {
    font-size: 11px;
    color: var(--tx3);
    padding: 0 16px 12px;
    margin: 0;
    font-style: italic;
  }

  /* ── 6. Scroll reveal ── */
  [data-reveal] {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .reveal--in {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Footer ── */
  .foot {
    text-align: center;
    padding: 48px 0;
    border-top: 1px solid var(--brd);
    margin-top: 16px;
  }

  .foot-text {
    font-size: 18px;
    font-weight: 500;
    color: var(--tx2);
    margin: 0 0 24px;
    line-height: 1.5;
    word-break: keep-all;
  }

  .foot-btn {
    padding: 10px 28px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.12);
    background: transparent;
    color: var(--tx);
    font-family: var(--font);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s var(--ease);
  }
  .foot-btn:hover { background: var(--s2); border-color: rgba(255,255,255,0.2); }

  /* ── prefers-reduced-motion ── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    [data-reveal] {
      opacity: 1;
      transform: none;
    }
    .feat-row {
      opacity: 1;
      transform: none;
    }
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .side { display: none; }
    .main { padding: 20px 16px 48px; }
    .plan-top { flex-direction: column; gap: 16px; }
    .plan-num { font-size: 36px; }
    .plan-title { font-size: 26px; }
    .seg-wrap { align-self: stretch; }
    .seg { flex: 1; font-size: 12px; padding: 6px 8px; }
    .bar { padding: 0 16px; }
  }

  @media (max-width: 375px) {
    .plan-num { font-size: 28px; }
    .plan-title { font-size: 22px; }
    .main { padding: 16px 12px 40px; gap: 24px; }
  }
</style>
