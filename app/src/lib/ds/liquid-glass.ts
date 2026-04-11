/**
 * Liquid Glass Primitives
 *
 * Provides CSS helper functions for iOS 26 Liquid Glass effects.
 * All components use these primitives instead of writing blur/shadow/refraction manually.
 *
 * Liquid Glass Parameters (from ios26-design-system):
 *   lightAngle: -45deg
 *   opacity: 60%
 *   refraction: 100%
 *   frostRadius: 7px(s) / 12px(m) / 14px(l)
 *   depth: 16
 *   shadowBlur: 40px(layer) / 80px(bg)
 */

// ─── Types ──────────────────────────────────────────────────────

export type GlassVariant = 'sheet' | 'card' | 'bar' | 'modal' | 'badge';
export type GlassSize = 's' | 'm' | 'l';

interface GlassConfig {
	frostRadius: string;
	opacity: number;
	shadowBlur: string;
	borderOpacity: number;
	depth: number;
}

// ─── Config per variant ─────────────────────────────────────────

const GLASS_CONFIGS: Record<GlassVariant, GlassConfig> = {
	sheet: {
		frostRadius: 'var(--lg-frost-radius-l)',
		opacity: 0.6,
		shadowBlur: 'var(--lg-shadow-blur-bg)',
		borderOpacity: 0.35,
		depth: 16,
	},
	card: {
		frostRadius: 'var(--lg-frost-radius-m)',
		opacity: 0.6,
		shadowBlur: 'var(--lg-shadow-blur-layer)',
		borderOpacity: 0.3,
		depth: 12,
	},
	bar: {
		frostRadius: 'var(--lg-frost-radius-m)',
		opacity: 0.6,
		shadowBlur: 'var(--lg-shadow-blur-layer)',
		borderOpacity: 0.25,
		depth: 8,
	},
	modal: {
		frostRadius: 'var(--lg-frost-radius-l)',
		opacity: 0.65,
		shadowBlur: 'var(--lg-shadow-blur-bg)',
		borderOpacity: 0.4,
		depth: 20,
	},
	badge: {
		frostRadius: 'var(--lg-frost-radius-s)',
		opacity: 0.55,
		shadowBlur: 'var(--lg-shadow-blur-layer)',
		borderOpacity: 0.2,
		depth: 6,
	},
};

// ─── CSS Generation ─────────────────────────────────────────────

/**
 * Returns a CSS string for Liquid Glass effect based on variant.
 * Apply as inline style or use in a <style> block.
 */
export function liquidGlassStyle(variant: GlassVariant): string {
	const config = GLASS_CONFIGS[variant];
	return [
		`backdrop-filter: blur(${config.frostRadius}) saturate(180%)`,
		`-webkit-backdrop-filter: blur(${config.frostRadius}) saturate(180%)`,
		`background: var(--glass-bg)`,
		`border: 1px solid var(--glass-border)`,
		`box-shadow: 0 ${config.depth / 2}px ${config.shadowBlur} rgba(0, 0, 0, 0.08),` +
			` inset 0 0.5px 0 rgba(255, 255, 255, ${config.borderOpacity})`,
	].join('; ');
}

/**
 * Returns a CSS class-compatible object of Liquid Glass properties.
 * Useful for Svelte style directives.
 */
export function liquidGlassProps(variant: GlassVariant): Record<string, string> {
	const config = GLASS_CONFIGS[variant];
	return {
		'--lg-variant-frost': config.frostRadius,
		'--lg-variant-opacity': String(config.opacity),
		'--lg-variant-shadow': config.shadowBlur,
		'--lg-variant-border-opacity': String(config.borderOpacity),
		'--lg-variant-depth': String(config.depth),
	};
}

/**
 * Returns a CSS string for depth shadow only (no blur/glass).
 * Useful for elements that need depth but not glass effect.
 */
export function depthShadow(depth: number = 16): string {
	const blur = Math.round(depth * 2.5);
	const yOffset = Math.round(depth / 2);
	const opacity = Math.min(0.15, depth * 0.008);
	return `0 ${yOffset}px ${blur}px rgba(0, 0, 0, ${opacity})`;
}

/**
 * Returns a CSS string for the inner highlight that gives glass its edge.
 */
export function innerHighlight(opacity: number = 0.35): string {
	return `inset 0 0.5px 0 rgba(255, 255, 255, ${opacity})`;
}

/**
 * Frost radius value for a given size.
 */
export function frostRadius(size: GlassSize): string {
	const map: Record<GlassSize, string> = {
		s: 'var(--lg-frost-radius-s)',
		m: 'var(--lg-frost-radius-m)',
		l: 'var(--lg-frost-radius-l)',
	};
	return map[size];
}

/**
 * Get the full Liquid Glass config for a variant.
 */
export function getGlassConfig(variant: GlassVariant): Readonly<GlassConfig> {
	return GLASS_CONFIGS[variant];
}
