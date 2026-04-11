<script lang="ts">
	import type { Snippet } from 'svelte';

	interface ListRowProps {
		title: string;
		subtitle?: string;
		onclick?: (e: MouseEvent) => void;
		showChevron?: boolean;
		leading?: Snippet;
		trailing?: Snippet;
	}

	let {
		title,
		subtitle,
		onclick,
		showChevron = true,
		leading,
		trailing,
	}: ListRowProps = $props();

	const interactive = $derived(!!onclick);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="list-row"
	class:list-row--interactive={interactive}
	role={interactive ? 'button' : 'listitem'}
	tabindex={interactive ? 0 : undefined}
	{onclick}
	onkeydown={(e: KeyboardEvent) => {
		if (interactive && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			onclick?.(e as unknown as MouseEvent);
		}
	}}
>
	{#if leading}
		<div class="list-row__leading" aria-hidden="true">
			{@render leading()}
		</div>
	{/if}

	<div class="list-row__content">
		<span class="list-row__title">{title}</span>
		{#if subtitle}
			<span class="list-row__subtitle">{subtitle}</span>
		{/if}
	</div>

	{#if trailing}
		<div class="list-row__trailing">
			{@render trailing()}
		</div>
	{:else if showChevron && interactive}
		<div class="list-row__chevron" aria-hidden="true">
			<svg width="8" height="14" viewBox="0 0 8 14" fill="none">
				<path
					d="M1 1l6 6-6 6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
	{/if}
</div>

<style>
	.list-row {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		min-height: 44px;
		background: transparent;
		border-bottom: 0.5px solid var(--color-separator);
		transition: background-color 150ms ease;
	}

	.list-row--interactive {
		cursor: pointer;
	}

	.list-row--interactive:hover {
		background: var(--color-fill-tertiary);
	}

	.list-row--interactive:active {
		background: var(--color-fill-secondary);
	}

	.list-row__leading {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		font-size: 22px;
	}

	.list-row__content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.list-row__title {
		font: var(--font-body);
		color: var(--color-label);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.list-row__subtitle {
		font: var(--font-subheadline);
		color: var(--color-label-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.list-row__trailing {
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.list-row__chevron {
		flex-shrink: 0;
		color: var(--color-label-tertiary);
		display: flex;
		align-items: center;
	}

	@media (prefers-reduced-motion: reduce) {
		.list-row {
			transition: none;
		}
	}
</style>
