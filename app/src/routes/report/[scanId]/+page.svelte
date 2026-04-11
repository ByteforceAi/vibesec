<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button, Card, Badge, Toolbar, ListRow, Sheet } from '$lib/components';
  import { t } from '$lib/i18n/loader';
  import { scanHistory } from '$lib/stores/scan';
  import { addToCart } from '$lib/stores/cart';
  import type { ScanResult, Finding } from '$lib/stores/scan';
  import packagesIndex from '$content/packages/index.json';

  // Get scanId from route params
  const scanId = $derived($page.params.scanId);

  // Find the scan result from history
  let history = $state<ScanResult[]>([]);
  $effect(() => {
    const unsub = scanHistory.subscribe((h) => { history = h; });
    return unsub;
  });

  const scan = $derived(history.find((h) => h.scanId === scanId));
  const findings = $derived(scan?.findings ?? []);
  const summary = $derived(scan?.summary ?? { critical: 0, warning: 0, ok: 0, total: 0 });

  // Recommended packages
  interface PkgInfo {
    id: string;
    name_kr: string;
    price_krw: number;
    severity: string;
  }
  const allPkgs = packagesIndex as PkgInfo[];
  const recommendedPkgs = $derived(
    (scan?.recommendedPackageIds ?? [])
      .map((id) => allPkgs.find((p) => p.id === id))
      .filter((p): p is PkgInfo => p !== undefined)
      .slice(0, 5)
  );

  // Finding detail sheet
  let selectedFinding = $state<Finding | null>(null);
  let sheetOpen = $state(false);

  function openFinding(f: Finding) {
    selectedFinding = f;
    sheetOpen = true;
  }

  function closeFinding() {
    sheetOpen = false;
    selectedFinding = null;
  }

  // Copy
  const resultTitle = t('diagnosis.report_summary_copy.summary_phrases.template', '');
  const critLabel = t('diagnosis.severity_comments.urgent_count', '');
  const warnLabel = t('diagnosis.severity_comments.careful_count', '');
  const okLabel = t('diagnosis.severity_comments.ok_count', '');

  // Severity to display severity mapping for Badge
  function findingSeverityToBadge(sev: string): 'critical' | 'warning' | 'ok' {
    if (sev === 'critical' || sev === 'high') return 'critical';
    if (sev === 'medium') return 'warning';
    return 'ok';
  }

  function handleAddToCart(pkgId: string) {
    addToCart(pkgId, scanId);
  }

  function formatPrice(price: number): string {
    if (price === 0) return 'Free';
    return price.toLocaleString('ko-KR');
  }
</script>

