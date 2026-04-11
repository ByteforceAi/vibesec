<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Severity } from '$lib/ds/tokens';

	export interface AlertAction {
		label: string;
		variant?: 'primary' | 'destructive' | 'cancel';
		onclick: () => void;
	}

	interface AlertProps {
		open: boolean;
		severity?: Severity;
		title: string;
		message?: string;
		actions?: AlertAction[];
		onclose?: () => void;
		icon?: Snippet;
	}

	let {
		open = false,
		severity = 'warning',
		title,
		message,
		actions = [],
		onclose,
		icon,
	}: AlertProps = $props();

	const severityColor: Record<Severity, string> = {
		critical: 'var(--color-system-red)',
		warning: 'var(--color-system-yellow)',
		ok: 'var(--color-system-green)',
	};

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && onclose) {
			onclose();
		}
	}

	$effect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="alert-backdrop" onkeydown={handleKeydown}>
		<div
			class="alert"
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="alert-title"
			aria-describedby={message ? 'alert-message' : undefined}
		>
			{#if icon}
				<div class="alert__icon" aria-hidden="true">
					{@render icon()}
				</div>
			{:else}
				<div
					class="alert__severity-dot"
					style:background={severityColor[severity]}
					aria-hidden="true"
				></div>
			{/if}

			<h2 class="alert__title" id="alert-title">{title}</h2>

			{#if message}
				<p class="alert__message" id="alert-message">{message}</p>
			{/if}

			{#if actions.length > 0}
				<div class="alert__actions" class:alert__actions--stacked={actions.length > 2}>
					{#each actions as action}
						<button
							class="alert__action alert__action--{action.variant ?? 'primary'}"
							onclick={action.onclick}
						>
							{action.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.alert-backdrop {
		position: fixed;
		inset: 0;
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.35);
		padding: var(--space-xl);
		animation: fade-in 150ms ease;
	}

	.alert {
		width: 100%;
		max-width: 280px;
		border-radius: var(--radius-lg);
		text-align: center;
		overflow: hidden;
		animation: alert-pop 250ms cubic-bezier(0.22, 1, 0.36, 1);

		/* Liquid Glass modal */
		backdrop-filter: blur(var(--lg-frost-radius-l)) saturate(180%);
		-webkit-backdrop-filter: blur(var(--lg-frost-radius-l)) saturate(180%);
		background: var(--glass-bg-thick);
		border: 0.5px solid var(--glass-border);
		box-shadow:
			0 10px 80px rgba(0, 0, 0, 0.15),
			inset 0 0.5px 0 rgba(255, 255, 255, 0.4);
	}

	.alert__severity-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		margin: var(--space-lg) auto var(--space-sm);
	}

	.alert__icon {
		margin: var(--space-lg) auto var(--space-sm);
		font-size: 28px;
	}

	.alert__title {
		font: var(--font-headline);
		color: var(--color-label);
		padding: 0 var(--space-md);
		margin: var(--space-xs) 0;
	}

	.alert__message {
		font: var(--font-subheadline);
		color: var(--color-label-secondary);
		padding: var(--space-xs) var(--space-md) var(--space-md);
		margin: 0;
	}

	.alert__actions {
		display: flex;
		border-top: 0.5px solid var(--color-separator);
	}

	.alert__actions--stacked {
		flex-direction: column;
	}

	.alert__action {
		flex: 1;
		min-height: 44px;
		padding: var(--space-sm) var(--space-md);
		background: none;
		border: none;
		font: var(--font-body);
		cursor: pointer;
		transition: background-color 100ms ease;
	}

	.alert__action:not(:last-child) {
		border-right: 0.5px solid var(--color-separator);
	}

	.alert__actions--stacked .alert__action:not(:last-child) {
		border-right: none;
		border-bottom: 0.5px solid var(--color-separator);
	}

	.alert__action:hover {
		background: var(--color-fill-tertiary);
	}

	.alert__action--primary {
		color: var(--color-system-blue);
		font-weight: 600;
	}

	.alert__action--destructive {
		color: var(--color-system-red);
		font-weight: 600;
	}

	.alert__action--cancel {
		color: var(--color-system-blue);
		font-weight: 400;
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes alert-pop {
		from {
			transform: scale(0.9);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.alert-backdrop,
		.alert {
			animation: none;
		}
	}
</style>
