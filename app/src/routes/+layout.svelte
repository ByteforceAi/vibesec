<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	interface LayoutProps {
		children: Snippet;
	}

	let { children }: LayoutProps = $props();
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

<div class="app-shell">
	<main class="app-main">
		{@render children()}
	</main>
</div>

<style>
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
	}
</style>
