<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  type MsgRole = 'bot' | 'user';
  type Phase = 'greeting' | 'check-tool' | 'check-url' | 'check-visit' | 'urgent' | 'email' | 'done';

  interface ChatMsg {
    role: MsgRole;
    text: string;
    id: number;
  }

  interface FormData {
    type: 'check' | 'urgent' | 'pricing' | 'other' | null;
    tool: string | null;
    projectUrl: string | null;
    visitType: string | null;
    urgentDetail: string | null;
    email: string | null;
    timestamp: string | null;
  }

  let messages = $state<ChatMsg[]>([]);
  let phase = $state<Phase>('greeting');
  let showChoices = $state(false);
  let showInput = $state(false);
  let showTyping = $state(false);
  let inputValue = $state('');
  let inputType = $state<'url' | 'email'>('url');
  let msgCounter = $state(0);
  let chatContainer: HTMLDivElement | undefined = $state(undefined);
  let reducedMotion = $state(false);

  let formData = $state<FormData>({
    type: null,
    tool: null,
    projectUrl: null,
    visitType: null,
    urgentDetail: null,
    email: null,
    timestamp: null,
  });

  // Current choices for pill buttons
  let currentChoices = $state<{ label: string; value: string }[]>([]);
  // Whether to show a skip button alongside the input
  let showSkip = $state(false);
  // CTA button for special actions (e.g. navigate to /packages)
  let ctaButton = $state<{ label: string; action: () => void } | null>(null);

  // Check reduced motion
  if (typeof window !== 'undefined') {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  const DELAY = reducedMotion ? 50 : 600;
  const ANIM_MS = reducedMotion ? 0 : 300;

  function nextId(): number {
    msgCounter += 1;
    return msgCounter;
  }

  function scrollToBottom() {
    if (chatContainer) {
      requestAnimationFrame(() => {
        chatContainer!.scrollTop = chatContainer!.scrollHeight;
      });
    }
  }

  async function addBotMsg(text: string): Promise<void> {
    showTyping = true;
    showChoices = false;
    showInput = false;
    ctaButton = null;
    scrollToBottom();

    await sleep(DELAY);
    showTyping = false;
    messages = [...messages, { role: 'bot', text, id: nextId() }];
    await sleep(50);
    scrollToBottom();
  }

  function addUserMsg(text: string) {
    messages = [...messages, { role: 'user', text, id: nextId() }];
    scrollToBottom();
  }

  function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  function presentChoices(choices: { label: string; value: string }[]) {
    currentChoices = choices;
    showChoices = true;
    showInput = false;
    ctaButton = null;
    scrollToBottom();
  }

  function presentInput(type: 'url' | 'email', skip: boolean = false) {
    inputType = type;
    inputValue = '';
    showInput = true;
    showChoices = false;
    showSkip = skip;
    ctaButton = null;
    scrollToBottom();
  }

  function presentCta(label: string, action: () => void) {
    ctaButton = { label, action };
    showChoices = false;
    showInput = false;
    scrollToBottom();
  }

  // ---- Flow logic ----

  async function startGreeting() {
    await addBotMsg('안녕하세요. Byteforce 상담 데스크입니다.');
    await addBotMsg('어떤 도움이 필요하세요?');
    phase = 'greeting';
    presentChoices([
      { label: '프로젝트 점검 받고 싶어요', value: 'check' },
      { label: '긴급 상황이에요', value: 'urgent' },
      { label: '요금제가 궁금해요', value: 'pricing' },
      { label: '기타 문의', value: 'other' },
    ]);
  }

  async function handleGreetingChoice(value: string) {
    if (value === 'check') {
      formData.type = 'check';
      addUserMsg('프로젝트 점검 받고 싶어요');
      await addBotMsg('프로젝트 점검이요. 어떤 도구로 만드셨나요?');
      phase = 'check-tool';
      presentChoices([
        { label: 'Cursor', value: 'cursor' },
        { label: 'Claude Code', value: 'claude' },
        { label: 'v0 / Lovable', value: 'v0-lovable' },
        { label: 'bolt.new / Replit', value: 'bolt-replit' },
        { label: '기타', value: 'other' },
      ]);
    } else if (value === 'urgent') {
      formData.type = 'urgent';
      addUserMsg('긴급 상황이에요');
      await addBotMsg('무슨 일이 있으셨나요?');
      phase = 'urgent';
      presentChoices([
        { label: '요금이 갑자기 많이 나왔어요', value: 'billing' },
        { label: '데이터가 사라졌어요', value: 'data' },
        { label: '사이트가 이상하게 바뀌었어요', value: 'site' },
        { label: '계정에 접근이 안 돼요', value: 'account' },
        { label: '기타', value: 'other' },
      ]);
    } else if (value === 'pricing') {
      formData.type = 'pricing';
      addUserMsg('요금제가 궁금해요');
      await addBotMsg('요금제 페이지를 안내해드릴게요.');
      presentCta('요금제 보기', () => goto(`${base}/packages`));
      // Also allow continuing to email
      await sleep(800);
      await goToEmail();
    } else {
      formData.type = 'other';
      addUserMsg('기타 문의');
      await goToEmail();
    }
  }

  async function handleToolChoice(value: string) {
    formData.tool = value;
    const labels: Record<string, string> = {
      cursor: 'Cursor',
      claude: 'Claude Code',
      'v0-lovable': 'v0 / Lovable',
      'bolt-replit': 'bolt.new / Replit',
      other: '기타',
    };
    addUserMsg(labels[value] || value);
    await addBotMsg('프로젝트 URL이 있으시면 알려주세요. 없으면 건너뛰셔도 돼요.');
    phase = 'check-url';
    presentInput('url', true);
  }

  async function handleUrlSubmit(url: string | null) {
    formData.projectUrl = url;
    if (url) {
      addUserMsg(url);
    } else {
      addUserMsg('건너뛰기');
    }
    await addBotMsg('어떤 방식으로 점검 받으시겠어요?');
    phase = 'check-visit';
    presentChoices([
      { label: '서울 지점 방문', value: 'seoul' },
      { label: '부산 지점 방문', value: 'busan' },
      { label: '온라인 (Zoom/Meet)', value: 'online' },
    ]);
  }

  async function handleVisitChoice(value: string) {
    formData.visitType = value;
    const labels: Record<string, string> = {
      seoul: '서울 지점 방문',
      busan: '부산 지점 방문',
      online: '온라인 (Zoom/Meet)',
    };
    addUserMsg(labels[value] || value);
    await goToEmail();
  }

  async function handleUrgentChoice(value: string) {
    formData.urgentDetail = value;
    const labels: Record<string, string> = {
      billing: '요금이 갑자기 많이 나왔어요',
      data: '데이터가 사라졌어요',
      site: '사이트가 이상하게 바뀌었어요',
      account: '계정에 접근이 안 돼요',
      other: '기타',
    };
    addUserMsg(labels[value] || value);
    await goToEmail();
  }

  async function goToEmail() {
    await addBotMsg('접수 완료를 위해 이메일을 알려주세요.');
    await addBotMsg('점검 결과 리포트도 이 이메일로 보내드립니다.');
    phase = 'email';
    presentInput('email', false);
  }

  async function handleEmailSubmit(email: string) {
    formData.email = email;
    formData.timestamp = new Date().toISOString();
    addUserMsg(email);

    // Save to localStorage + console
    saveFormData();

    await addBotMsg('접수되었습니다. 24시간 내로 연락드리겠습니다.');
    await addBotMsg('급하시면 카카오톡 채널로도 연락 가능합니다.');
    phase = 'done';
    showChoices = false;
    showInput = false;
    ctaButton = null;
    presentCta('홈으로 돌아가기', () => goto(`${base}/`));
  }

  function saveFormData() {
    const data = {
      type: formData.type,
      tool: formData.tool,
      projectUrl: formData.projectUrl,
      visitType: formData.visitType,
      urgentDetail: formData.urgentDetail,
      email: formData.email,
      timestamp: formData.timestamp,
    };
    console.log('[Byteforce] 상담 접수 데이터:', data);
    try {
      const existing = JSON.parse(localStorage.getItem('byteforce_inquiries') || '[]');
      existing.push(data);
      localStorage.setItem('byteforce_inquiries', JSON.stringify(existing));
    } catch {
      // localStorage unavailable
    }
  }

  // Choice click handler
  function onChoiceClick(value: string) {
    if (phase === 'greeting') handleGreetingChoice(value);
    else if (phase === 'check-tool') handleToolChoice(value);
    else if (phase === 'check-visit') handleVisitChoice(value);
    else if (phase === 'urgent') handleUrgentChoice(value);
  }

  // Input submit handler
  function onInputSubmit() {
    const val = inputValue.trim();
    if (inputType === 'url') {
      handleUrlSubmit(val || null);
    } else if (inputType === 'email') {
      if (!val || !val.includes('@')) return;
      handleEmailSubmit(val);
    }
  }

  function onSkip() {
    if (phase === 'check-url') {
      handleUrlSubmit(null);
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onInputSubmit();
    }
  }

  // Start on mount
  if (typeof window !== 'undefined') {
    startGreeting();
  }
</script>

<div class="page">

  <!-- App bar -->
  <header class="bar">
    <button class="bar-back" onclick={() => goto(`${base}/`)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
    </button>
    <span class="bar-title">BYTEFORCE</span>
    <span class="bar-spacer"></span>
  </header>

  <!-- Chat area -->
  <div class="chat-area" bind:this={chatContainer}>
    <div class="chat-inner">

      {#each messages as msg (msg.id)}
        <div
          class="msg msg--{msg.role}"
          style="animation-duration: {ANIM_MS}ms;"
        >
          <div class="msg-bubble msg-bubble--{msg.role}">
            {msg.text}
          </div>
        </div>
      {/each}

      <!-- Typing indicator -->
      {#if showTyping}
        <div class="msg msg--bot" style="animation-duration: {ANIM_MS}ms;">
          <div class="msg-bubble msg-bubble--bot typing-bubble">
            <span class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        </div>
      {/if}

      <!-- Choice pills -->
      {#if showChoices}
        <div class="choices" style="animation-duration: {ANIM_MS}ms;">
          {#each currentChoices as choice}
            <button class="choice-pill" onclick={() => onChoiceClick(choice.value)}>
              {choice.label}
            </button>
          {/each}
        </div>
      {/if}

      <!-- CTA button -->
      {#if ctaButton}
        <div class="cta-wrap" style="animation-duration: {ANIM_MS}ms;">
          <button class="cta-btn" onclick={ctaButton.action}>
            {ctaButton.label}
          </button>
        </div>
      {/if}

    </div>
  </div>

  <!-- Input bar (conditionally shown) -->
  {#if showInput}
    <div class="input-bar" style="animation-duration: {ANIM_MS}ms;">
      <div class="input-row">
        <input
          class="input-field"
          type={inputType === 'email' ? 'email' : 'text'}
          placeholder={inputType === 'email' ? 'email@example.com' : 'https://...'}
          bind:value={inputValue}
          onkeydown={onKeydown}
        />
        {#if showSkip}
          <button class="skip-btn" onclick={onSkip}>건너뛰기</button>
        {/if}
        <button
          class="send-btn"
          onclick={onInputSubmit}
          disabled={inputType === 'email' && (!inputValue.trim() || !inputValue.includes('@'))}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>
        </button>
      </div>
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
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;

    display: flex; flex-direction: column; height: 100dvh;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10, 132, 255, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0, 71, 179, 0.08) 0%, transparent 50%),
      var(--bg-void);
    color: var(--text-primary); font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }

  /* App bar */
  .bar {
    position: sticky; top: 0; z-index: 90; height: 48px;
    display: flex; align-items: center; gap: 12px;
    padding: 0 24px; flex-shrink: 0;
    background: rgba(5,6,10,0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-dim);
  }
  .bar-back {
    background: none; border: none; color: var(--text-secondary); cursor: pointer;
    display: flex; align-items: center; padding: 4px; transition: color 0.15s;
  }
  .bar-back:hover { color: var(--text-primary); }
  .bar-title {
    font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
    color: var(--text-secondary);
  }
  .bar-spacer { flex: 1; }

  /* Chat area */
  .chat-area {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }
  .chat-inner {
    max-width: 640px; margin: 0 auto;
    padding: 24px 16px 32px;
    display: flex; flex-direction: column; gap: 8px;
  }

  /* Message rows */
  .msg {
    display: flex;
    animation: msgIn var(--ease-organic) forwards;
    opacity: 0;
  }
  .msg--bot { justify-content: flex-start; }
  .msg--user { justify-content: flex-end; }

  @keyframes msgIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Bubbles */
  .msg-bubble {
    padding: 14px 18px;
    font-size: 14px; line-height: 1.55;
    max-width: 80%; word-break: break-word;
  }
  .msg-bubble--bot {
    background: linear-gradient(165deg, var(--bg-deep) 0%, var(--bg-abyss) 100%);
    border: 1px solid var(--border-dim);
    border-radius: 16px 16px 16px 4px;
    color: var(--text-primary);
  }
  .msg-bubble--user {
    background: rgba(10, 132, 255, 0.12);
    border: 1px solid rgba(10, 132, 255, 0.25);
    border-radius: 16px 16px 4px 16px;
    color: var(--text-primary);
  }

  /* Typing indicator */
  .typing-bubble {
    display: flex; align-items: center; padding: 14px 22px;
  }
  .typing-dots {
    display: flex; gap: 5px; align-items: center;
  }
  .typing-dots span {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--text-tertiary);
    animation: dotBounce 1.4s infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes dotBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-4px); opacity: 1; }
  }

  /* Choices */
  .choices {
    display: flex; flex-wrap: wrap; gap: 8px;
    padding: 4px 0;
    animation: msgIn var(--ease-organic) forwards;
    opacity: 0;
  }
  .choice-pill {
    padding: 10px 18px; border-radius: 980px;
    border: 1px solid var(--border-dim);
    background: var(--bg-abyss);
    color: var(--text-primary);
    font-family: var(--font); font-size: 13px; font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .choice-pill:hover {
    border-color: var(--border-active);
    background: var(--bg-deep);
  }

  /* CTA button */
  .cta-wrap {
    padding: 8px 0;
    animation: msgIn var(--ease-organic) forwards;
    opacity: 0;
  }
  .cta-btn {
    padding: 12px 28px; border-radius: 980px; border: none;
    background: var(--blue-core); color: #fff;
    font-family: var(--font); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
  }
  .cta-btn:hover { background: var(--blue-glow); }

  /* Input bar */
  .input-bar {
    flex-shrink: 0;
    padding: 12px 16px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    background: rgba(5,6,10,0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border-dim);
    animation: msgIn var(--ease-organic) forwards;
    opacity: 0;
  }
  .input-row {
    max-width: 640px; margin: 0 auto;
    display: flex; gap: 8px; align-items: center;
  }
  .input-field {
    flex: 1;
    background: var(--bg-abyss);
    border: 1px solid var(--border-dim);
    border-radius: 12px;
    padding: 12px 16px;
    color: var(--text-primary);
    font-family: var(--font); font-size: 14px;
    outline: none;
    transition: border-color 0.15s;
  }
  .input-field::placeholder { color: var(--text-tertiary); }
  .input-field:focus { border-color: var(--border-active); }

  .skip-btn {
    padding: 10px 16px; border-radius: 980px;
    border: 1px solid var(--border-dim);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font); font-size: 13px; font-weight: 500;
    cursor: pointer; white-space: nowrap;
    transition: border-color 0.15s, color 0.15s;
  }
  .skip-btn:hover {
    border-color: var(--border-active); color: var(--text-primary);
  }

  .send-btn {
    width: 40px; height: 40px; border-radius: 50%;
    border: none; background: var(--blue-core);
    color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s, opacity 0.15s;
  }
  .send-btn:hover { background: var(--blue-glow); }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0s !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
