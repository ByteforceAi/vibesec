<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/loader';
  import { cartItems, removeFromCart, clearCart, calculateTotal } from '$lib/stores/cart';
  import type { CartItem } from '$lib/stores/cart';
  import packagesIndex from '$content/packages/index.json';

  interface PkgSummary { id: string; name_kr: string; price_krw: number; severity: string; }
  const allPkgs = packagesIndex as PkgSummary[];
  const pkgMap = Object.fromEntries(allPkgs.map((p) => [p.id, p]));
  const priceMap = Object.fromEntries(allPkgs.map((p) => [p.id, p.price_krw]));

  let items = $state<CartItem[]>([]);
  $effect(() => {
    const unsub = cartItems.subscribe((i) => { items = i; });
    return unsub;
  });

  const total = $derived(calculateTotal(items, priceMap));
  const isEmpty = $derived(items.length === 0);

  let orderComplete = $state(false);
  let showRemoveConfirm = $state(false);
  let removeTargetId = $state('');

  const emptyTitle = t('empty_states.cart_empty.title', '');
  const emptyBody = t('empty_states.cart_empty.body', '');
  const emptyCta = t('empty_states.cart_empty.cta', '');
  const confirmTitle = t('checkout.package_selection_confirmation.selection_confirmation', '');
  const warrantyInfo = t('checkout.package_selection_confirmation.warranty_info', '');
  const payMethodTitle = t('checkout.payment_method.payment_method_selection', '');
  const cardPay = t('checkout.payment_method.card_payment', '');
  const kakaoPay = t('checkout.payment_method.kakao_consultation', '');
  const completeTitle = t('checkout.payment_complete.complete_title', '');
  const completeBody = t('checkout.payment_complete.complete_body', '');
  const removeConfirmText = t('checkout.cart.delete_confirmation', '');

  function formatPrice(price: number): string {
    if (price === 0) return '무료';
    return price.toLocaleString('ko-KR');
  }

  function handleRemoveConfirm(pkgId: string) {
    removeTargetId = pkgId;
    showRemoveConfirm = true;
  }

  function confirmRemove() {
    removeFromCart(removeTargetId);
    showRemoveConfirm = false;
    removeTargetId = '';
  }

  function handleMockPayment() { orderComplete = true; clearCart(); }
  function handleKakaoConsult() { orderComplete = true; clearCart(); }
  function handleBackHome() { goto(`${base}/`); }
</script>

