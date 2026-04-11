<script lang="ts">
	import type { Snippet } from 'svelte';

	interface SheetProps {
		open: boolean;
		onclose: () => void;
		snapPoints?: number[];
		title?: string;
		children: Snippet;
	}

	let {
		open = false,
		onclose,
		snapPoints = [0.5, 0.95],
		title,
		children,
	}: SheetProps = $props();

	let currentSnap = $state(0);

	function handleBackdropClick() {
		onclose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose();
		}
	}

	$effect(() => {
		if (open) {
			currentSnap = 0;
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});

	const sheetHeight = $derived(snapPoints[currentSnap] ?? 0.5);
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="sheet-backdrop"
		class:sheet-backdrop--visible={open}
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="sheet"
			role="dialog"
			aria-modal="true"
			aria-label={title}
			tabindex="-1"
			style:height="{sheetHeight * 100}%"
			onclick={(e: MouseEvent) => e.stopPropagation()}
			onkeydown={handleKeydown}
		>
			<div class="sheet__handle-area">
				<div class="sheet__handle" aria-hidden="true"></div>
			</div>

			{#if title}
				<div class="sheet__header">
					<h2 class="sheet__title">{title}</h2>
					<button
						class="sheet__close"
						aria-label="Close"
						onclick={onclose}
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="12" fill="var(--color-fill-secondary)" />
							<path
								d="M8 8l8 8M16 8l-8 8"
								stroke="var(--color-label-secondary)"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				</div>
			{/if}

			<div class="sheet__content">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	.sheet-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: flex-end;
		animation: fade-in 200ms ease;
	}

	.sheet {
		width: 100%;
		max-height: 95%;
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		animation: slide-up 300ms cubic-bezier(0.22, 1, 0.36, 1);

		/* Liquid Glass sheet */
		backdrop-filter: blur(var(--lg-frost-radius-l)) saturate(180%);
		-webkit-backdrop-filter: blur(var(--lg-frost-radius-l)) saturate(180%);
		background: var(--glass-bg-thick);
		border: 0.5px solid var(--glass-border);
		border-bottom: none;
		box-shadow:
			0 -8px 80px rgba(0, 0, 0, 0.12),
			inset 0 0.5px 0 rgba(255, 255, 255, 0.35);
	}

	.sheet__handle-area {
		display: flex;
		justify-content: center;
		padding: 8px 0 4px;
	}

	.sheet__handle {
		width: 36px;
		height: 5px;
		border-radius: 2.5px;
		background: var(--color-label-quaternary);
	}

	.sheet__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-sm) var(--space-md);
		border-bottom: 0.5px solid var(--color-separator);
	}

	.sheet__title {
		font: var(--font-headline);
		color: var(--color-label);
		margin: 0;
	}

	.sheet__close {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 50%;
	}

	.sheet__content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-md);
		-webkit-overflow-scrolling: touch;
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slide-up {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	@media (prefers-reduced-motion: reduce) {
		.sheet-backdrop {
			animation: none;
		}
		.sheet {
			animation: none;
		}
	}
</style>
