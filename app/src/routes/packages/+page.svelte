<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  interface Feature { label: string; starter: string; pro: string; full: string }

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      desc: 'Automated scan. See what\'s exposed.',
      price: 0,
      priceLabel: '0',
      cta: 'Run free scan',
      ctaStyle: 'secondary' as const,
    },
    {
      id: 'pro',
      name: 'Pro',
      desc: 'Full audit + fix guide before you ship.',
      price: 190000,
      priceLabel: '190,000',
      period: '/ project',
      cta: 'Start Pro audit',
      ctaStyle: 'primary' as const,
      popular: true,
    },
    {
      id: 'full',
      name: 'Full Audit',
      desc: 'One engineer. Yours for a week.',
      price: 490000,
      priceLabel: '490,000',
      period: '/ project',
      cta: 'Talk to founder',
      ctaStyle: 'secondary' as const,
    },
  ];

  const features: Feature[] = [
    { label: 'Automated scan',           starter: 'check', pro: 'check',        full: 'check' },
    { label: 'Vulnerability report',     starter: 'Summary', pro: 'Detailed',   full: 'Detailed + line numbers' },
    { label: 'Secret/key exposure check',starter: 'check', pro: 'check',        full: 'check' },
    { label: 'Auth system audit',        starter: 'minus', pro: 'check',        full: 'check' },
    { label: 'Database security (RLS)',   starter: 'minus', pro: 'check',        full: 'check' },
    { label: 'API endpoint validation',  starter: 'minus', pro: 'check',        full: 'check' },
    { label: 'Dependency vuln analysis', starter: 'minus', pro: 'check',        full: 'check' },
    { label: 'Fix guide',               starter: 'minus', pro: 'PDF',          full: '1:1 walkthrough' },
    { label: 'Hands-on fix by engineer', starter: 'minus', pro: 'minus',        full: 'check' },
    { label: 'Post-deploy monitoring',   starter: 'minus', pro: '7 days',       full: '30 days' },
    { label: 'Incident response SLA',    starter: 'minus', pro: 'minus',        full: '< 4 hours' },
    { label: 'Re-audit guarantee',       starter: 'minus', pro: '14 days',      full: '30 days' },
  ];

  const faqs = [
    {
      q: 'What is vibe coding?',
      a: 'Building software with AI tools like Cursor, Claude Code, v0, or Lovable. You ship fast, but the AI doesn\'t audit itself. That\'s what we do.',
    },
    {
      q: 'I\'m not a developer. Can I use this?',
      a: 'VibeSec was built for non-developers. Paste your project URL. We scan it. The report uses plain language, not CVE numbers.',
    },
    {
      q: 'What does the free scan find?',
      a: 'Exposed API keys, leaked .env files, public database endpoints, default auth configs. The things that cost you money overnight.',
    },
    {
      q: 'Pro vs Full Audit?',
      a: 'Pro is automated scan + PDF fix guide. Full Audit: a human engineer reads your code, fixes the issues, and monitors for 30 days.',
    },
    {
      q: 'What if nothing is wrong?',
      a: 'Then you ship with confidence. Most repos we audit have 3-7 issues. Zero is rare, but it happens.',
    },
    {
      q: 'Refund policy?',
      a: 'Full refund before scan starts. After the report is delivered, no refund—you already have the findings.',
    },
  ];

  let openFaq = $state<number | null>(null);

  function toggleFaq(i: number) {
    openFaq = openFaq === i ? null : i;
  }
</script>

<div class="pricing-page">

  <!-- Hero -->
  <section class="hero">
    <div class="container">
      <span class="eyebrow">VibeSec</span>
      <h1 class="hero-headline">Your app ships Friday.<br/>Your API keys shipped Tuesday.</h1>
      <p class="hero-sub">We audit what your AI assistant didn't.</p>
      <a href="#plans" class="hero-cta">Run free scan on my repo</a>
    </div>
  </section>

  <!-- Stat Block -->
  <section class="stats">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-block">
          <span class="stat-label">Exposed keys found last month</span>
          <span class="stat-number">847</span>
          <span class="stat-desc">across vibe-coded repos we scanned</span>
        </div>
        <div class="stat-block">
          <span class="stat-label">RLS disabled</span>
          <span class="stat-number">62<span class="stat-pct">%</span></span>
          <span class="stat-desc">of Supabase projects had no row-level security</span>
        </div>
        <div class="stat-block">
          <span class="stat-label">Average detection time</span>
          <span class="stat-number">11<span class="stat-unit"> days</span></span>
          <span class="stat-desc">from key leak to discovery (without us: never)</span>
        </div>
      </div>
      <p class="stat-source">Based on 312 vibe-coded repos audited Mar–Aug 2026</p>
    </div>
  </section>

  <!-- Code Threat Demo -->
  <section class="threat-demo">
    <div class="container">
      <p class="threat-caption">This is what your repo looks like right now.</p>
      <div class="code-block">
        <div class="code-header">
          <span class="code-filename">.env</span>
          <span class="code-badge">committed to git</span>
        </div>
        <pre class="code-content"><code><span class="code-line"><span class="code-key">OPENAI_API_KEY</span>=sk-proj-4f8a...9c2d</span>
