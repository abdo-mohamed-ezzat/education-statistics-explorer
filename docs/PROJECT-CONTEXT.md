Below is a ready-to-paste **project context document** for your agent.

---

# Project Context — Education Statistics Explorer

## 1) Project summary

**Education Statistics Explorer** is an Angular dashboard for exploring Saudi Arabia general education statistics from **2016 to 2024**.

The app turns large Excel/open-data records into a clear, interactive dashboard with charts, KPIs, and filters so users can understand:

- student growth over time
- regional differences
- gender distribution
- stage distribution
- school and teacher counts
- high-level education development trends

This is a **frontend mentorship project**, so the codebase must prioritize:

- clean architecture
- reusable components
- readable code
- scalable folder structure
- strong design consistency
- realistic production-style patterns

---

## 2) Main product goal

The raw education dataset is large and hard to understand in Excel form. The app should make it easy to explore and compare education statistics visually.

The dashboard must help users answer questions like:

- How did total student counts change from 2016 to 2024?
- Which regions have the highest student counts?
- How does gender distribution vary by year, region, and stage?
- What is the distribution of students across primary, middle, secondary, and kindergarten?
- How many schools and teachers are represented in the data?
- Which areas show the biggest growth or concentration?

---

## 3) Target users

The app is for general dashboard users such as:

- students
- educators
- analysts
- mentors/reviewers
- people exploring Saudi education data visually

The UI should feel professional, clear, lightweight, and easy to scan.

---

## 4) Data context

The original dataset comes from Saudi open education data and was extracted from Excel into JSON.

The app uses these files inside:

```text
src/assets/datasets/
  education-records.json
  edu-master.json
  edu-summary.json
```

### Dataset roles

#### `education-records.json`

Canonical cleaned dataset used as the source of truth.

Expected fields include things like:

- `year`
- `hijriYear`
- `region`
- `educationOffice`
- `stage`
- `gender`
- `schoolCount`
- `studentCount`
- `teacherCount`
- `administratorCount`

#### `edu-master.json`

Aggregated dataset optimized for charts and filters.

Used for:

- yearly trends
- region comparisons
- stage/gender charts
- fast dashboard rendering

#### `edu-summary.json`

Top-level dashboard summary data.

Used for:

- total students
- growth rate
- largest region
- latest year
- base year

### Important data notes

- Data values may still contain Arabic labels.
- The app should not mutate dataset structure unless absolutely necessary.
- Data loading and transformation belong in services/facades, not presentational UI components.
- Components should receive ready-to-render view models.

---

## 5) Tech stack

### Core framework

- Angular
- TypeScript
- Angular standalone components
- Angular Router

### Styling

- Tailwind CSS v4
- Custom design system in `src/styles/`
- Mobile-first responsive styling
- RTL/LTR support

### Translation

- Transloco
- Arabic and English support
- Runtime language switching
- RTL for Arabic
- LTR for English

### Charts

- Apache ECharts
- `ngx-echarts`
- Modular `echarts/core` setup
- Shared chart wrapper component
- Central ECharts registration config

### Icons

- Lucide icons

---

## 6) Architecture rules

The app must use **feature-first Angular architecture**.

### Folder ownership

```text
src/app/
  core/
  shared/
  features/
```

### `core/`

Use for app-wide singletons and infrastructure:

- app config
- chart registration
- layout shell
- route config
- app-wide models
- global services
- translation helpers
- filter persistence if global
- dataset services if shared across features

### `shared/`

Use for generic reusable pieces:

- reusable UI primitives
- chart wrapper component
- state components
- pipes
- directives
- utils
- token-aware helpers

### `features/`

Use for business-specific screens:

- overview
- trends
- regional analysis
- gender analysis
- optional stage analysis

Each feature should own:

- page component
- feature UI components
- feature view models
- feature facade or data-access logic
- feature chart option builders

---

## 7) Smart vs dumb component rule

### Smart/container components

Usually page-level:

- load data through facades/services
- own feature state
- handle loading/error/empty/content
- prepare chart inputs and card view models
- pass data to child components

### Dumb/presentational components

Reusable UI pieces:

- receive inputs
- emit outputs
- render data only
- do not fetch data
- do not aggregate dataset logic
- do not contain business rules

---

## 8) Global design system context

The project uses a custom design system defined in:

```text
src/styles/
  tokens.css
  themes.css
  base.css
  components.css
  utilities.css
```

### Core visual direction

The UI should feel:

- clean
- editorial
- soft
- calm
- premium but simple
- data-focused
- modern and minimal

### Visual language

- layered surfaces instead of strong borders
- soft radii
- subtle ambient shadows
- glass effect for floating filter/action areas
- strong KPI typography
- quiet background
- clean charts integrated into cards
- no noisy default styles

### Fonts

- Display/headline font: **IBM Plex Sans**
- Body/UI font: **Inter**

### Tailwind v4 rule

Custom semantic classes like `.ds-btn-primary`, `.ds-card`, etc. must be **self-contained**.

