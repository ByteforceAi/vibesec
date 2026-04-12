<script lang="ts">
  import { t } from '$lib/i18n/loader';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  interface Step {
    title: string;
    body: string;
    cta: string;
    num: string;
  }

  const steps: Step[] = [
    {
      title: t('onboarding.step_1_welcome.title', ''),
      body: t('onboarding.step_1_welcome.body', ''),
      cta: t('onboarding.step_1_welcome.cta', ''),
      num: '01',
    },
    {
      title: t('onboarding.step_2_connect_project.title', ''),
      body: t('onboarding.step_2_connect_project.body', ''),
      cta: t('onboarding.step_2_connect_project.cta', ''),
      num: '02',
    },
    {
      title: t('onboarding.step_3_free_diagnose.title', ''),
      body: t('onboarding.step_3_free_diagnose.body', ''),
      cta: t('onboarding.step_3_free_diagnose.cta', ''),
      num: '03',
    },
    {
      title: t('onboarding.step_4_check_results.title', ''),
      body: t('onboarding.step_4_check_results.body', ''),
      cta: t('onboarding.step_4_check_results.cta', ''),
      num: '04',
    },
  ];

  let currentStep = $state(0);

  function nextStep() {
    if (currentStep < steps.length - 1) currentStep++;
    else finishOnboarding();
  }

  function skipOnboarding() { finishOnboarding(); }

  function finishOnboarding() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('vibesec_visited', 'true');
    }
    goto(`${base}/diagnose`);
  }

  const step = $derived(steps[currentStep]);
  const isLast = $derived(currentStep === steps.length - 1);
</script>

<div class="page">

  <div class="skip-area">
    {#if !isLast}
      <button class="skip-btn" onclick={skipOnboarding}>건너뛰기</button>
    {/if}
  </div>

  <div class="step-area">
    <div class="step-card">
      <span class="step-num">{step.num}</span>
      <h1 class="step-title">{step.title}</h1>
      <p class="step-body">{step.body}</p>
    </div>
  </div>

  <div class="dots" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemax={steps.length}>
    {#each steps as _, i}
      <span
        class="dot"
        class:dot--active={i === currentStep}
        class:dot--done={i < currentStep}
      ></span>
    {/each}
  </div>

  <div class="cta-area">
    <button class="cta-primary" onclick={nextStep}>{step.cta}</button>
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
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
    --mono: "JetBrains Mono", "SF Mono", monospace;

    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding: 24px;
    background: var(--black);
    color: var(--tx);
    font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }

  .skip-area {
    display: flex;
    justify-content: flex-end;
    min-height: 44px;
    padding-top: 8px;
  }

  .skip-btn {
    background: none; border: none;
    font-family: var(--font); font-size: 13px; font-weight: 500;
    color: var(--tx3); cursor: pointer;
    transition: color 0.15s;
  }
  .skip-btn:hover { color: var(--tx2); }

  .step-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    padding: 32px 24px;
    background: var(--s1);
    border: 1px solid var(--brd);
    border-radius: 8px;
    max-width: 360px;
    width: 100%;
  }

  .step-num {
    font-family: var(--mono);
    font-size: 40px;
    font-weight: 500;
    color: var(--tx3);
    line-height: 1;
  }

  .step-title {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--tx);
    margin: 0;
  }

  .step-body {
    font-size: 15px;
    color: var(--tx2);
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }

  .dots {
    display: flex;
    justify-content: center;
    gap: 10px;
    padding: 32px 0;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    transition: all 300ms ease;
  }

  .dot--active {
    background: var(--tx);
    width: 24px;
    border-radius: 4px;
  }

  .dot--done {
    background: var(--tx);
    opacity: 0.3;
  }

  .cta-area {
    padding-bottom: 32px;
  }

  .cta-primary {
    width: 100%;
    padding: 12px 28px;
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
  .cta-primary:hover { background: #e0e0e0; }
</style>
