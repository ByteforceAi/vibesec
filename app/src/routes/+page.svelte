<script lang="ts">
  import { Button, Card, TabBar, Toolbar, Badge } from '$lib/components';
  import type { TabItem } from '$lib/components';
  import { t } from '$lib/i18n/loader';
  import { scanHistory } from '$lib/stores/scan';
  import type { ScanResult } from '$lib/stores/scan';
  import { goto } from '$app/navigation';

  // Check if first visit -> redirect to onboarding
  $effect(() => {
    if (typeof localStorage !== 'undefined') {
      const visited = localStorage.getItem('vibesec_visited') === 'true';
      if (!visited) {
        localStorage.setItem('vibesec_visited', 'true');
        goto('/onboarding');
      }
    }
  });

  // Tab bar config
  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: '\u2302' },
    { id: 'diagnose', label: 'Diagnose', icon: '\uD83D\uDD0D' },
    { id: 'report', label: 'Report', icon: '\uD83D\uDCC4' },
    { id: 'packages', label: 'Packages', icon: '\uD83D\uDCE6' },
  ];

  let activeTab = $state('home');

  function handleTabSelect(id: string) {
    activeTab = id;
    if (id === 'home') goto('/');
    else goto(`/${id}`);
  }

  // Recent scan history - reactive
  let history = $state<ScanResult[]>([]);
  $effect(() => {
    const unsub = scanHistory.subscribe((h) => { history = h; });
    return unsub;
  });

  // Copy
  const welcomeTitle = t('onboarding.step_1_welcome.title', '');
  const welcomeBody = t('onboarding.step_1_welcome.body', '');
  const ctaText = t('onboarding.step_3_free_diagnose.cta', '');
</script>

<div class="home-page">
  <Toolbar title={t('onboarding.step_1_welcome.title', 'VibeSec')} largeTitle />

  <div class="home-content">
    <!-- Hero section -->
    <section class="hero">
      <Card glass padding="lg">
        <div class="hero-inner">
          <span class="hero-icon" aria-hidden="true">{'\uD83D\uDD27'}</span>
          <h2 class="hero-title">{welcomeTitle}</h2>
          <p class="hero-body">{welcomeBody}</p>

          <div class="hero-cta">
            <Button variant="primary" size="lg" fullWidth onclick={() => goto('/diagnose')}>
              {ctaText}
            </Button>
          </div>

          <div class="hero-secondary">
            <Button variant="destructive" size="md" fullWidth onclick={() => goto('/incident')}>
              {t('errors.general_error.title', '')}
            </Button>
          </div>
        </div>
      </Card>
    </section>

    <!-- Recent scans -->
    {#if history.length > 0}
      <section class="recent-scans">
        <h3 class="section-title">{t('diagnosis.report_summary_copy.summary_phrases.template', '')}</h3>
        {#each history.slice(0, 3) as scan}
          <Card glass padding="md" onclick={() => goto(`/report/${scan.scanId}`)}>
            <div class="scan-summary">
              <span class="scan-target">{scan.target}</span>
              <div class="scan-badges">
                {#if scan.summary.critical > 0}
                  <Badge severity="critical">{String(scan.summary.critical)}</Badge>
                {/if}
                {#if scan.summary.warning > 0}
                  <Badge severity="warning">{String(scan.summary.warning)}</Badge>
                {/if}
                {#if scan.summary.ok > 0}
                  <Badge severity="ok">{String(scan.summary.ok)}</Badge>
                {/if}
              </div>
            </div>
          </Card>
        {/each}
      </section>
    {:else}
      <section class="empty-state">
        <Card glass padding="lg">
          <p class="empty-text">{t('empty_states.no_diagnosis_records.body', '')}</p>
          <Button variant="secondary" size="md" onclick={() => goto('/diagnose')}>
            {t('empty_states.no_diagnosis_records.cta', '')}
          </Button>
        </Card>
      </section>
    {/if}
  </div>

  <div class="tab-bar-wrapper">
    <TabBar items={tabs} active={activeTab} onselect={handleTabSelect} />
  </div>
</div>

<style>
  .home-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .home-content {
    flex: 1;
    padding: var(--space-md);
    padding-bottom: calc(var(--space-xl) + 80px);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .hero-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-md);
  }

  .hero-icon {
    font-size: 48px;
    line-height: 1;
  }

  .hero-title {
    font: var(--font-title-1);
    color: var(--color-label);
    margin: 0;
  }

  .hero-body {
    font: var(--font-body);
    color: var(--color-label-secondary);
    margin: 0;
    max-width: 300px;
  }

  .hero-cta {
    width: 100%;
    margin-top: var(--space-sm);
  }

  .hero-secondary {
    width: 100%;
  }

  .section-title {
    font: var(--font-headline);
    color: var(--color-label);
    margin: var(--space-sm) 0;
  }

  .recent-scans {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .scan-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-sm);
  }

  .scan-target {
    font: var(--font-body);
    color: var(--color-label);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .scan-badges {
    display: flex;
    gap: var(--space-xs);
    flex-shrink: 0;
  }

  .empty-state {
    text-align: center;
  }

  .empty-text {
    font: var(--font-body);
    color: var(--color-label-secondary);
    margin: 0 0 var(--space-md);
  }

  .tab-bar-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
  }
</style>
