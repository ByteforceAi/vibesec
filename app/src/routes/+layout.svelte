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
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		background: var(--color-bg-primary);
		color: var(--color-label);
	}

	.app-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
	}
</style>
