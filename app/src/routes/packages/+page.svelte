<script lang="ts">
  import { Button, Badge, Toolbar, TabBar, ListRow, Input } from '$lib/components';
  import type { TabItem } from '$lib/components';
  import { t } from '$lib/i18n/loader';
  import { goto } from '$app/navigation';
  import packagesIndex from '$content/packages/index.json';

  interface PkgSummary {
    id: string;
    category: string;
    name: string;
    name_kr: string;
    price_krw: number;
    severity: string;
  }

  const allPackages = packagesIndex as PkgSummary[];

  // Categories
  const categories = [
    { id: 'ALL', label: 'All' },
    { id: 'SECRETS', label: 'Secrets' },
    { id: 'AUTH', label: 'Auth' },
    { id: 'DATA', label: 'Data' },
    { id: 'NETWORK', label: 'Network' },
    { id: 'INJECTION', label: 'Injection' },
    { id: 'INFRA', label: 'Infra' },
    { id: 'MONITOR', label: 'Monitor' },
    { id: 'RESPONSE', label: 'Response' },
  ];

  // Price filter options
  type PriceRange = 'all' | 'free' | 'under100k' | 'under300k' | 'over300k';
  const priceFilters: { id: PriceRange; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'free', label: 'Free' },
    { id: 'under100k', label: '~10' },
    { id: 'under300k', label: '~30' },
    { id: 'over300k', label: '30+' },
  ];

  // State
  let activeCategory = $state('ALL');
  let searchQuery = $state('');
  let activePriceFilter = $state<PriceRange>('all');
  let activeSeverity = $state<string>('all');
  let visibleCount = $state(20);

  // Filtered packages
  const filtered = $derived(() => {
    let result = allPackages;

    // Category filter
    if (activeCategory !== 'ALL') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name_kr.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }

    // Price filter
    if (activePriceFilter === 'free') {
      result = result.filter((p) => p.price_krw === 0);
    } else if (activePriceFilter === 'under100k') {
      result = result.filter((p) => p.price_krw > 0 && p.price_krw < 100000);
    } else if (activePriceFilter === 'under300k') {
      result = result.filter((p) => p.price_krw >= 100000 && p.price_krw < 300000);
    } else if (activePriceFilter === 'over300k') {
      result = result.filter((p) => p.price_krw >= 300000);
    }

    // Severity filter
    if (activeSeverity !== 'all') {
      result = result.filter((p) => {
        if (activeSeverity === 'critical') return p.severity === 'critical' || p.severity === 'high';
        if (activeSeverity === 'warning') return p.severity === 'medium';
        return p.severity === 'low' || p.severity === 'info';
      });
    }

    return result;
  });

  const displayedPackages = $derived(filtered().slice(0, visibleCount));
  const hasMore = $derived(visibleCount < filtered().length);

  // Intersection observer for lazy loading
  let sentinelEl = $state<HTMLDivElement | undefined>(undefined);

  $effect(() => {
    if (typeof IntersectionObserver === 'undefined' || !sentinelEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          visibleCount += 20;
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelEl);

    return () => observer.disconnect();
  });

  // Reset visible count on filter change
  $effect(() => {
    // Trigger on any filter change
    void activeCategory;
    void searchQuery;
    void activePriceFilter;
    void activeSeverity;
    visibleCount = 20;
  });

  function formatPrice(price: number): string {
    if (price === 0) return 'Free';
    return price.toLocaleString('ko-KR');
  }

  function severityToBadge(sev: string): 'critical' | 'warning' | 'ok' {
    if (sev === 'critical' || sev === 'high') return 'critical';
    if (sev === 'medium') return 'warning';
    return 'ok';
  }

  // Tab bar
  const navTabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: '\u2302' },
    { id: 'diagnose', label: 'Diagnose', icon: '\uD83D\uDD0D' },
    { id: 'report', label: 'Report', icon: '\uD83D\uDCC4' },
    { id: 'packages', label: 'Packages', icon: '\uD83D\uDCE6' },
  ];

  function handleNavTab(id: string) {
    if (id === 'home') goto('/');
    else goto(`/${id}`);
  }
</script>

