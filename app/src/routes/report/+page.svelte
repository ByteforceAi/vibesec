<script lang="ts">
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
    <h1 class="page-title">{pageTitle || '진단 리포트'}</h1>

    {#if history.length === 0}
      <section class="empty">
        <h2 class="empty-title">{emptyTitle}</h2>
        <p class="empty-body">{emptyBody}</p>
        <button class="btn-outline" onclick={() => goto(`${base}/diagnose`)}>{emptyCta}</button>
      </section>
    {:else}
      <section class="history">
        <div class="list-head">
          <span class="list-head-label">프로젝트</span>
          <span class="list-head-label">결과</span>
        </div>
        {#each history as scan}
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
    {/if}
  </div>

  <nav class="nav">
    <button class="nav-item" onclick={() => goto(`${base}/`)}>홈</button>
    <button class="nav-item" onclick={() => goto(`${base}/diagnose`)}>진단</button>
    <button class="nav-item nav-item--on" onclick={() => goto(`${base}/report`)}>리포트</button>
    <button class="nav-item" onclick={() => goto(`${base}/packages`)}>요금제</button>
  </nav>

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

  .bar {
    position: sticky; top: 0; z-index: 90; height: 48px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; background: var(--black); border-bottom: 1px solid var(--brd);
  }
  .bar-brand { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--tx3); }
  .bar-action {
    font-family: var(--font); font-size: 13px; font-weight: 500; color: var(--tx2);
    background: none; border: 1px solid var(--brd); border-radius: 6px; padding: 5px 14px; cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .bar-action:hover { color: var(--tx); border-color: rgba(255,255,255,0.15); }

  .content { flex: 1; padding: 32px 24px 100px; display: flex; flex-direction: column; gap: 24px; }

  .page-title {
    font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: var(--tx); margin: 0;
  }

  /* Empty */
  .empty {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 12px; padding: 48px 0;
  }
  .empty-title { font-size: 18px; font-weight: 600; color: var(--tx2); margin: 0; }
  .empty-body { font-size: 14px; color: var(--tx3); margin: 0; max-width: 280px; line-height: 1.5; }

  .btn-outline {
    padding: 8px 20px; border-radius: 6px; border: 1px solid var(--brd);
    background: transparent; color: var(--tx2); font-family: var(--font);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-outline:hover { color: var(--tx); border-color: rgba(255,255,255,0.15); }

  /* History list */
  .history { display: flex; flex-direction: column; }

  .list-head {
    display: flex; justify-content: space-between;
    padding-bottom: 8px; border-bottom: 1px solid var(--brd); margin-bottom: 0;
  }
  .list-head-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--tx3);
  }

  .scan-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid var(--brd);
    background: none; border-left: none; border-right: none; border-top: none;
    width: 100%; font-family: var(--font); cursor: pointer;
    text-align: left; color: var(--tx); transition: background 0.15s;
  }
  .scan-row:hover { background: var(--s1); }

  .scan-info { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
  .scan-target { font-size: 14px; color: var(--tx); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .scan-date { font-size: 11px; color: var(--tx3); }

  .scan-stats { display: flex; gap: 6px; flex-shrink: 0; }

  .stat {
    font-family: var(--mono); font-size: 12px; font-weight: 500;
    padding: 2px 8px; border-radius: 4px; border: 1px solid var(--brd); background: var(--s2);
  }
  .stat--crit { color: var(--crit-color); }
  .stat--warn { color: var(--warn-color); }
  .stat--ok { color: var(--ok); }

  /* Nav */
  .nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    display: flex; background: var(--s1); border-top: 1px solid var(--brd);
  }
  .nav-item {
    flex: 1; padding: 12px 0; background: none; border: none;
    font-family: var(--font); font-size: 13px; font-weight: 500;
    color: var(--tx3); cursor: pointer; transition: color 0.15s;
  }
  .nav-item:hover { color: var(--tx2); }
  .nav-item--on { color: var(--tx); }
</style>