<span class="code-line"><span class="code-key">SUPABASE_SERVICE_ROLE</span>=eyJhbGci...kX9s</span>
<span class="code-line code-line--alert"><span class="code-key">STRIPE_SECRET_KEY</span>=sk_live_51N...rYz  <span class="code-comment">// exposed in commit a3f7b2</span></span>
<span class="code-line"><span class="code-key">DATABASE_URL</span>=postgresql://admin:pass123@db.render.com:5432/prod</span></code></pre>
      </div>
    </div>
  </section>

  <!-- Pricing Cards -->
  <section class="plans" id="plans">
    <div class="container">
      <h2 class="section-headline">Pricing</h2>
      <p class="section-sub">No tiers to decode. Pick what fits.</p>

      <div class="plans-grid">
        {#each plans as plan}
          <div class="plan-card" class:plan-card--popular={plan.popular}>
            <div class="plan-header">
              {#if plan.popular}
                <span class="plan-popular-label">Most picked</span>
              {/if}
              <h3 class="plan-name">{plan.name}</h3>
              <p class="plan-desc">{plan.desc}</p>
            </div>

            <div class="plan-price">
              <span class="plan-currency">&#8361;</span>
              <span class="plan-amount">{plan.priceLabel}</span>
              {#if plan.period}
                <span class="plan-period">{plan.period}</span>
              {/if}
            </div>

            <button
              class="plan-cta"
              class:plan-cta--primary={plan.ctaStyle === 'primary'}
              onclick={() => goto(`${base}/diagnose`)}
            >
              {plan.cta}
            </button>

            <div class="plan-features">
              {#each features as feat}
                {@const val = plan.id === 'starter' ? feat.starter : plan.id === 'pro' ? feat.pro : feat.full}
                <div class="plan-feature-row">
                  <span class="plan-feature-label">{feat.label}</span>
                  <span class="plan-feature-value" class:val-check={val === 'check'} class:val-minus={val === 'minus'}>
                    {#if val === 'check'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    {:else if val === 'minus'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12h14"/></svg>
                    {:else}
                      {val}
                    {/if}
                  </span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Comparison Table -->
  <section class="comparison">
    <div class="container">
      <h2 class="section-headline">Compare plans</h2>
      <div class="table-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th class="compare-feature-col"></th>
              <th class="compare-plan-col">Starter</th>
              <th class="compare-plan-col">Pro</th>
              <th class="compare-plan-col">Full Audit</th>
            </tr>
          </thead>
          <tbody>
            {#each features as feat}
              <tr>
                <td class="compare-feature-col">{feat.label}</td>
                {#each [feat.starter, feat.pro, feat.full] as val}
                  <td class:cell-check={val === 'check'} class:cell-minus={val === 'minus'}>
                    {#if val === 'check'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    {:else if val === 'minus'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12h14"/></svg>
                    {:else}{val}{/if}
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="faq">
    <div class="container">
      <h2 class="section-headline">FAQ</h2>
      <div class="faq-list">
        {#each faqs as faq, i}
          <button class="faq-item" onclick={() => toggleFaq(i)} aria-expanded={openFaq === i}>
            <div class="faq-question">
              <span>{faq.q}</span>
              <svg class="faq-chevron" class:faq-chevron--open={openFaq === i} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            {#if openFaq === i}
              <p class="faq-answer">{faq.a}</p>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </section>

  <!-- Footer CTA -->
  <section class="footer-cta">
    <div class="container">
      <p class="footer-cta-text">Not sure? Send your repo URL.<br/>We'll send back a 1-page risk summary in 24h. Free.</p>
      <button class="footer-cta-btn" onclick={() => goto(`${base}/diagnose`)}>Send my repo URL</button>
    </div>
  </section>

</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

  .pricing-page {
    --bg:        #fbfbfd;
    --surface:   #ffffff;
    --surface-2: #f5f5f7;
    --text:      #1d1d1f;
    --text-2:    #6e6e73;
    --text-3:    #86868b;
    --border:    rgba(0,0,0,0.08);
    --accent:    #0071e3;
    --accent-hover: #0077ed;
    --alert:     #d70015;
    --mono-bg:   #1d1d1f;
    --mono-text: #f5f5f7;
    --font: "SF Pro Display", "Inter Tight", -apple-system,
            "Pretendard Variable", system-ui, sans-serif;
    --mono: "JetBrains Mono", "SF Mono", "Menlo", monospace;
    --r-card: 12px;
    --r-btn:  980px;
    --r-code: 8px;
    --s1: 8px;  --s2: 16px; --s3: 24px; --s4: 40px;
    --s5: 64px; --s6: 96px; --s7: 160px;
    --shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06);
    --ease: cubic-bezier(0.4, 0, 0.2, 1);

    font-family: var(--font);
    color: var(--text);
    background: var(--bg);
    -webkit-font-smoothing: antialiased;
  }

  .container {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 var(--s3);
  }

  /* ─── Hero ─── */
  .hero {
    padding: var(--s7) 0 var(--s6);
    text-align: center;
  }

  .eyebrow {
    display: inline-block;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-3);
    margin-bottom: var(--s3);
  }

  .hero-headline {
    font-size: 64px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.05;
    margin: 0 0 var(--s3);
    color: var(--text);
  }

  .hero-sub {
    font-size: 21px;
    font-weight: 400;
    letter-spacing: -0.01em;
    line-height: 1.5;
    color: var(--text-2);
    margin: 0 0 var(--s4);
  }

  .hero-cta {
    display: inline-block;
    padding: 14px 32px;
    background: var(--accent);
    color: #fff;
    font-size: 17px;
    font-weight: 500;
    letter-spacing: -0.01em;
    border-radius: var(--r-btn);
    text-decoration: none;
    transition: background 0.3s var(--ease);
  }
  .hero-cta:hover { background: var(--accent-hover); }

  /* ─── Stats ─── */
  .stats {
    padding: var(--s6) 0 var(--s7);
    background: var(--bg);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--s3);
  }

  .stat-block {
    text-align: center;
    padding: var(--s4) var(--s3);
  }

  .stat-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: var(--text-3);
    text-transform: uppercase;
    margin-bottom: var(--s2);
  }

  .stat-number {
    display: block;
    font-family: var(--mono);
    font-size: 48px;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--alert);
    font-variant-numeric: tabular-nums;
    margin-bottom: var(--s1);
  }

  .stat-pct, .stat-unit {
    font-size: 24px;
    color: var(--alert);
  }

  .stat-desc {
    display: block;
    font-size: 15px;
    color: var(--text-2);
    line-height: 1.4;
  }

  .stat-source {
    text-align: center;
    font-size: 13px;
    color: var(--text-3);
    margin: var(--s4) 0 0;
    font-style: italic;
  }

  /* ─── Threat Demo ─── */
  .threat-demo {
    padding: 0 0 var(--s7);
  }

  .threat-caption {
    font-size: 15px;
    color: var(--text-3);
    text-align: center;
    margin: 0 0 var(--s2);
  }

  .code-block {
    background: var(--mono-bg);
    border-radius: var(--r-code);
    overflow: hidden;
    max-width: 720px;
    margin: 0 auto;
  }

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--s2) var(--s3);
    border-bottom: 0.5px solid rgba(255,255,255,0.08);
  }

  .code-filename {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--mono-text);
    opacity: 0.7;
  }

  .code-badge {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--alert);
    padding: 2px 8px;
    border: 0.5px solid var(--alert);
    border-radius: 4px;
    opacity: 0.8;
  }

  .code-content {
    padding: var(--s3);
    margin: 0;
    overflow-x: auto;
  }

  .code-content code {
    font-family: var(--mono);
    font-size: 14px;
    line-height: 1.7;
    color: var(--mono-text);
  }

  .code-line {
    display: block;
  }

  .code-line--alert {
    background: rgba(215, 0, 21, 0.1);
    margin: 0 calc(var(--s3) * -1);
    padding: 0 var(--s3);
  }

  .code-key {
    color: #a8d8ea;
  }

  .code-comment {
    color: var(--text-3);
    font-style: italic;
  }

  /* ─── Section ─── */
  .section-headline {
    font-size: 48px;
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.1;
    margin: 0 0 var(--s2);
    text-align: center;
    color: var(--text);
  }

  .section-sub {
    font-size: 17px;
    font-weight: 400;
    letter-spacing: -0.01em;
    line-height: 1.5;
    color: var(--text-2);
    text-align: center;
    margin: 0 0 var(--s5);
  }

  /* ─── Plans ─── */
  .plans {
    padding: var(--s7) 0;
    background: var(--bg);
  }

  .plans-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--s3);
  }

  .plan-card {
    background: var(--surface);
    border: 0.5px solid var(--border);
    border-radius: var(--r-card);
    padding: var(--s4);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
  }
  .plan-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  .plan-card--popular {
    border: 2px solid var(--border);
  }

  .plan-header { margin-bottom: var(--s4); }

  .plan-popular-label {
    display: inline-block;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    margin-bottom: var(--s1);
  }

  .plan-name {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.2;
    margin: 0 0 var(--s1);
  }

  .plan-desc {
    font-size: 15px;
    color: var(--text-2);
    line-height: 1.5;
    margin: 0;
  }

  .plan-price {
    display: flex;
    align-items: baseline;
    gap: 2px;
    margin-bottom: var(--s3);
  }

  .plan-currency {
    font-size: 20px;
    font-weight: 500;
    color: var(--text-3);
    align-self: flex-start;
    margin-top: 8px;
  }

  .plan-amount {
    font-family: var(--mono);
    font-size: 48px;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }

  .plan-period {
    font-size: 13px;
    color: var(--text-3);
    margin-left: 4px;
  }

  .plan-cta {
    width: 100%;
    padding: 14px 0;
    border-radius: var(--r-btn);
    font-size: 15px;
    font-weight: 500;
    font-family: var(--font);
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: background 0.3s var(--ease);
    border: 0.5px solid var(--border);
    background: var(--surface);
    color: var(--text);
    margin-bottom: var(--s3);
  }
  .plan-cta:hover { background: var(--surface-2); }

  .plan-cta--primary {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }
  .plan-cta--primary:hover { background: var(--accent-hover); }

  .plan-features {
    border-top: 0.5px solid var(--border);
    padding-top: var(--s3);
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--s2);
  }

  .plan-feature-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .plan-feature-label {
    font-size: 14px;
    color: var(--text-2);
  }

  .plan-feature-value {
    font-size: 13px;
    color: var(--text);
    font-weight: 500;
  }
  .val-check { color: var(--text); }
  .val-minus { color: var(--text-3); }

  /* ─── Comparison ─── */
  .comparison {
    padding: var(--s7) 0;
    background: var(--surface-2);
  }

  .table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .compare-table {
    width: 100%;
    border-collapse: collapse;
  }

  .compare-table th {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-3);
    padding: var(--s2);
    text-align: center;
    border-bottom: 0.5px solid var(--border);
  }

  .compare-table td {
    padding: var(--s2);
    text-align: center;
    border-bottom: 0.5px solid var(--border);
    color: var(--text-2);
    font-size: 14px;
  }

  .compare-feature-col {
    text-align: left !important;
    font-weight: 500;
    color: var(--text) !important;
    min-width: 180px;
    font-size: 14px !important;
  }

  .compare-plan-col { min-width: 120px; }

  .cell-check { color: var(--text) !important; }
  .cell-minus { color: var(--text-3) !important; }

  /* ─── FAQ ─── */
  .faq {
    padding: var(--s7) 0;
    background: var(--bg);
  }

  .faq-list {
    max-width: 720px;
    margin: 0 auto;
  }

  .faq-item {
    display: block;
    width: 100%;
    background: none;
    border: none;
    border-bottom: 0.5px solid var(--border);
    padding: var(--s3) 0;
    cursor: pointer;
    text-align: left;
    font-family: var(--font);
  }

  .faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 17px;
    font-weight: 500;
    color: var(--text);
  }

  .faq-chevron {
    flex-shrink: 0;
    transition: transform 0.3s var(--ease);
    color: var(--text-3);
  }
  .faq-chevron--open { transform: rotate(180deg); }

  .faq-answer {
    font-size: 17px;
    font-weight: 400;
    line-height: 1.5;
    color: var(--text-2);
    margin: var(--s2) 0 0;
    padding-right: var(--s4);
  }

  /* ─── Footer CTA ─── */
  .footer-cta {
    padding: var(--s7) 0;
    background: var(--surface-2);
    text-align: center;
  }

  .footer-cta-text {
    font-size: 24px;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.4;
    color: var(--text);
    margin: 0 0 var(--s4);
  }

  .footer-cta-btn {
    display: inline-block;
    padding: 14px 32px;
    background: var(--text);
    color: var(--surface);
    font-size: 15px;
    font-weight: 500;
    font-family: var(--font);
    border-radius: var(--r-btn);
    border: none;
    cursor: pointer;
    transition: background 0.3s var(--ease);
  }
  .footer-cta-btn:hover { background: #333; }

  /* ─── Responsive ─── */
  @media (max-width: 768px) {
    .hero { padding: var(--s6) 0 var(--s5); }
    .hero-headline { font-size: 40px; }
    .section-headline { font-size: 32px; }
    .plans, .comparison, .faq, .footer-cta, .stats { padding: var(--s6) 0; }
    .plans-grid, .stats-grid { grid-template-columns: 1fr; }
    .plan-amount { font-size: 40px; }
    .stat-number { font-size: 36px; }
    .compare-feature-col { min-width: 120px; }
    .footer-cta-text { font-size: 20px; }
  }

  @media (max-width: 375px) {
    .hero-headline { font-size: 32px; }
    .plan-amount { font-size: 32px; }
    .stat-number { font-size: 32px; }
    .container { padding: 0 var(--s2); }
  }
</style>
