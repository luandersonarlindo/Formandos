# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

> **SOURCE OF TRUTH:** Every value below was verified against `src/app/globals.css`
> and `src/components/ui/*`. The dataset suggestion that generated this file
> (teal `#0D9488`, Baloo 2 / Comic Neue, amber CTA) was explicitly rejected:
> this product is an administrative platform, not a playful education app.
> Full record in `DESIGN.md`; machine tokens in `.impeccable/design.json`.

---

**Project:** Formandos
**Validated:** 2026-10-12
**Category:** Graduation event management (SaaS, multi-turma)

---

## Global Rules

### Color Palette

| Role | Value | CSS Variable |
|------|-------|--------------|
| Primary (Indigo Institucional) | `oklch(0.511 0.262 276.966)` ≈ `#4F46E5` | `--primary` |
| On Primary | `oklch(0.985 0 0)` (white, 6.17:1 on primary) | `--primary-foreground` |
| Background | `oklch(1 0 0)` | `--background` |
| Foreground | `oklch(0.145 0 0)` | `--foreground` |
| Card | `oklch(1 0 0)` | `--card` |
| Muted | `oklch(0.97 0 0)` | `--muted` |
| Muted Foreground | `oklch(0.556 0 0)` (4.73:1 on white) | `--muted-foreground` |
| Border / Input | `oklch(0.922 0 0)` | `--border` / `--input` |
| Destructive | `oklch(0.577 0.245 27.325)` | `--destructive` |
| Ring | `oklch(0.585 0.233 277.117)` | `--ring` |
| Chart series (single, validated) | `#2a78d6` light / `#3987e5` dark | `--viz-serie-1` |

**Color Notes:** One accent, fixed in both themes; only neutrals and the ring
remap in dark mode. No secondary or tertiary accent exists — omit them, do not
invent them. Body-text pairs hold ≥4.5:1 in both themes.

### Typography

- **Display / Body Font:** Geist Sans (`--font-geist-sans`), system-ui fallback
- **Mono Font:** Geist Mono (`--font-geist-mono`) — invite-code digits only
- **Scale in use:** Display 1.5rem semibold tight (page titles) · Headline
  1.125rem · Title 1rem medium (card titles) · Statistic 1.875rem semibold
  tabular · Body 0.875rem · Label 0.75rem muted
- **Mood:** quiet, legible, administrative

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| Card padding | `16px` (`12px` small) | `--card-spacing` |
| Page padding | `16px → 24px → 32px → 48px` | sm → md → lg → 2xl |
| Gaps | `4–16px` | flex/grid rhythm |
| Section gaps | `24–48px` | vitrine only |
| Containers | `56rem` app · `72rem` vitrine | widen on 2xl screens |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| Card rest | `shadow-sm` + 10% foreground ring | default cards, flat look |
| Vitrine hover | lift 4px + tinted indigo shadow | marketing cards only |
| Dialog scrim | black 40% | dialogs |
| Sheet scrim | black 10% | sheets (differs; do not add a third) |
| Focus glow | 3px ring at 50% + 3px solid outline | every control, keyboard + TV remote |

---

## Component Specs

### Buttons

```css
/* Primary Button — 8px radius, 32px height, 14px medium label */
.btn-primary {
  background: oklch(0.511 0.262 276.966);
  color: oklch(0.985 0 0);
  padding: 0 10px;
  height: 32px; /* 40–44px on coarse pointers */
  border-radius: 8px;
}
.btn-primary:hover { background: color-mix(in oklch, var(--primary) 80%, transparent); }
.btn-primary:active { transform: translateY(1px); }
```

Outline, secondary, ghost, and destructive-tint variants share the geometry.
Icon-only sizes run 24–36px. The link variant is defined but unused.

### Cards

```css
.card {
  background: var(--card);
  border-radius: 10px; /* rounded-xl */
  padding: 16px 0;
  overflow: hidden; /* long titles truncate — keep copy short */
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05),
    0 0 0 1px color-mix(in oklch, var(--foreground) 10%, transparent);
}
```

App cards never lift on hover. Only vitrine cards lift.

### Inputs

```css
.input {
  height: 32px; /* 44px on touch */
  padding: 4px 10px;
  border: 1px solid var(--input);
  border-radius: 8px;
  font-size: 16px; /* 14px at ≥768px — never auto-zooms */
}
.input:focus-visible {
  border-color: var(--ring);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);
}
```

Selects and textareas share the treatment. Invalid state uses destructive.

### Modals

```css
.modal-overlay-dialog { background: rgb(0 0 0 / 0.4); }
.modal-overlay-sheet { background: rgb(0 0 0 / 0.1); }
```

Radix Dialog/Sheet own focus trap and focus return — do not reimplement.

---

## Style Guidelines

**Style:** Restrained shadcn-style interface, light-first, single indigo voice.

**Keywords:** calm, legible, administrative, flat-by-default, single accent,
pt-BR copy, touch/keyboard/remote operable.

**Best For:** admin-dense screens (reports, members, catalog editing) and
single-action participant screens (voting, doubts, RSVP).

**Key Effects:** state-only motion (200ms color/transform, 100ms overlays);
entrance animation gated behind reduced-motion checks with a no-JS path that
shows content; TV root-font scaling (112.5/150/200% at 1920/2560/3400px).

### Page Pattern

**Pattern Name:** Mesa de Decisão

- Admin screens: dense tables, lists, and catalog editors behind the sidebar shell.
- Participant screens: one question or action per view, scannable in seconds.
- Vitrine: hero → features → profiles → team → final CTA.

---

## Anti-Patterns (Do NOT Use)

- ❌ **Playful direction** — Claymorphism, Baloo 2 / Comic Neue, toy-like
  rounding were explicitly rejected for this product.
- ❌ **Hardcoded gray/white/black utilities** in app UI — illustration SVG
  fills and email templates are the only exceptions.
- ❌ **Gradient text on functional UI** — vitrine hero title is the exception.
- ❌ **Second chart series on `--chart-*`** — dead all-gray tokens.
- ❌ **Nested landmarks** (`main` in `main`) or `aria-label` on plain `p`/`div`.
- ❌ **New overlay opacities** — unify dialog/sheet first.
- ❌ **Emojis as icons** — Lucide only (one 🎓 brand mark in vitrine footer,
  already `aria-hidden` everywhere structural).
- ❌ **Invisible focus states** — focus must survive theme switch and TV remote.
- ❌ **Low contrast text** — 4.5:1 minimum, verified per theme, not assumed.

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] Semantic tokens only; no hardcoded colors outside SVG/email
- [ ] Text contrast 4.5:1 in **both** themes (checked, not inferred)
- [ ] Focus visible via keyboard; skip-link target `id="conteudo"` present once
- [ ] `prefers-reduced-motion` respected (matchMedia + CSS media query)
- [ ] Touch targets ≥44px on coarse pointers
- [ ] Responsive: 375px, 768px, 1024px, 1440px (+ TV scaling untouched)
- [ ] `npm run typecheck` + `npm test` green
