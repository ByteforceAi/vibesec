<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/loader';

  const symptoms = [
    { id: 'billing', label: t('incident.symptoms.billing', '') },
    { id: 'data', label: t('incident.symptoms.data', '') },
    { id: 'site', label: t('incident.symptoms.site', '') },
    { id: 'account', label: t('incident.symptoms.account', '') },
    { id: 'other', label: t('incident.symptoms.other', '') },
  ];

  let selectedSymptom = $state<string | null>(null);
  let contacted = $state(false);

  function selectSymptom(id: string) { selectedSymptom = id; }
  function handleContact() { contacted = true; }
  function handleCall() { contacted = true; }
</script>

<div class="page">

  <header class="bar">
    <button class="bar-back" onclick={() => goto(`${base}/`)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
    </button>
    <span class="bar-title">{t('incident.page.title', '') || '긴급 상담'}</span>
    <span class="bar-spacer"></span>
  </header>

  <div class="content">

    {#if contacted}
      <section class="state-section">
        <div class="state-card">
          <svg class="state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#32d74b" stroke-width="2" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          <h2 class="state-title">{t('incident.contact.complete_title', '')}</h2>
          <p class="state-body">{t('incident.contact.complete_body', '')}</p>
          <button class="cta-primary" onclick={() => goto(`${base}/`)}>
            {t('incident.nav.back_to_home', '') || '홈으로'}
          </button>
        </div>
      </section>

    {:else}
      <!-- Header -->
      <section class="emer-header">
        <h1 class="emer-title">{t('incident.page.subtitle', '') || '어떤 문제가 발생했나요?'}</h1>
      </section>

      <!-- Symptom selection -->
      <section class="symptoms">
        {#each symptoms as symptom}
          <button
            class="symptom-btn"
            class:symptom-btn--on={selectedSymptom === symptom.id}
            onclick={() => selectSymptom(symptom.id)}
          >
            <span class="symptom-label">{symptom.label}</span>
            {#if selectedSymptom === symptom.id}
              <svg class="symptom-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#32d74b" stroke-width="2" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            {/if}
          </button>
        {/each}
      </section>

      <!-- Tip -->
      <section class="tip">
        <p class="tip-text">{t('incident.tip.emergency', '')}</p>
      </section>

      <!-- CTAs -->
      <section class="cta-section">
        <button
          class="cta-primary"
          disabled={!selectedSymptom}
          onclick={handleContact}
        >
          {t('incident.contact.kakao', '') || '카카오톡 상담'}
        </button>
        <button
          class="btn-outline btn-full"
          disabled={!selectedSymptom}
          onclick={handleCall}
        >
          {t('incident.contact.call', '') || '전화 상담'}
        </button>
      </section>
    {/if}

  </div>

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
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;

    display: flex; flex-direction: column; min-height: 100dvh;
    background: var(--black); color: var(--tx); font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }

  /* Bar */
  .bar {
    position: sticky; top: 0; z-index: 90; height: 48px;
    display: flex; align-items: center; gap: 12px;
    padding: 0 24px; background: var(--black); border-bottom: 1px solid var(--brd);
  }
  .bar-back {
    background: none; border: none; color: var(--tx2); cursor: pointer;
    display: flex; align-items: center; padding: 4px; transition: color 0.15s;
  }
  .bar-back:hover { color: var(--tx); }
  .bar-title { font-size: 14px; font-weight: 600; color: var(--tx); }
  .bar-spacer { flex: 1; }

  .content {
    flex: 1; padding: 24px 24px 32px; display: flex; flex-direction: column; gap: 24px;
  }

  /* Header */
  .emer-header {
    padding: 16px 0;
  }
  .emer-title {
    font-size: 22px; font-weight: 700; letter-spacing: -0.02em;
    color: var(--tx); margin: 0;
  }

  /* Symptoms */
  .symptoms { display: flex; flex-direction: column; gap: 6px; }

  .symptom-btn {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-radius: 6px;
    border: 1px solid var(--brd); background: var(--s1);
    color: var(--tx2); font-family: var(--font); font-size: 14px;
    cursor: pointer; width: 100%; text-align: left;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .symptom-btn:hover { background: var(--s2); color: var(--tx); }
  .symptom-btn--on {
    border-color: rgba(255,255,255,0.12); background: var(--s2); color: var(--tx);
  }

  .symptom-label { flex: 1; }
  .symptom-check { flex-shrink: 0; }

  /* Tip */
  .tip {
    border-left: 2px solid var(--tx3);
    padding-left: 16px;
  }
  .tip-text {
    font-size: 13px; color: var(--tx3); margin: 0; line-height: 1.5;
  }

  /* CTAs */
  .cta-section {
    display: flex; flex-direction: column; gap: 8px;
    margin-top: auto; padding-top: 16px;
  }

  .cta-primary {
    width: 100%; padding: 10px 28px; border-radius: 6px; border: none;
    background: var(--tx); color: var(--black);
    font-family: var(--font); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
  }
  .cta-primary:hover { background: #e0e0e0; }
  .cta-primary:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-outline {
    padding: 8px 20px; border-radius: 6px; border: 1px solid var(--brd);
    background: transparent; color: var(--tx2); font-family: var(--font);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-outline:hover { color: var(--tx); border-color: rgba(255,255,255,0.15); }
  .btn-outline:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn-full { width: 100%; }

  /* State (complete) */
  .state-section {
    flex: 1; display: flex; align-items: center; justify-content: center;
  }
  .state-card {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 16px; padding: 40px 24px;
    background: var(--s1); border: 1px solid var(--brd); border-radius: 8px;
    max-width: 360px; width: 100%;
  }
  .state-icon { margin-bottom: 8px; }
  .state-title { font-size: 20px; font-weight: 700; color: var(--tx); margin: 0; }
  .state-body { font-size: 14px; color: var(--tx2); margin: 0; line-height: 1.5; }
</style>
