<script lang="ts">
  import { t, getSection } from '$lib/i18n/loader';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import {
    scanState,
    startScan,
    updateProgress,
    completeScan,
    failScan,
    resetScan,
  } from '$lib/stores/scan';
  import { fakeScan } from '$lib/mock/fake-scanner';

  let url = $state('');
  let errorMsg = $state('');

  let status = $state<string>('idle');
  let progress = $state<number>(0);
  let progressMessage = $state<string>('');

  $effect(() => {
    const unsub = scanState.subscribe((s) => {
      status = s.status;
      progress = s.progress;
      progressMessage = s.progressMessage;
    });
    return unsub;
  });

  const inputPrompt = t('diagnosis.url_input_prompt.default', '');
  const inputHint = t('diagnosis.url_input_prompt.hint', '');
  const emptyError = t('diagnosis.error_copy.empty_value', '');
  const invalidError = t('diagnosis.error_copy.invalid_url', '');
  const progressMessages = getSection('diagnosis', 'scanning_progress_copy_10_variations');

  function validateUrl(input: string): boolean {
    if (!input.trim()) { errorMsg = emptyError; return false; }
    const urlLike = /^(https?:\/\/|github\.com|[\w.-]+\.(com|io|dev|app|xyz|co|net|org))/i;
    if (!urlLike.test(input.trim())) { errorMsg = invalidError; return false; }
    errorMsg = '';
    return true;
  }

  async function handleStartScan() {
    if (!validateUrl(url)) return;
    let target = url.trim();
    if (!target.startsWith('http')) target = 'https://' + target;
    startScan();
    try {
      const result = await fakeScan(target, progressMessages, (prog, msg) => {
        updateProgress(prog, msg);
      });
      completeScan(result);
      goto(`${base}/report/${result.scanId}`);
    } catch {
      failScan(t('errors.diagnosis_failure.body', ''));
    }
  }

  function handleRetry() { resetScan(); errorMsg = ''; }
</script>

<div class="page">

  <header class="bar">
    <span class="bar-brand">Byteforce Security</span>
    <button class="bar-action" onclick={() => goto(`${base}/incident`)}>상담 예약</button>
  </header>

  <div class="content">

    {#if status === 'idle' || status === 'error'}
      <section class="input-section">
        <h1 class="page-title">{inputPrompt || '프로젝트 주소를 알려주세요'}</h1>
        <p class="page-hint">{inputHint}</p>

        <div class="field-wrap">
          <input
            class="field"
            type="url"
            placeholder="github.com/my-project"
            bind:value={url}
            onkeydown={(e) => { if (e.key === 'Enter') handleStartScan(); }}
            aria-label={inputPrompt}
          />
        </div>

        {#if errorMsg}
          <p class="error-msg" role="alert">{errorMsg}</p>
        {/if}

        {#if status === 'error'}
          <p class="error-msg" role="alert">{t('errors.diagnosis_failure.body', '')}</p>
        {/if}

        <button
          class="cta-primary"
          disabled={!url.trim()}
          onclick={handleStartScan}
        >
          {t('onboarding.step_3_free_diagnose.cta', '') || '점검 시작'}
        </button>

        {#if status === 'error'}
          <button class="btn-outline" onclick={handleRetry}>
            {t('errors.diagnosis_failure.cta', '') || '다시 시도'}
          </button>
        {/if}
      </section>

    {:else if status === 'scanning'}
      <section class="scanning-section">
        <div class="progress-ring-wrap">
          <svg class="progress-ring" width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.06)" stroke-width="3" fill="none" />
            <circle
              cx="40" cy="40" r="36"
              stroke="#ffffff"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
              stroke-dasharray={2 * Math.PI * 36}
              stroke-dashoffset={2 * Math.PI * 36 * (1 - progress / 100)}
              transform="rotate(-90 40 40)"
              style="transition: stroke-dashoffset 0.4s ease"
            />
          </svg>
          <span class="progress-pct">{Math.round(progress)}</span>
        </div>

        <p class="progress-msg">{progressMessage}</p>

        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: {progress}%"></div>
        </div>
      </section>
    {/if}

  </div>

  <nav class="nav">
    <button class="nav-item" onclick={() => goto(`${base}/`)}>홈</button>
    <button class="nav-item nav-item--on" onclick={() => goto(`${base}/diagnose`)}>진단</button>
    <button class="nav-item" onclick={() => goto(`${base}/report`)}>리포트</button>
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

  .bar {
    position: sticky; top: 0; z-index: 90;
    height: 48px; display: flex; align-items: center;
    justify-content: space-between; padding: 0 24px;
    background: var(--black); border-bottom: 1px solid var(--brd);
  }
  .bar-brand { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--tx3); }
  .bar-action {
    font-family: var(--font); font-size: 13px; font-weight: 500; color: var(--tx2);
    background: none; border: 1px solid var(--brd); border-radius: 6px; padding: 5px 14px; cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .bar-action:hover { color: var(--tx); border-color: rgba(255,255,255,0.15); }

  .content {
    flex: 1; padding: 32px 24px 100px;
    display: flex; flex-direction: column; justify-content: center;
  }

  .input-section {
    display: flex; flex-direction: column; gap: 16px;
    max-width: 480px; margin: 0 auto; width: 100%;
  }

  .page-title {
    font-size: 22px; font-weight: 700; letter-spacing: -0.02em;
    color: var(--tx); margin: 0;
  }

  .page-hint {
    font-size: 14px; color: var(--tx3); margin: 0; line-height: 1.5;
  }

  .field-wrap { width: 100%; }

  .field {
    width: 100%; box-sizing: border-box;
    padding: 12px 16px; border-radius: 6px;
    border: 1px solid var(--brd); background: var(--s1);
    color: var(--tx); font-family: var(--mono); font-size: 14px;
    outline: none; transition: border-color 0.2s;
  }
  .field::placeholder { color: var(--tx3); }
  .field:focus { border-color: rgba(255,255,255,0.15); }

  .error-msg {
    font-size: 13px; color: #ff453a; margin: 0;
  }

  .cta-primary {
    padding: 10px 28px; border-radius: 6px; border: none;
    background: var(--tx); color: var(--black);
    font-family: var(--font); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
    align-self: flex-start;
  }
  .cta-primary:hover { background: #e0e0e0; }
  .cta-primary:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-outline {
    padding: 8px 20px; border-radius: 6px;
    border: 1px solid var(--brd); background: transparent;
    color: var(--tx2); font-family: var(--font); font-size: 13px; font-weight: 500;
    cursor: pointer; align-self: flex-start;
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-outline:hover { color: var(--tx); border-color: rgba(255,255,255,0.15); }

  /* Scanning */
  .scanning-section {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 24px; padding: 48px 0;
  }

  .progress-ring-wrap {
    position: relative; width: 80px; height: 80px;
    display: flex; align-items: center; justify-content: center;
  }

  .progress-ring {
    position: absolute; top: 0; left: 0;
  }

  .progress-pct {
    font-family: var(--mono); font-size: 18px; font-weight: 500; color: var(--tx);
  }

  .progress-msg {
    font-family: var(--mono); font-size: 14px; color: var(--tx2);
    margin: 0; min-height: 2em;
  }

  .progress-bar {
    width: 100%; max-width: 280px; height: 2px;
    background: rgba(255,255,255,0.06); border-radius: 1px; overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%; background: var(--tx);
    transition: width 0.4s ease; border-radius: 1px;
  }

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
