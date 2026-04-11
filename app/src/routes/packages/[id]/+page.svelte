<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button, Card, Badge, Toolbar, ListRow } from '$lib/components';
  import { t } from '$lib/i18n/loader';
  import { addToCart, cartItems } from '$lib/stores/cart';
  import packagesIndex from '$content/packages/index.json';

  // Dynamic import for individual package detail files
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

  // Find detailed package data
  const pkg = $derived((): PkgDetail | null => {
    for (const data of Object.values(packageFiles)) {
      if (isPkgDetail(data) && data.id === pkgId) return data;
    }
    return null;
  });

  // Related packages from the same category
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
      ? allPkgs
          .filter((p) => p.category === pkg()!.category && p.id !== pkgId)
          .slice(0, 3)
      : []
  );

  // Check if already in cart
  let inCart = $state(false);
  $effect(() => {
    const unsub = cartItems.subscribe((items) => {
      inCart = items.some((i) => i.packageId === pkgId);
    });
    return unsub;
  });

  function handleAddToCart() {
    if (pkgId) addToCart(pkgId);
  }

  function handleBuyNow() {
    if (pkgId) addToCart(pkgId);
    goto('/checkout');
  }

  function formatPrice(price: number): string {
    if (price === 0) return 'Free';
    return price.toLocaleString('ko-KR');
  }

  function severityToBadge(sev: string): 'critical' | 'warning' | 'ok' {
    if (sev === 'critical' || sev === 'high') return 'critical';
    if (sev === 'medium') return 'warning';
    return 'ok';
  }
</script>

<div class="pkg-detail-page">
  <Toolbar title={pkg()?.name_kr ?? ''}>
    {#snippet leading()}
      <Button variant="ghost" size="sm" ariaLabel="뒤로 가기" onclick={() => goto('/packages')}>
        {'\u2190'}
      </Button>
    {/snippet}
  </Toolbar>

  {#if pkg()}
    {@const p = pkg()!}
    <div class="pkg-detail-content">
      <!-- Header -->
      <section class="pkg-header">
        <Card glass padding="lg">
          <div class="pkg-header-inner">
            <Badge severity={severityToBadge(p.severity)}>
              {p.category}
            </Badge>
            <h1 class="pkg-title">{p.name_kr}</h1>
            <p class="pkg-subtitle">{p.subtitle_kr}</p>
            <div class="pkg-meta">
              <span class="pkg-price">{formatPrice(p.price_krw)}</span>
              <span class="pkg-duration">{p.duration}</span>
            </div>
          </div>
        </Card>
      </section>

      <!-- Description -->
      <section class="pkg-section">
        <Card glass padding="md">
          <p class="pkg-description">{p.description_kr}</p>
        </Card>
      </section>

      <!-- Symptoms -->
      {#if p.symptoms && p.symptoms.length > 0}
        <section class="pkg-section">
          <Card glass padding="md">
            {#snippet header()}
              <h3 class="section-label">{t('checkout.package_selection_confirmation.selection_confirmation', '')}</h3>
            {/snippet}
            <ul class="symptom-list">
              {#each p.symptoms as symptom}
                <li class="symptom-item">{symptom}</li>
              {/each}
            </ul>
          </Card>
        </section>
      {/if}

      <!-- Includes -->
      {#if p.includes && p.includes.length > 0}
        <section class="pkg-section">
          <Card glass padding="md">
            {#snippet header()}
              <h3 class="section-label">{t('checkout.package_selection_confirmation.warranty_info', '')}</h3>
            {/snippet}
            <ul class="include-list">
              {#each p.includes as item}
                <li class="include-item">{item}</li>
              {/each}
            </ul>
          </Card>
        </section>
      {/if}

      <!-- Warranty -->
      {#if p.warranty_days > 0}
        <section class="pkg-section">
          <Card glass padding="md">
            <div class="warranty-badge">
              <Badge severity="ok">{String(p.warranty_days)}</Badge>
              <span>{t('checkout.package_selection_confirmation.warranty_info', '')}</span>
            </div>
          </Card>
        </section>
      {/if}

      <!-- Related packages -->
      {#if relatedPkgs.length > 0}
        <section class="pkg-section">
          <h3 class="related-heading">{t('empty_states.no_search_results.cta', '')}</h3>
          {#each relatedPkgs as rel}
            <ListRow
              title={rel.name_kr}
              subtitle={formatPrice(rel.price_krw)}
              onclick={() => goto(`/packages/${rel.id}`)}
            >
              {#snippet leading()}
                <Badge severity={severityToBadge(rel.severity)}>
                  {rel.category.slice(0, 2)}
                </Badge>
              {/snippet}
            </ListRow>
          {/each}
        </section>
      {/if}

      <!-- CTA -->
      <section class="cta-section">
        {#if inCart}
          <Button variant="secondary" size="lg" fullWidth onclick={() => goto('/checkout')}>
            {t('checkout.payment_complete.complete_title', '')}
          </Button>
        {:else}
          <Button variant="primary" size="lg" fullWidth onclick={handleAddToCart}>
            +
          </Button>
          <Button variant="secondary" size="lg" fullWidth onclick={handleBuyNow}>
            {t('checkout.payment_method.card_payment', '')}
          </Button>
        {/if}
      </section>
    </div>
  {:else}
    <div class="not-found">
      <Card glass padding="lg">
        <p>{t('errors.page_not_found_404.body', '')}</p>
        <Button variant="primary" size="md" onclick={() => goto('/packages')}>
          {t('errors.page_not_found_404.cta', '')}
        </Button>
      </Card>
    </div>
  {/if}
</div>

<style>
  .pkg-detail-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .pkg-detail-content {
    flex: 1;
    padding: var(--space-md);
    padding-bottom: var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .pkg-header-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-sm);
  }

  .pkg-title {
    font: var(--font-title-1);
    color: var(--color-label);
    margin: 0;
  }

  .pkg-subtitle {
    font: var(--font-body);
    color: var(--color-label-secondary);
    margin: 0;
  }

  .pkg-meta {
    display: flex;
    gap: var(--space-lg);
    align-items: center;
  }

  .pkg-price {
    font: var(--font-title-2);
    color: var(--color-system-blue);
    font-weight: 700;
  }

  .pkg-duration {
    font: var(--font-subheadline);
    color: var(--color-label-tertiary);
  }

  .pkg-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .section-label {
    font: var(--font-headline);
    color: var(--color-label);
    margin: 0;
  }

  .pkg-description {
    font: var(--font-body);
    color: var(--color-label);
    margin: 0;
    line-height: 1.6;
  }

  .symptom-list,
  .include-list {
    margin: 0;
    padding-left: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .symptom-item,
  .include-item {
    font: var(--font-body);
    color: var(--color-label-secondary);
    line-height: 1.5;
  }

  .warranty-badge {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font: var(--font-body);
    color: var(--color-label);
  }

  .related-heading {
    font: var(--font-headline);
    color: var(--color-label);
    margin: var(--space-sm) 0;
  }

  .cta-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding-top: var(--space-md);
  }

  .not-found {
    padding: var(--space-xl);
    text-align: center;
  }
</style>
