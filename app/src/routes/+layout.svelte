<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { navigating } from '$app/stores';

	interface LayoutProps {
		children: Snippet;
	}

	let { children }: LayoutProps = $props();

	/* ── Page transition via View Transition API ── */
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Byteforce Security -- 바이브코딩 보안</title>
	<meta name="description" content="AI 코딩 도구(Cursor, Claude Code, v0)로 만든 서비스의 보안을 사람이 직접 점검합니다." />
	<meta property="og:title" content="Byteforce Security -- 바이브코딩 보안" />
	<meta property="og:description" content="AI 코딩 도구(Cursor, Claude Code, v0)로 만든 서비스의 보안을 사람이 직접 점검합니다." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://byteforceai.github.io/vibesec/" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Byteforce Security -- 바이브코딩 보안" />
	<meta name="twitter:description" content="AI 코딩 도구(Cursor, Claude Code, v0)로 만든 서비스의 보안을 사람이 직접 점검합니다." />
	<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 76' fill='none'%3E%3Cpath d='M32 2L4 16v20c0 18.67 11.93 36.13 28 42 16.07-5.87 28-23.33 28-42V16L32 2z' stroke='%230A84FF' stroke-width='3' fill='%230A84FF' fill-opacity='0.15'/%3E%3Cpath d='M26 38l6 6 12-14' stroke='%230A84FF' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
</svelte:head>

<!-- Top page-loading progress bar -->
{#if $navigating}
	<div class="page-progress"></div>
{/if}

<div class="app-shell">
	<main class="app-main">
		{@render children()}
	</main>
</div>

<style>
	/* ══════════════════════════════════════════════
	   BASE LAYOUT
	   ══════════════════════════════════════════════ */
	:global(body) {
		margin: 0;
		padding: 0;
		background: #05060A;
		color: #EAF2FF;
		font-family: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		background: #05060A;
		color: #EAF2FF;
	}

	.app-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		view-transition-name: main;
	}

	/* ══════════════════════════════════════════════
	   1. BUTTON RIPPLE EFFECT
	   ══════════════════════════════════════════════ */
	:global(button),
	:global([role="button"]) {
		position: relative;
		overflow: hidden;
	}

	:global(button::after) {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			circle at var(--ripple-x, 50%) var(--ripple-y, 50%),
			rgba(255, 255, 255, 0.12) 0%,
			transparent 60%
		);
		opacity: 0;
		transition: opacity 0.4s;
		pointer-events: none;
		border-radius: inherit;
	}

	:global(button:active::after) {
		opacity: 1;
		transition: opacity 0s;
	}

	/* ══════════════════════════════════════════════
	   2. PAGE VIEW TRANSITIONS
	   ══════════════════════════════════════════════ */
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(4px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	@keyframes fadeOut {
		from { opacity: 1; transform: translateY(0); }
		to   { opacity: 0; transform: translateY(-4px); }
	}

	:global(::view-transition-old(main)) {
		animation: fadeOut 0.15s ease-out;
	}

	:global(::view-transition-new(main)) {
		animation: fadeIn 0.2s ease-out;
	}

	/* ══════════════════════════════════════════════
	   3. SCROLL-RESPONSIVE APP BAR
	   ══════════════════════════════════════════════ */
	:global(.bar) {
		transition: backdrop-filter 0.3s, background 0.3s, border-color 0.3s;
	}

	/* ══════════════════════════════════════════════
	   4. TAB INDICATOR SLIDE
	   ══════════════════════════════════════════════ */
	:global(.nav) {
		position: relative;
	}

	:global(.nav-i) {
		position: relative;
	}

	:global(.nav-i--on)::before {
		content: '';
		position: absolute;
		top: 0;
		left: 25%;
		right: 25%;
		height: 2px;
		background: #0A84FF;
		border-radius: 0 0 2px 2px;
		box-shadow: 0 0 8px rgba(10, 132, 255, 0.3);
	}

	/* ══════════════════════════════════════════════
	   5. INPUT FOCUS GLOW
	   ══════════════════════════════════════════════ */
	:global(input:focus),
	:global(textarea:focus),
	:global(select:focus) {
		outline: none;
		border-color: rgba(10, 132, 255, 0.4) !important;
		box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.08), 0 0 16px rgba(10, 132, 255, 0.06) !important;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	/* ══════════════════════════════════════════════
	   6. TOP PAGE-LOADING PROGRESS BAR
	   ══════════════════════════════════════════════ */
	.page-progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent, #0A84FF, transparent);
		z-index: 9999;
		animation: progressSlide 1s ease-in-out infinite;
	}

	@keyframes progressSlide {
		0%   { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	/* ══════════════════════════════════════════════
	   7. CARD SELECT GLOW PULSE
	   ══════════════════════════════════════════════ */
	:global(.service-card:active),
	:global(.card:active),
	:global(.visit-card:active) {
		animation: selectPulse 0.3s ease-out;
	}

	@keyframes selectPulse {
		0%  { box-shadow: 0 0 0 0 rgba(10, 132, 255, 0.4); }
		50% { box-shadow: 0 0 20px 4px rgba(10, 132, 255, 0.15); }
		100%{ box-shadow: 0 0 0 0 rgba(10, 132, 255, 0); }
	}

	/* ══════════════════════════════════════════════
	   8. CUSTOM SCROLLBAR
	   ══════════════════════════════════════════════ */
	:global(::-webkit-scrollbar) {
		width: 6px;
	}

	:global(::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(::-webkit-scrollbar-thumb) {
		background: rgba(120, 160, 220, 0.15);
		border-radius: 3px;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: rgba(120, 160, 220, 0.3);
	}

	/* ══════════════════════════════════════════════
	   9. TEXT SELECTION COLOR
	   ══════════════════════════════════════════════ */
	:global(::selection) {
		background: rgba(10, 132, 255, 0.3);
		color: #EAF2FF;
	}

	/* ══════════════════════════════════════════════
	   10. PREFERS-REDUCED-MOTION
	   ══════════════════════════════════════════════ */
	@media (prefers-reduced-motion: reduce) {
		:global(::view-transition-old(main)),
		:global(::view-transition-new(main)) {
			animation: none !important;
		}

		:global(button::after) {
			display: none;
		}

		.page-progress {
			animation: none;
		}
	}
</style>
