# VibeSec Visual Design Audit

**Date**: 2026-04-12  
**Scope**: app.css (global tokens), +layout.svelte, +page.svelte (home), packages/+page.svelte  
**Reviewer**: Typography & Visual Design Analysis

---

## Overall Score: 6.8 / 10

Packages page is strong (7.5/10). Home page lags behind (6.0/10). Token system exists in app.css but is largely overridden by inline `<style>` blocks, creating two competing design systems.

---

## 1. Typography Scale Analysis

### Current Scale (packages page, primary)

| Role | Size | Weight | Line-height | Ratio to body (14px) |
|------|------|--------|-------------|---------------------|
| plan-title | 32px | 700 | 1.1 | 2.28x |
| plan-num (price) | 44px | 500 | 1.0 | 3.14x |
| foot-text | 18px | 500 | 1.5 | 1.28x |
| plan-desc | 15px | 400 | 1.4 | 1.07x |
| row-key (body) | 14px | 400 | inherit | 1.00x (base) |
| bar-action / seg | 13px | 500 | inherit | 0.93x |
| term-code | 12.5px | 400 | 1.8 | 0.89x |
| plan-won / plan-meta / term-file | 12px | varied | inherit | 0.86x |
| group-head / row-sub / scan-date | 11px | 600/400 | 1.4 | 0.79x |
| side-label / term-flag / row-dim | 10px | 600/400 | inherit | 0.71x |
| side-tag | 9px | 600 | inherit | 0.64x |

### Diagnosis

**Scale ratio is irregular.** The jumps between sizes do not follow a consistent modular scale. From 9 -> 10 -> 11 -> 12 -> 12.5 -> 13 -> 14 -> 15 -> 18 -> 32 -> 44px, the increments are: +1, +1, +1, +0.5, +0.5, +1, +1, +3, +14, +12. The gap between 15px (body-ish) and 32px (title) is enormous -- there is no intermediate heading size used in the main content. The 18px foot-text is the only element in that void.

**app.css defines an iOS-standard type scale** (34, 28, 22, 20, 17, 16, 15, 13, 12, 11) that maps neatly to a ~1.17-1.2 minor-third progression. But **none of these tokens are referenced** in the actual page components. Both +page.svelte and packages/+page.svelte redefine everything with inline values.

**Score: 5/10** -- Tokens exist but are not used. No consistent ratio. Midrange heading sizes (20-26px) are absent from the packages page content flow.

---

## 2. Spacing Rhythm

### Current Spacing Tokens (app.css)

4, 8, 16, 24, 32, 48 -- a clean **doubling base-4 system** (4, 8, 16) that shifts to +8 increments (24, 32) then jumps to 48. Close to an 8pt grid.

### Actual Usage

| Location | Value | On-grid? |
|----------|-------|----------|
| .main padding | 32px 40px | 32 yes, 40 no |
| .content padding (home) | 32px 24px 100px | 100 no |
| .hero padding | 24px 0 | yes |
| .hero gap | 16px | yes |
| .plan-top margin-bottom | 20px | no |
| .plan-cta padding | 10px 24px | 10 no |
| .hero-cta padding | 10px 28px | 28 no |
| .bar height | 48px | yes |
| .bar padding | 0 24px | yes |
| .side padding | 16px 10px | 10 no |
| .row padding | 11px 0 | no |
| .foot padding | 48px 0 | yes |
| .empty padding | 48px 0 | yes |
| section gap | 32px | yes |
| .side-group margin-bottom | 20px | no |

**About 40% of spacing values fall off the 4/8pt grid** (10, 11, 20, 28, 40, 100). The 100px bottom padding on home is an arbitrary safe-area hack for the fixed bottom nav -- functional but inelegant.

**Section-to-section rhythm:** The 32px gap between sections is consistent in both pages, which is good. But within sections the vertical rhythm fragments: row padding is 11px (not 12), plan-top margin is 20px (not 24), side padding is 10px (not 8 or 12).

**Score: 6/10** -- Token system is well-designed but underutilized. Many inline values break the grid by 1-3px.

---

## 3. Color Contrast (WCAG)

### Key Combinations (Dark Mode -- which is the only mode actually used)

