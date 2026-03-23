---
trigger: always_on
---

---

description: Education Statistics Explorer frontend, Tailwind v4-safe design system, Angular architecture, RTL, and state handling rules

# Antigravity Rules — Education Statistics Explorer

## Mission

Generate code that is:

- visually consistent with the design system in `src/styles/`
- compatible with Tailwind CSS v4
- mobile-first
- RTL-safe
- Angular feature-first
- accessible
- explicit about loading, error, empty, and content states

The styling source of truth is:

- `src/styles/tokens.css`
- `src/styles/themes.css`
- `src/styles/base.css`
- `src/styles/components.css`
- `src/styles/utilities.css`
- `src/styles/fonts.css`
  The architecture source of truth is:

- `src/app/core/`
- `src/app/shared/`
- `src/app/features/`

---

## 1. Tailwind v4 rule

Tailwind CSS v4 does **not** allow `@apply` with custom classes like `.ds-btn` or `.ds-card`.

### Required

- Use `@apply` only with native Tailwind utilities
- Keep semantic `.ds-*` classes self-contained
- Use CSS variables from `tokens.css` for colors, spacing, radius, shadows, fonts
- Use normal CSS properties when token-based values are needed

### Allowed

- `@apply flex items-center gap-2 px-4 py-2`
- `background-color: var(--color-surface-lowest)`
- `border-radius: var(--radius-pill)`

### Forbidden

- `@apply ds-btn`
- `@apply ds-card`
- `@apply ds-section`
- chaining custom semantic classes through `@apply`

### Rule

Every semantic design-system class must be defined directly in `components.css`.

---

## 2. Styling priority order

When generating UI, follow this order:

1. Use existing semantic classes from `src/styles/components.css`
2. Use utility helpers from `src/styles/utilities.css`
3. Use Tailwind utilities with token values
4. Add a new semantic class in `components.css` if the pattern is reusable
5. Add a new token in `tokens.css` only if a reusable design value is missing

Do not jump directly to raw Tailwind palette colors, inline styles, or arbitrary one-off values.

---

## 3. Approved semantic classes

Prefer these classes first whenever they fit:

### Layout and shell

- `ds-page`
- `ds-shell`
- `ds-stack-4`
- `ds-stack-6`

### Surfaces

- `ds-section`
- `ds-card`
- `ds-card-elevated`
- `ds-card-muted`
- `ds-glassbar`

### Typography

- `ds-display-lg`
- `ds-display-md`
- `ds-display-sm`
- `ds-title-lg`
- `ds-title-md`
- `ds-title-sm`
- `ds-body-lg`
- etc...

### Controls

- `ds-btn`
- `ds-btn-primary`
- `ds-btn-secondary`
- `ds-btn-outline`
- `ds-btn-tertiary`
- `ds-input`
- `ds-select`
- etc...

### Navigation and content

- `ds-nav`
- `ds-kpi-card`
- `ds-stat-card`
- `ds-chart-card`
- `ds-state-panel`
- `ds-divider`

### Status badges

- `ds-badge-success`
- `ds-badge-warning`
- `ds-badge-error`
- `ds-badge-info`

### Rule

If one of these classes already matches the need, use it instead of rebuilding the same pattern.

---

## 4. Approved utility helpers

Use these helpers from `utilities.css` when semantic classes are not enough:

### Fonts

- `font-display`
- `font-body`

### Surfaces

- `bg-page`
- `bg-surface`
- `bg-surface-lowest`
- `bg-surface-low`
- `bg-surface-high`
- `bg-surface-highest`

### Text

- `text-main`
- `text-soft`
- `text-muted`
- etc...

### Effects

- `ring-soft`
- `border-soft`
- `shadow-soft-token`
- `shadow-ambient-token`
- `glass`
- `bg-brand-gradient`

### Charts

- `chart-color-1`
- `chart-color-2`
- `chart-color-3`
- etc...

### Scrollbars

- `scrollbar-thin-soft`

---

## 5. Colors

Only use token-based colors.

### Allowed token variables

