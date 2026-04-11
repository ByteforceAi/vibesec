<script lang="ts">
  import { Button, Card } from '$lib/components';
  import { t } from '$lib/i18n/loader';
  import { goto } from '$app/navigation';

  // Onboarding steps from content/copy/onboarding.md
  interface Step {
    title: string;
    body: string;
    cta: string;
    icon: string;
  }

  const steps: Step[] = [
    {
      title: t('onboarding.step_1_welcome.title', ''),
      body: t('onboarding.step_1_welcome.body', ''),
      cta: t('onboarding.step_1_welcome.cta', ''),
      icon: '\uD83D\uDC4B',
    },
    {
      title: t('onboarding.step_2_connect_project.title', ''),
      body: t('onboarding.step_2_connect_project.body', ''),
      cta: t('onboarding.step_2_connect_project.cta', ''),
      icon: '\uD83D\uDD17',
    },
    {
      title: t('onboarding.step_3_free_diagnose.title', ''),
      body: t('onboarding.step_3_free_diagnose.body', ''),
      cta: t('onboarding.step_3_free_diagnose.cta', ''),
      icon: '\uD83E\uDE7A',
    },
    {
      title: t('onboarding.step_4_check_results.title', ''),
      body: t('onboarding.step_4_check_results.body', ''),
      cta: t('onboarding.step_4_check_results.cta', ''),
      icon: '\uD83D\uDCCB',
    },
  ];

  let currentStep = $state(0);

  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
    } else {
      finishOnboarding();
    }
  }

  function skipOnboarding() {
    finishOnboarding();
  }

  function finishOnboarding() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('vibesec_visited', 'true');
    }
    goto('/diagnose');
  }

  const step = $derived(steps[currentStep]);
  const isLast = $derived(currentStep === steps.length - 1);
</script>

<div class="onboarding">
  <!-- Skip button -->
  <div class="skip-area">
    {#if !isLast}
      <Button variant="ghost" size="sm" onclick={skipOnboarding}>
        Skip
      </Button>
    {/if}
  </div>

  <!-- Step content -->
  <div class="step-content">
    <Card glass padding="lg">
      <div class="step-inner">
        <span class="step-icon" aria-hidden="true">{step.icon}</span>
        <h1 class="step-title">{step.title}</h1>
        <p class="step-body">{step.body}</p>
      </div>
    </Card>
  </div>

  <!-- Progress dots -->
  <div class="dots" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemax={steps.length}>
    {#each steps as _, i}
      <span
        class="dot"
        class:dot--active={i === currentStep}
        class:dot--done={i < currentStep}
      ></span>
    {/each}
  </div>

  <!-- CTA -->
  <div class="cta-area">
    <Button variant="primary" size="lg" fullWidth onclick={nextStep}>
      {step.cta}
    </Button>
  </div>
</div>

<style>
  .onboarding {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding: var(--space-md);
  }

  .skip-area {
    display: flex;
    justify-content: flex-end;
    min-height: 44px;
    padding-top: var(--space-sm);
  }

  .step-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-md);
    padding: var(--space-lg) 0;
  }

  .step-icon {
    font-size: 64px;
    line-height: 1;
  }

  .step-title {
    font: var(--font-title-1);
    color: var(--color-label);
    margin: 0;
  }

  .step-body {
    font: var(--font-body);
    color: var(--color-label-secondary);
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }

  .dots {
    display: flex;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-lg) 0;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-fill-secondary);
    transition: all 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .dot--active {
    background: var(--color-system-blue);
    width: 24px;
    border-radius: 4px;
  }

  .dot--done {
    background: var(--color-system-blue);
    opacity: 0.4;
  }

  .cta-area {
    padding-bottom: var(--space-xl);
  }

  @media (prefers-reduced-motion: reduce) {
    .dot {
      transition: none;
    }
  }
</style>
