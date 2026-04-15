<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { addInquiry } from '$lib/stores/inquiries';

  // --- Form state ---
  let checkType = $state<'check' | 'urgent' | null>(null);
  let tool = $state<string | null>(null);
  let projectUrl = $state('');
  let visitType = $state<string | null>(null);
  let email = $state('');
  let phone = $state('');
  let message = $state('');
  let submitted = $state(false);
  let processing = $state(false);
  let processingStep = $state(0);
  let emailError = $state('');

  const processingSteps = [
    '접수 내용을 확인하고 있습니다',
    '담당 엔지니어를 배정하고 있습니다',
    '견적서 양식을 준비하고 있습니다',
    '접수가 완료되었습니다',
  ];

  const tools = ['Cursor', 'Claude Code', 'v0', 'Lovable', 'bolt.new', '기타'];
  const visits = [
    { id: 'seoul', label: '서울 지점', sub: '마곡나루역' },
    { id: 'busan', label: '부산 지점', sub: '해운대 오션타워' },
    { id: 'online', label: '온라인', sub: 'Zoom / Meet' },
  ];

  function validateEmail(e: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function handleSubmit() {
    if (!checkType) return;
    if (!email || !validateEmail(email)) {
      emailError = '올바른 이메일 주소를 입력해주세요.';
      return;
    }
    emailError = '';

    const data = {
      type: checkType,
      tool,
      projectUrl: projectUrl || null,
      visitType,
      email,
      phone: phone || null,
      message: message || null,
      timestamp: new Date().toISOString(),
    };

    // Save via data layer (swappable to Vercel KV later)
    addInquiry(data);

    // Labor Illusion: show processing steps before completion
    processing = true;
    processingStep = 0;

    for (let i = 1; i < processingSteps.length; i++) {
      setTimeout(() => { processingStep = i; }, i * 800);
    }

    setTimeout(() => {
      processing = false;
      submitted = true;
    }, processingSteps.length * 800);
  }
</script>

<svelte:head>
  <title>상담 예약 | Byteforce Security</title>
  <meta name="description" content="바이브코딩 보안 점검 상담을 예약하세요. 24시간 내 견적서 발송. 서울, 부산, 온라인." />
  <meta property="og:title" content="상담 예약 | Byteforce Security" />
  <meta property="og:description" content="바이브코딩 보안 점검 상담을 예약하세요. 24시간 내 견적서 발송. 서울, 부산, 온라인." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://byteforceai.github.io/vibesec/incident" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="상담 예약 | Byteforce Security" />
  <meta name="twitter:description" content="바이브코딩 보안 점검 상담을 예약하세요. 24시간 내 견적서 발송. 서울, 부산, 온라인." />
</svelte:head>

<div class="page">
  <header class="bar">
    <span class="bar-brand">BYTEFORCE</span>
    <button class="bar-link" onclick={() => goto(`${base}/`)}>홈으로</button>
  </header>

  <div class="form-area">
    {#if processing}
      <!-- Processing: Labor Illusion -->
      <div class="processing">
        <div class="proc-objet">
          <div class="proc-ring">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(10,132,255,0.1)" stroke-width="2"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--blue-core)" stroke-width="2.5" stroke-linecap="round"
                stroke-dasharray={2 * Math.PI * 34}
                stroke-dashoffset={2 * Math.PI * 34 * (1 - (processingStep + 1) / processingSteps.length)}
                transform="rotate(-90 40 40)"
                style="transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1);"
              />
              <!-- Glow -->
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--blue-core)" stroke-width="1" stroke-linecap="round"
                stroke-dasharray={2 * Math.PI * 34}
                stroke-dashoffset={2 * Math.PI * 34 * (1 - (processingStep + 1) / processingSteps.length)}
                transform="rotate(-90 40 40)"
                opacity="0.3" filter="blur(4px)"
                style="transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1);"
              />
            </svg>
            <span class="proc-percent">{Math.round(((processingStep + 1) / processingSteps.length) * 100)}%</span>
          </div>
        </div>

        <p class="proc-step">{processingSteps[processingStep]}</p>

        <div class="proc-steps">
          {#each processingSteps as step, i}
            <div class="proc-item" class:proc-item--done={i < processingStep} class:proc-item--active={i === processingStep} class:proc-item--pending={i > processingStep}>
              <span class="proc-dot">
                {#if i < processingStep}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--blue-core)" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                {:else if i === processingStep}
                  <span class="proc-dot-active"></span>
                {:else}
                  <span class="proc-dot-pending"></span>
                {/if}
              </span>
              <span class="proc-text">{step}</span>
            </div>
          {/each}
        </div>
      </div>
    {:else if submitted}
      <!-- Done -->
      <div class="done">
        <!-- Connection Objet transforms to checkmark -->
        <div class="done-objet">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" fill="rgba(10,132,255,0.06)" stroke="rgba(10,132,255,0.3)" stroke-width="1.5"/>
            <path d="M20 33l8 8 16-16" stroke="var(--blue-core)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="done-check-path"/>
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(10,132,255,0.15)" stroke-width="1" class="done-ring-pulse"/>
          </svg>
        </div>
        <h1 class="done-title">접수되었습니다</h1>
        <div class="done-msgs">
          <p class="done-msg">견적서를 이메일로 보내드립니다.</p>
          <p class="done-msg">입금 확인 후 점검 일정이 확정됩니다.</p>
          <div class="done-account">
            <span class="done-label">입금 계좌</span>
            <span class="done-value">신한은행 110-XXX-XXXXXX</span>
            <span class="done-value">(주)바이트포스</span>
          </div>
        </div>
        <button class="btn-ghost" onclick={() => goto(`${base}/`)}>홈으로 돌아가기</button>
      </div>
    {:else}
      <!-- Connection Objet -->
      <div class="objet-wrap fade-in" style="animation-delay: 0s;">
        <div class="objet-connect">
          <svg width="80" height="48" viewBox="0 0 80 48" fill="none">
            <!-- Left node (You) -->
            <circle cx="16" cy="24" r="10" fill="rgba(10,132,255,0.08)" stroke="rgba(10,132,255,0.3)" stroke-width="1.2"/>
            <circle cx="16" cy="24" r="3" fill="rgba(10,132,255,0.5)"/>
            <!-- Right node (Engineer) -->
            <circle cx="64" cy="24" r="10" fill="rgba(10,132,255,0.08)" stroke="rgba(10,132,255,0.3)" stroke-width="1.2"/>
            <circle cx="64" cy="24" r="3" fill="rgba(10,132,255,0.5)"/>
            <!-- Connection line -->
            <line x1="26" y1="24" x2="54" y2="24" stroke="rgba(10,132,255,0.25)" stroke-width="1" stroke-dasharray="4 3"/>
            <!-- Pulse dot on the line -->
            <circle cx="40" cy="24" r="2.5" fill="var(--blue-core)" class="connect-pulse"/>
            <!-- Labels -->
            <text x="16" y="42" text-anchor="middle" fill="var(--text-tertiary)" font-size="7" font-family="var(--font)">나</text>
            <text x="64" y="42" text-anchor="middle" fill="var(--text-tertiary)" font-size="7" font-family="var(--font)">엔지니어</text>
          </svg>
        </div>
      </div>

      <!-- Form -->
      <h1 class="page-title fade-in" style="animation-delay: 0.1s;">상담 예약</h1>
      <p class="page-sub fade-in" style="animation-delay: 0.15s;">필요한 정보를 선택해주세요. 24시간 내 연락드립니다.</p>

      <!-- Group: 점검 유형 -->
      <div class="group fade-in" style="animation-delay: 0.2s;">
        <span class="group-label"><span class="group-dot"></span>점검 유형</span>
        <div class="group-body">
          <div class="pill-row">
            <button class="pill" class:pill--blue={checkType === 'check'} onclick={() => { checkType = 'check'; }}>
              프로젝트 점검
            </button>
            <button class="pill" class:pill--coral={checkType === 'urgent'} onclick={() => { checkType = 'urgent'; }}>
              긴급 점검
            </button>
          </div>
          {#if checkType === 'urgent'}
            <p class="group-note">긴급 점검은 24시간 이내 대응입니다. 별도 요금이 적용됩니다.</p>
          {/if}
        </div>
      </div>

      <!-- Group: 사용 도구 -->
      <div class="group fade-in" style="animation-delay: 0.25s;">
        <span class="group-label"><span class="group-dot"></span>사용 도구</span>
        <div class="group-body">
          <div class="pill-row pill-row--wrap">
            {#each tools as t}
              <button class="pill" class:pill--blue={tool === t} onclick={() => { tool = t; }}>
                {t}
              </button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Group: 프로젝트 URL -->
      <div class="group fade-in" style="animation-delay: 0.3s;">
        <span class="group-label"><span class="group-dot"></span>프로젝트 URL <span class="optional">(선택)</span></span>
        <div class="group-body">
          <input
            class="input"
            type="url"
            placeholder="https://github.com/..."
            bind:value={projectUrl}
          />
        </div>
      </div>

      <!-- Group: 점검 방식 -->
      <div class="group fade-in" style="animation-delay: 0.35s;">
        <span class="group-label"><span class="group-dot"></span>점검 방식</span>
        <div class="group-body">
          <div class="visit-cards">
            {#each visits as v}
              <button class="visit-card" class:visit-card--on={visitType === v.id} onclick={() => { visitType = v.id; }}>
                <span class="visit-name">{v.label}</span>
                <span class="visit-sub">{v.sub}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Group: 연락처 -->
      <div class="group fade-in" style="animation-delay: 0.4s;">
        <span class="group-label"><span class="group-dot"></span>연락처</span>
        <div class="group-body">
          <input
            class="input"
            type="email"
            placeholder="이메일 주소"
            bind:value={email}
            class:input--error={emailError}
          />
          {#if emailError}
            <p class="error-msg">{emailError}</p>
          {/if}
          <input
            class="input"
            type="tel"
            placeholder="연락처 (선택)"
            bind:value={phone}
          />
        </div>
      </div>

      <!-- Group: 추가 메시지 -->
      <div class="group fade-in" style="animation-delay: 0.45s;">
        <span class="group-label"><span class="group-dot"></span>추가 메시지 <span class="optional">(선택)</span></span>
        <div class="group-body">
          <textarea
            class="input textarea"
            placeholder="궁금한 점이 있으면 적어주세요"
            bind:value={message}
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- Submit -->
      <button
        class="btn-submit fade-in"
        style="animation-delay: 0.5s;"
        class:btn-submit--disabled={!checkType || !email}
        disabled={!checkType || !email}
        onclick={handleSubmit}
      >
        접수하기
      </button>

      <p class="footer-note fade-in" style="animation-delay: 0.55s;">접수 후 24시간 내 견적서를 이메일로 보내드립니다.</p>
    {/if}
  </div>

  <nav class="nav">
    <button class="nav-i" onclick={() => goto(`${base}/`)}>홈</button>
    <button class="nav-i" onclick={() => goto(`${base}/check`)}>자가진단</button>
    <button class="nav-i" onclick={() => goto(`${base}/packages`)}>요금제</button>
    <button class="nav-i nav-i--on" onclick={() => goto(`${base}/contact`)}>상담예약</button>
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
    --coral-alert: #FF6B47;
    --text-primary: #EAF2FF;
    --text-secondary: rgba(234, 242, 255, 0.62);
    --text-tertiary: rgba(234, 242, 255, 0.38);
    --ease-organic: cubic-bezier(0.22, 1, 0.36, 1);
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
    --mono: "JetBrains Mono", "SF Mono", monospace;

    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10, 132, 255, 0.1) 0%, transparent 60%),
      var(--bg-void);
    color: var(--text-primary);
    font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }

  /* Page entry animation */
  .fade-in {
    opacity: 0;
    transform: translateY(8px);
    animation: pageIn 0.5s var(--ease-organic) forwards;
  }
  @keyframes pageIn {
    to { opacity: 1; transform: translateY(0); }
  }

  /* Connection Objet */
  .objet-wrap {
    display: flex;
    justify-content: center;
    padding: 8px 0 12px;
  }
  .objet-connect {
    filter: drop-shadow(0 2px 12px rgba(10, 132, 255, 0.15));
  }
  .connect-pulse {
    animation: connectPulse 2s ease-in-out infinite;
  }
  @keyframes connectPulse {
    0%, 100% { opacity: 0.4; transform: translateX(0); }
    25% { opacity: 1; transform: translateX(6px); }
    50% { opacity: 0.6; transform: translateX(0); }
    75% { opacity: 1; transform: translateX(-6px); }
  }

  /* Done Objet */
  .done-objet {
    margin-bottom: 8px;
    animation: pageIn 0.5s var(--ease-organic) forwards;
  }
  .done-check-path {
    stroke-dasharray: 40;
    stroke-dashoffset: 40;
    animation: checkDraw 0.6s 0.2s var(--ease-organic) forwards;
  }
  @keyframes checkDraw {
    to { stroke-dashoffset: 0; }
  }
  .done-ring-pulse {
    animation: ringPulse 2s ease-in-out infinite;
  }
  @keyframes ringPulse {
    0%, 100% { opacity: 0.15; transform: scale(1); transform-origin: center; }
    50% { opacity: 0.3; transform: scale(1.05); transform-origin: center; }
  }

  /* Bar */
  .bar {
    position: sticky; top: 0; z-index: 50;
    height: 48px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
    background: rgba(5, 6, 10, 0.85);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-dim);
    position: relative;
  }
  /* Neon glow on bar bottom edge */
  .bar::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(10, 132, 255, 0.03) 20%,
      rgba(59, 160, 255, 0.15) 45%,
      rgba(90, 200, 250, 0.3) 50%,
      rgba(59, 160, 255, 0.15) 55%,
      rgba(10, 132, 255, 0.03) 80%,
      transparent 100%
    );
    pointer-events: none;
  }
  .bar-brand { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--text-tertiary); }
  .bar-link {
    font-family: var(--font); font-size: 13px; color: var(--blue-core);
    background: none; border: none; cursor: pointer;
    transition: opacity 0.15s;
  }
  .bar-link:active { opacity: 0.7; }

  /* Form area */
  .form-area {
    flex: 1; padding: 24px 20px 100px;
    max-width: 560px; margin: 0 auto; width: 100%;
    display: flex; flex-direction: column; gap: 20px;
  }

  .page-title { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
  .page-sub { font-size: 15px; color: var(--text-secondary); margin: 0; line-height: 1.5; }

  /* Group */
  .group { display: flex; flex-direction: column; gap: 8px; }
  .group-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-tertiary); padding-left: 4px;
    display: flex; align-items: center; gap: 6px;
  }
  .group-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--blue-core);
    flex-shrink: 0;
  }
  .optional { font-weight: 400; text-transform: none; letter-spacing: 0; }
  .group-body {
    background: var(--bg-abyss);
    border: 1px solid rgba(10, 132, 255, 0.1);
    border-radius: 14px;
    padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
    box-shadow: 0 0 16px rgba(10, 132, 255, 0.03);
    transition: border-color 0.3s var(--ease-organic), box-shadow 0.3s var(--ease-organic);
  }
  .group-body:focus-within {
    border-color: rgba(10, 132, 255, 0.25);
    box-shadow: 0 0 24px rgba(10, 132, 255, 0.08);
  }
  .group-note {
    font-size: 12px; color: var(--coral-alert); margin: 0; opacity: 0.8;
  }

  /* Pill buttons */
  .pill-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .pill-row--wrap { flex-wrap: wrap; }
  .pill {
    padding: 12px 22px;
    min-height: 44px;
    border-radius: 980px;
    border: 1px solid var(--border-dim);
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: 14px; font-weight: 500;
    cursor: pointer;
    transition: all 0.25s var(--ease-organic);
    display: flex; align-items: center; justify-content: center;
  }
  .pill:hover { border-color: rgba(120, 160, 220, 0.2); color: var(--text-primary); }
  .pill:active { transform: scale(0.97); }
  .pill--blue {
    background: var(--blue-core); color: #fff; border-color: var(--blue-core);
    box-shadow: 0 0 16px rgba(10, 132, 255, 0.2);
  }
  .pill--coral {
    background: var(--coral-alert); color: #fff; border-color: var(--coral-alert);
    box-shadow: 0 0 16px rgba(255, 107, 71, 0.2);
  }

  /* Visit cards */
  .visit-cards { display: flex; gap: 8px; }
  .visit-card {
    flex: 1; padding: 14px 12px;
    border-radius: 12px;
    border: 1px solid var(--border-dim);
    background: var(--bg-deep);
    display: flex; flex-direction: column; gap: 4px; align-items: center;
    cursor: pointer; font-family: var(--font); text-align: center;
    transition: all 0.25s var(--ease-organic);
  }
  .visit-card:hover { border-color: rgba(120, 160, 220, 0.2); }
  .visit-card:active { transform: scale(0.97); }
  .visit-card--on {
    border-color: var(--blue-core);
    background: rgba(10, 132, 255, 0.08);
    box-shadow: 0 0 20px rgba(10, 132, 255, 0.1);
  }
  .visit-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .visit-sub { font-size: 11px; color: var(--text-tertiary); }
  .visit-card--on .visit-name { color: var(--blue-core); }

  /* Input */
  .input {
    width: 100%; padding: 12px 16px;
    background: var(--bg-deep);
    border: 1px solid var(--border-dim);
    border-radius: 10px;
    color: var(--text-primary);
    font-family: var(--font); font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .input::placeholder { color: var(--text-tertiary); }
  .input:focus {
    border-color: var(--border-active);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
  }
  .input--error { border-color: var(--coral-alert); }
  .textarea { resize: vertical; min-height: 60px; }
  .error-msg { font-size: 12px; color: var(--coral-alert); margin: 0; }

  /* Submit */
  .btn-submit {
    padding: 16px 0; width: 100%;
    border-radius: 980px;
    border: none;
    background: var(--blue-core);
    color: #fff;
    font-family: var(--font); font-size: 16px; font-weight: 600;
    cursor: pointer;
    transition: all 0.25s var(--ease-organic);
    box-shadow: 0 0 20px rgba(10, 132, 255, 0.15);
  }
  .btn-submit:hover { background: var(--blue-glow); transform: translateY(-2px); box-shadow: 0 0 40px rgba(10, 132, 255, 0.35), 0 0 80px rgba(10, 132, 255, 0.15); }
  .btn-submit:active { transform: scale(0.97); }
  .btn-submit--disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-submit--disabled:hover { transform: none; background: var(--blue-core); box-shadow: 0 0 20px rgba(10, 132, 255, 0.15); }

  .footer-note { font-size: 12px; color: var(--text-tertiary); text-align: center; margin: 0; }

  /* Processing: Labor Illusion */
  .processing {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 28px; padding: 64px 0;
    animation: pageIn 0.5s var(--ease-organic) forwards;
  }

  .proc-objet { position: relative; }

  .proc-ring {
    position: relative;
    display: flex; align-items: center; justify-content: center;
  }
  .proc-ring svg {
    filter: drop-shadow(0 0 12px rgba(10,132,255,0.15));
  }
  .proc-percent {
    position: absolute;
    font-family: var(--mono);
    font-size: 16px; font-weight: 600;
    color: var(--text-primary);
  }

  .proc-step {
    font-size: 15px; color: var(--text-secondary);
    margin: 0;
    animation: procFade 0.5s var(--ease-organic);
  }

  @keyframes procFade {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .proc-steps {
    display: flex; flex-direction: column; gap: 12px;
    align-items: flex-start;
    width: 100%; max-width: 320px;
  }

  .proc-item {
    display: flex; align-items: center; gap: 12px;
    font-size: 13px; color: var(--text-tertiary);
    transition: color 0.4s var(--ease-organic);
  }
  .proc-item--done { color: var(--blue-core); }
  .proc-item--active { color: var(--text-primary); }

  .proc-dot {
    width: 16px; height: 16px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .proc-dot-active {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--blue-core);
    box-shadow: 0 0 8px rgba(10,132,255,0.5);
    animation: procPulse 1s var(--ease-organic) infinite;
  }
  @keyframes procPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.7; }
  }

  .proc-dot-pending {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--border-dim);
  }

  .proc-text { transition: color 0.3s; }

  /* Done */
  .done {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 20px; padding: 48px 0;
    animation: pageIn 0.5s var(--ease-organic) forwards;
  }
  .done-title { font-size: 28px; font-weight: 700; margin: 0; }
  .done-msgs { display: flex; flex-direction: column; gap: 8px; }
  .done-msg { font-size: 15px; color: var(--text-secondary); margin: 0; }
  .done-account {
    margin-top: 12px; padding: 16px;
    background: var(--bg-abyss); border: 1px solid var(--border-dim);
    border-radius: 12px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .done-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.1em; }
  .done-value { font-family: var(--mono); font-size: 14px; color: var(--text-primary); }
  .btn-ghost {
    padding: 12px 32px; border-radius: 980px; border: 1px solid var(--border-dim);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font); font-size: 14px; font-weight: 500; cursor: pointer;
    transition: all 0.2s;
  }
  .btn-ghost:hover { color: var(--text-primary); border-color: rgba(120,160,220,0.2); }
  .btn-ghost:active { transform: scale(0.97); }

  /* Nav */
  .nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    display: flex;
    background: rgba(5, 6, 10, 0.92);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border-dim);
    padding-bottom: var(--safe-bottom, 0px);
  }
  .nav-i {
    flex: 1; padding: 12px 0; background: none; border: none;
    border-top: 2px solid transparent;
    font-family: var(--font); font-size: 12px; font-weight: 500;
    color: var(--text-tertiary); cursor: pointer; transition: color 0.15s;
  }
  .nav-i:hover { color: var(--text-secondary); }
  .nav-i--on {
    color: var(--blue-core);
    border-top-color: var(--blue-core);
  }

  @media (max-width: 480px) {
    .bar { padding: 0 16px; padding-top: var(--safe-top, 0px); }
    .visit-cards { flex-direction: column; }
    .page-title { font-size: 24px; }
    .form-area { padding: 20px 16px calc(80px + var(--safe-bottom, 0px)); }
    .pill { padding: 10px 16px; font-size: 13px; }
    .btn-submit { font-size: 15px; }
    .nav-i { font-size: 11px; }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0s !important;
      transition-duration: 0.01ms !important;
    }
    .fade-in {
      opacity: 1;
      transform: none;
    }
  }
</style>
