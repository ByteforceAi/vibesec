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
    <div class="bar-left">
      <span class="bar-brand">BYTEFORCE</span>
    </div>
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
    <button class="nav-i" onclick={() => goto(`${base}/`)}>홈</button>
    <button class="nav-i" onclick={() => goto(`${base}/check`)}>자가진단</button>
    <button class="nav-i" onclick={() => goto(`${base}/packages`)}>요금제</button>
    <button class="nav-i" onclick={() => goto(`${base}/contact`)}>상담예약</button>
  </nav>

</div>

<style>
  .page {
    --bg-void: #05060A;
    --bg-abyss: #0A0E1A;
    --bg-deep: #0D1528;
    --border-dim: rgba(120, 160, 220, 0.08);
    --border-active: rgba(10, 132, 255, 0.45);
    --blue-core: #0A84FF;
    --blue-glow: #3BA0FF;
    --cyan-scan: #5AC8FA;
    --coral-alert: #FF6B47;
    --text-primary: #EAF2FF;
    --text-secondary: rgba(234, 242, 255, 0.62);
    --text-tertiary: rgba(234, 242, 255, 0.38);
    --ease-organic: cubic-bezier(0.22, 1, 0.36, 1);
    --mono: "JetBrains Mono", "SF Mono", monospace;
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
    --ok: #32d74b;
    --warn-color: #ff9500;
    --crit-color: #ff453a;

    display: flex; flex-direction: column; min-height: 100dvh;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10, 132, 255, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0, 71, 179, 0.08) 0%, transparent 50%),
      var(--bg-void);
    color: var(--text-primary); font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }

  .bar {
    position: sticky; top: 0; z-index: 90; height: 48px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px;
    background: rgba(5,6,10,0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-dim);
  }
  .bar-left { display: flex; align-items: center; }
  .bar-brand { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-tertiary); }
  .bar-action {
    font-family: var(--font); font-size: 13px; font-weight: 500; color: var(--text-secondary);
    background: none; border: 1px solid var(--border-dim); border-radius: 980px; padding: 5px 14px; cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .bar-action:hover { color: var(--text-primary); border-color: var(--border-active); }

  .content { flex: 1; padding: 32px 24px 100px; display: flex; flex-direction: column; gap: 24px; }

  .page-title {
    font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-primary); margin: 0;
  }

  /* Empty */
  .empty {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 12px; padding: 48px 0;
  }
  .empty-title { font-size: 18px; font-weight: 600; color: var(--text-secondary); margin: 0; }
  .empty-body { font-size: 14px; color: var(--text-tertiary); margin: 0; max-width: 280px; line-height: 1.5; }

  .btn-outline {
    padding: 8px 20px; border-radius: 980px; border: 1px solid var(--border-dim);
    background: transparent; color: var(--text-secondary); font-family: var(--font);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-outline:hover { color: var(--text-primary); border-color: var(--border-active); }

  /* History list */
  .history { display: flex; flex-direction: column; }

  .list-head {
    display: flex; justify-content: space-between;
    padding-bottom: 8px; border-bottom: 1px solid var(--border-dim); margin-bottom: 0;
  }
  .list-head-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-tertiary);
  }

  .scan-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid var(--border-dim);
    background: none; border-left: none; border-right: none; border-top: none;
    width: 100%; font-family: var(--font); cursor: pointer;
    text-align: left; color: var(--text-primary); transition: background 0.15s;
  }
  .scan-row:hover { background: rgba(10, 132, 255, 0.04); }

  .scan-info { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
  .scan-target { font-size: 14px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .scan-date { font-size: 11px; color: var(--text-tertiary); }

  .scan-stats { display: flex; gap: 6px; flex-shrink: 0; }

  .stat {
    font-family: var(--mono); font-size: 12px; font-weight: 500;
    padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-dim); background: var(--bg-abyss);
  }
  .stat--crit { color: var(--crit-color); }
  .stat--warn { color: var(--warn-color); }
  .stat--ok { color: var(--ok); }

  /* Nav */
  .nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    display: flex;
    background: rgba(5,6,10,0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border-dim);
  }
  .nav-i {
    flex: 1; padding: 12px 0; background: none; border: none;
    font-family: var(--font); font-size: 13px; font-weight: 500;
    color: var(--text-tertiary); cursor: pointer; transition: color 0.15s;
  }
  .nav-i:hover { color: var(--text-secondary); }
  .nav-i--on { color: var(--blue-core); }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
