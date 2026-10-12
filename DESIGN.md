---
name: Formandos
description: Gestão administrativa de formaturas e eventos por turma.
colors:
  primary: "oklch(0.511 0.262 276.966)"
  primary-foreground: "oklch(0.985 0 0)"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  border: "oklch(0.922 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  ring: "oklch(0.585 0.233 277.117)"
  dataviz: "#2a78d6"
typography:
  display:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.375
  body:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  label:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "1.875rem"
    fontWeight: 600
rounded:
  card: "0.625rem"
  control: "0.5rem"
  pill: "9999px"
spacing:
  card: "16px"
  card-sm: "12px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.control}"
    height: "32px"
    padding: "0 10px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklch, oklch(0.511 0.262 276.966) 80%, transparent)"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.control}"
    height: "32px"
    padding: "0 10px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    height: "32px"
    padding: "0 10px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    height: "32px"
    padding: "0 10px"
  button-destructive:
    backgroundColor: "color-mix(in oklch, oklch(0.577 0.245 27.325) 10%, transparent)"
    textColor: "{colors.destructive}"
    rounded: "{rounded.control}"
    height: "32px"
    padding: "0 10px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    height: "32px"
    padding: "4px 10px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: Formandos

## Overview

**Creative North Star: "Mesa de Decisão"**

The interface is the committee's worktable: a calm, legible surface where an administrator runs collective decisions and a participant answers them. Nothing decorates; everything records. Density serves the admin screens (reports, member lists, catalog editing) while participant screens (voting, doubts, RSVP) stay scannable with one action per view.

The mood is claro e acolhedor: light surfaces, generous whitespace, plain pt-BR copy, and a single indigo voice that speaks only when something needs deciding. A playful Claymorphism direction with rounded toy-like forms was explicitly considered and rejected; the system stays a restrained shadcn-style interface.

**Key Characteristics:**
- One accent, used rarely and always meaningfully.
- Administrative density for admins; single-action clarity for participants.
- Flat surfaces at rest; motion only in response to state.
- Readable pt-BR copy; no invented claims, no decorative text effects on functional UI.

## Colors

A neutral light-first palette with one fixed brand accent. Dark mode remaps the neutrals, never the brand.

### Primary

