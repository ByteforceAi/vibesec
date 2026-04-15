<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  type Answer = 'unknown' | 'yes' | 'no' | null;

  interface Question {
    text: string;
    options: { label: string; value: Answer }[];
  }

  const questions: Question[] = [
    {
      text: '.env 파일이 뭔지 아시나요?',
      options: [
        { label: '모르겠어요', value: 'unknown' },
        { label: '네', value: 'yes' },
        { label: '아니요', value: 'no' },
      ],
    },
    {
      text: 'GitHub 레포가 public인가요?',
      options: [
        { label: '모르겠어요', value: 'unknown' },
        { label: '네', value: 'yes' },
        { label: '아니요', value: 'no' },
      ],
    },
    {
      text: 'API 키를 코드에 직접 적은 적 있나요?',
      options: [
        { label: '모르겠어요', value: 'unknown' },
        { label: '네', value: 'yes' },
        { label: '아니요', value: 'no' },
      ],
    },
    {
      text: '로그인 기능이 있나요?',
      options: [
        { label: '없어요', value: 'no' },
        { label: '있어요', value: 'yes' },
      ],
    },
    {
      text: '보안 설정을 따로 한 적 있나요?',
      options: [
        { label: '모르겠어요', value: 'unknown' },
        { label: '네', value: 'yes' },
        { label: '아니요', value: 'no' },
      ],
    },
  ];

  let currentIndex = $state(0);
  let answers = $state<Answer[]>([null, null, null, null, null]);
  let showResult = $state(false);
  let analyzing = $state(false);
  let analyzeStep = $state(0);
  let reducedMotion = $state(false);
  let transitioning = $state(false);

  const analyzeSteps = [
    '응답을 확인하고 있습니다',
    '보안 항목을 대조하고 있습니다',
    '위험도를 계산하고 있습니다',
  ];

  if (typeof window !== 'undefined') {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  const ANIM_MS = reducedMotion ? 0 : 300;

  type ResultType = 'recommend' | 'warning' | 'safe';

  function getResult(): { type: ResultType; title: string; body: string } {
    const unknowns = answers.filter((a) => a === 'unknown').length;
    // Risk signals: Q1 unknown/no, Q2 yes/unknown, Q3 yes/unknown, Q5 unknown/no
    const risks: boolean[] = [
      answers[0] === 'unknown' || answers[0] === 'no',
      answers[1] === 'yes' || answers[1] === 'unknown',
      answers[2] === 'yes' || answers[2] === 'unknown',
      answers[4] === 'unknown' || answers[4] === 'no',
    ];
    const riskCount = risks.filter(Boolean).length;

    if (unknowns >= 2) {
      return {
        type: 'recommend',
        title: '점검을 받아보시는 게 좋겠어요.',
        body: '모르는 부분이 있다는 건 확인이 필요하다는 뜻입니다. 전문가가 직접 살펴보면 금방 정리됩니다.',
      };
    }
    if (riskCount >= 2) {
      return {
        type: 'warning',
        title: '몇 가지 확인이 필요합니다.',
        body: '지금 상태에서 몇 가지 위험 요소가 보입니다. 간단한 점검으로 해결할 수 있는 것들입니다.',
      };
    }
    return {
      type: 'safe',
      title: '기본은 잘 되어 있어요.',
      body: '더 확인하고 싶으시면 전문가 상담을 받아보세요. 놓친 부분이 없는지 꼼꼼히 봐드립니다.',
    };
  }

  function selectAnswer(value: Answer) {
    answers[currentIndex] = value;
    answers = [...answers];

    if (currentIndex < questions.length - 1) {
      transitioning = true;
      setTimeout(() => {
        currentIndex += 1;
        transitioning = false;
      }, reducedMotion ? 0 : 250);
    } else {
      // Labor Illusion: analyzing phase before showing result
      transitioning = true;
      setTimeout(() => {
        transitioning = false;
        analyzing = true;
        analyzeStep = 0;

        if (reducedMotion) {
          analyzing = false;
          showResult = true;
          return;
        }

        for (let i = 1; i < analyzeSteps.length; i++) {
          setTimeout(() => { analyzeStep = i; }, i * 700);
        }

        setTimeout(() => {
          analyzing = false;
          showResult = true;
        }, analyzeSteps.length * 700);
      }, reducedMotion ? 0 : 250);
    }
  }

  function restart() {
    answers = [null, null, null, null, null];
    currentIndex = 0;
    showResult = false;
    analyzing = false;
    analyzeStep = 0;
    transitioning = false;
  }

  const result = $derived(getResult());

  // Compute progress for SVG ring
  const ringProgress = $derived(() => {
    const answered = answers.filter(a => a !== null).length;
    return answered / questions.length;
  });

  // Ring color based on result
  const ringColor = $derived(() => {
    if (!showResult) return 'var(--blue-core)';
    if (result.type === 'safe') return 'var(--green-ok)';
    if (result.type === 'warning') return 'var(--blue-core)';
    return 'var(--coral-alert)';
  });
</script>

<svelte:head>
  <title>자가 진단 | Byteforce Security</title>
  <meta name="description" content="5가지 질문으로 내 프로젝트의 보안 상태를 빠르게 확인하세요. 1분이면 됩니다." />
  <meta property="og:title" content="자가 진단 | Byteforce Security" />
  <meta property="og:description" content="5가지 질문으로 내 프로젝트의 보안 상태를 빠르게 확인하세요. 1분이면 됩니다." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://byteforceai.github.io/vibesec/check" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="자가 진단 | Byteforce Security" />
  <meta name="twitter:description" content="5가지 질문으로 내 프로젝트의 보안 상태를 빠르게 확인하세요. 1분이면 됩니다." />
</svelte:head>

<div class="page">

  <!-- App bar -->
  <header class="bar">
    <button class="bar-back" onclick={() => goto(`${base}/`)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
    </button>
    <span class="bar-title">BYTEFORCE</span>
    <span class="bar-spacer"></span>
  </header>

  <!-- Content -->
  <div class="content">

    <!-- Scan Ring Objet -->
    <div class="objet-wrap fade-in" style="animation-delay: 0s;">
      <div class="objet-ring">
        <svg class="ring-svg" width="72" height="72" viewBox="0 0 72 72">
          <!-- Track -->
          <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(10,132,255,0.1)" stroke-width="3"/>
          <!-- Progress arc -->
          <circle
            cx="36" cy="36" r="30"
            fill="none"
            stroke={ringColor()}
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray={2 * Math.PI * 30}
            stroke-dashoffset={2 * Math.PI * 30 * (1 - ringProgress())}
            class="ring-progress"
            transform="rotate(-90 36 36)"
          />
          <!-- Glow filter -->
          <circle
            cx="36" cy="36" r="30"
            fill="none"
            stroke={ringColor()}
            stroke-width="1"
            stroke-linecap="round"
            stroke-dasharray={2 * Math.PI * 30}
            stroke-dashoffset={2 * Math.PI * 30 * (1 - ringProgress())}
            transform="rotate(-90 36 36)"
            opacity="0.4"
            filter="blur(4px)"
          />
          <!-- Center icon: shield -->
          <path d="M36 22 L36 22 C36 22 46 26 46 34 C46 42 36 50 36 50 C36 50 26 42 26 34 C26 26 36 22 36 22Z" fill="none" stroke={ringColor()} stroke-width="1.5" stroke-linejoin="round" opacity="0.7"/>
          <!-- Center text -->
          <text x="36" y="39" text-anchor="middle" fill="var(--text-primary)" font-size="11" font-weight="600" font-family="var(--mono)">{showResult ? '100' : Math.round(ringProgress() * 100)}%</text>
        </svg>
      </div>
    </div>

    {#if analyzing}
      <!-- Analyzing: Labor Illusion -->
      <div class="analyze-wrap">
        <div class="analyze-spinner">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(10,132,255,0.1)" stroke-width="2"/>
            <circle cx="28" cy="28" r="24" fill="none" stroke="var(--blue-core)" stroke-width="2.5" stroke-linecap="round"
              stroke-dasharray={2 * Math.PI * 24 * 0.3}
              stroke-dashoffset="0"
              transform="rotate(-90 28 28)"
              class="analyze-arc"
            />
          </svg>
        </div>
        <p class="analyze-text">{analyzeSteps[analyzeStep]}</p>
        <div class="analyze-dots">
          {#each analyzeSteps as _, i}
            <span class="adot" class:adot--done={i <= analyzeStep}></span>
          {/each}
        </div>
      </div>
    {:else if !showResult}
      <!-- Progress -->
      <div class="progress-wrap fade-in" style="animation-delay: 0.1s;">
        <div class="progress-bar">
          <div
            class="progress-fill"
            style="width: {((currentIndex + (answers[currentIndex] !== null ? 1 : 0)) / questions.length) * 100}%; transition-duration: {ANIM_MS}ms;"
          ></div>
        </div>
        <span class="progress-label">{currentIndex + 1} / {questions.length}</span>
      </div>

      <!-- Question card -->
      <div
        class="card-wrap fade-in"
        class:card-wrap--out={transitioning}
        style="animation-duration: {ANIM_MS}ms; animation-delay: 0.2s;"
      >
        <div class="question-card">
          <span class="question-num">Q{currentIndex + 1}</span>
          <h2 class="question-text">{questions[currentIndex].text}</h2>
          <div class="options">
            {#each questions[currentIndex].options as opt}
              <button
                class="option-btn"
                class:option-btn--selected={answers[currentIndex] === opt.value}
                onclick={() => selectAnswer(opt.value)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        </div>
      </div>

    {:else}
      <!-- Result -->
      <div class="result-wrap" style="animation-duration: {ANIM_MS}ms;">
        <div class="result-card result-card--{result.type}">
          <div class="result-icon">
            {#if result.type === 'recommend'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            {:else if result.type === 'warning'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            {/if}
          </div>
          <h2 class="result-title">{result.title}</h2>
          <p class="result-body">{result.body}</p>
          <button class="cta-btn" onclick={() => goto(`${base}/contact`)}>
            상담 예약하기
          </button>
          <button class="retry-btn" onclick={restart}>
            다시 해보기
          </button>
        </div>
      </div>
    {/if}

  </div>

  <!-- Bottom nav -->
  <nav class="nav">
    <button class="nav-i" onclick={() => goto(`${base}/`)}>홈</button>
    <button class="nav-i nav-i--on" onclick={() => goto(`${base}/check`)}>자가진단</button>
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
    --coral-alert: #FF6B47;
    --green-ok: #32D74B;
    --text-primary: #EAF2FF;
    --text-secondary: rgba(234, 242, 255, 0.62);
    --text-tertiary: rgba(234, 242, 255, 0.38);
    --ease-organic: cubic-bezier(0.22, 1, 0.36, 1);
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
    --mono: "JetBrains Mono", "SF Mono", monospace;

    display: flex; flex-direction: column; min-height: 100dvh;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10, 132, 255, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0, 71, 179, 0.08) 0%, transparent 50%),
      var(--bg-void);
    color: var(--text-primary); font-family: var(--font);
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

  /* Scan Ring Objet */
  .objet-wrap {
    display: flex;
    justify-content: center;
    padding: 8px 0 12px;
  }
  .objet-ring {
    position: relative;
    animation: objetPulse 3s ease-in-out infinite;
  }
  .ring-svg {
    filter: drop-shadow(0 2px 12px rgba(10, 132, 255, 0.2)) drop-shadow(0 0 20px rgba(10, 132, 255, 0.1));
  }
  .ring-progress {
    transition: stroke-dashoffset 0.5s var(--ease-organic), stroke 0.4s;
    filter: drop-shadow(0 0 6px currentColor);
  }
  @keyframes objetPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
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
  .bar-back {
    background: none; border: none; color: var(--text-secondary); cursor: pointer;
    display: flex; align-items: center; padding: 4px; transition: color 0.15s;
  }
  .bar-back:hover { color: var(--text-primary); }
  .bar-back:active { transform: scale(0.95); }
  .bar-title {
    font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
    color: var(--text-secondary);
  }
  .bar-spacer { flex: 1; }

  /* Content */
  .content {
    flex: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 24px 20px;
    max-width: 480px; margin: 0 auto; width: 100%;
  }

  /* Progress */
  .progress-wrap {
    width: 100%;
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px;
  }
  .progress-bar {
    flex: 1; height: 4px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px; overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: var(--blue-core);
    border-radius: 2px;
    transition: width var(--ease-organic);
  }
  .progress-label {
    font-size: 12px; color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  /* Card animations */
  .card-wrap {
    width: 100%;
    animation: cardIn 0.3s var(--ease-organic) forwards;
  }
  .card-wrap--out {
    animation: cardOut 0.25s var(--ease-organic) forwards;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateX(24px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes cardOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(-24px); }
  }

  /* Question card */
  .question-card {
    background: linear-gradient(165deg, var(--bg-deep) 0%, var(--bg-abyss) 100%);
    border: 1px solid rgba(10, 132, 255, 0.12);
    border-radius: 20px;
    padding: 32px 28px;
    display: flex; flex-direction: column; gap: 20px;
    box-shadow: 0 0 20px rgba(10, 132, 255, 0.04);
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .question-card:hover {
    border-color: rgba(10, 132, 255, 0.3);
    box-shadow: 0 0 30px rgba(10, 132, 255, 0.1), 0 12px 40px rgba(0, 20, 60, 0.2);
  }
  .question-num {
    font-size: 11px; font-weight: 600;
    color: var(--blue-core); letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .question-text {
    font-size: 22px; font-weight: 700; line-height: 1.4;
    margin: 0;
  }

  /* Options */
  .options {
    display: flex; flex-direction: column; gap: 10px;
  }
  .option-btn {
    padding: 14px 20px;
    min-height: 44px;
    border: 1px solid var(--border-dim);
    border-radius: 980px;
    background: var(--bg-abyss);
    color: var(--text-primary);
    font-family: var(--font); font-size: 15px; font-weight: 500;
    text-align: center; cursor: pointer;
    transition: border-color 0.3s, background 0.2s, box-shadow 0.3s, transform 0.15s;
  }
  .option-btn:hover {
    border-color: rgba(10, 132, 255, 0.3);
    background: var(--bg-deep);
    box-shadow: 0 0 20px rgba(10, 132, 255, 0.15);
    transform: translateY(-1px);
  }
  .option-btn:active {
    transform: scale(0.97);
  }
  .option-btn--selected {
    border-color: var(--blue-core);
    background: rgba(10, 132, 255, 0.1);
    box-shadow: 0 0 16px rgba(10, 132, 255, 0.12);
  }

  /* Analyzing: Labor Illusion */
  .analyze-wrap {
    display: flex; flex-direction: column; align-items: center;
    gap: 20px; padding: 40px 0;
    animation: pageIn 0.4s var(--ease-organic) forwards;
  }

  .analyze-spinner {
    position: relative;
    animation: analyzeRotate 1.2s linear infinite;
  }
  .analyze-spinner svg {
    filter: drop-shadow(0 0 10px rgba(10,132,255,0.2));
  }
  @keyframes analyzeRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .analyze-text {
    font-size: 14px; color: var(--text-secondary); margin: 0;
    animation: analyzeFade 0.5s var(--ease-organic);
  }
  @keyframes analyzeFade {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .analyze-dots {
    display: flex; gap: 8px;
  }
  .adot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--border-dim);
    transition: background 0.4s, box-shadow 0.4s;
  }
  .adot--done {
    background: var(--blue-core);
    box-shadow: 0 0 6px rgba(10,132,255,0.4);
  }

  /* Result */
  .result-wrap {
    width: 100%;
    animation: cardIn 0.3s var(--ease-organic) forwards;
  }
  .result-card {
    background: linear-gradient(165deg, var(--bg-deep) 0%, var(--bg-abyss) 100%);
    border: 1px solid rgba(10, 132, 255, 0.12);
    border-radius: 20px;
    padding: 40px 28px;
    display: flex; flex-direction: column;
    align-items: center; text-align: center; gap: 16px;
    box-shadow: 0 0 20px rgba(10, 132, 255, 0.04);
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .result-card:hover {
    border-color: rgba(10, 132, 255, 0.3);
    box-shadow: 0 0 30px rgba(10, 132, 255, 0.1), 0 12px 40px rgba(0, 20, 60, 0.2);
  }
  .result-card--recommend { border-color: rgba(10, 132, 255, 0.3); }
  .result-card--warning { border-color: rgba(255, 107, 71, 0.3); }
  .result-card--safe { border-color: rgba(50, 215, 75, 0.3); }

  .result-icon {
    width: 48px; height: 48px;
  }
  .result-icon svg {
    width: 100%; height: 100%;
  }
  .result-card--recommend .result-icon { color: var(--blue-core); }
  .result-card--warning .result-icon { color: var(--coral-alert); }
  .result-card--safe .result-icon { color: var(--green-ok); }

  .result-title {
    font-size: 22px; font-weight: 700; line-height: 1.4;
    margin: 0;
  }
  .result-body {
    font-size: 15px; line-height: 1.6;
    color: var(--text-secondary); margin: 0;
    max-width: 320px;
  }

  .cta-btn {
    margin-top: 8px;
    padding: 14px 36px; border-radius: 980px; border: none;
    background: var(--blue-core); color: #fff;
    font-family: var(--font); font-size: 16px; font-weight: 600;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(10, 132, 255, 0.15);
    transition: background 0.2s, box-shadow 0.3s, transform 0.15s;
  }
  .cta-btn:hover {
    background: var(--blue-glow);
    box-shadow: 0 0 30px rgba(10, 132, 255, 0.25);
    transform: translateY(-1px);
  }
  .cta-btn:active { transform: scale(0.97); }

  .retry-btn {
    padding: 10px 24px; border-radius: 980px;
    border: 1px solid var(--border-dim);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font); font-size: 14px; font-weight: 500;
    cursor: pointer; transition: border-color 0.15s, color 0.15s, transform 0.15s;
  }
  .retry-btn:hover {
    border-color: var(--border-active); color: var(--text-primary);
  }
  .retry-btn:active { transform: scale(0.97); }

  /* Bottom nav */
  .nav {
    position: sticky; bottom: 0;
    display: flex; justify-content: space-around;
    height: 52px; align-items: center;
    background: rgba(5,6,10,0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border-dim);
    flex-shrink: 0;
    z-index: 90;
    padding-bottom: var(--safe-bottom, 0px);
  }
  .nav-i {
    background: none; border: none;
    border-top: 2px solid transparent;
    font-family: var(--font); font-size: 13px; font-weight: 500;
    color: var(--text-tertiary); cursor: pointer;
    transition: color 0.15s;
    padding: 8px 16px 6px;
  }
  .nav-i:hover { color: var(--text-secondary); }
  .nav-i--on {
    color: var(--blue-core);
    border-top-color: var(--blue-core);
  }

  /* Mobile */
  @media (max-width: 480px) {
    .bar { padding: 0 16px; padding-top: var(--safe-top, 0px); }
    .content { padding: 20px 16px; }
    .question-card { padding: 24px 20px; border-radius: 16px; }
    .question-text { font-size: 17px; }
    .option-btn { padding: 14px 20px; font-size: 15px; }
    .result-card { padding: 32px 20px; }
    .result-title { font-size: 20px; }
    .cta-btn { width: 100%; padding: 16px; }
    .retry-btn { width: 100%; }
    .nav-i { font-size: 11px; padding: 10px 0 8px; }
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
