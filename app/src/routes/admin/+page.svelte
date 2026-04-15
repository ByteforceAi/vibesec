<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { getInquiries, updateInquiry, deleteInquiry, getStats, type Inquiry } from '$lib/stores/inquiries';

  // --- Auth (simple PIN for now, replace with real auth on Vercel) ---
  let authed = $state(false);
  let pin = $state('');
  const ADMIN_PIN = '0608'; // TODO: move to env on Vercel

  function tryAuth() {
    if (pin === ADMIN_PIN) {
      authed = true;
      sessionStorage.setItem('bf_admin', '1');
    }
  }

  // Check session
  $effect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('bf_admin') === '1') {
      authed = true;
    }
  });

  // --- Data ---
  let inquiries = $state<Inquiry[]>([]);
  let stats = $state(getStats());
  let selectedId = $state<string | null>(null);
  let filterStatus = $state<string>('all');

  function refresh() {
    inquiries = getInquiries().sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    stats = getStats();
  }

  $effect(() => {
    if (authed) refresh();
  });

  function changeStatus(id: string, status: Inquiry['status']) {
    updateInquiry(id, { status });
    refresh();
  }

  function saveNotes(id: string, notes: string) {
    updateInquiry(id, { notes });
    refresh();
  }

  function remove(id: string) {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteInquiry(id);
      if (selectedId === id) selectedId = null;
      refresh();
    }
  }

  function logout() {
    sessionStorage.removeItem('bf_admin');
    authed = false;
    pin = '';
  }

  // Filtered list
  const filtered = $derived(
    filterStatus === 'all'
      ? inquiries
      : inquiries.filter(i => i.status === filterStatus)
  );

  // Status labels
  const statusLabels: Record<Inquiry['status'], string> = {
    new: '신규',
    contacted: '연락 완료',
    quoted: '견적 발송',
    paid: '입금 확인',
    inspecting: '점검 중',
    done: '완료',
  };

  const statusColors: Record<Inquiry['status'], string> = {
    new: '#FF453A',
    contacted: '#FF9F0A',
    quoted: '#0A84FF',
    paid: '#32D74B',
    inspecting: '#5AC8FA',
    done: '#8E8E93',
  };

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function typeLabel(type: string): string {
    return type === 'urgent' ? '긴급 점검' : '프로젝트 점검';
  }
</script>

