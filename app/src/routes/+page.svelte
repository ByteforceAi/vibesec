<script lang="ts">
  import { Button, Card, TabBar, Toolbar, Badge } from '$lib/components';
  import type { TabItem } from '$lib/components';
  import { t } from '$lib/i18n/loader';
  import { scanHistory } from '$lib/stores/scan';
  import type { ScanResult } from '$lib/stores/scan';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  // Check if first visit -> redirect to onboarding
  $effect(() => {
    if (typeof localStorage !== 'undefined') {
      const visited = localStorage.getItem('vibesec_visited') === 'true';
      if (!visited) {
        localStorage.setItem('vibesec_visited', 'true');
        goto(`${base}/onboarding`);
      }
    }
  });

  // Tab bar - 한국어 라벨
  const tabs: TabItem[] = [
    { id: 'home', label: t('home.tabs.home', '홈'), icon: '\u2302' },
    { id: 'diagnose', label: t('home.tabs.diagnose', '진단'), icon: '\uD83D\uDD0D' },
    { id: 'report', label: t('home.tabs.report', '리포트'), icon: '\uD83D\uDCC4' },
    { id: 'packages', label: t('home.tabs.packages', '패키지'), icon: '\uD83D\uDCE6' },
  ];

  let activeTab = $state('home');

  function handleTabSelect(id: string) {
    activeTab = id;
    if (id === 'home') goto(`${base}/`);
    else goto(`${base}/${id}`);
  }

  // Recent scan history
  let history = $state<ScanResult[]>([]);
  $effect(() => {
    const unsub = scanHistory.subscribe((h) => { history = h; });
    return unsub;
  });
</script>

<div class="home-page">
  <Toolbar title={t('home.hero.title', '바이브코딩 보안센터')} largeTitle />

  <div class="home-content">
    <!-- Hero -->
    <section class="hero">
      <Card glass padding="lg">
        <div class="hero-inner">
          <span class="hero-icon" aria-hidden="true">{'\uD83D\uDD27'}</span>
          <h2 class="hero-title">{t('home.hero.title', '바이브코딩 보안센터')}</h2>
          <p class="hero-body">{t('home.hero.subtitle', '프로젝트 하나만 보여주시면 무료로 건강검진 해드려요.')}</p>

          <div class="hero-cta">
            <Button variant="primary" size="lg" fullWidth onclick={() => goto(`${base}/diagnose`)}>
              {t('home.hero.cta', '무료 진단 받기')}
            </Button>
          </div>

          <div class="hero-secondary">
            <Button variant="destructive" size="md" fullWidth onclick={() => goto(`${base}/incident`)}>
              {t('home.hero.emergency_cta', '긴급 도움이 필요해요')}
            </Button>
          </div>
        </div>
      </Card>
    </section>

    <!-- Recent scans -->
    {#if history.length > 0}
      <section class="recent-scans">
        <h3 class="section-title">{t('home.recent.title', '최근 진단 기록')}</h3>
        {#each history.slice(0, 3) as scan}
          <Card glass padding="md" onclick={() => goto(`${base}/report/${scan.scanId}`)}>
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
          <div class="empty-inner">
            <span class="empty-icon" aria-hidden="true">{'\uD83E\uDE7A'}</span>
            <h3 class="empty-title">{t('home.recent.empty_title', '아직 진단 기록이 없어요')}</h3>
            <p class="empty-text">{t('home.recent.empty_body', '프로젝트 주소를 넣어주시면 무료로 건강검진 해드려요.')}</p>
            <Button variant="secondary" size="md" onclick={() => goto(`${base}/diagnose`)}>
              {t('home.recent.empty_cta', '첫 진단 받기')}
            </Button>
          </div>
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
    line-height: 1.6;
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

  .empty-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }

  .empty-icon {
    font-size: 48px;
    line-height: 1;
  }

  .empty-title {
    font: var(--font-headline);
    color: var(--color-label);
    margin: 0;
  }

  .empty-text {
    font: var(--font-body);
    color: var(--color-label-secondary);
    margin: 0;
  }

  .tab-bar-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
  }
</style>