<div class="packages-page">
  <Toolbar title="Packages" largeTitle />

  <div class="packages-content">
    <!-- Search -->
    <div class="search-bar">
      <Input
        bind:value={searchQuery}
        type="search"
        placeholder={t('empty_states.no_search_results.title', 'Search')}
        ariaLabel="Search packages"
      />
    </div>

    <!-- Category tabs -->
    <div class="category-tabs" role="tablist">
      {#each categories as cat}
        <button
          class="cat-tab"
          class:cat-tab--active={activeCategory === cat.id}
          role="tab"
          aria-selected={activeCategory === cat.id}
          onclick={() => { activeCategory = cat.id; }}
        >
          {cat.label}
        </button>
      {/each}
    </div>

    <!-- Price + severity filters -->
    <div class="filter-row">
      <div class="filter-group">
        {#each priceFilters as pf}
          <button
            class="filter-chip"
            class:filter-chip--active={activePriceFilter === pf.id}
            onclick={() => { activePriceFilter = pf.id; }}
          >
            {pf.label}
          </button>
        {/each}
      </div>
      <div class="filter-group">
        <button
          class="filter-chip"
          class:filter-chip--active={activeSeverity === 'all'}
          onclick={() => { activeSeverity = 'all'; }}
        >
          All
        </button>
        <button
          class="filter-chip filter-chip--red"
          class:filter-chip--active={activeSeverity === 'critical'}
          onclick={() => { activeSeverity = 'critical'; }}
          aria-label="Critical severity"
        >
          !
        </button>
        <button
          class="filter-chip filter-chip--yellow"
          class:filter-chip--active={activeSeverity === 'warning'}
          onclick={() => { activeSeverity = 'warning'; }}
          aria-label="Warning severity"
        >
          ~
        </button>
        <button
          class="filter-chip filter-chip--green"
          class:filter-chip--active={activeSeverity === 'ok'}
          onclick={() => { activeSeverity = 'ok'; }}
          aria-label="OK severity"
        >
          -
        </button>
      </div>
    </div>

    <!-- Package list -->
    <div class="package-list">
      {#if displayedPackages.length === 0}
        <div class="empty-results">
          <p>{t('empty_states.no_search_results.title', '')}</p>
          <Button variant="ghost" size="sm" onclick={() => { activeCategory = 'ALL'; searchQuery = ''; activePriceFilter = 'all'; activeSeverity = 'all'; }}>
            {t('empty_states.no_search_results.cta', '')}
          </Button>
        </div>
      {:else}
        {#each displayedPackages as pkg (pkg.id)}
          <ListRow
            title={pkg.name_kr}
            subtitle={formatPrice(pkg.price_krw)}
            onclick={() => goto(`/packages/${pkg.id}`)}
          >
            {#snippet leading()}
              <Badge severity={severityToBadge(pkg.severity)}>
                {pkg.category.slice(0, 2)}
              </Badge>
            {/snippet}
            {#snippet trailing()}
              <span class="pkg-price-tag">{formatPrice(pkg.price_krw)}</span>
            {/snippet}
          </ListRow>
        {/each}

        <!-- Lazy load sentinel -->
        {#if hasMore}
          <div class="sentinel" bind:this={sentinelEl}></div>
        {/if}

        <p class="result-count">
          {displayedPackages.length} / {filtered().length}
        </p>
      {/if}
    </div>
  </div>

  <div class="tab-bar-wrapper">
    <TabBar items={navTabs} active="packages" onselect={handleNavTab} />
  </div>
</div>

<style>
  .packages-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .packages-content {
    flex: 1;
    padding-bottom: calc(var(--space-xl) + 80px);
  }

  .search-bar {
    padding: var(--space-sm) var(--space-md);
  }

  .category-tabs {
    display: flex;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .category-tabs::-webkit-scrollbar {
    display: none;
  }

  .cat-tab {
    flex-shrink: 0;
    padding: var(--space-xs) var(--space-md);
    min-height: 36px;
    border: 1px solid var(--color-separator);
    border-radius: var(--radius-full);
    background: transparent;
    font: var(--font-subheadline);
    font-weight: 500;
    color: var(--color-label-secondary);
    cursor: pointer;
    transition: all 150ms ease;
    white-space: nowrap;
  }

  .cat-tab--active {
    background: var(--color-system-blue);
    border-color: var(--color-system-blue);
    color: #ffffff;
  }

  .filter-row {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-xs) var(--space-md);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .filter-row::-webkit-scrollbar {
    display: none;
  }

  .filter-group {
    display: flex;
    gap: var(--space-xs);
    flex-shrink: 0;
  }

  .filter-chip {
    padding: 4px 12px;
    min-height: 30px;
    border: 1px solid var(--color-separator);
    border-radius: var(--radius-full);
    background: transparent;
    font: var(--font-caption-1);
    color: var(--color-label-secondary);
    cursor: pointer;
    white-space: nowrap;
  }

  .filter-chip--active {
    background: var(--color-fill-secondary);
    border-color: var(--color-system-blue);
    color: var(--color-system-blue);
    font-weight: 600;
  }

  .filter-chip--red {
    border-color: var(--color-system-red);
    color: var(--color-system-red);
  }

  .filter-chip--yellow {
    border-color: var(--color-system-yellow);
    color: var(--color-system-yellow);
  }

  .filter-chip--green {
    border-color: var(--color-system-green);
    color: var(--color-system-green);
  }

  .package-list {
    padding: 0 var(--space-md);
  }

  .empty-results {
    text-align: center;
    padding: var(--space-xl) 0;
  }

  .empty-results p {
    font: var(--font-body);
    color: var(--color-label-secondary);
  }

  .sentinel {
    height: 1px;
  }

  .result-count {
    text-align: center;
    font: var(--font-caption-1);
    color: var(--color-label-tertiary);
    padding: var(--space-md) 0;
  }

  .pkg-price-tag {
    font: var(--font-subheadline);
    color: var(--color-label-secondary);
    font-weight: 500;
  }

  .tab-bar-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
  }
</style>