- `--color-primary`
- `--color-primary-hover`- etc..

- `--color-secondary`
- `--color-secondary-hover`- etc..

- `--color-tertiary`
- `--color-tertiary-hover`- etc..

- `--color-background`
- `--color-surface`
- `--color-surface-lowest`
- `--color-surface-low`

- `--color-on-surface`
- `--color-on-surface-soft`
- etc..

- `--color-success`
- `--color-success-soft`
- etc..

### Forbidden

- hardcoded hex colors inside Angular components
- random Tailwind palette classes like `bg-teal-500`, `text-gray-700`, `border-slate-200`
- colors invented per screen without first adding them to tokens

### Rule

If a new reusable color is needed, add it to `tokens.css` first.

---

## 6. Typography

Use the approved font system only.

### Fonts

- Display/headline font: `var(--font-display)` → IBM Plex Sans
- Body/UI font: `var(--font-body)` → Inter

### Rules

- page titles, hero text, KPI numbers, and major headings should use `ds-display-*` or `ds-title-*`
- paragraphs, helper text, and descriptions should use `ds-body-*`
- labels, metadata, and small annotations should use `ds-label-*` or `ds-caption`
- do not set custom fonts inside feature components
- do not create random text scales per page

---

## 7. Surfaces and borders

This design system uses layered surfaces instead of heavy borders.

### Prefer

- `ds-section`
- `ds-card`
- `ds-card-elevated`
- `ds-card-muted`
- `bg-surface-low`

### Avoid

- heavy borders
- dark separators
- using `border border-*` everywhere
- high-contrast outlines for normal cards

### Rule

When a border is necessary, keep it soft using token-based outline styles.

---

## 8. Radius, shadows, and effects

Only use approved tokens.

### Allowed radius tokens

- `--radius-xs`
- `--radius-sm`
- `--radius-md`
- etc..

### Allowed shadow tokens

- `--shadow-soft`
- `--shadow-ambient`
- `--shadow-focus`

### Rules

- cards generally use `radius-xl`
- inputs/selects generally use `radius-md`
- pill buttons/tabs/badges use `radius-pill`
- do not invent arbitrary radius values or custom shadows in components

---

## 9. Layout rules

All layouts must be mobile-first.

### Required

- build the smallest screen first
- enhance progressively with `md:`, `lg:`, `xl:`
- keep wrappers minimal and readable
- use grid/flex cleanly

### Preferred patterns

- `grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4`
- `flex flex-col gap-4`
- `ds-shell`
- `ds-stack-4`
- `ds-stack-6`

### Avoid

- desktop-first layout logic
- fixed heights unless necessary
- deeply nested wrappers without purpose

---

## 10. RTL rules

All generated UI must support both Arabic and English.

### Required

- every layout must remain correct in both `dir="rtl"` and `dir="ltr"`
- do not assume left-to-right layout
- keep icon placement and spacing direction-safe

### Prefer

- logical spacing and alignment
- neutral flex/grid layouts that mirror naturally

### Avoid

- left/right assumptions baked into the design
- layouts that only look correct in English

---

## 11. Buttons and controls

Use design-system controls first.

### Buttons

- `ds-btn-primary` for main actions
- `ds-btn-secondary` for secondary actions
- `ds-btn-outline` for low emphasis bordered actions
- `ds-btn-tertiary` for quiet actions

### Inputs

- `ds-input`
- `ds-select`
- `ds-search`

### Support controls

- `ds-pill`
- `ds-pill-primary`
- `ds-pill-secondary`
- `ds-icon-btn`
- `ds-icon-btn-active`

### Rules

- do not restyle buttons from scratch in every feature
- controls must stay touch-friendly
- hover/focus/disabled states must remain intact

---

## 12. States

Every feature page must handle 4 explicit states:

- loading
- error
- empty
- content

### Required

- state handling belongs at the page/container level
- presentational components should receive ready-to-render data
- loading/error/empty should use shared UI patterns
- avoid blank or broken panels while data is unavailable

### Prefer

- `ds-state-panel`
- shared loading skeletons
- shared empty-state component
- shared error-state component

