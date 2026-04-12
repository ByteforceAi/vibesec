<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  // --- Plans ---
  interface Feature { label: string; starter: string; pro: string; full: string }

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      desc: '바이브코딩 결과물의 기본 건강 상태를 확인합니다.',
      price: 0,
      priceLabel: '무료',
      cta: '무료 진단 시작',
      ctaStyle: 'secondary' as const,
    },
    {
      id: 'pro',
      name: 'Pro',
      desc: '배포 전 필수 보안 항목을 점검하고 수정합니다.',
      price: 190000,
      priceLabel: '190,000',
      period: '/ 프로젝트',
      cta: 'Pro 시작하기',
      ctaStyle: 'primary' as const,
      popular: true,
    },
    {
      id: 'full',
      name: 'Full Audit',
      desc: '프로덕션 레벨의 종합 보안 감사와 하드닝.',
      price: 490000,
      priceLabel: '490,000',
      period: '/ 프로젝트',
      cta: '상담 신청',
      ctaStyle: 'secondary' as const,
    },
  ];

  const features: Feature[] = [
    { label: '자동 스캔', starter: 'check', pro: 'check', full: 'check' },
    { label: '취약점 리포트', starter: '요약', pro: '상세', full: '상세 + 코드 위치' },
    { label: '비밀키 노출 검사', starter: 'check', pro: 'check', full: 'check' },
    { label: '인증 체계 점검', starter: 'minus', pro: 'check', full: 'check' },
    { label: '데이터베이스 보안', starter: 'minus', pro: 'check', full: 'check' },
    { label: 'API 엔드포인트 검증', starter: 'minus', pro: 'check', full: 'check' },
    { label: '의존성 취약점 분석', starter: 'minus', pro: 'check', full: 'check' },
    { label: '수정 가이드 제공', starter: 'minus', pro: 'PDF', full: '1:1 코칭' },
    { label: '직접 수정 대행', starter: 'minus', pro: 'minus', full: 'check' },
    { label: '배포 후 모니터링', starter: 'minus', pro: '7일', full: '30일' },
    { label: '긴급 대응 (SLA)', starter: 'minus', pro: 'minus', full: '4시간 이내' },
    { label: '재점검 보증', starter: 'minus', pro: '14일', full: '30일' },
  ];

  const faqs = [
    {
      q: '바이브코딩이 뭔가요?',
      a: 'Cursor, Claude Code, v0, Lovable 같은 AI 도구로 소프트웨어를 만드는 방식입니다. 코드를 직접 쓰지 않아도 제품을 만들 수 있지만, 보안은 AI가 자동으로 챙겨주지 않습니다.',
    },
    {
      q: '개발을 못 해도 사용할 수 있나요?',
      a: 'VibeSec은 비개발자를 위해 만들어졌습니다. 프로젝트 URL만 넣으면 자동으로 점검하고, 결과도 기술 용어 없이 설명합니다.',
    },
    {
      q: 'Starter로 뭘 알 수 있나요?',
      a: '비밀키 노출, 기본적인 설정 오류, 공개된 취약점을 빠르게 스캔합니다. 심각한 문제가 있는지 1분 안에 파악할 수 있습니다.',
    },
    {
      q: 'Pro와 Full Audit의 차이가 뭔가요?',
      a: 'Pro는 자동화된 점검 + 수정 가이드입니다. Full Audit은 전문가가 직접 코드를 읽고, 수정까지 대행하며, 30일간 모니터링합니다.',
    },
    {
      q: '결제는 어떻게 하나요?',
      a: '카드 결제와 카카오페이를 지원합니다. 청구서가 필요하시면 상담을 통해 안내드립니다.',
    },
    {
      q: '환불 정책이 있나요?',
      a: '점검 시작 전이면 전액 환불됩니다. 점검 완료 후에는 결과 리포트가 제공되므로 환불이 어렵습니다.',
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
      <h1 class="hero-headline">Security for the<br/>vibe-coded era.</h1>
      <p class="hero-sub">AI로 만들었으면, 보안도 전문가에게.</p>
      <a href="#plans" class="hero-cta">요금제 보기</a>
    </div>
  </section>

  <!-- Pricing Cards -->
  <section class="plans" id="plans">
    <div class="container">
      <h2 class="section-headline">요금제</h2>
      <p class="section-sub">프로젝트 규모와 상황에 맞는 플랜을 선택하세요.</p>

      <div class="plans-grid">
        {#each plans as plan}
          <div class="plan-card" class:plan-card--popular={plan.popular}>
            <div class="plan-header">
              {#if plan.popular}
                <span class="plan-popular-label">Most popular</span>
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
                  <span class="plan-feature-value" class:plan-feature-value--check={val === 'check'} class:plan-feature-value--minus={val === 'minus'}>
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
              <th>Starter</th>
              <th>Pro</th>
              <th>Full Audit</th>
            </tr>
          </thead>
          <tbody>
            {#each features as feat}
              <tr>
                <td class="compare-feature-col">{feat.label}</td>
                <td class:cell-check={feat.starter === 'check'} class:cell-minus={feat.starter === 'minus'}>
                  {#if feat.starter === 'check'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  {:else if feat.starter === 'minus'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12h14"/></svg>
                  {:else}{feat.starter}{/if}
                </td>
                <td class:cell-check={feat.pro === 'check'} class:cell-minus={feat.pro === 'minus'}>
                  {#if feat.pro === 'check'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  {:else if feat.pro === 'minus'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12h14"/></svg>
                  {:else}{feat.pro}{/if}
                </td>
                <td class:cell-check={feat.full === 'check'} class:cell-minus={feat.full === 'minus'}>
                  {#if feat.full === 'check'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  {:else if feat.full === 'minus'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12h14"/></svg>
                  {:else}{feat.full}{/if}
                </td>
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
      <h2 class="section-headline">어떤 플랜이 맞을지 모르겠다면</h2>
      <p class="section-sub">프로젝트 상황을 듣고 맞는 플랜을 추천해드립니다.</p>
      <button class="footer-cta-btn" onclick={() => goto(`${base}/incident`)}>상담 신청하기</button>
    </div>
  </section>

</div>

<style>
  /* ─── Tokens (scoped to this page) ─── */
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
    --font: "SF Pro Display", "Inter Tight", -apple-system,
            "Pretendard Variable", system-ui, sans-serif;
    --r-card: 18px;
    --r-btn:  980px;
    --s1: 8px;  --s2: 16px; --s3: 24px; --s4: 40px;
    --s5: 64px; --s6: 96px; --s7: 160px;
    --shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06);
    --ease: cubic-bezier(0.4, 0, 0.2, 1);

    font-family: var(--font);
    color: var(--text);
    background: var(--bg);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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

  .hero-headline {
    font-size: 72px;
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

  /* ─── Section headings ─── */
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
    border: 1px solid var(--border);
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
    background: var(--surface-2);
  }

  .plan-header { margin-bottom: var(--s4); }

  .plan-popular-label {
    display: inline-block;
    font-size: 13px;
    font-weight: 500;
    color: var(--accent);
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
    font-size: 24px;
    font-weight: 600;
    color: var(--text);
    align-self: flex-start;
    margin-top: 8px;
  }

  .plan-amount {
    font-size: 56px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--text);
  }

  .plan-period {
    font-size: 15px;
    color: var(--text-3);
    margin-left: 4px;
  }

  .plan-cta {
    width: 100%;
    padding: 14px 0;
    border-radius: var(--r-btn);
    font-size: 17px;
    font-weight: 500;
    font-family: var(--font);
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: background 0.3s var(--ease);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--accent);
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
    border-top: 1px solid var(--border);
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
    font-size: 15px;
    color: var(--text-2);
  }

  .plan-feature-value {
    font-size: 14px;
    color: var(--text);
    font-weight: 500;
  }
  .plan-feature-value--check { color: var(--text); }
  .plan-feature-value--minus { color: var(--text-3); }

  /* ─── Comparison Table ─── */
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
    font-size: 15px;
  }

  .compare-table th {
    font-weight: 600;
    font-size: 15px;
    color: var(--text);
    padding: var(--s2);
    text-align: center;
    border-bottom: 1px solid var(--border);
  }

  .compare-table td {
    padding: var(--s2);
    text-align: center;
    border-bottom: 1px solid var(--border);
    color: var(--text-2);
    font-size: 14px;
  }

  .compare-feature-col {
    text-align: left !important;
    font-weight: 500;
    color: var(--text) !important;
    min-width: 180px;
  }

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
    display: flex;
    flex-direction: column;
  }

  .faq-item {
    display: block;
    width: 100%;
    background: none;
    border: none;
    border-bottom: 1px solid var(--border);
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
    font-weight: 600;
    letter-spacing: -0.01em;
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

  .footer-cta-btn {
    display: inline-block;
    padding: 14px 32px;
    background: var(--text);
    color: var(--surface);
    font-size: 17px;
    font-weight: 500;
    font-family: var(--font);
    letter-spacing: -0.01em;
    border-radius: var(--r-btn);
    border: none;
    cursor: pointer;
    transition: background 0.3s var(--ease);
  }
  .footer-cta-btn:hover { background: #333; }

  /* ─── Responsive ─── */
  @media (max-width: 768px) {
    .hero { padding: var(--s6) 0 var(--s5); }
    .hero-headline { font-size: 44px; }
    .hero-sub { font-size: 17px; }
    .section-headline { font-size: 32px; }
    .plans, .comparison, .faq, .footer-cta { padding: var(--s6) 0; }
    .plans-grid { grid-template-columns: 1fr; }
    .plan-amount { font-size: 44px; }
    .compare-table { font-size: 13px; }
    .compare-feature-col { min-width: 120px; }
  }

  @media (max-width: 375px) {
    .hero-headline { font-size: 36px; }
    .plan-amount { font-size: 36px; }
    .container { padding: 0 var(--s2); }
  }
</style>
