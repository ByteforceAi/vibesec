<script lang="ts">
  import { Button, Card, Badge, Toolbar, TabBar, ListRow } from '$lib/components';
  import type { TabItem } from '$lib/components';
  import { t } from '$lib/i18n/loader';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { scanHistory } from '$lib/stores/scan';
  import type { ScanResult } from '$lib/stores/scan';

  let history = $state<ScanResult[]>([]);
  $effect(() => {
    const unsub = scanHistory.subscribe((h) => { history = h; });
    return unsub;
  });

  const emptyTitle = t('empty_states.no_diagnosis_records.title', '');
  const emptyBody = t('empty_states.no_diagnosis_records.body', '');
  const emptyCta = t('empty_states.no_diagnosis_records.cta', '');
  const pageTitle = t('onboarding.step_4_check_results.title', '');

  // Tab bar
  const tabs: TabItem[] = [
    { id: 'home', label: t('home.tabs.home', '홈'), icon: '\u2302' },
    { id: 'diagnose', label: t('home.tabs.diagnose', '진단'), icon: '\uD83D\uDD0D' },
    { id: 'report', label: t('home.tabs.report', '리포트'), icon: '\uD83D\uDCC4' },
    { id: 'packages', label: t('home.tabs.packages', '패키지'), icon: '\uD83D\uDCE6' },
  ];

  function handleTabSelect(id: string) {
    if (id === 'home') goto(`${base}/`);
    else goto(`${base}/${id}`);
  }

  function formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }
</script>

<div class="report-list-page">
  <Toolbar title={pageTitle} largeTitle />

  <div class="report-content">
    {#if history.length === 0}
      <!-- Empty state -->
      <section class="empty-state">
        <Card glass padding="lg">
          <div class="empty-inner">
            <span class="empty-icon" aria-hidden="true">{'\uD83D\uDCC4'}</span>
            <h2 class="empty-title">{emptyTitle}</h2>
            <p class="empty-body">{emptyBody}</p>
            <Button variant="primary" size="md" onclick={() => goto(`${base}/diagnose`)}>
              {emptyCta}
            </Button>
          </div>
        </Card>
      </section>
    {:else}
      <!-- Scan history list -->
      <section class="history-list">
        {#each history as scan}
          <ListRow
            title={scan.target}
            subtitle={formatDate(scan.finishedAt)}
            onclick={() => goto(`${base}/report/${scan.scanId}`)}
          >
            {#snippet leading()}
              <div class="scan-badges-compact">
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
            {/snippet}
          </ListRow>
        {/each}
      </section>
    {/if}
  </div>

  <div class="tab-bar-wrapper">
    <TabBar items={tabs} active="report" onselect={handleTabSelect} />
  </div>
</div>

<style>
  .report-list-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .report-content {
    flex: 1;
    padding: var(--space-md);
    padding-bottom: calc(var(--space-xl) + 80px);
  }

  .empty-state {
    display: flex;
    justify-content: center;
    padding-top: var(--space-xl);
  }

  .empty-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-md);
  }

  .empty-icon {
    font-size: 48px;
    line-height: 1;
  }

  .empty-title {
    font: var(--font-title-2);
    color: var(--color-label);
    margin: 0;
  }

  .empty-body {
    font: var(--font-body);
    color: var(--color-label-secondary);
    margin: 0;
  }

  .history-list {
    display: flex;
    flex-direction: column;
  }

  .scan-badges-compact {
    display: flex;
    gap: 2px;
    flex-direction: column;
  }

  .tab-bar-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
  }
</style>
