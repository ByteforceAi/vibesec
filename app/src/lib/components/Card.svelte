<script lang="ts">
	import type { Snippet } from 'svelte';

	interface CardProps {
		glass?: boolean;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		onclick?: (e: MouseEvent) => void;
		ariaLabel?: string;
		header?: Snippet;
		footer?: Snippet;
		children: Snippet;
	}

	let {
		glass = true,
		padding = 'md',
		onclick,
		ariaLabel,
		header,
		footer,
		children,
	}: CardProps = $props();

	const interactive = $derived(!!onclick);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="card card--pad-{padding}"
	class:card--glass={glass}
	class:card--interactive={interactive}
	role={interactive ? 'button' : undefined}
	tabindex={interactive ? 0 : undefined}
	aria-label={ariaLabel}
	onclick={onclick}
	onkeydown={(e: KeyboardEvent) => {
		if (interactive && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			onclick?.(e as unknown as MouseEvent);
		}
	}}
>
	{#if header}
		<div class="card__header">
			{@render header()}
		</div>
	{/if}

	<div class="card__body">
		{@render children()}
	</div>

	{#if footer}
		<div class="card__footer">
			{@render footer()}
		</div>
	{/if}
</div>

<style>
	.card {
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition:
			transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 200ms ease;
	}

	/* Glass effect */
	.card--glass {
		backdrop-filter: blur(var(--lg-frost-radius-m)) saturate(180%);
		-webkit-backdrop-filter: blur(var(--lg-frost-radius-m)) saturate(180%);
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		box-shadow:
			0 6px 40px rgba(0, 0, 0, 0.08),
			inset 0 0.5px 0 rgba(255, 255, 255, 0.3);
	}

	/* Non-glass fallback */
	.card:not(.card--glass) {
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-separator);
	}

	/* Padding variants */
	.card--pad-none > .card__header,
	.card--pad-none > .card__body,
	.card--pad-none > .card__footer {
		padding: 0;
	}
	.card--pad-sm {
		padding: var(--space-sm);
	}
	.card--pad-sm > .card__header,
	.card--pad-sm > .card__footer {
		padding: var(--space-sm);
	}

	.card--pad-md > .card__header,
	.card--pad-md > .card__body,
	.card--pad-md > .card__footer {
		padding: var(--space-md);
	}

	.card--pad-lg > .card__header,
	.card--pad-lg > .card__body,
	.card--pad-lg > .card__footer {
		padding: var(--space-lg);
	}

	/* Interactive */
	.card--interactive {
		cursor: pointer;
	}
	.card--interactive:hover {
		transform: translateY(-1px);
		box-shadow:
			0 8px 48px rgba(0, 0, 0, 0.1),
			inset 0 0.5px 0 rgba(255, 255, 255, 0.35);
	}
	.card--interactive:active {
		transform: scale(0.98);
	}

	/* Sections */
	.card__header {
		border-bottom: 1px solid var(--color-separator);
	}

	.card__footer {
		border-top: 1px solid var(--color-separator);
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
	}
</style>