<div class="page">

  <header class="bar">
    <button class="bar-back" onclick={() => history.back()}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
    </button>
    <span class="bar-title">{confirmTitle || '결제'}</span>
    <span class="bar-spacer"></span>
  </header>

  <div class="content">

    {#if orderComplete}
      <section class="state-section">
        <div class="state-card">
          <svg class="state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#32d74b" stroke-width="2" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          <h2 class="state-title">{completeTitle}</h2>
          <p class="state-body">{completeBody}</p>
          <button class="cta-primary" onclick={handleBackHome}>
            {t('errors.page_not_found_404.cta', '') || '홈으로'}
          </button>
        </div>
      </section>

    {:else if isEmpty}
      <section class="state-section">
        <div class="state-card">
          <h2 class="state-title">{emptyTitle}</h2>
          <p class="state-body">{emptyBody}</p>
          <button class="btn-outline" onclick={() => goto(`${base}/packages`)}>{emptyCta}</button>
        </div>
      </section>

    {:else}
      <!-- Cart items -->
      <section class="cart-list">
        <h2 class="group-head">선택한 패키지</h2>
        {#each items as item}
          {@const pkg = pkgMap[item.packageId]}
          {#if pkg}
            <div class="cart-row">
              <div class="cart-info">
                <span class="cart-name">{pkg.name_kr}</span>
                <span class="cart-price">W{formatPrice(pkg.price_krw)}</span>
              </div>
              <button
                class="cart-remove"
                aria-label="삭제"
                onclick={() => handleRemoveConfirm(item.packageId)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </div>
          {/if}
        {/each}
      </section>

      <!-- Total -->
      <section class="total-section">
        <div class="total-row">
          <span class="total-label">{t('checkout.receipt.total', '') || '합계'}</span>
          <span class="total-amount">W{formatPrice(total)}</span>
        </div>
      </section>

      <p class="warranty-text">{warrantyInfo}</p>

      <!-- Payment methods -->
      <section class="pay-section">
        <h3 class="group-head">{payMethodTitle}</h3>
        <div class="pay-buttons">
          <button class="cta-primary" onclick={handleMockPayment}>{cardPay}</button>
          <button class="btn-outline btn-full" onclick={handleKakaoConsult}>{kakaoPay}</button>
        </div>
      </section>
    {/if}
  </div>

  <!-- Remove confirmation -->
  {#if showRemoveConfirm}
    <div class="overlay" onclick={() => { showRemoveConfirm = false; }} role="dialog" aria-modal="true">
      <div class="confirm-box" onclick={(e) => e.stopPropagation()}>
        <p class="confirm-text">{removeConfirmText}</p>
        <div class="confirm-actions">
          <button class="confirm-btn confirm-btn--danger" onclick={confirmRemove}>확인</button>
          <button class="confirm-btn" onclick={() => { showRemoveConfirm = false; }}>취소</button>
        </div>
      </div>
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

  /* Group head */
  .group-head {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--tx3); margin: 0 0 8px;
    padding-bottom: 8px; border-bottom: 1px solid var(--brd);
  }

  /* State (complete / empty) */
  .state-section {
    flex: 1; display: flex; align-items: center; justify-content: center;
  }
  .state-card {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 16px; padding: 40px 24px;
    background: var(--s1); border: 1px solid var(--brd); border-radius: 8px;
    max-width: 360px; width: 100%;
  }
  .state-icon { margin-bottom: 8px; }
  .state-title { font-size: 20px; font-weight: 700; color: var(--tx); margin: 0; }
  .state-body { font-size: 14px; color: var(--tx2); margin: 0; line-height: 1.5; }

  /* Cart */
  .cart-list { display: flex; flex-direction: column; }

  .cart-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid var(--brd);
  }
  .cart-info { display: flex; flex-direction: column; gap: 2px; }
  .cart-name { font-size: 14px; color: var(--tx); }
  .cart-price { font-family: var(--mono); font-size: 12px; color: var(--tx3); }

  .cart-remove {
    width: 32px; height: 32px; border-radius: 6px;
    border: 1px solid var(--brd); background: var(--s2);
    color: var(--crit-color); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.15s;
  }
  .cart-remove:hover { border-color: rgba(255,255,255,0.15); }

  /* Total */
  .total-section {
    padding: 16px; background: var(--s1); border: 1px solid var(--brd); border-radius: 8px;
  }
  .total-row { display: flex; justify-content: space-between; align-items: center; }
  .total-label { font-size: 14px; font-weight: 600; color: var(--tx); }
  .total-amount { font-family: var(--mono); font-size: 22px; font-weight: 500; color: var(--tx); }

  .warranty-text { font-size: 12px; color: var(--tx3); text-align: center; margin: 0; }

  /* Payment */
  .pay-section { display: flex; flex-direction: column; }
  .pay-buttons { display: flex; flex-direction: column; gap: 8px; }

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

  /* Overlay */
  .overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.75);
    display: flex; align-items: center; justify-content: center;
  }
  .confirm-box {
    background: var(--s1); border: 1px solid var(--brd); border-radius: 8px;
    padding: 24px; max-width: 320px; width: 90%;
    display: flex; flex-direction: column; gap: 16px;
  }
  .confirm-text { font-size: 15px; color: var(--tx); margin: 0; text-align: center; }
  .confirm-actions { display: flex; gap: 8px; }
  .confirm-btn {
    flex: 1; padding: 8px 0; border-radius: 6px;
    border: 1px solid var(--brd); background: transparent;
    color: var(--tx2); font-family: var(--font); font-size: 14px;
    font-weight: 500; cursor: pointer; transition: all 0.15s;
  }
  .confirm-btn:hover { color: var(--tx); border-color: rgba(255,255,255,0.15); }
  .confirm-btn--danger { color: var(--crit-color); }
  .confirm-btn--danger:hover { color: var(--crit-color); border-color: var(--crit-color); }
</style>
