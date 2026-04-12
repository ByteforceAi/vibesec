<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/loader';
  import { addToCart, cartItems } from '$lib/stores/cart';
  import packagesIndex from '$content/packages/index.json';

  const packageFiles = import.meta.glob('$content/packages/**/*.json', {
    import: 'default',
    eager: true,
  }) as Record<string, unknown>;

  interface PkgDetail {
    id: string;
    name: string;
    name_kr: string;
    subtitle_kr: string;
    severity: string;
    price_krw: number;
    duration: string;
    symptoms: string[];
    description_kr: string;
    fixes_vulns: string[];
    includes: string[];
    warranty_days: number;
    category: string;
  }

  function isPkgDetail(data: unknown): data is PkgDetail {
    return typeof data === 'object' && data !== null && 'id' in data && 'name_kr' in data;
  }

  const pkgId = $derived($page.params.id);

  const pkg = $derived((): PkgDetail | null => {
    for (const data of Object.values(packageFiles)) {
      if (isPkgDetail(data) && data.id === pkgId) return data;
    }
    return null;
  });

  interface PkgSummary {
    id: string;
    category: string;
    name_kr: string;
    price_krw: number;
    severity: string;
  }
  const allPkgs = packagesIndex as PkgSummary[];
  const relatedPkgs = $derived(
    pkg()
      ? allPkgs.filter((p) => p.category === pkg()!.category && p.id !== pkgId).slice(0, 3)
      : []
  );

  let inCart = $state(false);
  $effect(() => {
    const unsub = cartItems.subscribe((items) => {
      inCart = items.some((i) => i.packageId === pkgId);
    });
    return unsub;
  });

  function handleAddToCart() { if (pkgId) addToCart(pkgId); }
  function handleBuyNow() { if (pkgId) addToCart(pkgId); goto(`${base}/checkout`); }

  function formatPrice(price: number): string {
    if (price === 0) return '무료';
    return price.toLocaleString('ko-KR');
  }

  function sevClass(sev: string): string {
    if (sev === 'critical' || sev === 'high') return 'sev--crit';
    if (sev === 'medium') return 'sev--warn';
    return 'sev--ok';
  }
</script>