<div class="report-page">
  <Toolbar title={resultTitle}>
    {#snippet leading()}
      <Button variant="ghost" size="sm" ariaLabel="뒤로 가기" onclick={() => goto('/report')}>
        {'\u2190'}
      </Button>
    {/snippet}
  </Toolbar>

  {#if scan}
    <div class="report-content">
      <!-- Summary header -->
      <section class="summary-header">
        <Card glass padding="lg">
          <div class="summary-inner">
            <h2 class="summary-title">{resultTitle}</h2>
            <div class="summary-badges">
              <div class="summary-badge-item">
                <Badge severity="critical">{String(summary.critical)}</Badge>
                <span class="badge-label">{critLabel}</span>
              </div>
              <div class="summary-badge-item">
                <Badge severity="warning">{String(summary.warning)}</Badge>
                <span class="badge-label">{warnLabel}</span>
              </div>
              <div class="summary-badge-item">
                <Badge severity="ok">{String(summary.ok)}</Badge>
                <span class="badge-label">{okLabel}</span>
              </div>
            </div>
            <p class="summary-target">{scan.target}</p>
          </div>
        </Card>
      </section>

      <!-- Findings list -->
      <section class="findings-section">
        {#each findings as finding}
          <ListRow
            title={finding.title_kr}
            subtitle={finding.description_kr}
            onclick={() => openFinding(finding)}
          >
            {#snippet leading()}
              <Badge severity={findingSeverityToBadge(finding.severity)}>
                {finding.severity === 'critical' || finding.severity === 'high'
                  ? '!'
                  : finding.severity === 'medium'
                    ? '~'
                    : '-'}
              </Badge>
            {/snippet}
          </ListRow>
        {/each}
      </section>

      <!-- Recommended packages -->
      {#if recommendedPkgs.length > 0}
        <section class="recommended-section">
          <h3 class="section-heading">{t('diagnosis.report_summary_copy.summary_phrases.template', '')}</h3>
          {#each recommendedPkgs as pkg}
            <Card glass padding="md" onclick={() => goto(`/packages/${pkg.id}`)}>
              <div class="pkg-row">
                <div class="pkg-info">
                  <span class="pkg-name">{pkg.name_kr}</span>
                  <span class="pkg-price">{formatPrice(pkg.price_krw)}</span>
                </div>
                <Button variant="secondary" size="sm" onclick={(e) => { e.stopPropagation(); handleAddToCart(pkg.id); }}>
                  +
                </Button>
              </div>
            </Card>
          {/each}

          <div class="cta-row">
            <Button variant="primary" size="lg" fullWidth onclick={() => goto('/checkout')}>
              {t('checkout.payment_complete.complete_title', '')}
            </Button>
          </div>
          <div class="cta-row">
            <Button variant="ghost" size="md" fullWidth onclick={() => goto('/packages')}>
              {t('empty_states.no_search_results.cta', '')}
            </Button>
          </div>
        </section>
      {/if}
    </div>

    <!-- Finding detail sheet -->
    <Sheet open={sheetOpen} onclose={closeFinding} title={selectedFinding?.title_kr ?? ''}>
      {#if selectedFinding}
        <div class="finding-detail">
          <Badge severity={findingSeverityToBadge(selectedFinding.severity)}>
            {selectedFinding.severity}
          </Badge>
          <p class="finding-description">{selectedFinding.description_kr}</p>
          <p class="finding-location">{selectedFinding.location}</p>

          {#if selectedFinding.recommendedPackageIds.length > 0}
            <div class="finding-packages">
              {#each selectedFinding.recommendedPackageIds as pkgId}
                {@const pkg = allPkgs.find((p) => p.id === pkgId)}
                {#if pkg}
                  <Button
                    variant="secondary"
                    size="sm"
                    onclick={() => { closeFinding(); goto(`/packages/${pkg.id}`); }}
                  >
                    {pkg.name_kr}
                  </Button>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </Sheet>
  {:else}
    <!-- Scan not found -->
    <div class="not-found">
      <Card glass padding="lg">
        <div class="not-found-inner">
          <p>{t('errors.page_not_found_404.body', '')}</p>
          <Button variant="primary" size="md" onclick={() => goto('/diagnose')}>
            {t('empty_states.no_diagnosis_records.cta', '')}
          </Button>
        </div>
      </Card>
    </div>
  {/if}
</div>

<style>
  .report-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .report-content {
    flex: 1;
    padding: var(--space-md);
    padding-bottom: var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .summary-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-md);
  }

  .summary-title {
    font: var(--font-title-2);
    color: var(--color-label);
    margin: 0;
  }

  .summary-badges {
    display: flex;
    gap: var(--space-lg);
    justify-content: center;
  }

  .summary-badge-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

  .badge-label {
    font: var(--font-caption-1);
    color: var(--color-label-secondary);
  }

  .summary-target {
    font: var(--font-caption-1);
    color: var(--color-label-tertiary);
    margin: 0;
    word-break: break-all;
  }

  .findings-section {
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--glass-bg);
    backdrop-filter: blur(var(--lg-frost-radius-m)) saturate(180%);
    -webkit-backdrop-filter: blur(var(--lg-frost-radius-m)) saturate(180%);
  }

  .recommended-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .section-heading {
    font: var(--font-headline);
    color: var(--color-label);
    margin: var(--space-sm) 0;
  }

  .pkg-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pkg-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pkg-name {
    font: var(--font-body);
    color: var(--color-label);
  }

  .pkg-price {
    font: var(--font-subheadline);
    color: var(--color-label-secondary);
  }

  .cta-row {
    margin-top: var(--space-sm);
  }

  .finding-detail {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .finding-description {
    font: var(--font-body);
    color: var(--color-label);
    margin: 0;
    line-height: 1.6;
  }

  .finding-location {
    font: var(--font-caption-1);
    color: var(--color-label-tertiary);
    margin: 0;
    word-break: break-all;
  }

  .finding-packages {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .not-found {
    padding: var(--space-xl);
  }

  .not-found-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-md);
  }
</style>