Do **not** use patterns like:

- `@apply ds-btn`
- `@apply ds-card`

Only use `@apply` with native Tailwind utilities.

---

## 9) Design system usage rules

The agent must use the design system as the source of truth.

### Prefer first

Semantic classes from `components.css`, such as:

- `ds-page`
- `ds-shell`
- `ds-section`
- `ds-card`
- `ds-card-elevated`
- `ds-glassbar`
- `ds-display-sm`
- `ds-title-md`
- `ds-body-md`
- `ds-label-md`
- `ds-btn-primary`
- `ds-btn-secondary`
- `ds-btn-outline`
- `ds-btn-tertiary`
- `ds-input`
- `ds-select`
- `ds-search`
- `ds-stat-card`
- `ds-chart-card`
- `ds-state-panel`

### Then

Use utility helpers from `utilities.css`.

### Then

Use Tailwind utilities with design tokens.

### Never

- hardcode random hex colors
- use random Tailwind palette colors
- create ad hoc shadows/radii
- create duplicate styling patterns in feature components

---

## 10) Responsive and RTL requirements

### Responsive

The app must be:

- mobile-first
- tablet-friendly
- desktop-optimized

### Layout rules

- start with mobile layout
- progressively enhance with `md:`, `lg:`, `xl:`
- avoid fixed desktop-only layouts
- chart containers must have explicit heights
- tables/lists should remain usable on smaller screens

### RTL / LTR

The app must work in:

- Arabic (`dir="rtl"`)
- English (`dir="ltr"`)

Components must not assume LTR-only alignment or spacing.

---

## 11) Accessibility requirements

The UI must remain accessible.

### Required

- semantic HTML
- visible focus states
- keyboard-accessible interactive controls
- proper labels for form fields
- readable contrast
- touch-friendly controls
- no clickable `div` where a button is appropriate

---

## 12) Shared state handling rule

Every feature page must support **4 explicit states**:

- loading
- error
- empty
- content

This state handling belongs at the **page/container level**.

### Shared state UI

Use shared components/patterns for:

- loading skeleton
- error state
- empty state

Do not render broken or blank chart sections while data is unavailable.

---

## 13) Shared services and utilities

The app should have a clean separation between data loading, transformation, and rendering.

### Recommended shared/core services

- `education-data.service`
- `filter-state.service` if filters are global
- `storage.service` for persisted language/filter preferences
- chart config helper(s)
- translation direction helper

### Data responsibilities

- load JSON from assets
- expose structured data
- prepare view models in facades
- avoid repeated parsing/aggregation in components

---

## 14) ECharts integration rules

The app uses **Apache ECharts with ngx-echarts**.

### Required setup pattern

- central `echarts.config.ts` in core
- import from `echarts/core`
- register only needed charts/components
- use `provideEchartsCore({ echarts })`
- use shared Angular chart wrapper component
- use feature-specific chart option builders

### Chart styling rules

Charts must use design tokens for:

- series colors
- tooltip surface/background
- text colors
- grid/split line tone

Do not use default loud chart palettes.

---

## 15) Main app routes

The app should include these main routes:

- `/overview`
- `/trends`
- `/regional-analysis`
- `/gender-analysis`

Optional later:

- `/stage-analysis`
- `/about`
- `/methodology`

The default route should redirect to `/overview`.

---

## 16) Main features

## Feature 1 — Overview Dashboard

### Goal

Provide a quick snapshot of the education dataset.

### Main content

- top header / page intro
- filter bar
- KPI cards
- summary charts
- quick highlights/insights

### KPIs

Should include:

- total number of students
- growth rate since the base year
- largest region
- latest year in dataset
- optionally total schools
- optionally total teachers

### Possible overview visuals

- student growth line chart
- gender distribution donut/pie chart
- stage distribution bar/pie chart
- top regions ranking summary

### UI blocks

- page header
- filter bar
- KPI card grid
- summary chart cards
- insight/highlight section

### Done criteria

A user can open the overview page and immediately understand the high-level story of the dataset.

---

## Feature 2 — Trends Analysis

### Goal

Help users explore how student counts changed over time.

### Main content

- yearly student growth line chart
- comparisons across years
- optional yearly bar comparison
- optional trend by stage
- optional trend by region

### Questions it should answer

- what is the growth pattern from 2016 to 2024?
- which years changed the most?
- do some stages grow faster than others?
- how do regions compare over time?

### Expected visuals

- line chart for total student trend
- multi-series line chart for selected regions or genders
- optional area chart for change over time
- optional yoy comparison table/cards

### Done criteria

A user can compare year-by-year growth clearly and identify major trend shifts.

---

## Feature 3 — Regional Analysis

### Goal

Let users compare regions and inspect regional education distribution.

### Main content

- ranked region comparison
- regional chart
- selected region profile
- optional region detail panel
- optional map in future

### Questions it should answer

- which regions have the largest student populations?
- how do regions compare by stage and gender?
- what is the selected region’s breakdown?
- how many schools and teachers exist in a region?

