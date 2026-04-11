<script lang="ts">
	import type { Snippet } from 'svelte';

	interface ToolbarProps {
		title?: string;
		largeTitle?: boolean;
		leading?: Snippet;
		trailing?: Snippet;
	}

	let {
		title = '',
		largeTitle = false,
		leading,
		trailing,
	}: ToolbarProps = $props();
</script>

<header class="toolbar" class:toolbar--large={largeTitle}>
	<div class="toolbar__bar">
		<div class="toolbar__leading" role="navigation" aria-label="Leading actions">
			{#if leading}
				{@render leading()}
			{/if}
		</div>

		{#if !largeTitle && title}
			<h1 class="toolbar__title">{title}</h1>
		{/if}

		<div class="toolbar__trailing" role="navigation" aria-label="Trailing actions">
			{#if trailing}
				{@render trailing()}
			{/if}
		</div>
	</div>

	{#if largeTitle && title}
		<div class="toolbar__large-title">
			<h1>{title}</h1>
		</div>
	{/if}
</header>

<style>
	.toolbar {
		position: sticky;
		top: 0;
		z-index: 100;
		padding-top: var(--safe-area-top);

		/* Liquid Glass bar */
		backdrop-filter: blur(var(--lg-frost-radius-m)) saturate(180%);
		-webkit-backdrop-filter: blur(var(--lg-frost-radius-m)) saturate(180%);
		background: var(--glass-bg-thick);
		border-bottom: 0.5px solid var(--glass-border);
		box-shadow:
			0 4px 40px rgba(0, 0, 0, 0.05),
			inset 0 -0.5px 0 rgba(255, 255, 255, 0.15);
	}

	.toolbar__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 44px;
		padding: 0 var(--space-md);
	}

	.toolbar__leading,
	.toolbar__trailing {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 44px;
	}

	.toolbar__title {
		flex: 1;
		text-align: center;
		font: var(--font-headline);
		color: var(--color-label);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin: 0;
	}

	.toolbar__large-title {
		padding: var(--space-sm) var(--space-md) var(--space-md);
	}

	.toolbar__large-title h1 {
		font: var(--font-large-title);
		color: var(--color-label);
		margin: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.toolbar {
			transition: none;
		}
	}
</style>
