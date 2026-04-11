<script lang="ts">
	import type { Snippet } from 'svelte';

	type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
	type ButtonSize = 'sm' | 'md' | 'lg';

	interface ButtonProps {
		variant?: ButtonVariant;
		size?: ButtonSize;
		fullWidth?: boolean;
		disabled?: boolean;
		loading?: boolean;
		onclick?: (e: MouseEvent) => void;
		ariaLabel?: string;
		type?: 'button' | 'submit' | 'reset';
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		disabled = false,
		loading = false,
		onclick,
		ariaLabel,
		type = 'button',
		children,
	}: ButtonProps = $props();

	let pressed = $state(false);
</script>

<button
	class="btn btn--{variant} btn--{size}"
	class:btn--full={fullWidth}
	class:btn--loading={loading}
	{type}
	disabled={disabled || loading}
	aria-label={ariaLabel}
	aria-busy={loading}
	aria-disabled={disabled || loading}
	onpointerdown={() => (pressed = true)}
	onpointerup={() => (pressed = false)}
	onpointerleave={() => (pressed = false)}
	{onclick}
	style:transform={pressed && !disabled ? 'scale(0.97)' : undefined}
>
	{#if loading}
		<span class="btn__spinner" aria-hidden="true"></span>
	{/if}
	<span class="btn__label" class:btn__label--hidden={loading}>
		{@render children()}
	</span>
</button>

<style>
	.btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-family);
		font-weight: 600;
		cursor: pointer;
		transition:
			transform 150ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 150ms ease,
			background-color 150ms ease;
		-webkit-tap-highlight-color: transparent;
		user-select: none;
		/* Korean text: ensure 16-char button text fits on single line */
		min-width: 120px;
		white-space: nowrap;
	}

	/* Sizes — all respect 44pt minimum touch target */
	.btn--sm {
		min-height: 36px;
		padding: 6px 14px;
		font: var(--font-subheadline);
		font-weight: 600;
		border-radius: var(--radius-sm);
		min-width: 80px;
	}

	.btn--md {
		min-height: 44px;
		padding: 10px 20px;
		font: var(--font-body);
		font-weight: 600;
	}

	.btn--lg {
		min-height: 50px;
		padding: 12px 28px;
		font: var(--font-headline);
		border-radius: var(--radius-lg);
		min-width: 160px;
	}

	/* Variants */
	.btn--primary {
		background: var(--color-system-blue);
		color: #ffffff;
	}
	.btn--primary:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-system-blue) 85%, black);
	}

	.btn--secondary {
		background: var(--color-fill-secondary);
		color: var(--color-system-blue);
	}
	.btn--secondary:hover:not(:disabled) {
		background: var(--color-fill);
	}

	.btn--destructive {
		background: var(--color-system-red);
		color: #ffffff;
	}
	.btn--destructive:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-system-red) 85%, black);
	}

	.btn--ghost {
		background: transparent;
		color: var(--color-system-blue);
	}
	.btn--ghost:hover:not(:disabled) {
		background: var(--color-fill-tertiary);
	}

	/* Full width */
	.btn--full {
		width: 100%;
	}

	/* Disabled */
	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Loading spinner */
	.btn__spinner {
		position: absolute;
		width: 18px;
		height: 18px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: btn-spin 0.6s linear infinite;
	}

	.btn__label--hidden {
		visibility: hidden;
	}

	@keyframes btn-spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.btn {
			transition: none;
		}
		.btn__spinner {
			animation: none;
			border-top-color: currentColor;
			opacity: 0.5;
		}
	}
</style>