<svelte:head>
  <title>Admin | Byteforce Security</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin">
  {#if !authed}
    <!-- PIN Gate -->
    <div class="gate">
      <div class="gate-box">
        <div class="gate-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(10,132,255,0.6)" stroke-width="1.5" stroke-linecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h1 class="gate-title">Admin</h1>
        <p class="gate-sub">관리자 PIN을 입력하세요</p>
        <input
          class="gate-input"
          type="password"
          maxlength="6"
          placeholder="PIN"
          bind:value={pin}
          onkeydown={(e) => { if (e.key === 'Enter') tryAuth(); }}
        />
        <button class="gate-btn" onclick={tryAuth}>확인</button>
      </div>
    </div>
  {:else}
    <!-- Dashboard -->
    <header class="bar">
      <div class="bar-left">
        <span class="bar-brand">BYTEFORCE</span>
        <span class="bar-sep">/</span>
        <span class="bar-page">Admin</span>
      </div>
      <div class="bar-right">
        <button class="bar-link" onclick={() => goto(`${base}/`)}>사이트</button>
        <button class="bar-link bar-link--dim" onclick={logout}>로그아웃</button>
      </div>
    </header>

    <div class="dash">
      <!-- Stats row -->
      <div class="stats">
        <div class="stat-card stat-card--accent">
          <span class="stat-num">{stats.new}</span>
          <span class="stat-label">신규</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{stats.contacted}</span>
          <span class="stat-label">연락 완료</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{stats.quoted}</span>
          <span class="stat-label">견적 발송</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{stats.paid}</span>
          <span class="stat-label">입금 확인</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{stats.inspecting}</span>
          <span class="stat-label">점검 중</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{stats.done}</span>
          <span class="stat-label">완료</span>
        </div>
        <div class="stat-card stat-card--total">
          <span class="stat-num">{stats.total}</span>
          <span class="stat-label">전체</span>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="filter-row">
        <button class="filter" class:filter--on={filterStatus === 'all'} onclick={() => filterStatus = 'all'}>전체</button>
        {#each Object.entries(statusLabels) as [key, label]}
          <button class="filter" class:filter--on={filterStatus === key} onclick={() => filterStatus = key}>{label}</button>
        {/each}
      </div>

      <!-- List + Detail split -->
      <div class="split">
        <!-- List -->
        <div class="list">
          {#if filtered.length === 0}
            <div class="empty">
              <p>접수된 문의가 없습니다.</p>
              <p class="empty-sub">테스트: <a href="{base}/incident">상담 예약</a>에서 접수해보세요.</p>
            </div>
          {/if}
          {#each filtered as inq}
            <button
              class="inq-row"
              class:inq-row--selected={selectedId === inq.id}
              class:inq-row--new={inq.status === 'new'}
              onclick={() => selectedId = inq.id}
            >
              <div class="inq-top">
                <span class="inq-type" class:inq-type--urgent={inq.type === 'urgent'}>{typeLabel(inq.type)}</span>
                <span class="inq-dot" style="background: {statusColors[inq.status]}"></span>
                <span class="inq-status">{statusLabels[inq.status]}</span>
              </div>
              <div class="inq-email">{inq.email}</div>
              <div class="inq-meta">
                {#if inq.tool}<span>{inq.tool}</span>{/if}
                <span>{formatDate(inq.timestamp)}</span>
              </div>
            </button>
          {/each}
        </div>

        <!-- Detail -->
        <div class="detail">
          {#if selectedId}
            {@const inq = inquiries.find(i => i.id === selectedId)}
            {#if inq}
              <div class="detail-header">
                <h2 class="detail-title">{inq.email}</h2>
                <span class="detail-id">{inq.id}</span>
              </div>

              <div class="detail-grid">
                <div class="d-row">
                  <span class="d-key">유형</span>
                  <span class="d-val">{typeLabel(inq.type)}</span>
                </div>
                <div class="d-row">
                  <span class="d-key">사용 도구</span>
                  <span class="d-val">{inq.tool || '-'}</span>
                </div>
                <div class="d-row">
                  <span class="d-key">프로젝트 URL</span>
                  <span class="d-val">{inq.projectUrl || '-'}</span>
                </div>
                <div class="d-row">
                  <span class="d-key">방문 방식</span>
                  <span class="d-val">{inq.visitType || '-'}</span>
                </div>
                <div class="d-row">
                  <span class="d-key">연락처</span>
                  <span class="d-val">{inq.phone || '-'}</span>
                </div>
                <div class="d-row">
                  <span class="d-key">접수일</span>
                  <span class="d-val">{formatDate(inq.timestamp)}</span>
                </div>
                {#if inq.message}
                  <div class="d-row d-row--full">
                    <span class="d-key">메시지</span>
                    <p class="d-msg">{inq.message}</p>
                  </div>
                {/if}
              </div>

              <!-- Status Pipeline -->
              <div class="pipeline">
                <span class="pipe-label">상태 변경</span>
                <div class="pipe-btns">
                  {#each Object.entries(statusLabels) as [key, label]}
                    <button
                      class="pipe-btn"
                      class:pipe-btn--active={inq.status === key}
                      style="--pipe-color: {statusColors[key as Inquiry['status']]}"
                      onclick={() => changeStatus(inq.id, key as Inquiry['status'])}
                    >{label}</button>
                  {/each}
                </div>
              </div>

              <!-- Notes -->
              <div class="notes-area">
                <span class="notes-label">메모</span>
                <textarea
                  class="notes-input"
                  placeholder="내부 메모 (고객에게 보이지 않음)"
                  value={inq.notes}
                  onblur={(e) => saveNotes(inq.id, (e.target as HTMLTextAreaElement).value)}
                  rows="3"
                ></textarea>
              </div>

              <!-- Actions -->
              <div class="detail-actions">
                <a class="action-link" href="mailto:{inq.email}">이메일 보내기</a>
                {#if inq.phone}
                  <a class="action-link" href="tel:{inq.phone}">전화하기</a>
                {/if}
                <button class="action-delete" onclick={() => remove(inq.id)}>삭제</button>
              </div>
            {/if}
          {:else}
            <div class="detail-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(120,160,220,0.2)" stroke-width="1.5" stroke-linecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
              </svg>
              <p>문의를 선택하세요</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .admin {
    --bg-void: #05060A;
    --bg-abyss: #0A0E1A;
    --bg-deep: #0D1528;
    --border-dim: rgba(120, 160, 220, 0.08);
    --blue-core: #0A84FF;
    --blue-glow: #3BA0FF;
    --text-primary: #EAF2FF;
    --text-secondary: rgba(234, 242, 255, 0.62);
    --text-tertiary: rgba(234, 242, 255, 0.38);
    --ease: cubic-bezier(0.22, 1, 0.36, 1);
    --font: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
    --mono: "JetBrains Mono", "SF Mono", monospace;

    min-height: 100dvh;
    background: var(--bg-void);
    color: var(--text-primary);
    font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }

  /* ===== PIN GATE ===== */
  .gate {
    display: flex; align-items: center; justify-content: center;
    min-height: 100dvh;
  }
  .gate-box {
    display: flex; flex-direction: column; align-items: center;
    gap: 16px; padding: 48px 40px;
    background: var(--bg-abyss);
    border: 1px solid var(--border-dim);
    border-radius: 20px;
    width: 320px;
  }
  .gate-icon { opacity: 0.7; }
  .gate-title {
    font-size: 20px; font-weight: 700; margin: 0;
    letter-spacing: 0.05em;
  }
  .gate-sub { font-size: 13px; color: var(--text-tertiary); margin: 0; }
  .gate-input {
    width: 100%; padding: 14px 16px;
    border-radius: 12px; border: 1px solid var(--border-dim);
    background: var(--bg-deep); color: var(--text-primary);
    font-family: var(--mono); font-size: 20px;
    text-align: center; letter-spacing: 0.3em;
    outline: none;
    transition: border-color 0.2s;
  }
  .gate-input:focus { border-color: rgba(10, 132, 255, 0.4); }
  .gate-btn {
    width: 100%; padding: 12px;
    border-radius: 12px; border: none;
    background: var(--blue-core); color: #fff;
    font-family: var(--font); font-size: 15px; font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .gate-btn:hover { background: var(--blue-glow); }

  /* ===== BAR ===== */
  .bar {
    height: 48px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px;
    background: rgba(5,6,10,0.92);
    border-bottom: 1px solid var(--border-dim);
    position: sticky; top: 0; z-index: 50;
  }
  .bar-left { display: flex; align-items: center; gap: 8px; }
  .bar-brand { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; color: var(--text-tertiary); }
  .bar-sep { color: var(--text-tertiary); font-size: 12px; }
  .bar-page { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .bar-right { display: flex; gap: 12px; }
  .bar-link {
    font-family: var(--font); font-size: 13px; color: var(--blue-core);
    background: none; border: none; cursor: pointer;
  }
  .bar-link--dim { color: var(--text-tertiary); }

  /* ===== DASHBOARD ===== */
  .dash {
    max-width: 1200px; margin: 0 auto;
    padding: 24px;
    display: flex; flex-direction: column; gap: 20px;
  }

  /* Stats */
  .stats {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .stat-card {
    flex: 1; min-width: 80px;
    padding: 16px 12px;
    background: var(--bg-abyss);
    border: 1px solid var(--border-dim);
    border-radius: 12px;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .stat-card--accent { border-color: rgba(255, 69, 58, 0.3); }
  .stat-card--total { border-color: rgba(10, 132, 255, 0.2); }
  .stat-num {
    font-family: var(--mono); font-size: 24px; font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .stat-card--accent .stat-num { color: #FF453A; }
  .stat-card--total .stat-num { color: var(--blue-core); }
  .stat-label { font-size: 11px; color: var(--text-tertiary); }

  /* Filter */
  .filter-row {
    display: flex; gap: 6px; flex-wrap: wrap;
  }
  .filter {
    padding: 6px 14px; border-radius: 980px;
    border: 1px solid var(--border-dim);
    background: transparent; color: var(--text-tertiary);
    font-family: var(--font); font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .filter:hover { color: var(--text-secondary); border-color: rgba(120,160,220,0.15); }
  .filter--on {
    background: rgba(10,132,255,0.12); color: var(--blue-core);
    border-color: rgba(10,132,255,0.3);
  }

  /* Split layout */
  .split {
    display: flex; gap: 16px;
    min-height: 500px;
  }

  /* List */
  .list {
    width: 380px; flex-shrink: 0;
    border: 1px solid var(--border-dim);
    border-radius: 16px;
    background: var(--bg-abyss);
    overflow-y: auto; max-height: 70vh;
    display: flex; flex-direction: column;
  }
  .empty {
    padding: 40px 20px; text-align: center;
    color: var(--text-tertiary); font-size: 14px;
  }
  .empty-sub { font-size: 12px; margin-top: 8px; }
  .empty-sub a { color: var(--blue-core); }

  .inq-row {
    display: flex; flex-direction: column; gap: 6px;
    padding: 16px 20px;
    background: transparent; border: none;
    border-bottom: 1px solid var(--border-dim);
    text-align: left; cursor: pointer;
    font-family: var(--font); color: var(--text-primary);
    transition: background 0.15s;
    width: 100%;
  }
  .inq-row:hover { background: rgba(10,132,255,0.04); }
  .inq-row--selected { background: rgba(10,132,255,0.08); }
  .inq-row--new { border-left: 3px solid #FF453A; }

  .inq-top { display: flex; align-items: center; gap: 8px; }
  .inq-type {
    font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
    color: var(--blue-core);
  }
  .inq-type--urgent { color: #FF453A; }
  .inq-dot { width: 6px; height: 6px; border-radius: 50%; margin-left: auto; }
  .inq-status { font-size: 11px; color: var(--text-tertiary); }
  .inq-email { font-size: 14px; font-weight: 500; }
  .inq-meta {
    display: flex; gap: 12px;
    font-size: 11px; color: var(--text-tertiary);
    font-family: var(--mono);
  }

  /* Detail */
  .detail {
    flex: 1;
    border: 1px solid var(--border-dim);
    border-radius: 16px;
    background: var(--bg-abyss);
    padding: 24px;
    overflow-y: auto; max-height: 70vh;
    display: flex; flex-direction: column; gap: 20px;
  }
  .detail-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    height: 100%; gap: 12px;
    color: var(--text-tertiary); font-size: 14px;
  }

  .detail-header { display: flex; justify-content: space-between; align-items: center; }
  .detail-title { font-size: 18px; font-weight: 700; margin: 0; }
  .detail-id { font-family: var(--mono); font-size: 10px; color: var(--text-tertiary); }

  .detail-grid { display: flex; flex-direction: column; gap: 8px; }
  .d-row {
    display: flex; align-items: center;
    padding: 10px 14px;
    background: var(--bg-deep);
    border-radius: 10px;
  }
  .d-row--full { flex-direction: column; align-items: flex-start; gap: 6px; }
  .d-key { font-size: 12px; color: var(--text-tertiary); width: 100px; flex-shrink: 0; }
  .d-val { font-size: 14px; color: var(--text-primary); }
  .d-msg { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5; }

  /* Pipeline */
  .pipeline { display: flex; flex-direction: column; gap: 8px; }
  .pipe-label { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; color: var(--text-tertiary); }
  .pipe-btns { display: flex; gap: 6px; flex-wrap: wrap; }
  .pipe-btn {
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid var(--border-dim);
    background: transparent; color: var(--text-tertiary);
    font-family: var(--font); font-size: 12px; cursor: pointer;
    transition: all 0.2s;
  }
  .pipe-btn:hover { border-color: var(--pipe-color); color: var(--pipe-color); }
  .pipe-btn--active {
    background: color-mix(in srgb, var(--pipe-color) 15%, transparent);
    border-color: var(--pipe-color);
    color: var(--pipe-color);
  }

  /* Notes */
  .notes-area { display: flex; flex-direction: column; gap: 6px; }
  .notes-label { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; color: var(--text-tertiary); }
  .notes-input {
    width: 100%; padding: 12px 14px;
    border-radius: 10px; border: 1px solid var(--border-dim);
    background: var(--bg-deep); color: var(--text-primary);
    font-family: var(--font); font-size: 13px;
    resize: vertical; outline: none;
    transition: border-color 0.2s;
  }
  .notes-input:focus { border-color: rgba(10,132,255,0.3); }

  /* Actions */
  .detail-actions { display: flex; gap: 12px; margin-top: 8px; }
  .action-link {
    font-size: 13px; color: var(--blue-core);
    text-decoration: none;
    transition: opacity 0.15s;
  }
  .action-link:hover { opacity: 0.8; }
  .action-delete {
    font-family: var(--font); font-size: 13px;
    color: #FF453A; background: none; border: none;
    cursor: pointer; margin-left: auto;
  }
  .action-delete:hover { opacity: 0.8; }

  /* Mobile */
  @media (max-width: 768px) {
    .dash { padding: 16px; }
    .stats { gap: 6px; }
    .stat-card { padding: 12px 8px; min-width: 60px; }
    .stat-num { font-size: 18px; }
    .split { flex-direction: column; }
    .list { width: 100%; max-height: 40vh; }
    .detail { max-height: none; }
    .d-row { flex-direction: column; align-items: flex-start; gap: 4px; }
    .d-key { width: auto; }
    .gate-box { width: calc(100vw - 40px); max-width: 320px; }
  }
</style>
