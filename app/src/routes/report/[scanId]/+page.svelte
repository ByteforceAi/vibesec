<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/loader';
  import { scanHistory } from '$lib/stores/scan';
  import { addToCart } from '$lib/stores/cart';
  import type { ScanResult, Finding } from '$lib/stores/scan';
  import packagesIndex from '$content/packages/index.json';

  const scanId = $derived($page.params.scanId);

  let history = $state<ScanResult[]>([]);
  $effect(() => {
    const unsub = scanHistory.subscribe((h) => { history = h; });
    return unsub;
  });

  const scan = $derived(history.find((h) => h.scanId === scanId));
  const findings = $derived(scan?.findings ?? []);
  const summary = $derived(scan?.summary ?? { critical: 0, warning: 0, ok: 0, total: 0 });

  interface PkgInfo { id: string; name_kr: string; price_krw: number; severity: string; }
  const allPkgs = packagesIndex as PkgInfo[];
  const recommendedPkgs = $derived(
    (scan?.recommendedPackageIds ?? [])
      .map((id) => allPkgs.find((p) => p.id === id))
      .filter((p): p is PkgInfo => p !== undefined)
      .slice(0, 5)
  );

  let selectedFinding = $state<Finding | null>(null);
  let detailOpen = $state(false);

  function openFinding(f: Finding) { selectedFinding = f; detailOpen = true; }
  function closeFinding() { detailOpen = false; selectedFinding = null; }

  const resultTitle = t('diagnosis.report_summary_copy.summary_phrases.template', '');
  const critLabel = t('diagnosis.severity_comments.urgent_count', '');
  const warnLabel = t('diagnosis.severity_comments.careful_count', '');
  const okLabel = t('diagnosis.severity_comments.ok_count', '');

  function sevClass(sev: string): string {
    if (sev === 'critical' || sev === 'high') return 'sev--crit';
    if (sev === 'medium') return 'sev--warn';
    return 'sev--ok';
  }

  function sevSymbol(sev: string): string {
    if (sev === 'critical' || sev === 'high') return '!';
    if (sev === 'medium') return '~';
    return '-';
  }

  function handleAddToCart(pkgId: string) { addToCart(pkgId, scanId); }

  function formatPrice(price: number): string {
    if (price === 0) return '무료';
    return price.toLocaleString('ko-KR');
  }
</script>

