<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Bump rationale: MINOR — Amended to allow dark mode.

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Feature-First Angular Architecture
  - [PRINCIPLE_2_NAME] → II. Design System Supremacy
  - [PRINCIPLE_3_NAME] → III. Clean Data Flow (No Business Logic in UI)
  - [PRINCIPLE_4_NAME] → IV. RTL-Safe, Mobile-First UI
  - [PRINCIPLE_5_NAME] → V. Explicit Page States (Loading / Error / Empty / Content)

Added sections:
  - Technology Constraints
  - Mentorship & Code Quality Standards

Removed sections: none (template sections repurposed)

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gates aligned
  ✅ .specify/templates/spec-template.md — no structural change needed; aligns with FR/SC format
  ✅ .specify/templates/tasks-template.md — phase structure compatible; no changes needed

Deferred TODOs: none
-->

# Education Statistics Explorer Constitution

## Core Principles

### I. Feature-First Angular Architecture

The codebase MUST follow a strict feature-first folder structure under `src/app/`:

- `core/` — app-wide singletons only: app config, ECharts registration, layout shell,
  routing, global services, and translation helpers.
- `shared/` — reusable generic UI primitives, chart wrapper, state components,
  pipes, directives, and utilities that are not feature-specific.
- `features/` — one folder per feature (overview, trends, regional-analysis,
  gender-analysis, stage-analysis). Each feature owns its own pages, ui components,
  data-access/facade, and models.

Each feature folder MUST follow:

```
feature-name/
  pages/        ← smart/container components
  ui/           ← dumb/presentational components
  data-access/  ← facades, mappers, chart option builders
  models/       ← feature view models and interfaces
```

Smart (container) components MUST: load data via facades, own view state, handle all
4 page states, and pass ready-to-render view models to children.

Dumb (presentational) components MUST: receive inputs only, emit outputs, never fetch
data, and never contain business logic.

Business logic, aggregation, and chart transformations MUST live in services, facades,
or pure utility functions — never in templates or presentational components.

### II. Design System Supremacy

All UI MUST be built using the custom design system defined in `src/styles/`:
`tokens.css`, `themes.css`, `base.css`, `components.css`, `utilities.css`.

Styling priority order (MUST be followed in this order):

1. Semantic DS classes from `components.css` (e.g. `ds-card`, `ds-btn-primary`,
   `ds-stat-card`, `ds-chart-card`, `ds-state-panel`, `ds-glassbar`)
2. Utility helpers from `utilities.css` (e.g. `bg-surface`, `text-soft`, `glass`)
3. Tailwind utilities backed by CSS design tokens
4. New semantic class added to `components.css` if pattern is reusable
5. New token added to `tokens.css` only if a reusable design value is missing

Tailwind CSS v4 compatibility is NON-NEGOTIABLE:

- `@apply` MUST only be used with native Tailwind utilities
- `@apply ds-btn`, `@apply ds-card`, or any custom class chaining via `@apply`
  is FORBIDDEN
- Semantic `.ds-*` classes MUST be self-contained

Hardcoded hex colors, random Tailwind palette colors (e.g. `bg-teal-500`),
and ad-hoc shadows or radii MUST NEVER appear in feature component code.

Charts MUST use `--chart-1` through `--chart-N` tokens for series colors.
Design token variables (e.g. `--color-primary`, `--color-surface`) are the
only approved color source.

### III. Clean Data Flow (No Business Logic in UI)

Data loading, transformation, and aggregation MUST be centralized:

- JSON datasets are loaded exclusively by services (`education-data.service`,
  `filter-state.service`, etc.) — never by presentational components.
- View models are prepared in feature facades before reaching the template.
- Components receive only ready-to-render data — no raw dataset slicing in templates.
- Repeated calculation or aggregation logic MUST be extracted to utils or services.
- Angular `OnPush` change detection MUST be preferred on all components.
- Angular signals and `computed()` MUST be preferred over imperative subscriptions
  where appropriate.