- **Indigo Institucional** (oklch(0.511 0.262 276.966), ≈ #4F46E5): the only accent. Primary buttons, fixed-decision markers, vote highlights, the invite-code gradient, and focus outlines. Identical value in light and dark; white text on it measures 6.17:1 in both themes.

### Neutral

- **Paper** (oklch(1 0 0)): page and card background in light mode.
- **Ink** (oklch(0.145 0 0)): body text in light mode; page background in dark mode (19.79:1 / 18.96:1 against its counterpart).
- **Muted Surface** (oklch(0.97 0 0)): secondary fills, hover states, footer strips.
- **Muted Text** (oklch(0.556 0 0)): descriptions, metadata, placeholders (4.73:1 on Paper; 7.63:1 in dark mode).
- **Hairline** (oklch(0.922 0 0)): borders and input strokes in light mode.
- **Destructive** (oklch(0.577 0.245 27.325)): errors and destructive actions (4.76:1 on Paper; softened to 10–20% tints for destructive button fills).
- **Focus Ring** (oklch(0.585 0.233 277.117)): input borders and focus rings in light mode; lightened in dark mode for contrast against the dark surface.
- **Chart Blue** (#2a78d6 light / #3987e5 dark): the single validated dataviz series color (4.42:1 on white, 5.44:1 on the dark surface).

### Named Rules

**The One Voice Rule.** The indigo accent appears on ≤10% of any given screen: primary actions, decided states, and key figures. Its rarity is the point — when everything is indigo, nothing is decided.
**The Same Brand Both Themes Rule.** The primary value never changes between themes; only neutrals and the focus ring remap. Brand recognition must survive a theme switch.

## Typography

**Display Font:** Geist Sans, system-ui fallback (loaded via next/font; `--font-geist-sans`)
**Body Font:** Geist Sans, same stack
**Label/Mono Font:** Geist Mono for the invite-code digits; system sans everywhere else

**Character:** Quiet grotesque with tight tracking on headings and tabular numerals on every figure. Type never decorates; size changes mark hierarchy, nothing else does.

### Hierarchy

- **Display** (semibold, 1.5rem / text-2xl, tracking-tight): page titles, one per page.
- **Headline** (semibold, 1.125rem / text-lg): section and card-group titles.
- **Title** (medium, 1rem / text-base, leading snug): card titles.
- **Statistic** (semibold, 1.875rem / text-3xl, tabular-nums): dashboard figures and the invite-code digits (mono).
- **Body** (regular, 0.875rem / text-sm): default reading text across the app.
- **Label** (medium, 0.75rem / text-xs, muted): metadata, descriptions, form hints.

### Named Rules

**The No-Zoom Rule.** Form fields render at 1rem on small screens and step down to 0.875rem at ≥768px, so mobile browsers never auto-zoom into a field.
**The One Display Rule.** A page gets one Display title. Card and section titles use Headline or Title; they are not headings in the accessibility tree (CardTitle renders a div), so visual hierarchy must not imply document structure that is not there.

## Layout

A centered single-column model inside a persistent sidebar shell. Inner app content caps at 56rem (widening to 72rem on very large screens); the marketing vitrine caps at 72rem (84rem on very large screens). Page padding steps 1rem → 1.5rem → 2rem → 3rem across small, medium, large, and very-large viewports. Spacing rhythm follows the 4px scale with gaps of 4–16px; section gaps widen to 24–48px only on the vitrine.

Filter and toolbar rows scroll horizontally on narrow screens with hidden scrollbars; data tables scroll inside `overflow-x-auto` wrappers rather than breaking the page. On TVs and very large displays the root font size scales up (112.5% at 1920px, 150% at 2560px, 200% at 3400px), enlarging the whole interface proportionally since all sizing is rem-based.

## Elevation & Depth

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state: hover, overlay, or focus.

### Shadow Vocabulary

- **Card rest** (`shadow-sm` plus a 10%-opacity foreground ring): the default card treatment — a hairline ring does the separation work, the shadow is barely there.
- **Vitrine hover** (translate up 4px with a tinted indigo shadow): cards on the marketing page lift on hover; app cards never lift.
- **Overlay scrim** (black at 40%): the single dimmer behind dialogs and sheets, isolating modal content.
- **Focus glow** (3px ring at 50% ring color plus a 3px solid global outline): keyboard focus is deliberately double-marked and visible on every control, including TV D-pad navigation.

## Shapes

Gently rectangular with purpose-built corners: cards use a 10px radius (rounded-xl), controls use 8px (rounded-lg), filter pills and badges are fully round. Cards clip overflowing content (long titles truncate silently inside `overflow-hidden`, so copy must be kept short rather than relying on wrapping). Borders are 1px hairlines; the card adds its tonal ring on top. Form language is consistent: 8px radius, hairline stroke, 32px height, 10px horizontal padding on every text control.

## Components

### Buttons

Contained and precise: 8px radius, 14px medium label, 32px height (growing to 40–44px on coarse pointers for the default, small, and large sizes). Primary is solid indigo with white text, darkening to 80% on hover and nudging down 1px on press. Outline, secondary, ghost, and destructive-tint variants share the same geometry; the link variant is defined but unused. Icon-only sizes (24–36px) exist for header and dialog controls.

### Cards / Containers

- **Corner Style:** 10px radius, clipped.
- **Background:** card token with 14px body text.
- **Shadow Strategy:** flat by default per the Elevation section; ring plus `shadow-sm`.
- **Border:** hairline token, reinforced by the tonal ring.
- **Internal Padding:** 16px standard, 12px in the small size; header, content, and footer share one spacing variable.

### Inputs / Fields

Hairline stroke, transparent fill, 8px radius, 32px height (44px on touch). Focus shifts the border to the ring color with a 3px glow; invalid state shifts to destructive with its own glow. Disabled fields drop to half opacity with a tinted fill. Selects, textareas, and the native-select wrapper share the same treatment.

### Navigation

A fixed sidebar with a sticky in-app header (menu trigger, product wordmark, theme switcher). Menu items are full-width 8px-radius rows with muted-icon affordances and a tonal active state; the mobile sidebar arrives as a sheet. The skip link targets the content landmark on every route layout.

### Chips

Fully round pills: 12px medium labels, tonal fills for filter and status states, solid indigo with white text for the default badge. Used for filters, vote status ("Respondida"), and counts — never for actions that need a button's affordance.

### Invite-Code Tiles (signature component)

The invite code renders as individual mono digits in bordered tiles with gradient numerals — the one place display typography is allowed to show off. Each tile is a fixed-size cell (44–64px wide depending on viewport) so the code scans as a single object.

## Do's and Don'ts

Concrete guardrails grounded in the implemented system.

### Do:

- **Do** build every color from semantic tokens; the only hex values in app UI are the two validated chart blues.
- **Do** keep body-text contrast at or above 4.5:1 in both themes; the observed pairs (body, muted, primary-on-white-text, destructive) all pass.
- **Do** grow touch targets on coarse pointers using the established pattern; the floor is a full 44px for any new control.
- **Do** gate entrance animation behind reduced-motion checks and always leave a no-JS, no-animation path that shows content.
- **Do** keep the skip-link target (`id="conteudo"`) on exactly one content landmark per route layout.

### Don't:

- **Don't** hardcode gray, white, or black utilities in app UI; illustration fills and email templates are the only sanctioned exceptions.
- **Don't** set gradient text on functional headings or metrics; the vitrine hero title is the single exception.
- **Don't** add a second chart series without a validated color; the dead gray `--chart-*` tokens were removed, and `--viz-serie-1` covers the single series.
- **Don't** nest landmarks (a `main` inside a `main`) or label plain paragraphs and divs with `aria-label`; assistive technology ignores both.
- **Don't** add new overlay scrim opacities; the single 40% scrim covers dialogs and sheets.
