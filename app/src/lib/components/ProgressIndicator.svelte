<script lang="ts">
	type ProgressVariant = 'linear' | 'circular';

	interface ProgressIndicatorProps {
		value: number; // 0 to 1
		variant?: ProgressVariant;
		showLabel?: boolean;
		size?: number; // pixel size for circular variant
		ariaLabel?: string;
	}

	let {
		value = 0,
		variant = 'linear',
		showLabel = false,
		size = 48,
		ariaLabel,
	}: ProgressIndicatorProps = $props();

	const clampedValue = $derived(Math.max(0, Math.min(1, value)));
	const percentage = $derived(Math.round(clampedValue * 100));

	// Circular SVG calculations
	const strokeWidth = 4;
	const radius = $derived((size - strokeWidth) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const dashOffset = $derived(circumference * (1 - clampedValue));
</script>

{#if variant === 'linear'}
	<div
		class="progress-linear"
		role="progressbar"
		aria-valuenow={percentage}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-label={ariaLabel}
	>
		<div class="progress-linear__track">
			<div
				class="progress-linear__fill"
				style:width="{percentage}%"
			></div>
		</div>
		{#if showLabel}
			<span class="progress-linear__label">{percentage}%</span>
		{/if}
	</div>
{:else}
	<div
		class="progress-circular"
		role="progressbar"
		aria-valuenow={percentage}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-label={ariaLabel}
		style:width="{size}px"
		style:height="{size}px"
	>
		<svg
			width={size}
			height={size}
			viewBox="0 0 {size} {size}"
			class="progress-circular__svg"
		>
			<circle
				class="progress-circular__track"
				cx={size / 2}
				cy={size / 2}
				r={radius}
				stroke-width={strokeWidth}
			/>
			<circle
				class="progress-circular__fill"
				cx={size / 2}
				cy={size / 2}
				r={radius}
				stroke-width={strokeWidth}
				stroke-dasharray={circumference}
				stroke-dashoffset={dashOffset}
			/>
		</svg>
		{#if showLabel}
			<span class="progress-circular__label">{percentage}%</span>
		{/if}
	</div>
{/if}

<style>
	/* Linear variant */
	.progress-linear {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
	}

	.progress-linear__track {
		flex: 1;
		height: 6px;
		border-radius: 3px;
		background: var(--color-fill-secondary);
		overflow: hidden;
	}

	.progress-linear__fill {
		height: 100%;
		border-radius: 3px;
		background: var(--color-system-blue);
		transition: width 300ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.progress-linear__label {
		font: var(--font-caption-1);
		color: var(--color-label-secondary);
		min-width: 3ch;
		text-align: right;
	}

	/* Circular variant */
	.progress-circular {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.progress-circular__svg {
		transform: rotate(-90deg);
	}

	.progress-circular__track {
		fill: none;
		stroke: var(--color-fill-secondary);
	}

	.progress-circular__fill {
		fill: none;
		stroke: var(--color-system-blue);
		stroke-linecap: round;
		transition: stroke-dashoffset 300ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.progress-circular__label {
		position: absolute;
		font: var(--font-caption-1);
		font-weight: 600;
		color: var(--color-label);
	}

	@media (prefers-reduced-motion: reduce) {
		.progress-linear__fill,
		.progress-circular__fill {
			transition: none;
		}
	}
</style>
