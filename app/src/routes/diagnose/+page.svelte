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
    <div class="bar-left">
      <span class="bar-brand">BYTEFORCE</span>
    </div>
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
            <circle cx="40" cy="40" r="36" stroke="rgba(120,160,220,0.08)" stroke-width="3" fill="none" />
            <circle
              cx="40" cy="40" r="36"
              stroke="var(--blue-core)"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
              stroke-dasharray={2 * Math.PI * 36}
              stroke-dashoffset={2 * Math.PI * 36 * (1 - progress / 100)}
              transform="rotate(-90 40 40)"
              style="transition: stroke-dashoffset 0.4s var(--ease-organic)"
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

    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10, 132, 255, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0, 71, 179, 0.08) 0%, transparent 50%),
      var(--bg-void);
    color: var(--text-primary);
    font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }

  .bar {
    position: sticky; top: 0; z-index: 90;
    height: 48px; display: flex; align-items: center;
    justify-content: space-between; padding: 0 24px;
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
    color: var(--text-primary); margin: 0;
  }

  .page-hint {
    font-size: 14px; color: var(--text-tertiary); margin: 0; line-height: 1.5;
  }

  .field-wrap { width: 100%; }

  .field {
    width: 100%; box-sizing: border-box;
    padding: 12px 16px; border-radius: 10px;
    border: 1px solid var(--border-dim); background: var(--bg-abyss);
    color: var(--text-primary); font-family: var(--mono); font-size: 14px;
    outline: none; transition: border-color 0.2s;
  }
  .field::placeholder { color: var(--text-tertiary); }
  .field:focus { border-color: var(--border-active); }

  .error-msg {
    font-size: 13px; color: var(--coral-alert); margin: 0;
  }

  .cta-primary {
    padding: 10px 28px; border-radius: 980px; border: none;
    background: var(--blue-core); color: #fff;
    font-family: var(--font); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
    align-self: flex-start;
  }
  .cta-primary:hover { background: var(--blue-glow); }
  .cta-primary:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-outline {
    padding: 8px 20px; border-radius: 980px;
    border: 1px solid var(--border-dim); background: transparent;
    color: var(--text-secondary); font-family: var(--font); font-size: 13px; font-weight: 500;
    cursor: pointer; align-self: flex-start;
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-outline:hover { color: var(--text-primary); border-color: var(--border-active); }

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
    font-family: var(--mono); font-size: 18px; font-weight: 500; color: var(--text-primary);
  }

  .progress-msg {
    font-family: var(--mono); font-size: 14px; color: var(--text-secondary);
    margin: 0; min-height: 2em;
  }

  .progress-bar {
    width: 100%; max-width: 280px; height: 2px;
    background: var(--border-dim); border-radius: 1px; overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%; background: var(--blue-core);
    transition: width 0.4s var(--ease-organic); border-radius: 1px;
  }

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
