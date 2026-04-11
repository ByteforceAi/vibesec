<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Severity } from '$lib/ds/tokens';

	type BadgeVariant = 'severity' | 'count';

	interface BadgeProps {
		variant?: BadgeVariant;
		severity?: Severity;
		count?: number;
		maxCount?: number;
		children?: Snippet;
	}

	let {
		variant = 'severity',
		severity = 'ok',
		count,
		maxCount = 99,
		children,
	}: BadgeProps = $props();

	const severityBg: Record<Severity, string> = {
		critical: 'var(--color-system-red)',
		warning: 'var(--color-system-yellow)',
		ok: 'var(--color-system-green)',
	};

	const severityTextColor: Record<Severity, string> = {
		critical: '#ffffff',
		warning: '#000000',
		ok: '#ffffff',
	};

	// Accessibility: text prefix so severity is not communicated by color alone (WCAG 1.4.1)
	const severityPrefix: Record<Severity, string> = {
		critical: '\u25CF ',  // filled circle ●
		warning: '\u25B2 ',   // triangle ▲
		ok: '\u2714 ',        // check mark ✔
	};

	const severityAriaLabel: Record<Severity, string> = {
		critical: '\uAE09\uD574\uC694',   // 급해요
		warning: '\uC870\uC2EC\uD574\uC694', // 조심해요
		ok: '\uAD1C\uCC2E\uC544\uC694',   // 괜찮아요
	};

	const displayCount = $derived(
		count !== undefined
			? count > maxCount ? `${maxCount}+` : String(count)
			: undefined
	);
</script>

{#if variant === 'severity'}
	<span
		class="badge badge--severity"
		style:background={severityBg[severity]}
		style:color={severityTextColor[severity]}
		role="status"
		aria-label={severityAriaLabel[severity]}
	>
		<span class="severity-icon" aria-hidden="true">{severityPrefix[severity]}</span>{#if children}{@render children()}{/if}
	</span>
{:else}
	<span
		class="badge badge--count"
		role="status"
		aria-label={displayCount ? `${displayCount} items` : undefined}
	>
		{displayCount ?? ''}
	</span>
{/if}

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		white-space: nowrap;
		user-select: none;
	}

	.badge--severity {
		min-height: 22px;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		font: var(--font-caption-1);
		font-weight: 600;
		/* Subtle glass edge */
		box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.25);
	}

	.severity-icon {
		font-size: 0.75em;
	}

	.badge--count {
		min-width: 20px;
		min-height: 20px;
		padding: 1px 6px;
		border-radius: var(--radius-full);
		font: var(--font-caption-2);
		font-weight: 700;
		background: var(--color-system-red);
		color: #ffffff;
	}

	/* Empty count badge (dot) */
	.badge--count:empty {
		min-width: 8px;
		min-height: 8px;
		padding: 0;
	}
</style>
