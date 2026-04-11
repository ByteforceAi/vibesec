<script lang="ts">
	export interface TabItem {
		id: string;
		label: string;
		icon?: string;
	}

	interface TabBarProps {
		items: TabItem[];
		active: string;
		onselect: (id: string) => void;
	}

	let { items, active, onselect }: TabBarProps = $props();
</script>

<div class="tabbar" role="tablist" aria-orientation="horizontal">
	{#each items as item (item.id)}
		<button
			class="tabbar__item"
			class:tabbar__item--active={active === item.id}
			role="tab"
			aria-selected={active === item.id}
			tabindex={active === item.id ? 0 : -1}
			onclick={() => onselect(item.id)}
		>
			{#if item.icon}
				<span class="tabbar__icon" aria-hidden="true">{item.icon}</span>
			{/if}
			<span class="tabbar__label">{item.label}</span>
		</button>
	{/each}
</div>

<style>
	.tabbar {
		display: flex;
		align-items: stretch;
		justify-content: space-around;
		min-height: 49px;
		padding-bottom: var(--safe-area-bottom);

		/* Liquid Glass bar */
		backdrop-filter: blur(var(--lg-frost-radius-m)) saturate(180%);
		-webkit-backdrop-filter: blur(var(--lg-frost-radius-m)) saturate(180%);
		background: var(--glass-bg-thick);
		border-top: 0.5px solid var(--glass-border);
		box-shadow:
			0 -4px 40px rgba(0, 0, 0, 0.05),
			inset 0 0.5px 0 rgba(255, 255, 255, 0.25);
	}

	.tabbar__item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		padding: 4px 0 2px;
		min-height: 44px;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-label-secondary);
		transition: color 150ms ease;
		-webkit-tap-highlight-color: transparent;
	}

	.tabbar__item--active {
		color: var(--color-system-blue);
	}

	.tabbar__icon {
		font-size: 22px;
		line-height: 1;
	}

	.tabbar__label {
		font: var(--font-caption-2);
		font-weight: 500;
	}

	.tabbar__item--active .tabbar__label {
		font-weight: 600;
	}

	@media (prefers-reduced-motion: reduce) {
		.tabbar__item {
			transition: none;
		}
	}
</style>
