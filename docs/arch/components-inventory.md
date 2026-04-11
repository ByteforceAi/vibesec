# Components Inventory

> design-system-engineer output. screen-builder and content-curator reference this document.

---

## Overview

All components live in `app/src/lib/components/` and are barrel-exported from `index.ts`.

Import pattern:
```svelte
<script lang="ts">
  import { Button, Card, TabBar } from '$lib/components';
</script>
```

Design tokens are in `app/src/lib/ds/tokens.ts`.
Liquid Glass utilities are in `app/src/lib/ds/liquid-glass.ts`.

---

## Component Catalog

### 1. Button

| Field | Value |
|-------|-------|
| File | `app/src/lib/components/Button.svelte` |
| iOS 26 Reference | Button (148 variants) |
| Min Height | 44px (md), 36px (sm), 50px (lg) |
| Min Width | 120px (md), 80px (sm), 160px (lg) |

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'primary' \| 'secondary' \| 'destructive' \| 'ghost'` | `'primary'` | Visual style |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size. All sizes meet 44pt min touch target except sm (36px, use sparingly) |
| fullWidth | `boolean` | `false` | Stretch to container width |
| disabled | `boolean` | `false` | Disabled state |
| loading | `boolean` | `false` | Show spinner, disable interaction |
| onclick | `(e: MouseEvent) => void` | — | Click handler |
| ariaLabel | `string` | — | Accessibility label |
| type | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| children | `Snippet` | required | Button label (slot) |

**Usage:**
```svelte
<Button variant="primary" size="lg" fullWidth onclick={handleDiagnose}>
  {copy.cta}