| Foreground | Background | Contrast Ratio | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|------------|------------|----------------|-----------------|----------------|
| #ffffff on #000000 | -- | 21:1 | PASS | PASS |
| **#9a9a9f on #000000** | --tx2 on black | **4.04:1** | **FAIL** | FAIL |
| #4a4a4f on #000000 | --tx3 on black | 1.98:1 | **FAIL** | FAIL |
| #4a4a4f on #060608 | --tx3 on --s1 | 1.90:1 | **FAIL** | FAIL |
| #9a9a9f on #060608 | --tx2 on --s1 | 3.87:1 | **FAIL** | FAIL |
| #32d74b on #000000 | --ok on black | 6.36:1 | PASS | FAIL |
| #ff453a on #000000 | --warn on black | 4.63:1 | PASS | FAIL |
| #ff9500 on #000000 | --warn-color on black | 5.68:1 | PASS | FAIL |

### Critical Finding

**--tx2 (#9a9a9f) fails WCAG AA at 4.04:1.** This color is used extensively for:
- plan-desc (package descriptions)
- hero-sub (home subtitle)
- row-key labels in the feature comparison table
- faq-body text
- foot-text (closing CTA)
- bar-action button text
- Nearly all secondary text across both pages

This means **the majority of readable content on the site fails accessibility contrast standards.**

**--tx3 (#4a4a4f) at 1.98:1 is severely deficient** but is used for tertiary labels and decorative text, which is somewhat acceptable for non-essential content -- however, group-head section headers and scan-date timestamps arguably are essential.

**Score: 4/10** -- Primary body text color fails AA. This is the single most impactful issue.

---

## 4. Visual Flow (Eye Tracking Patterns)

### Home Page

The home page follows a reasonable **F-pattern**:
1. Top-left: Brand name (but at 12px / --tx3, nearly invisible)
2. Hero title: strong 28px entry point -- good
3. Hero subtitle -> CTA button: clear left-aligned scan path
4. Section below: recent scans or empty state

**Issue:** The brand "Byteforce Security" at 12px in tx3 (#4a4a4f) is functionally invisible. At ~2:1 contrast on black, it reads as a ghost watermark rather than a brand anchor. This may be intentional (luxury/minimal aesthetic) but undermines brand recognition.

### Packages Page

Uses a **sidebar + main content** split on desktop, collapsing to tabs on mobile. The flow is:

1. Segment control (tab selector) -- good entry point
2. Plan title + price -- strong Z-pattern sweep from title (left) to price (right)
3. CTA button
4. Feature rows (scannable list)
5. Terminal demo
6. Extras, Location, FAQ, Footer

**Issue:** The 44px price number dominates the visual hierarchy -- arguably too much. The plan-title (32px) and plan-num (44px) create an inverted hierarchy where the price is visually louder than the service name. In repair-shop mental model, the service should lead.

**Score: 7/10** -- Strong F/Z patterns. Price over-dominance is a concern.

---

## 5. Negative Space

### Desktop (packages page)

- main padding: 32px top, 40px sides -- comfortable
- 32px gap between sections: adequate breathing room
- Row padding at 11px: slightly compressed for touch targets (min 44px touch target recommended, rows are ~36px)

### Mobile

- Padding drops to 16px 12px at 375px breakpoint -- **very tight**
- 24px section gap at 375px: acceptable
- The segment control stretches full-width, leaving no lateral breathing room

### Home Page

- 100px bottom padding is oversized (accounts for fixed nav, but the nav is only ~45px tall; 60-64px would suffice)
- Empty state has good centered breathing room (48px top/bottom)

**Score: 7/10** -- Desktop is well-composed. Mobile gets cramped at small breakpoints. Touch targets in rows are undersized.

---

## 6. Visual Hierarchy

### Hierarchy Chain (packages page)

1. **plan-num** 44px mono 500 -- LOUDEST (price)
2. **plan-title** 32px sans 700 -- second
3. **foot-text** 18px sans 500 -- tertiary heading
4. **plan-desc** 15px sans 400 tx2 -- body
5. **row-key** 14px sans 400 tx2 -- table labels
6. **group-head** 11px sans 600 uppercase tracking -- section dividers
7. **plan-meta / row-sub** 11-12px tx3 -- fine print

The hierarchy is readable but has a **gap in the middle**. There is no element occupying the 20-26px range in the main content. This creates a binary feel: either something screams (32-44px) or it whispers (11-15px). A mid-weight heading (e.g., 20px for sub-sections) would add depth.

**group-head at 11px uppercase** works as a structural divider (Vercel/Linear use this pattern) but depends heavily on letter-spacing and contrast. At --tx3 with 1.98:1 contrast, these headers are harder to spot than they should be.

### Home Page

hero-title (28px) -> hero-sub (15px) -> section-head (11px) -> body (14px)

The 28 -> 15 drop is steep. A 20px intermediate would smooth the transition.

**Score: 7/10** -- Clear extremes, missing middle register.

---

## 7. Mobile Typography

### Current Breakpoints

| Breakpoint | plan-title | plan-num | main padding | section gap |
|------------|-----------|----------|--------------|-------------|
| Desktop | 32px | 44px | 32px 40px | 32px |
| 768px | 26px | 36px | 20px 16px | 32px |
| 375px | 22px | 28px | 16px 12px | 24px |

### Assessment

- **plan-title at 22px on 375px**: acceptable, but tight with -0.025em tracking
- **plan-num at 28px on 375px**: good -- still readable
- **row-key at 14px on mobile**: fine
- **group-head at 11px uppercase on mobile**: borderline too small for Korean characters. Korean glyphs have higher complexity than Latin at equivalent sizes; 11px Korean is roughly equivalent to 9-10px Latin in terms of legibility
- **side-tag at 9px**: only shown on desktop (sidebar hidden), so acceptable
- **No font-size scaling between 375px and 768px**: the 768px breakpoint jumps directly; no fluid typography (clamp()) is used

**Score: 6/10** -- Breakpoints exist but are coarse. Korean text at 11px is a legibility risk. No fluid scaling.

---

## Improvement Recommendations (Priority Order)

### 1. Fix --tx2 Contrast to Pass WCAG AA (CRITICAL)

**Problem:** #9a9a9f on #000000 = 4.04:1 (fails AA 4.5:1 minimum).  
**Impact:** Affects 60%+ of all visible text (descriptions, labels, FAQ answers, subtitles).

**Fix:**
```css
/* Current */
--tx2: #9a9a9f;

/* Recommended */
--tx2: #ababaf;  /* ~5.0:1 on #000 -- passes AA */
/* Or for generous margin: */
--tx2: #b3b3b7;  /* ~5.5:1 on #000 */
```

Also raise --tx3 for essential content:
```css
/* Current */
--tx3: #4a4a4f;  /* 1.98:1 -- only acceptable for decorative elements */

/* For group-head and other functional labels: */
--tx3-readable: #707075;  /* ~3.5:1 -- better for uppercase labels with large tracking */
```

**Reference:** Linear uses #8E8E93 (~4.6:1 on #111) for secondary text. Vercel uses #888 (~4.5:1 on #000).

---

### 2. Unify Type Scale with app.css Tokens (HIGH)

**Problem:** app.css defines a complete iOS type ramp that is never referenced. Each page reinvents sizes inline, creating inconsistency.

**Fix:** Adopt app.css tokens or replace them with the actual scale in use. Recommended approach -- define a project scale:

```css
:root {
  /* Display */
  --type-display: 500 44px/1.0 var(--mono);   /* prices */
  --type-h1: 700 32px/1.1 var(--font);         /* plan titles */
  --type-h2: 600 22px/1.25 var(--font);         /* NEW mid-heading */
  --type-h3: 600 18px/1.35 var(--font);         /* sub-headings */
  --type-body: 400 15px/1.5 var(--font);        /* descriptions */
  --type-body-sm: 400 14px/1.5 var(--font);     /* rows, labels */
  --type-caption: 500 13px/1.4 var(--font);     /* buttons, nav */
  --type-overline: 600 11px/1.3 var(--font);    /* section heads */
  --type-fine: 400 12px/1.4 var(--mono);        /* code, metadata */
}
```

This gives a minor-third-ish ratio: 11 -> 13 -> 14 -> 15 -> 18 -> 22 -> 32 -> 44 (ratios: 1.18, 1.08, 1.07, 1.2, 1.22, 1.45, 1.375). Not strictly mathematical, but each step is perceptible.

**Reference:** Vercel's type scale: 12, 14, 16, 20, 24, 32, 40. Linear: 12, 13, 14, 16, 20, 24, 32.

---

### 3. Snap Spacing to 4px Grid (MEDIUM)

**Problem:** ~40% of spacing values deviate from the 4/8pt grid by 1-3px (10, 11, 20, 28, 40, 100).

**Fix:**
```css
/* Row padding: 11px -> 12px */
.row { padding: 12px 0; }

/* Plan-top margin: 20px -> 24px */
.plan-top { margin-bottom: 24px; }

/* Side padding: 16px 10px -> 16px 12px */
.side { padding: 16px 12px; }

/* Side-group margin: 20px -> 24px */
.side-group { margin-bottom: 24px; }

/* CTA padding: 10px 28px -> 12px 28px (or 12px 32px) */
.hero-cta { padding: 12px 32px; }
.plan-cta { padding: 12px 24px; }

/* Main padding: 32px 40px -> 32px 40px (40 is 5*8, acceptable) */
/* Or strictly: 32px 48px */

/* Home bottom padding: 100px -> 96px (12*8) */
.content { padding-bottom: 96px; }
```

**Reference:** Tailwind default scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96. Our 40px main padding aligns with this.

---

### 4. Add Fluid Typography for Mobile (MEDIUM)

**Problem:** Two hard breakpoints at 768px and 375px with no interpolation. Korean text at 11px is a legibility risk.

**Fix:**
```css
.plan-title {
  font-size: clamp(22px, 5vw + 8px, 32px);
  line-height: 1.15;
}

.plan-num {
  font-size: clamp(28px, 6vw + 4px, 44px);
}

/* Korean small text minimum */
.group-head,
.row-sub,
.side-label {
  font-size: max(12px, 11px);  /* floor at 12px for Korean */
}

/* Or better -- use clamp for section heads */
.group-head {
  font-size: clamp(11px, 1.2vw + 6px, 12px);
}
```

Also increase minimum row height for touch targets:
```css
.row { min-height: 44px; display: flex; align-items: center; }
```

**Reference:** Apple HIG recommends minimum 11pt (approx 15px CSS) for body text. For Korean, 13px is a practical floor for paragraph text.

---

### 5. Rebalance Price vs. Service Name Hierarchy (LOW)

**Problem:** plan-num (44px) visually overpowers plan-title (32px). In a repair-shop model, the service name should dominate; price supports.

**Fix:**
```css
/* Option A: shrink price */
.plan-num { font-size: 36px; font-weight: 400; }
.plan-title { font-size: 32px; font-weight: 700; }
/* Now title leads via weight while price is lighter. */

/* Option B: enlarge title */
.plan-title { font-size: 36px; }
.plan-num { font-size: 40px; font-weight: 400; color: var(--tx2); }
/* Desaturate price with tx2 to pull it back. */
```

**Reference:** Stripe pricing page: plan name at 24px bold, price at 48px but in lighter weight (300). The weight contrast lets the name "feel" primary even when the number is larger. Linear: names and prices at near-equal sizes, differentiated by color.

---

## Summary Table

| Dimension | Score | Key Issue |
|-----------|-------|-----------|
| Typography Scale | 5/10 | Tokens unused, no consistent ratio, missing mid-range |
| Spacing Rhythm | 6/10 | Good tokens, poor adoption, 40% off-grid |
| Color Contrast | 4/10 | --tx2 fails WCAG AA; affects majority of text |
| Visual Flow | 7/10 | Strong F/Z patterns, price over-dominant |
| Negative Space | 7/10 | Desktop good, mobile cramped at 375px |
| Visual Hierarchy | 7/10 | Clear extremes, hollow middle |
| Mobile Typography | 6/10 | Coarse breakpoints, Korean legibility risk at 11px |
| **Weighted Average** | **6.8/10** | |

---

## Reference Benchmarks

| Site | What they do well |
|------|-------------------|
| **Linear** | Perfect 4px grid discipline. Secondary text at #8E8E93 (4.6:1). Monospace prices. Minimal but never illegible. |
| **Vercel** | Fluid type with clamp(). Spacing tokens rigidly enforced. #888 secondary text. |
| **Stripe** | Weight-based hierarchy (300 vs 700) rather than size-only. Generous whitespace (64-80px between sections). |
| **Grok (x.ai)** | Ultra-dark theme done right: secondary text at #A1A1AA (5.2:1). Dot-grid background similar to VibeSec. |
| **Notion** | Korean typography reference: body at 16px, min caption at 12px, never below. |

---

*End of audit. No code was modified.*