A component that renders a KPI card, chart, or stat panel MUST NOT know where the
data came from or how it was derived.

### IV. RTL-Safe, Mobile-First UI

All layouts MUST be built mobile-first:

- Start with the smallest screen layout and progressively enhance with
  `md:`, `lg:`, `xl:` breakpoints.
- Fixed desktop-only layouts MUST be avoided.
- Chart containers MUST have explicit height values.

All layouts MUST remain correct in both `dir="rtl"` (Arabic) and `dir="ltr"`
(English):

- No left/right structural assumptions in component HTML or CSS.
- Language switching (Transloco) and text direction changes MUST not break any
  layout, chart label, or navigation element.
- Arabic (`ar`) is the default language; English (`en`) is the secondary language.

Accessibility MUST be maintained:

- Semantic HTML, visible focus states, keyboard-accessible controls,
  labels on all form inputs, readable contrast, touch-friendly targets.
- Clickable `div` elements where a `button` is appropriate are FORBIDDEN.

### V. Explicit Page States (Loading / Error / Empty / Content)

Every feature page MUST handle exactly 4 explicit states:

- **loading** — show shared loading skeleton; no partial renders
- **error** — show shared error state component; no blank sections
- **empty** — show shared empty state component; explain clearly
- **content** — render charts, KPI cards, and data panels

State handling belongs ONLY at the page/container level.

Presentational components MUST receive ready data; they MUST NOT conditionally
manage loading or error states internally.

Charts, KPI cards, and stat panels MUST NEVER render in a broken, blank,
or partially-loaded state while data is unavailable.

## Technology Constraints

The following technology choices are fixed for this project:

- **Framework**: Angular (standalone components, feature-first architecture)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + custom design system in `src/styles/`
- **Charts**: Apache ECharts via `ngx-echarts` (modular `echarts/core` setup)
  — registered centrally in `src/app/core/charts/echarts.config.ts`
  — provided via `provideEchartsCore({ echarts })`
- **Translation**: Transloco (Arabic + English, runtime switching)
- **Icons**: Lucide Angular only — mixing icon libraries is FORBIDDEN
- **Routing**: Angular Router — default route redirects to `/overview`
- **Datasets**: JSON files in `src/assets/datasets/` (read-only; no mutation)

The following are explicitly out of scope for now:
authentication, backend API, PDF export, map integration,
public API integration, and complex drill-through routing.

## Mentorship & Code Quality Standards

This project is a **frontend mentorship program** codebase. All code MUST reflect
production-style patterns that a junior developer can learn from:

- Code MUST be readable and self-explanatory — no clever one-liners that obscure
  intent.
- Patterns MUST be consistent across all features; no per-screen solutions to
  problems the design system already solved.
- Shared components MUST be created when the same visual pattern appears in more
  than one place.
- No giant monolithic services — responsibilities MUST be split cleanly between
  data loading, transformation, and presentation.
- Every new feature MUST include all 4 page states from day one; retrofitting state
  handling later is not acceptable.

## Governance

This constitution supersedes all other development practices, style rules, and
framework defaults for this project.

Amendment procedure:

1. Propose a change with rationale and impacted sections clearly identified.
2. Determine version bump type (MAJOR / MINOR / PATCH) using semantic versioning rules.
3. Update this file, increment the version, and set `Last Amended` to today.
4. Propagate changes to all affected templates in `.specify/templates/`.
5. Update the Sync Impact Report comment at the top of this file.

Compliance review expectations:

- All PRs and implementation plans MUST pass a Constitution Check before proceeding.
- The `plan-template.md` Constitution Check section MUST reference the active
  principle gates relevant to the feature being built.
- Complexity or deviations from principles MUST be justified in the plan's
  Complexity Tracking table.

All agents working on this project MUST load and apply this constitution before
generating any code, plan, or task list.

**Version**: 1.1.0 | **Ratified**: 2026-03-23 | **Last Amended**: 2026-03-23
