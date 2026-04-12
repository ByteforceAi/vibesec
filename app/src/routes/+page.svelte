<script lang="ts">
  import { t } from '$lib/i18n/loader';
  import { scanHistory } from '$lib/stores/scan';
  import type { ScanResult } from '$lib/stores/scan';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  $effect(() => {
    if (typeof localStorage !== 'undefined') {
      const visited = localStorage.getItem('vibesec_visited') === 'true';
      if (!visited) {
        localStorage.setItem('vibesec_visited', 'true');
        goto(`${base}/onboarding`);
      }
    }
  });

  let activeTab = $state('home');
  let history = $state<ScanResult[]>([]);

  $effect(() => {
    const unsub = scanHistory.subscribe((h) => { history = h; });
    return unsub;
  });

  function navTo(tab: string) {
    activeTab = tab;
    if (tab === 'home') goto(`${base}/`);
    else goto(`${base}/${tab}`);
  }

  function formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  }
</script>

<div class="page">

  <header class="bar">
    <span class="bar-brand">Byteforce Security</span>
    <button class="bar-action" onclick={() => goto(`${base}/incident`)}>상담 예약</button>
  </header>

  <div class="content">

    <section class="hero">
      <h1 class="hero-title">바이브코딩 보안.<br/>그게 저희 일입니다.</h1>
      <p class="hero-sub">{t('home.hero.subtitle', '프로젝트 하나만 보여주시면 무료로 건강검진 해드려요.')}</p>
      <button class="hero-cta" onclick={() => goto(`${base}/diagnose`)}>레포 점검 시작</button>
    </section>

    {#if history.length > 0}
      <section class="recent">
        <h2 class="section-head">최근 진단 기록</h2>
        {#each history.slice(0, 5) as scan}
          <button class="scan-row" onclick={() => goto(`${base}/report/${scan.scanId}`)}>
            <div class="scan-info">
              <span class="scan-target">{scan.target}</span>
              <span class="scan-date">{formatDate(scan.finishedAt)}</span>
            </div>
            <div class="scan-stats">
              {#if scan.summary.critical > 0}
                <span class="stat stat--crit">{scan.summary.critical}</span>
              {/if}
              {#if scan.summary.warning > 0}
                <span class="stat stat--warn">{scan.summary.warning}</span>
              {/if}
              {#if scan.summary.ok > 0}
                <span class="stat stat--ok">{scan.summary.ok}</span>
              {/if}
            </div>
          </button>
        {/each}
      </section>
    {:else}
      <section class="empty">
        <h2 class="empty-title">{t('home.recent.empty_title', '아직 진단 기록이 없어요')}</h2>
        <p class="empty-body">{t('home.recent.empty_body', '프로젝트 주소를 넣어주시면 무료로 건강검진 해드려요.')}</p>
        <button class="btn-outline" onclick={() => goto(`${base}/diagnose`)}>
          {t('home.recent.empty_cta', '첫 진단 받기')}
        </button>
      </section>
    {/if}

  </div>

  <nav class="nav">
    <button class="nav-item nav-item--on" onclick={() => navTo('home')}>홈</button>
    <button class="nav-item" onclick={() => navTo('diagnose')}>진단</button>
    <button class="nav-item" onclick={() => navTo('report')}>리포트</button>
    <button class="nav-item" onclick={() => navTo('packages')}>요금제</button>
  </nav>

</div>

<style>
  .page {
    --black: #000000;
    --s1: #060608;
    --s2: #0c0c0e;
    --s3: #141416;
    --s4: #1c1c1f;
    --tx: #ffffff;
    --tx2: #9a9a9f;
    --tx3: #4a4a4f;
    --brd: rgba(255,255,255,0.055);
    --ok: #32d74b;
    --warn-color: #ff9500;
    --crit-color: #ff453a;
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
    --mono: "JetBrains Mono", "SF Mono", monospace;

    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background: var(--black);
    color: var(--tx);
    font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }

  /* Bar */
  .bar {
    position: sticky;
    top: 0;
    z-index: 90;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background: var(--black);
    border-bottom: 1px solid var(--brd);
  }

  .bar-brand {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--tx3);
  }

  .bar-action {
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    color: var(--tx2);
    background: none;
    border: 1px solid var(--brd);
    border-radius: 6px;
    padding: 5px 14px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .bar-action:hover { color: var(--tx); border-color: rgba(255,255,255,0.15); }

  /* Content */
  .content {
    flex: 1;
    padding: 32px 24px 100px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* Hero */
  .hero {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 0;
  }

  .hero-title {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.2;
    margin: 0;
    color: var(--tx);
  }

  .hero-sub {
    font-size: 15px;
    color: var(--tx2);
    line-height: 1.5;
    margin: 0;
    max-width: 340px;
  }

  .hero-cta {
    align-self: flex-start;
    padding: 10px 28px;
    border-radius: 6px;
    border: none;
    background: var(--tx);
    color: var(--black);
    font-family: var(--font);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .hero-cta:hover { background: #e0e0e0; }

  /* Section head */
  .section-head {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--tx3);
    margin: 0 0 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--brd);
  }

  /* Recent scans */
  .recent {
    display: flex;
    flex-direction: column;
  }

  .scan-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--brd);
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    width: 100%;
    font-family: var(--font);
    cursor: pointer;
    text-align: left;
    color: var(--tx);
    transition: background 0.15s;
  }
  .scan-row:hover { background: var(--s1); }

  .scan-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }

  .scan-target {
    font-size: 14px;
    color: var(--tx);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .scan-date {
    font-size: 11px;
    color: var(--tx3);
  }

  .scan-stats {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .stat {
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--brd);
    background: var(--s2);
  }

  .stat--crit { color: var(--crit-color); }
  .stat--warn { color: var(--warn-color); }
  .stat--ok { color: var(--ok); }

  /* Empty */
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 48px 0;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--tx2);
    margin: 0;
  }

  .empty-body {
    font-size: 14px;
    color: var(--tx3);
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }

  .btn-outline {
    padding: 8px 20px;
    border-radius: 6px;
    border: 1px solid var(--brd);
    background: transparent;
    color: var(--tx2);
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-outline:hover { color: var(--tx); border-color: rgba(255,255,255,0.15); }

  /* Nav */
  .nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    display: flex;
    background: var(--s1);
    border-top: 1px solid var(--brd);
    padding: 0;
  }

  .nav-item {
    flex: 1;
    padding: 12px 0;
    background: none;
    border: none;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    color: var(--tx3);
    cursor: pointer;
    transition: color 0.15s;
  }
  .nav-item:hover { color: var(--tx2); }
  .nav-item--on { color: var(--tx); }
</style>