<div class="page">

  <header class="bar">
    <button class="bar-back" onclick={() => goto(`${base}/report`)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
    </button>
    <span class="bar-title">{resultTitle || '진단 결과'}</span>
    <span class="bar-spacer"></span>
  </header>

  {#if scan}
    <div class="content">

      <!-- Summary -->
      <section class="summary-card">
        <div class="summary-stats">
          <div class="summary-stat">
            <span class="summary-num summary-num--crit">{summary.critical}</span>
            <span class="summary-label">{critLabel || '긴급'}</span>
          </div>
          <div class="summary-stat">
            <span class="summary-num summary-num--warn">{summary.warning}</span>
            <span class="summary-label">{warnLabel || '주의'}</span>
          </div>
          <div class="summary-stat">
            <span class="summary-num summary-num--ok">{summary.ok}</span>
            <span class="summary-label">{okLabel || '안전'}</span>
          </div>
        </div>
        <p class="summary-target">{scan.target}</p>
      </section>

      <!-- Findings -->
      <section class="findings">
        <h2 class="group-head">발견 항목</h2>
        {#each findings as finding}
          <button class="finding-row" onclick={() => openFinding(finding)}>
            <span class="finding-sev {sevClass(finding.severity)}">{sevSymbol(finding.severity)}</span>
            <div class="finding-info">
              <span class="finding-title">{finding.title_kr}</span>
              <span class="finding-desc">{finding.description_kr}</span>
            </div>
            <svg class="finding-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        {/each}
      </section>

      <!-- Recommended packages -->
      {#if recommendedPkgs.length > 0}
        <section class="reco">
          <h2 class="group-head">추천 패키지</h2>
          {#each recommendedPkgs as pkg}
            <div class="pkg-row">
              <div class="pkg-info">
                <span class="pkg-name">{pkg.name_kr}</span>
                <span class="pkg-price">W{formatPrice(pkg.price_krw)}</span>
              </div>
              <button class="pkg-add" onclick={() => handleAddToCart(pkg.id)}>+</button>
            </div>
          {/each}

          <button class="cta-primary" onclick={() => goto(`${base}/checkout`)}>
            {t('checkout.payment_complete.complete_title', '') || '결제하기'}
          </button>
          <button class="btn-outline" onclick={() => goto(`${base}/packages`)}>
            {t('empty_states.no_search_results.cta', '') || '전체 패키지 보기'}
          </button>
        </section>
      {/if}
    </div>

    <!-- Finding detail overlay -->
    {#if detailOpen && selectedFinding}
      <div class="overlay" onclick={closeFinding} role="dialog" aria-modal="true">
        <div class="detail-sheet" onclick={(e) => e.stopPropagation()}>
          <div class="detail-header">
            <h3 class="detail-title">{selectedFinding.title_kr}</h3>
            <button class="detail-close" onclick={closeFinding}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            </button>
          </div>
          <span class="detail-sev {sevClass(selectedFinding.severity)}">{selectedFinding.severity}</span>
          <p class="detail-desc">{selectedFinding.description_kr}</p>
          <p class="detail-loc">{selectedFinding.location}</p>

          {#if selectedFinding.recommendedPackageIds.length > 0}
            <div class="detail-pkgs">
              {#each selectedFinding.recommendedPackageIds as pkgId}
                {@const pkg = allPkgs.find((p) => p.id === pkgId)}
                {#if pkg}
                  <button class="btn-outline" onclick={() => { closeFinding(); goto(`${base}/packages/${pkg.id}`); }}>
                    {pkg.name_kr}
                  </button>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

  {:else}
    <div class="not-found">
      <p class="not-found-text">{t('errors.page_not_found_404.body', '')}</p>
      <button class="btn-outline" onclick={() => goto(`${base}/diagnose`)}>
        {t('empty_states.no_diagnosis_records.cta', '')}
      </button>
    </div>
  {/if}

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

  /* Bar */
  .bar {
    position: sticky; top: 0; z-index: 90; height: 48px;
    display: flex; align-items: center; gap: 12px;
    padding: 0 24px;
    background: rgba(5,6,10,0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-dim);
  }
  .bar-back {
    background: none; border: none; color: var(--text-secondary); cursor: pointer;
    display: flex; align-items: center; padding: 4px;
    transition: color 0.15s;
  }
  .bar-back:hover { color: var(--text-primary); }
  .bar-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .bar-spacer { flex: 1; }

  .content {
    flex: 1; padding: 24px 24px 32px; display: flex; flex-direction: column; gap: 28px;
  }

  /* Summary */
  .summary-card {
    display: flex; flex-direction: column; align-items: center; gap: 16px;
    padding: 24px;
    background: linear-gradient(165deg, var(--bg-deep) 0%, var(--bg-abyss) 100%);
    border: 1px solid var(--border-dim); border-radius: 14px;
  }
  .summary-stats { display: flex; gap: 40px; }
  .summary-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .summary-num {
    font-family: var(--mono); font-size: 28px; font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .summary-num--crit { color: var(--crit-color); }
  .summary-num--warn { color: var(--warn-color); }
  .summary-num--ok { color: var(--ok); }
  .summary-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.08em; }
  .summary-target { font-size: 12px; color: var(--text-tertiary); margin: 0; word-break: break-all; }

  /* Group head */
  .group-head {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-tertiary); margin: 0 0 8px;
    padding-bottom: 8px; border-bottom: 1px solid var(--border-dim);
  }

  /* Findings */
  .findings { display: flex; flex-direction: column; }

  .finding-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 0; border-bottom: 1px solid var(--border-dim);
    background: none; border-left: none; border-right: none; border-top: none;
    width: 100%; font-family: var(--font); cursor: pointer;
    text-align: left; color: var(--text-primary); transition: background 0.15s;
  }
  .finding-row:hover { background: rgba(10, 132, 255, 0.04); }

  .finding-sev {
    width: 28px; height: 28px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; flex-shrink: 0;
    border: 1px solid var(--border-dim); background: var(--bg-abyss);
  }
  .sev--crit { color: var(--crit-color); }
  .sev--warn { color: var(--warn-color); }
  .sev--ok { color: var(--ok); }

  .finding-info { flex: 1; display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
  .finding-title { font-size: 14px; color: var(--text-primary); }
  .finding-desc { font-size: 12px; color: var(--text-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .finding-arr { flex-shrink: 0; color: var(--text-tertiary); }

  /* Recommended */
  .reco { display: flex; flex-direction: column; gap: 8px; }

  .pkg-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(165deg, var(--bg-deep) 0%, var(--bg-abyss) 100%);
    border: 1px solid var(--border-dim);
    border-radius: 14px;
  }
  .pkg-info { display: flex; flex-direction: column; gap: 2px; }
  .pkg-name { font-size: 14px; color: var(--text-primary); }
  .pkg-price { font-family: var(--mono); font-size: 12px; color: var(--text-tertiary); }

  .pkg-add {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border-dim); background: var(--bg-abyss);
    color: var(--text-secondary); font-size: 16px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: color 0.15s, border-color 0.15s;
  }
  .pkg-add:hover { color: var(--text-primary); border-color: var(--border-active); }

  .cta-primary {
    padding: 10px 28px; border-radius: 980px; border: none;
    background: var(--blue-core); color: #fff;
    font-family: var(--font); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.2s; margin-top: 8px;
  }
  .cta-primary:hover { background: var(--blue-glow); }

  .btn-outline {
    padding: 8px 20px; border-radius: 980px; border: 1px solid var(--border-dim);
    background: transparent; color: var(--text-secondary); font-family: var(--font);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-outline:hover { color: var(--text-primary); border-color: var(--border-active); }

  /* Overlay */
  .overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(5,6,10,0.8); display: flex;
    align-items: flex-end; justify-content: center;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .detail-sheet {
    width: 100%; max-width: 480px; max-height: 80dvh;
    background: linear-gradient(165deg, var(--bg-deep) 0%, var(--bg-abyss) 100%);
    border: 1px solid var(--border-dim);
    border-radius: 14px 14px 0 0; padding: 24px;
    display: flex; flex-direction: column; gap: 16px;
    overflow-y: auto;
  }

  .detail-header {
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  .detail-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0; flex: 1; }
  .detail-close {
    background: none; border: none; color: var(--text-tertiary); cursor: pointer;
    padding: 4px; display: flex; align-items: center;
    transition: color 0.15s;
  }
  .detail-close:hover { color: var(--text-primary); }

  .detail-sev {
    font-size: 12px; font-weight: 500; padding: 2px 10px;
    border-radius: 6px; border: 1px solid var(--border-dim); background: var(--bg-abyss);
    align-self: flex-start;
  }

  .detail-desc { font-size: 14px; color: var(--text-secondary); margin: 0; line-height: 1.6; }
  .detail-loc { font-family: var(--mono); font-size: 12px; color: var(--text-tertiary); margin: 0; word-break: break-all; }
  .detail-pkgs { display: flex; flex-wrap: wrap; gap: 8px; }

  /* Not found */
  .not-found {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 16px; padding: 48px 24px;
  }
  .not-found-text { font-size: 14px; color: var(--text-tertiary); margin: 0; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
