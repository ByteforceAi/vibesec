<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button, Card, Toolbar, ListRow, Alert } from '$lib/components';
  import { t } from '$lib/i18n/loader';
  import { cartItems, removeFromCart, clearCart, calculateTotal } from '$lib/stores/cart';
  import type { CartItem } from '$lib/stores/cart';
  import packagesIndex from '$content/packages/index.json';

  interface PkgSummary {
    id: string;
    name_kr: string;
    price_krw: number;
    severity: string;
  }
  const allPkgs = packagesIndex as PkgSummary[];
  const pkgMap = Object.fromEntries(allPkgs.map((p) => [p.id, p]));
  const priceMap = Object.fromEntries(allPkgs.map((p) => [p.id, p.price_krw]));

  // Cart state - reactive
  let items = $state<CartItem[]>([]);
  $effect(() => {
    const unsub = cartItems.subscribe((i) => { items = i; });
    return unsub;
  });

  const total = $derived(calculateTotal(items, priceMap));
  const isEmpty = $derived(items.length === 0);

  // Checkout state
  let orderComplete = $state(false);
  let showRemoveAlert = $state(false);
  let removeTargetId = $state('');

  // Copy
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
  const removeConfirm = t('checkout.cart.delete_confirmation', '');

  function formatPrice(price: number): string {
    if (price === 0) return 'Free';
    return price.toLocaleString('ko-KR');
  }

  function handleRemoveConfirm(pkgId: string) {
    removeTargetId = pkgId;
    showRemoveAlert = true;
  }

  function confirmRemove() {
    removeFromCart(removeTargetId);
    showRemoveAlert = false;
    removeTargetId = '';
  }

  function handleMockPayment() {
    // Mock payment - just show completion
    orderComplete = true;
    clearCart();
  }

  function handleKakaoConsult() {
    // Mock kakao consultation
    orderComplete = true;
    clearCart();
  }

  function handleBackHome() {
    goto('/');
  }
</script>

<div class="checkout-page">
  <Toolbar title={confirmTitle}>
    {#snippet leading()}
      <Button variant="ghost" size="sm" ariaLabel="뒤로 가기" onclick={() => goto(-1 as unknown as string)}>
        {'\u2190'}
      </Button>
    {/snippet}
  </Toolbar>

  <div class="checkout-content">
    {#if orderComplete}
      <!-- Order complete -->
      <section class="complete-section">
        <Card glass padding="lg">
          <div class="complete-inner">
            <span class="complete-icon" aria-hidden="true">{'\u2705'}</span>
            <h2 class="complete-title">{completeTitle}</h2>
            <p class="complete-body">{completeBody}</p>
            <Button variant="primary" size="lg" fullWidth onclick={handleBackHome}>
              {t('errors.page_not_found_404.cta', '')}
            </Button>
          </div>
        </Card>
      </section>
    {:else if isEmpty}
      <!-- Empty cart -->
      <section class="empty-section">
        <Card glass padding="lg">
          <div class="empty-inner">
            <span class="empty-icon" aria-hidden="true">{'\uD83D\uDED2'}</span>
            <h2 class="empty-title">{emptyTitle}</h2>
            <p class="empty-body">{emptyBody}</p>
            <Button variant="primary" size="md" onclick={() => goto('/packages')}>
              {emptyCta}
            </Button>
          </div>
        </Card>
      </section>
    {:else}
      <!-- Cart items -->
      <section class="cart-items">
        <Card glass padding="none">
          {#each items as item}
            {@const pkg = pkgMap[item.packageId]}
            {#if pkg}
              <ListRow
                title={pkg.name_kr}
                subtitle={formatPrice(pkg.price_krw)}
                onclick={() => goto(`/packages/${item.packageId}`)}
              >
                {#snippet trailing()}
                  <button
                    class="remove-btn"
                    aria-label="Remove"
                    onclick={(e) => { e.stopPropagation(); handleRemoveConfirm(item.packageId); }}
                  >
                    x
                  </button>
                {/snippet}
              </ListRow>
            {/if}
          {/each}
        </Card>
      </section>

      <!-- Total -->
      <section class="total-section">
        <Card glass padding="md">
          <div class="total-row">
            <span class="total-label">{t('checkout.receipt.total', '')}</span>
            <span class="total-amount">{formatPrice(total)}</span>
          </div>
        </Card>
      </section>

      <!-- Warranty info -->
      <p class="warranty-text">{warrantyInfo}</p>

      <!-- Payment methods (mock) -->
      <section class="payment-section">
        <h3 class="section-heading">{payMethodTitle}</h3>
        <div class="payment-buttons">
          <Button variant="primary" size="lg" fullWidth onclick={handleMockPayment}>
            {cardPay}
          </Button>
          <Button variant="secondary" size="lg" fullWidth onclick={handleKakaoConsult}>
            {kakaoPay}
          </Button>
        </div>
      </section>
    {/if}
  </div>

  <!-- Remove confirmation alert -->
  <Alert
    open={showRemoveAlert}
    severity="warning"
    title={removeConfirm}
    actions={[
      { label: 'OK', variant: 'destructive', onclick: confirmRemove },
      { label: 'Cancel', variant: 'cancel', onclick: () => { showRemoveAlert = false; } },
    ]}
    onclose={() => { showRemoveAlert = false; }}
  />
</div>

<style>
  .checkout-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .checkout-content {
    flex: 1;
    padding: var(--space-md);
    padding-bottom: var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .complete-inner,
  .empty-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-md);
  }

  .complete-icon,
  .empty-icon {
    font-size: 48px;
    line-height: 1;
  }

  .complete-title,
  .empty-title {
    font: var(--font-title-2);
    color: var(--color-label);
    margin: 0;
  }

  .complete-body,
  .empty-body {
    font: var(--font-body);
    color: var(--color-label-secondary);
    margin: 0;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .total-label {
    font: var(--font-headline);
    color: var(--color-label);
  }

  .total-amount {
    font: var(--font-title-2);
    color: var(--color-system-blue);
    font-weight: 700;
  }

  .warranty-text {
    font: var(--font-caption-1);
    color: var(--color-label-tertiary);
    text-align: center;
    margin: 0;
  }

  .section-heading {
    font: var(--font-headline);
    color: var(--color-label);
    margin: 0 0 var(--space-sm);
  }

  .payment-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .remove-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: var(--color-fill-secondary);
    color: var(--color-system-red);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
