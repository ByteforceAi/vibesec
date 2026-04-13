<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  // --- Form state ---
  let checkType = $state<'check' | 'urgent' | null>(null);
  let tool = $state<string | null>(null);
  let projectUrl = $state('');
  let visitType = $state<string | null>(null);
  let email = $state('');
  let phone = $state('');
  let message = $state('');
  let submitted = $state(false);
  let emailError = $state('');

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

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('byteforce_inquiries') || '[]');
    existing.push(data);
    localStorage.setItem('byteforce_inquiries', JSON.stringify(existing));
    console.log('[Byteforce] New inquiry:', data);

    submitted = true;
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
    {#if submitted}
      <!-- Done -->
      <div class="done">
        <div class="done-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0A84FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
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
        <button class="btn-primary" onclick={() => goto(`${base}/`)}>홈으로 돌아가기</button>
      </div>
    {:else}
      <!-- Form -->
      <h1 class="page-title">상담 예약</h1>
      <p class="page-sub">필요한 정보를 선택해주세요. 24시간 내 연락드립니다.</p>

      <!-- Group: 점검 유형 -->
      <div class="group">
        <span class="group-label">점검 유형</span>
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
      <div class="group">
        <span class="group-label">사용 도구</span>
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
      <div class="group">
        <span class="group-label">프로젝트 URL <span class="optional">(선택)</span></span>
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
      <div class="group">
        <span class="group-label">점검 방식</span>
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
      <div class="group">
        <span class="group-label">연락처</span>
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
      <div class="group">
        <span class="group-label">추가 메시지 <span class="optional">(선택)</span></span>
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
        class="btn-submit"
        class:btn-submit--disabled={!checkType || !email}
        disabled={!checkType || !email}
        onclick={handleSubmit}
      >
        접수하기
      </button>

      <p class="footer-note">접수 후 24시간 내 견적서를 이메일로 보내드립니다.</p>
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

  /* Bar */
  .bar {
    position: sticky; top: 0; z-index: 50;
    height: 48px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
    background: rgba(5, 6, 10, 0.85);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-dim);
  }
  .bar-brand { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--text-tertiary); }
  .bar-link {
    font-family: var(--font); font-size: 13px; color: var(--blue-core);
    background: none; border: none; cursor: pointer;
  }

  /* Form area */
  .form-area {
    flex: 1; padding: 32px 20px 100px;
    max-width: 560px; margin: 0 auto; width: 100%;
    display: flex; flex-direction: column; gap: 24px;
  }

  .page-title { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
  .page-sub { font-size: 15px; color: var(--text-secondary); margin: 0; line-height: 1.5; }

  /* Group */
  .group { display: flex; flex-direction: column; gap: 8px; }
  .group-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-tertiary); padding-left: 4px;
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
    padding: 10px 20px;
    border-radius: 980px;
    border: 1px solid var(--border-dim);
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: 14px; font-weight: 500;
    cursor: pointer;
    transition: all 0.25s var(--ease-organic);
  }
  .pill:hover { border-color: rgba(120, 160, 220, 0.2); color: var(--text-primary); }
  .pill--blue {
    background: var(--blue-core); color: #fff; border-color: var(--blue-core);
  }
  .pill--coral {
    background: var(--coral-alert); color: #fff; border-color: var(--coral-alert);
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
  .visit-card--on { border-color: var(--blue-core); background: rgba(10, 132, 255, 0.08); }
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
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .input::placeholder { color: var(--text-tertiary); }
  .input:focus { border-color: var(--border-active); }
  .input--error { border-color: var(--coral-alert); }
  .textarea { resize: vertical; min-height: 60px; }
  .error-msg { font-size: 12px; color: var(--coral-alert); margin: 0; }

  /* Submit */
  .btn-submit {
    padding: 14px 0; width: 100%;
    border-radius: 980px;
    border: none;
    background: var(--blue-core);
    color: #fff;
    font-family: var(--font); font-size: 16px; font-weight: 600;
    cursor: pointer;
    transition: all 0.25s var(--ease-organic);
  }
  .btn-submit:hover { background: #2196ff; transform: translateY(-1px); }
  .btn-submit--disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-submit--disabled:hover { transform: none; background: var(--blue-core); }

  .footer-note { font-size: 12px; color: var(--text-tertiary); text-align: center; margin: 0; }

  /* Done */
  .done {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 20px; padding: 48px 0;
  }
  .done-icon {
    width: 80px; height: 80px;
    border-radius: 20px;
    background: linear-gradient(155deg, #0D1528 0%, #0A0E1A 100%);
    border: 1px solid var(--border-dim);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 40px rgba(10,132,255,0.1);
  }
  .done-title { font-size: 24px; font-weight: 700; margin: 0; }
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
  .btn-primary {
    padding: 12px 32px; border-radius: 980px; border: 1px solid var(--border-dim);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font); font-size: 14px; font-weight: 500; cursor: pointer;
    transition: all 0.2s;
  }
  .btn-primary:hover { color: var(--text-primary); border-color: rgba(120,160,220,0.2); }

  /* Nav */
  .nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    display: flex;
    background: rgba(5, 6, 10, 0.9);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border-dim);
  }
  .nav-i {
    flex: 1; padding: 12px 0; background: none; border: none;
    font-family: var(--font); font-size: 12px; font-weight: 500;
    color: var(--text-tertiary); cursor: pointer; transition: color 0.15s;
  }
  .nav-i:hover { color: var(--text-secondary); }
  .nav-i--on { color: var(--blue-core); }

  @media (max-width: 480px) {
    .visit-cards { flex-direction: column; }
    .page-title { font-size: 24px; }
  }
</style>
