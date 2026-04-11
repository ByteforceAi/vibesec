<script lang="ts">
  import { Button, Card, Input, ProgressIndicator, Toolbar } from '$lib/components';
  import { t, getSection } from '$lib/i18n/loader';
  import { goto } from '$app/navigation';
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

  // Subscribe to scan state reactively
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

  // Copy
  const inputPrompt = t('diagnosis.url_input_prompt.default', '');
  const inputHint = t('diagnosis.url_input_prompt.hint', '');
  const emptyError = t('diagnosis.error_copy.empty_value', '');
  const invalidError = t('diagnosis.error_copy.invalid_url', '');

  // Progress messages from content/copy/diagnosis.md
  const progressMessages = getSection('diagnosis', 'scanning_progress_copy_10_variations');

  function validateUrl(input: string): boolean {
    if (!input.trim()) {
      errorMsg = emptyError;
      return false;
    }
    // Accept github URLs, deployed URLs, or any URL-like string
    const urlLike = /^(https?:\/\/|github\.com|[\w.-]+\.(com|io|dev|app|xyz|co|net|org))/i;
    if (!urlLike.test(input.trim())) {
      errorMsg = invalidError;
      return false;
    }
    errorMsg = '';
    return true;
  }

  async function handleStartScan() {
    if (!validateUrl(url)) return;

    // Normalize URL
    let target = url.trim();
    if (!target.startsWith('http')) {
      target = 'https://' + target;
    }

    startScan();

    try {
      const result = await fakeScan(target, progressMessages, (prog, msg) => {
        updateProgress(prog, msg);
      });
      completeScan(result);
      // Navigate to report
      goto(`/report/${result.scanId}`);
    } catch {
      failScan(t('errors.diagnosis_failure.body', ''));
    }
  }

  function handleRetry() {
    resetScan();
    errorMsg = '';
  }
</script>

<div class="diagnose-page">
  <Toolbar title={t('diagnosis.url_input_prompt.default', '')} largeTitle />

  <div class="diagnose-content">
    {#if status === 'idle' || status === 'error'}
      <!-- URL Input State -->
      <section class="input-section">
        <Card glass padding="lg">
          <div class="input-inner">
            <span class="input-icon" aria-hidden="true">{'\uD83D\uDD0D'}</span>
            <h2 class="input-title">{inputPrompt}</h2>
            <p class="input-hint">{inputHint}</p>

            <div class="url-field">
              <Input
                bind:value={url}
                type="url"
                placeholder="github.com/my-project"
                ariaLabel={inputPrompt}
                onsubmit={handleStartScan}
              />
            </div>

            {#if errorMsg}
              <p class="error-msg" role="alert">{errorMsg}</p>
            {/if}

            {#if status === 'error'}
              <p class="error-msg" role="alert">{t('errors.diagnosis_failure.body', '')}</p>
            {/if}

            <p class="safety-note">
              {t('diagnosis.url_input_prompt.hint', '')}
            </p>

            <div class="submit-cta">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!url.trim()}
                onclick={handleStartScan}
              >
                {t('onboarding.step_3_free_diagnose.cta', '')}
              </Button>
            </div>

            {#if status === 'error'}
              <Button variant="secondary" size="md" onclick={handleRetry}>
                {t('errors.diagnosis_failure.cta', '')}
              </Button>
            {/if}
          </div>
        </Card>
      </section>
    {:else if status === 'scanning'}
      <!-- Scanning State -->
      <section class="scanning-section">
        <Card glass padding="lg">
          <div class="scanning-inner">
            <ProgressIndicator
              value={progress}
              variant="circular"
              showLabel
              size={80}
              ariaLabel={progressMessage}
            />

            <p class="progress-message">{progressMessage}</p>

            <div class="progress-bar-wrapper">
              <ProgressIndicator value={progress} variant="linear" />
            </div>
          </div>
        </Card>
      </section>
    {/if}
  </div>
</div>

<style>
  .diagnose-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .diagnose-content {
    flex: 1;
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .input-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-md);
  }

  .input-icon {
    font-size: 48px;
    line-height: 1;
  }

  .input-title {
    font: var(--font-title-2);
    color: var(--color-label);
    margin: 0;
  }

  .input-hint {
    font: var(--font-subheadline);
    color: var(--color-label-secondary);
    margin: 0;
  }

  .url-field {
    width: 100%;
  }

  .error-msg {
    font: var(--font-subheadline);
    color: var(--color-system-red);
    margin: 0;
  }

  .safety-note {
    font: var(--font-caption-1);
    color: var(--color-label-tertiary);
    margin: 0;
  }

  .submit-cta {
    width: 100%;
  }

  .scanning-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-lg);
    padding: var(--space-xl) 0;
  }

  .progress-message {
    font: var(--font-headline);
    color: var(--color-label);
    margin: 0;
    min-height: 2em;
  }

  .progress-bar-wrapper {
    width: 100%;
    max-width: 280px;
  }
</style>