<div class="page">

  <header class="bar">
    <button class="bar-back" onclick={() => goto(`${base}/packages`)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
    </button>
    <span class="bar-title">{pkg()?.name_kr ?? ''}</span>
    <span class="bar-spacer"></span>
  </header>

  {#if pkg()}
    {@const p = pkg()!}
    <div class="content">

      <!-- Header -->
      <section class="pkg-header">
        <span class="pkg-cat {sevClass(p.severity)}">{p.category}</span>
        <h1 class="pkg-name">{p.name_kr}</h1>
        <p class="pkg-subtitle">{p.subtitle_kr}</p>
        <div class="pkg-meta">
          <span class="pkg-price">W{formatPrice(p.price_krw)}</span>
          <span class="pkg-duration">{p.duration}</span>
        </div>
      </section>

      <!-- Description -->
      <section class="section-card">
        <p class="section-body">{p.description_kr}</p>
      </section>

      <!-- Symptoms -->
      {#if p.symptoms && p.symptoms.length > 0}
        <section class="section-card">
          <h3 class="section-label">이런 증상이 있으면</h3>
          <ul class="list">
            {#each p.symptoms as symptom}
              <li class="list-item">{symptom}</li>
            {/each}
          </ul>
        </section>
      {/if}

      <!-- Includes -->
      {#if p.includes && p.includes.length > 0}
        <section class="section-card">
          <h3 class="section-label">포함 항목</h3>
          <ul class="list">
            {#each p.includes as item}
              <li class="list-item">
                <svg class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#32d74b" stroke-width="2" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                {item}
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <!-- Warranty -->
      {#if p.warranty_days > 0}
        <section class="section-card">
          <div class="warranty-row">
            <span class="warranty-days">{p.warranty_days}일</span>
            <span class="warranty-label">보증 기간</span>
          </div>
        </section>
      {/if}

      <!-- Related packages -->
      {#if relatedPkgs.length > 0}
        <section class="related">
          <h3 class="group-head">관련 패키지</h3>
          {#each relatedPkgs as rel}
            <button class="rel-row" onclick={() => goto(`${base}/packages/${rel.id}`)}>
              <div class="rel-info">
                <span class="rel-name">{rel.name_kr}</span>
                <span class="rel-price">W{formatPrice(rel.price_krw)}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          {/each}
        </section>
      {/if}

      <!-- CTA -->
      <section class="cta-section">
        {#if inCart}
          <button class="btn-outline btn-full" onclick={() => goto(`${base}/checkout`)}>
            {t('checkout.payment_complete.complete_title', '') || '결제하기'}
          </button>
        {:else}
          <button class="cta-primary" onclick={handleAddToCart}>담기</button>
          <button class="btn-outline btn-full" onclick={handleBuyNow}>
            {t('checkout.payment_method.card_payment', '') || '바로 결제'}
          </button>
        {/if}
      </section>

    </div>
  {:else}
    <div class="not-found">
      <p class="not-found-text">{t('errors.page_not_found_404.body', '')}</p>
      <button class="btn-outline" onclick={() => goto(`${base}/packages`)}>
        {t('errors.page_not_found_404.cta', '') || '돌아가기'}
      </button>
    </div>
  {/if}

</div>

<style>
  .page {
    --black: #000000;
    --s1: #060608;
    --s2: #0c0c0e;
    --s3: #141416;
    --tx: #ffffff;
    --tx2: #9a9a9f;
    --tx3: #4a4a4f;
    --brd: rgba(255,255,255,0.055);
    --ok: #32d74b;
    --warn-color: #ff9500;
    --crit-color: #ff453a;
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
    --mono: "JetBrains Mono", "SF Mono", monospace;

    display: flex; flex-direction: column; min-height: 100dvh;
    background: var(--black); color: var(--tx); font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }

  /* Bar */
  .bar {
    position: sticky; top: 0; z-index: 90; height: 48px;
    display: flex; align-items: center; gap: 12px;
    padding: 0 24px; background: var(--black); border-bottom: 1px solid var(--brd);
  }
  .bar-back {
    background: none; border: none; color: var(--tx2); cursor: pointer;
    display: flex; align-items: center; padding: 4px; transition: color 0.15s;
  }
  .bar-back:hover { color: var(--tx); }
  .bar-title { font-size: 14px; font-weight: 600; color: var(--tx); }
  .bar-spacer { flex: 1; }

  .content {
    flex: 1; padding: 24px 24px 32px; display: flex; flex-direction: column; gap: 24px;
  }

  /* Pkg header */
  .pkg-header {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 12px; padding: 24px;
    background: var(--s1); border: 1px solid var(--brd); border-radius: 8px;
  }

  .pkg-cat {
    font-size: 11px; font-weight: 500; padding: 2px 10px;
    border-radius: 4px; border: 1px solid var(--brd); background: var(--s2);
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .sev--crit { color: var(--crit-color); }
  .sev--warn { color: var(--warn-color); }
  .sev--ok { color: var(--ok); }

  .pkg-name { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin: 0; color: var(--tx); }
  .pkg-subtitle { font-size: 14px; color: var(--tx2); margin: 0; line-height: 1.5; }

  .pkg-meta { display: flex; gap: 24px; align-items: center; }
  .pkg-price { font-family: var(--mono); font-size: 22px; font-weight: 500; color: var(--tx); }
  .pkg-duration { font-size: 12px; color: var(--tx3); }

  /* Section card */
  .section-card {
    padding: 20px; background: var(--s1); border: 1px solid var(--brd); border-radius: 8px;
    display: flex; flex-direction: column; gap: 12px;
  }

  .section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--tx3); margin: 0;
  }

  .section-body { font-size: 14px; color: var(--tx2); margin: 0; line-height: 1.6; }

  .list { margin: 0; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .list-item {
    font-size: 14px; color: var(--tx2); line-height: 1.5;
    display: flex; align-items: center; gap: 8px;
  }

  .check-icon { flex-shrink: 0; }

  .warranty-row { display: flex; align-items: center; gap: 12px; }
  .warranty-days { font-family: var(--mono); font-size: 20px; font-weight: 500; color: var(--ok); }
  .warranty-label { font-size: 14px; color: var(--tx2); }

  /* Related */
  .related { display: flex; flex-direction: column; }

  .group-head {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--tx3); margin: 0 0 8px;
    padding-bottom: 8px; border-bottom: 1px solid var(--brd);
  }

  .rel-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid var(--brd);
    background: none; border-left: none; border-right: none; border-top: none;
    width: 100%; font-family: var(--font); cursor: pointer;
    text-align: left; color: var(--tx3); transition: color 0.15s;
  }
  .rel-row:hover { color: var(--tx2); }

  .rel-info { display: flex; flex-direction: column; gap: 2px; }
  .rel-name { font-size: 14px; color: var(--tx); }
  .rel-price { font-family: var(--mono); font-size: 12px; color: var(--tx3); }

  /* CTA */
  .cta-section { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }

  .cta-primary {
    width: 100%; padding: 10px 28px; border-radius: 6px; border: none;
    background: var(--tx); color: var(--black);
    font-family: var(--font); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
  }
  .cta-primary:hover { background: #e0e0e0; }

  .btn-outline {
    padding: 8px 20px; border-radius: 6px; border: 1px solid var(--brd);
    background: transparent; color: var(--tx2); font-family: var(--font);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-outline:hover { color: var(--tx); border-color: rgba(255,255,255,0.15); }
  .btn-full { width: 100%; }

  /* Not found */
  .not-found {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 16px; padding: 48px 24px;
  }
  .not-found-text { font-size: 14px; color: var(--tx3); margin: 0; }
</style>
