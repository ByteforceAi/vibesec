<script lang="ts">
	interface InputProps {
		value?: string;
		placeholder?: string;
		type?: 'text' | 'url' | 'email' | 'search';
		disabled?: boolean;
		ariaLabel?: string;
		oninput?: (value: string) => void;
		onsubmit?: () => void;
	}

	let {
		value = $bindable(''),
		placeholder = '',
		type = 'text',
		disabled = false,
		ariaLabel,
		oninput,
		onsubmit,
	}: InputProps = $props();

	let focused = $state(false);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		oninput?.(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && onsubmit) {
			onsubmit();
		}
	}
</script>

<div class="input-wrapper" class:input-wrapper--focused={focused} class:input-wrapper--disabled={disabled}>
	<input
		class="input"
		{type}
		{value}
		{placeholder}
		{disabled}
		aria-label={ariaLabel}
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
		oninput={handleInput}
		onkeydown={handleKeydown}
	/>
</div>

<style>
	.input-wrapper {
		display: flex;
		align-items: center;
		min-height: 44px;
		padding: 0 var(--space-md);
		border-radius: var(--radius-md);
		background: var(--color-fill-tertiary);
		border: 1.5px solid transparent;
		transition:
			border-color 200ms ease,
			background-color 200ms ease;
	}

	.input-wrapper--focused {
		border-color: var(--color-system-blue);
		background: var(--color-bg-primary);
	}

	.input-wrapper--disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.input {
		flex: 1;
		min-width: 0;
		padding: var(--space-sm) 0;
		background: none;
		border: none;
		outline: none;
		font: var(--font-body);
		color: var(--color-label);
		-webkit-tap-highlight-color: transparent;
	}

	.input::placeholder {
		color: var(--color-label-tertiary);
	}

	.input:disabled {
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.input-wrapper {
			transition: none;
		}
	}
</style>
