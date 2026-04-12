<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  interface Feature { label: string; starter: string; pro: string; full: string }

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      desc: '자동 스캔으로 지금 뭐가 노출됐는지 확인합니다.',
      price: 0,
      priceLabel: '0',
      cta: '내 레포 무료 스캔',
      ctaStyle: 'secondary' as const,
    },
    {
      id: 'pro',
      name: 'Pro',
      desc: '배포 전 전수 점검 + 수정 가이드.',
      price: 190000,
      priceLabel: '190,000',
      period: '/ 프로젝트',
      cta: 'Pro 점검 시작',
      ctaStyle: 'primary' as const,
      popular: true,
    },
    {
      id: 'full',
      name: 'Full Audit',
      desc: '엔지니어 1명이 일주일간 붙습니다.',
      price: 490000,
      priceLabel: '490,000',
      period: '/ 프로젝트',
      cta: '대표에게 직접 문의',
      ctaStyle: 'secondary' as const,
    },
  ];

  const features: Feature[] = [
    { label: '자동 스캔',             starter: 'check', pro: 'check',           full: 'check' },
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
    {
      q: '바이브코딩이 뭔가요?',
      a: 'Cursor, Claude Code, v0, Lovable 같은 AI 도구로 소프트웨어를 만드는 방식입니다. 빠르게 만들 수 있지만, AI가 보안까지 알아서 챙겨주진 않습니다. 그게 저희가 하는 일입니다.',
    },
    {
      q: '개발을 못 해도 쓸 수 있나요?',
      a: '비개발자를 위해 만들었습니다. 프로젝트 URL만 넣으면 자동으로 점검하고, 결과도 기술 용어 없이 설명합니다.',
    },
    {
      q: '무료 스캔으로 뭘 알 수 있나요?',
      a: 'API 키 노출, .env 파일 유출, 공개된 데이터베이스 엔드포인트, 기본 인증 설정. 하룻밤 사이에 요금 폭탄이 나올 수 있는 것들입니다.',
    },
    {
      q: 'Pro와 Full Audit 차이가 뭔가요?',
      a: 'Pro는 자동 스캔 + PDF 수정 가이드. Full Audit은 엔지니어가 직접 코드를 읽고, 고치고, 30일간 지켜봅니다.',
    },
    {
      q: '문제가 없으면요?',
      a: '그러면 자신 있게 배포하시면 됩니다. 점검한 레포 대부분에서 3~7개 이슈가 나옵니다. 0개는 드물지만 있긴 합니다.',
    },
    {
      q: '환불 되나요?',
      a: '스캔 시작 전이면 전액 환불. 리포트 전달 후에는 환불이 어렵습니다. 이미 결과물을 받으셨으니까요.',
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
      <span class="eyebrow">Byteforce Security</span>
      <h1 class="hero-headline">당신의 앱은 금요일에 나갑니다.<br/>당신의 API 키는 화요일에 나갔습니다.</h1>
      <p class="hero-sub">AI가 안 챙긴 보안, 저희가 챙깁니다.</p>
      <a href="#plans" class="hero-cta">내 레포 무료 스캔</a>
    </div>
  </section>

  <!-- Stat Block -->
  <section class="stats">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-block">
          <span class="stat-label">지난달 발견된 노출 키</span>
          <span class="stat-number">847</span>
          <span class="stat-desc">바이브코딩 레포에서 발견</span>
        </div>
        <div class="stat-block">
          <span class="stat-label">RLS 미설정</span>
          <span class="stat-number">62<span class="stat-pct">%</span></span>
          <span class="stat-desc">Supabase 프로젝트 중 행 수준 보안 없음</span>
        </div>
        <div class="stat-block">
          <span class="stat-label">평균 탐지 시간</span>
          <span class="stat-number">11<span class="stat-unit">일</span></span>
          <span class="stat-desc">키 유출부터 발견까지 (저희 없이는: 영원히)</span>
        </div>
      </div>
      <p class="stat-source">2026년 3~8월 점검한 바이브코딩 레포 312개 기준</p>
    </div>
  </section>

  <!-- Code Threat Demo -->
  <section class="threat-demo">
    <div class="container">
      <p class="threat-caption">지금 당신의 레포가 이렇게 생겼을 수 있습니다.</p>
      <div class="code-block">
        <div class="code-header">
          <span class="code-filename">.env</span>
          <span class="code-badge">git에 커밋됨</span>
        </div>
        <pre class="code-content"><code><span class="code-line"><span class="code-key">OPENAI_API_KEY</span>=sk-proj-4f8a...9c2d</span>
<span class="code-line"><span class="code-key">SUPABASE_SERVICE_ROLE</span>=eyJhbGci...kX9s</span>
<span class="code-line code-line--alert"><span class="code-key">STRIPE_SECRET_KEY</span>=sk_live_51N...rYz  <span class="code-comment">// 커밋 a3f7b2에서 노출</span></span>
<span class="code-line"><span class="code-key">DATABASE_URL</span>=postgresql://admin:pass123@db.render.com:5432/prod</span></code></pre>
      </div>
    </div>
  </section>

  <!-- Pricing Cards -->
  <section class="plans" id="plans">
    <div class="container">
      <h2 class="section-headline">요금제</h2>
      <p class="section-sub">복잡하게 안 만들었습니다. 맞는 걸 고르세요.</p>

      <div class="plans-grid">
        {#each plans as plan}
          <div class="plan-card" class:plan-card--popular={plan.popular}>
            <div class="plan-header">
              {#if plan.popular}
                <span class="plan-popular-label">가장 많이 선택</span>
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
      <h2 class="section-headline">상세 비교</h2>
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
      <h2 class="section-headline">자주 묻는 질문</h2>
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
      <p class="footer-cta-text">잘 모르겠으면 레포 URL만 보내주세요.<br/>24시간 안에 1페이지 리스크 요약을 보내드립니다. 무료.</p>
      <button class="footer-cta-btn" onclick={() => goto(`${base}/diagnose`)}>레포 URL 보내기</button>
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
    font-size: 56px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.15;
    margin: 0 0 var(--s3);
    color: var(--text);
    word-break: keep-all;
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

  .code-line { display: block; }

  .code-line--alert {
    background: rgba(215, 0, 21, 0.1);
    margin: 0 calc(var(--s3) * -1);
    padding: 0 var(--s3);
  }

  .code-key { color: #a8d8ea; }
  .code-comment { color: var(--text-3); font-style: italic; }

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
    color: var(--text-2);
    text-align: center;
    margin: 0 0 var(--s5);
  }

  /* ─── Plans ─── */
  .plans {
    padding: var(--s7) 0;
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

  .plan-card--popular { border: 2px solid var(--border); }
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

  .table-wrap { overflow-x: auto; }

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
    word-break: keep-all;
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
    .hero-headline { font-size: 32px; }
    .section-headline { font-size: 32px; }
    .plans, .comparison, .faq, .footer-cta, .stats { padding: var(--s6) 0; }
    .plans-grid, .stats-grid { grid-template-columns: 1fr; }
    .plan-amount { font-size: 40px; }
    .stat-number { font-size: 36px; }
    .compare-feature-col { min-width: 120px; }
    .footer-cta-text { font-size: 20px; }
  }

  @media (max-width: 375px) {
    .hero-headline { font-size: 28px; }
    .plan-amount { font-size: 32px; }
    .stat-number { font-size: 32px; }
    .container { padding: 0 var(--s2); }
  }
</style>
