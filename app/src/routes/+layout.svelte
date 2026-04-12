<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	interface LayoutProps {
		children: Snippet;
	}

	let { children }: LayoutProps = $props();
</script>

<div class="app-shell">
	<main class="app-main">
		{@render children()}
	</main>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

	:global(body) {
		margin: 0;
		padding: 0;
		background: #000000;
		color: #ffffff;
		font-family: "Instrument Sans", "Pretendard Variable", -apple-system, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		background: #000000;
		color: #ffffff;
	}

	.app-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
	}
</style>
