/**
 * Design System Tokens — re-exported from @ios26_design_system/tokens
 *
 * All design tokens are defined as CSS custom properties in app.css.
 * This file provides TypeScript constants for programmatic access
 * and semantic mappings for the VibeSec app.
 */

// ─── System Colors ──────────────────────────────────────────────
export const colors = {
	systemRed: 'var(--color-system-red)',
	systemOrange: 'var(--color-system-orange)',
	systemYellow: 'var(--color-system-yellow)',
	systemGreen: 'var(--color-system-green)',
	systemBlue: 'var(--color-system-blue)',
	systemIndigo: 'var(--color-system-indigo)',
	systemPurple: 'var(--color-system-purple)',
	systemPink: 'var(--color-system-pink)',
	systemTeal: 'var(--color-system-teal)',
	systemCyan: 'var(--color-system-cyan)',
} as const;

// ─── Semantic / Label Colors ────────────────────────────────────
export const labels = {
	primary: 'var(--color-label)',
	secondary: 'var(--color-label-secondary)',
	tertiary: 'var(--color-label-tertiary)',
	quaternary: 'var(--color-label-quaternary)',
} as const;

// ─── Fill Colors ────────────────────────────────────────────────
export const fills = {
	primary: 'var(--color-fill)',
	secondary: 'var(--color-fill-secondary)',
	tertiary: 'var(--color-fill-tertiary)',
} as const;

// ─── Background Colors ─────────────────────────────────────────
export const backgrounds = {
	primary: 'var(--color-bg-primary)',
	secondary: 'var(--color-bg-secondary)',
	tertiary: 'var(--color-bg-tertiary)',
} as const;

// ─── Separator Colors ──────────────────────────────────────────
export const separators = {
	default: 'var(--color-separator)',
	opaque: 'var(--color-separator-opaque)',
} as const;

// ─── Typography ─────────────────────────────────────────────────
export const typography = {
	largeTitle: 'var(--font-large-title)',
	title1: 'var(--font-title-1)',
	title2: 'var(--font-title-2)',
	title3: 'var(--font-title-3)',
	headline: 'var(--font-headline)',
	body: 'var(--font-body)',
	callout: 'var(--font-callout)',
	subheadline: 'var(--font-subheadline)',
	footnote: 'var(--font-footnote)',
	caption1: 'var(--font-caption-1)',
	caption2: 'var(--font-caption-2)',
} as const;

// ─── Spacing ────────────────────────────────────────────────────
export const spacing = {
	xs: 'var(--space-xs)',
	sm: 'var(--space-sm)',
	md: 'var(--space-md)',
	lg: 'var(--space-lg)',
	xl: 'var(--space-xl)',
	xxl: 'var(--space-2xl)',
} as const;

// ─── Radius ─────────────────────────────────────────────────────
export const radius = {
	sm: 'var(--radius-sm)',
	md: 'var(--radius-md)',
	lg: 'var(--radius-lg)',
	xl: 'var(--radius-xl)',
	full: 'var(--radius-full)',
} as const;

// ─── Glass Materials ────────────────────────────────────────────
export const glass = {
	bg: 'var(--glass-bg)',
	bgThick: 'var(--glass-bg-thick)',
	bgThin: 'var(--glass-bg-thin)',
	border: 'var(--glass-border)',
} as const;

// ─── Liquid Glass Parameters ────────────────────────────────────
export const liquidGlass = {
	lightAngle: 'var(--lg-light-angle)',
	opacity: 'var(--lg-opacity)',
	refraction: 'var(--lg-refraction)',
	frostRadiusS: 'var(--lg-frost-radius-s)',
	frostRadiusM: 'var(--lg-frost-radius-m)',
	frostRadiusL: 'var(--lg-frost-radius-l)',
	depth: 'var(--lg-depth)',
	shadowBlurLayer: 'var(--lg-shadow-blur-layer)',
	shadowBlurBg: 'var(--lg-shadow-blur-bg)',
} as const;

// ─── Animations ─────────────────────────────────────────────────
export const animations = {
	/** Standard iOS spring for most transitions */
	spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
	/** Duration for micro-interactions */
	durationFast: '150ms',
	/** Duration for standard transitions */
	durationNormal: '300ms',
	/** Duration for larger movements (sheets, modals) */
	durationSlow: '500ms',
} as const;

// ─── Composite DS Object ────────────────────────────────────────
export const ds = {
	color: colors,
	label: labels,
	fill: fills,
	bg: backgrounds,
	separator: separators,
	text: typography,
	space: spacing,
	radius,
	glass,
	liquidGlass,
	motion: animations,
} as const;

// ─── App Semantic Tokens ────────────────────────────────────────
export type Severity = 'critical' | 'warning' | 'ok';

export const semantic = {
	severity: {
		critical: colors.systemRed,
		warning: colors.systemYellow,
		ok: colors.systemGreen,
	},
	action: {
		primary: colors.systemBlue,
		destructive: colors.systemRed,
	},
	status: {
		scanning: colors.systemBlue,
		complete: colors.systemGreen,
		error: colors.systemRed,
	},
} as const;

// ─── Raw Values (for JS computations, not CSS) ─────────────────
export const rawValues = {
	spacing: {
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32,
		xxl: 48,
	},
	radius: {
		sm: 8,
		md: 12,
		lg: 16,
		xl: 22,
	},
	minTouchTarget: 44,
	/** Korean text needs slightly wider buttons than English */
	buttonMinWidthKr: 120,
} as const;