</Button>
```

**Token mapping:** `--color-system-blue` (primary), `--color-system-red` (destructive), `--color-fill-secondary` (secondary)

---

### 2. Card

| Field | Value |
|-------|-------|
| File | `app/src/lib/components/Card.svelte` |
| iOS 26 Reference | List Row (grouped style) |
| Glass | Liquid Glass card variant (12px frost, 40px shadow) |

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| glass | `boolean` | `true` | Enable Liquid Glass effect |
| padding | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Content padding |
| onclick | `(e: MouseEvent) => void` | — | Makes card interactive |
| ariaLabel | `string` | — | Accessibility label |
| header | `Snippet` | — | Header slot |
| footer | `Snippet` | — | Footer slot |
| children | `Snippet` | required | Body content |

**Usage:**
```svelte
<Card glass padding="lg">
  {#snippet header()}<h3>{pkg.name_kr}</h3>{/snippet}
  <p>{pkg.description_kr}</p>
  {#snippet footer()}<Badge severity={pkg.severity} />{/snippet}
</Card>
```

---

### 3. TabBar

| Field | Value |
|-------|-------|
| File | `app/src/lib/components/TabBar.svelte` |
| iOS 26 Reference | Tab Bar |
| Glass | Liquid Glass bar (thick, bottom-mounted) |

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | `TabItem[]` | required | Tab definitions `{ id, label, icon? }` |
| active | `string` | required | Currently active tab id |
| onselect | `(id: string) => void` | required | Tab selection handler |

**TabItem type:** `{ id: string; label: string; icon?: string; }`

**Usage:**
```svelte
<TabBar
  items={[
    { id: 'home', label: copy.tabHome, icon: '...' },
    { id: 'diagnose', label: copy.tabDiagnose, icon: '...' },
  ]}
  active={currentTab}
  onselect={(id) => goto(`/${id}`)}
/>
```

---

### 4. Toolbar

| Field | Value |
|-------|-------|
| File | `app/src/lib/components/Toolbar.svelte` |
| iOS 26 Reference | Toolbar / Navigation Bar |
| Glass | Liquid Glass bar (thick, top-mounted, sticky) |

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | `''` | Navigation title |
| largeTitle | `boolean` | `false` | iOS large title mode |
| leading | `Snippet` | — | Left action area |
| trailing | `Snippet` | — | Right action area |

**Usage:**
```svelte
<Toolbar title={copy.pageTitle} largeTitle>
  {#snippet trailing()}<Button variant="ghost">{copy.action}</Button>{/snippet}
</Toolbar>
```

---

### 5. ListRow

| Field | Value |
|-------|-------|
| File | `app/src/lib/components/ListRow.svelte` |
| iOS 26 Reference | List Row |
| Min Height | 44px |

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | required | Primary text |
| subtitle | `string` | — | Secondary text |
| onclick | `(e: MouseEvent) => void` | — | Makes row interactive |
| showChevron | `boolean` | `true` | Show right chevron (when interactive) |
| leading | `Snippet` | — | Left icon/image area |
| trailing | `Snippet` | — | Right accessory area |

**Usage:**
```svelte
<ListRow
  title={vuln.title_kr}
  subtitle={vuln.metaphor_kr}
  onclick={() => showDetail(vuln.id)}
>
  {#snippet leading()}<Badge severity={vuln.severity} />{/snippet}
</ListRow>
```

---

### 6. Sheet

| Field | Value |
|-------|-------|
| File | `app/src/lib/components/Sheet.svelte` |
| iOS 26 Reference | Sheet |
| Glass | Liquid Glass sheet (14px frost, 80px shadow) |

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | `boolean` | `false` | Visibility |
| onclose | `() => void` | required | Close handler |
| snapPoints | `number[]` | `[0.5, 0.95]` | Height ratios |
| title | `string` | — | Sheet header title |
| children | `Snippet` | required | Content |

**Usage:**
```svelte
<Sheet open={showDetail} onclose={() => showDetail = false} title={pkg.name_kr}>
  <p>{pkg.description_kr}</p>
</Sheet>
```

---

### 7. Alert

| Field | Value |
|-------|-------|
| File | `app/src/lib/components/Alert.svelte` |
| iOS 26 Reference | Alert |
| Glass | Liquid Glass modal (14px frost, 80px shadow, thick) |

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | `boolean` | `false` | Visibility |
| severity | `Severity` | `'warning'` | Dot color indicator |
| title | `string` | required | Alert title |
| message | `string` | — | Detail message |
| actions | `AlertAction[]` | `[]` | Action buttons |
| onclose | `() => void` | — | Escape key handler |
| icon | `Snippet` | — | Custom icon instead of severity dot |

**AlertAction type:** `{ label: string; variant?: 'primary' \| 'destructive' \| 'cancel'; onclick: () => void; }`

**Usage:**
```svelte
<Alert
  open={showAlert}
  severity="critical"
  title={copy.alertTitle}
  message={copy.alertMessage}
  actions={[
    { label: copy.confirm, variant: 'primary', onclick: handleConfirm },
    { label: copy.cancel, variant: 'cancel', onclick: () => showAlert = false },
  ]}
/>
```

---

### 8. ProgressIndicator

| Field | Value |
|-------|-------|
| File | `app/src/lib/components/ProgressIndicator.svelte` |
| iOS 26 Reference | Progress |

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `number` | `0` | Progress 0-1 |
| variant | `'linear' \| 'circular'` | `'linear'` | Display style |
| showLabel | `boolean` | `false` | Show percentage text |
| size | `number` | `48` | Pixel size (circular only) |
| ariaLabel | `string` | — | Accessibility label |

**Usage:**
```svelte
<ProgressIndicator value={scanProgress} variant="circular" showLabel size={64} />
```

---

### 9. Badge

| Field | Value |
|-------|-------|
| File | `app/src/lib/components/Badge.svelte` |
| iOS 26 Reference | Custom (semantic severity) |

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'severity' \| 'count'` | `'severity'` | Badge type |
| severity | `Severity` | `'ok'` | Color: critical=red, warning=yellow, ok=green |
| count | `number` | — | Number to display (count variant) |
| maxCount | `number` | `99` | Cap display at N+ |
| children | `Snippet` | — | Label text (severity variant) |

**Usage:**
```svelte
<Badge severity="critical">{copy.urgent}</Badge>
<Badge variant="count" count={3} />
```

---

### 10. Input

| Field | Value |
|-------|-------|
| File | `app/src/lib/components/Input.svelte` |
| iOS 26 Reference | Text Field |
| Min Height | 44px |

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | `''` | Bindable input value |
| placeholder | `string` | `''` | Placeholder text |
| type | `'text' \| 'url' \| 'email' \| 'search'` | `'text'` | Input type |
| disabled | `boolean` | `false` | Disabled state |
| ariaLabel | `string` | — | Accessibility label |
| oninput | `(value: string) => void` | — | Value change handler |
| onsubmit | `() => void` | — | Enter key handler |

**Usage:**
```svelte
<Input
  bind:value={url}
  type="url"
  placeholder={copy.urlPlaceholder}
  ariaLabel={copy.urlLabel}
  onsubmit={startScan}
/>
```

---

## Design Token Files

| File | Purpose |
|------|---------|
| `app/src/lib/ds/tokens.ts` | All design tokens as TS constants: colors, typography, spacing, radius, glass, animations, semantic mappings |
| `app/src/lib/ds/liquid-glass.ts` | Liquid Glass CSS helper functions: `liquidGlassStyle()`, `liquidGlassProps()`, `depthShadow()`, `frostRadius()` |
| `app/src/app.css` | CSS custom properties (source of truth for all tokens), dark mode overrides, base reset |

## Liquid Glass Variants

| Variant | Frost Radius | Shadow | Use Case |
|---------|-------------|--------|----------|
| `sheet` | 14px (L) | 80px bg | Bottom sheets |
| `card` | 12px (M) | 40px layer | Cards, grouped content |
| `bar` | 12px (M) | 40px layer | Toolbar, TabBar |
| `modal` | 14px (L) | 80px bg | Alerts, dialogs |
| `badge` | 7px (S) | 40px layer | Small indicators |

## Severity Color Mapping

| Severity | Token | CSS Variable | Meaning |
|----------|-------|-------------|---------|
| `critical` | `semantic.severity.critical` | `--color-system-red` | Urgent issue |
| `warning` | `semantic.severity.warning` | `--color-system-yellow` | Caution needed |
| `ok` | `semantic.severity.ok` | `--color-system-green` | All clear |