### Expected visuals

- horizontal bar chart for regions
- region profile card/panel
- top/bottom region summary
- optional stage breakdown for selected region
- optional teacher/school summary for region

### Done criteria

A user can choose a region and clearly understand its education profile.

---

## Feature 4 — Gender Analysis

### Goal

Show how male/female distributions differ across time, stage, and region.

### Main content

- gender comparison charts
- distribution by year
- distribution by region
- distribution by stage

### Questions it should answer

- what is the overall gender balance?
- how does it vary by region?
- how does it vary by stage?
- how does it change over time?

### Expected visuals

- donut/pie chart
- grouped bar chart
- stacked bar chart
- optional trend line by gender across years

### Done criteria

A user can compare gender distributions across key dimensions without confusion.

---

## Feature 5 — Stage Analysis (optional but recommended)

### Goal

Explore the distribution of students across education stages.

### Stages

Possible stages include:

- kindergarten
- primary
- middle
- secondary

### Questions it should answer

- which stage has the largest share?
- how do stages vary by year?
- how do stages vary by region?
- what is the gender split inside each stage?

### Expected visuals

- stage distribution chart
- stage trend chart
- stage comparison bar chart
- optional stage-specific KPI cards

---

## 17) Global filtering behavior

The dashboard should support filter-driven exploration.

### Main filters

- year
- region
- stage
- gender

Optional later:

- education office
- metric type
- compare mode

### Filter behavior

- filters should update charts and KPIs consistently
- filter components should be reusable
- if filters are used across multiple pages, manage them in shared/global state
- if filters are page-specific, keep state inside that feature’s facade

### UX expectation

The filter bar should feel lightweight, fast, and obvious.

---

## 18) Shared UI components

The following shared components are expected or strongly recommended:

### Layout / shell

- main layout
- sidebar or top navigation
- top bar
- language toggle
- theme-ready shell structure

### Reusable primitives

- button
- card
- stat card
- chart card
- section header
- select
- search input
- filter bar
- tabs/pills
- icon button
- badge

### States

- loading skeleton
- empty state
- error state

### Charts

- shared ECharts wrapper component

---

## 19) Suggested feature internals

A feature should usually contain:

```text
feature-name/
  pages/
  ui/
  data-access/
  models/
```

### `pages/`

Container page components.

### `ui/`

Presentational feature-specific components.

### `data-access/`

Facades, mappers, chart option builders, feature-specific data shaping.

### `models/`

Feature view models and interfaces.

---

## 20) Example page composition pattern

A typical page should follow this flow:

**Page container**
→ loads data through a facade
→ derives feature state
→ handles loading/error/empty/content
→ passes ready data to shared/feature UI

Example:

- `OverviewPageComponent`
- `OverviewFacade`
- `Overview KPI cards`
- `Growth chart`
- `Gender chart`
- `Insights panel`

---

## 21) Performance expectations

The app does not need backend complexity, but frontend code should still be efficient.

### Required

- avoid unnecessary repeated calculations
- centralize aggregation logic
- reuse transformed data where possible
- use aggregated JSON when helpful
- avoid heavy chart recreation on every tiny state change

### Angular style

- prefer `OnPush`
- prefer signals/computed values where appropriate
- keep components lean

---

## 22) Agent working rules

The agent should work under these constraints:

### Must do

- follow feature-first architecture
- follow design system tokens/classes
- stay Tailwind v4-safe
- support RTL and translation
- keep charts modular
- keep page state explicit
- keep code clean and mentorship-friendly
- create reusable shared components when patterns repeat

### Must not

- put business logic in small UI components
- invent random styling outside the design system
- hardcode chart colors unrelated to tokens
- skip loading/error/empty handling
- create LTR-only layouts
- create one giant dashboard service with everything inside
- use `@apply` with custom semantic classes

---

## 23) Non-goals for now

These are not required in the first iteration unless explicitly requested:

- authentication
- backend API
- SSR
- advanced analytics engine
- PDF export
- map integration
- dark mode
- public API integration
- complex drill-through routing

They can be added later.

---

## 24) Definition of done

The feature work is considered done when:

- the page is visually aligned with the design system
- the page works in Arabic and English
- the page works in RTL and LTR
- the page is mobile-first and responsive
- all 4 states are handled
- data is loaded through clean architecture
- charts use shared ECharts setup
- components are reusable and readable
- code is consistent with the project structure

---

## 25) Short version for the agent

This is an **Angular standalone, feature-first, RTL-aware education data dashboard** using:

- Tailwind CSS v4
- custom design system in `src/styles/`
- Transloco
- ngx-echarts + modular ECharts
- shared reusable UI
- loading/error/empty/content state handling
- JSON datasets in `src/assets/datasets/`

The agent must build clean, reusable, mobile-first features for:

- overview
- trends
- regional analysis
- gender analysis
- optional stage analysis

using the existing design system and architecture rules.

---