---

## 13. Icons

Use the approved icon system only.

### Required

- use Lucide icons
- keep sizes and stroke weights consistent
- use token-based colors

### Avoid

- mixing icon libraries
- decorative clutter
- inconsistent icon sizing

---

## 14. Charts

Charts must also follow the design system.

### Use only these chart tokens

- `--chart-1`
- `--chart-2`
- `--chart-3`
- etc..

### Rules

- chart colors must come from tokens
- chart surfaces should match surrounding cards
- tooltips and text should align with text tokens
- do not use chart library default palettes if they conflict with the system

---

## 15. Angular architecture

Use feature-first architecture.

### `core/`

Use for:

- app-wide singleton services
- config
- layout shell
- base models
- tokens/configuration services

### `shared/`

Use for:

- reusable generic UI
- pipes
- directives
- utilities
- shared state components

### `features/`

Use for:

- domain-specific screens
- local UI
- data-access/facades
- feature models
- feature-specific transformations

### Rule

Do not use `shared` as a dumping folder for feature-specific code.

---

## 16. Smart vs dumb components

### Smart/container components

Usually page-level:

- talk to services/facades
- own view state
- prepare data
- pass data to children

### Dumb/presentational components

Reusable UI:

- receive inputs
- emit outputs
- do not fetch data
- do not calculate business metrics

### Rule

Presentational components display data; they do not compute business logic.

---

## 17. Data and logic rules

### Required

- JSON loading belongs in services/facades, not small UI components
- transformations belong in services, facades, mappers, or pure utils
- components should receive ready-to-render view models

### Avoid

- reading raw data inside presentational components
- calculating totals in templates
- mixing heavy chart transformation logic into generic shared UI

---

## 18. File ownership

### `src/styles/tokens.css`

Use for:

- colors
- fonts
- radii
- shadows
- timing
- type scale
- layout tokens

### `src/styles/themes.css`

Use for:

- global theme behavior
- root theme defaults
- reduced motion adjustments
- theme-level page background behavior

### `src/styles/base.css`

Use for:

- font-face declarations
- reset
- base HTML element styling
- default typography behavior

### `src/styles/components.css`

Use for:

- reusable semantic `.ds-*` classes
- self-contained design-system component styles

### `src/styles/utilities.css`

Use for:

- small reusable token-backed helpers

### Rule

Do not place token definitions in feature component styles.

---

## 19. Component generation rules

When generating Angular components:

### Required

- use standalone components
- keep templates readable
- use semantic DS classes first
- use utility helpers second
- use token-based Tailwind utilities third
- keep components mobile-first and RTL-safe

### Avoid

- giant unreadable class strings when a DS class exists
- duplicating patterns across features
- inline styles for normal UI styling

---

## 20. Accessibility rules

### Required

- semantic HTML
- keyboard-accessible controls
- visible focus states
- readable text contrast
- labels for inputs
- touch-friendly interactive targets

### Avoid

- clickable `div`s instead of buttons
- hidden focus styles
- placeholder-only inputs
- inaccessible filter bars or icon buttons

---

## 21. Design system extension process

When a requested UI pattern does not fit the current system:

1. Check whether existing `.ds-*` classes already solve it
2. Check whether utility helpers solve it
3. If the pattern is reusable, add a new semantic class in `components.css`
4. If a reusable token is missing, add it to `tokens.css`
5. Reuse the new pattern consistently afterward

Do not solve reusable problems with one-off inline styles.

---

## 22. Forbidden patterns

Never:

- use `@apply` with custom `.ds-*` classes
- hardcode hex colors inside Angular components
- use random Tailwind palette colors
- invent ad hoc shadows or radii
- break RTL behavior
- skip loading/error/empty/content handling
- put business logic in presentational components
- use inline styles for standard UI
- duplicate a visual pattern that belongs in the design system

---

## 23. Preferred implementation order for new screens

When building a new page:

1. create page shell and spacing structure
2. add loading/error/empty/content handling
3. add filter/action area
4. add KPI cards
5. add cha
