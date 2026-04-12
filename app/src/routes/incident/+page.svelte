<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { Button, Card, Toolbar } from '$lib/components';
  import { t } from '$lib/i18n/loader';

  // Symptoms from journey.md S7
  // These correspond to common emergency scenarios
  const symptoms = [
    { id: 'billing', icon: '\uD83D\uDCB3', label: t('incident.symptoms.billing', '') },
    { id: 'data', icon: '\uD83D\uDDC4', label: t('incident.symptoms.data', '') },
    { id: 'site', icon: '\uD83C\uDF10', label: t('incident.symptoms.site', '') },
    { id: 'account', icon: '\uD83D\uDD12', label: t('incident.symptoms.account', '') },
    { id: 'other', icon: '\u2753', label: t('incident.symptoms.other', '') },
  ];

  let selectedSymptom = $state<string | null>(null);
  let contacted = $state(false);

  function selectSymptom(id: string) {
    selectedSymptom = id;
  }

  function handleContact() {
    // Mock contact - in real app would open kakao link
    contacted = true;
  }

  function handleCall() {
    // Mock phone call
    contacted = true;
  }
</script>

<div class="incident-page">
  <Toolbar title={t('incident.page.title', '')}>
    {#snippet leading()}
      <Button variant="ghost" size="sm" ariaLabel={t('incident.nav.back_to_home', '')} onclick={() => goto(`${base}/`)}>
        {'\u2190'}
      </Button>
    {/snippet}
  </Toolbar>

  <div class="incident-content">
    {#if contacted}
      <!-- Contact complete -->
      <section class="contact-complete">
        <Card glass padding="lg">
          <div class="complete-inner">
            <span class="complete-icon" aria-hidden="true">{'\uD83D\uDC4C'}</span>
            <h2 class="complete-title">{t('incident.contact.complete_title', '')}</h2>
            <p class="complete-body">{t('incident.contact.complete_body', '')}</p>
            <Button variant="primary" size="lg" fullWidth onclick={() => goto(`${base}/`)}>
              {t('incident.nav.back_to_home', '')}
            </Button>
          </div>
        </Card>
      </section>
    {:else}
      <!-- Emergency header -->
      <section class="emergency-header">
        <Card glass padding="lg">
          <div class="header-inner">
            <span class="header-icon" aria-hidden="true">{'\uD83D\uDE91'}</span>
            <h1 class="header-title">{t('incident.page.subtitle', '')}</h1>
          </div>
        </Card>
      </section>

      <!-- Symptom selection -->
      <section class="symptoms">
        {#each symptoms as symptom}
          <Card
            glass
            padding="md"
            onclick={() => selectSymptom(symptom.id)}
            ariaLabel={symptom.label}
          >
            <div class="symptom-row" class:symptom-row--selected={selectedSymptom === symptom.id}>
              <span class="symptom-icon" aria-hidden="true">{symptom.icon}</span>
              <span class="symptom-label">{symptom.label}</span>
              {#if selectedSymptom === symptom.id}
                <span class="check-mark" aria-hidden="true">{'\u2713'}</span>
              {/if}
            </div>
          </Card>
        {/each}
      </section>

      <!-- Emergency tip -->
      <section class="emergency-tip">
        <Card padding="md" glass={false}>
          <p class="tip-text">{t('incident.tip.emergency', '')}</p>
        </Card>
      </section>

      <!-- CTAs -->
      <section class="cta-section">
        <Button
          variant="destructive"
          size="lg"
          fullWidth
          disabled={!selectedSymptom}
          onclick={handleContact}
        >
          {t('incident.contact.kakao', '')}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          disabled={!selectedSymptom}
          onclick={handleCall}
        >
          {t('incident.contact.call', '')}
        </Button>
      </section>
    {/if}
  </div>
</div>

<style>
  .incident-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    /* Subtle red tint for urgency but not fear */
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-system-red) 5%, var(--color-bg-primary)) 0%,
      var(--color-bg-primary) 40%
    );
  }

  .incident-content {
    flex: 1;
    padding: var(--space-md);
    padding-bottom: var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .header-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-md);
  }

  .header-icon {
    font-size: 48px;
    line-height: 1;
  }

  .header-title {
    font: var(--font-title-1);
    color: var(--color-label);
    margin: 0;
  }

  .symptoms {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .symptom-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    min-height: 44px;
  }

  .symptom-row--selected {
    color: var(--color-system-blue);
  }

  .symptom-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .symptom-label {
    flex: 1;
    font: var(--font-body);
    color: var(--color-label);
  }

  .symptom-row--selected .symptom-label {
    color: var(--color-system-blue);
    font-weight: 600;
  }

  .check-mark {
    color: var(--color-system-blue);
    font-size: 18px;
    font-weight: 700;
  }

  .emergency-tip {
    border-left: 3px solid var(--color-system-orange);
    border-radius: var(--radius-md);
  }

  .tip-text {
    font: var(--font-subheadline);
    color: var(--color-label-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .cta-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: auto;
    padding-top: var(--space-md);
  }

  .complete-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-md);
  }

  .complete-icon {
    font-size: 48px;
    line-height: 1;
  }

  .complete-title {
    font: var(--font-title-2);
    color: var(--color-label);
    margin: 0;
  }

  .complete-body {
    font: var(--font-body);
    color: var(--color-label-secondary);
    margin: 0;
  }
</style>
