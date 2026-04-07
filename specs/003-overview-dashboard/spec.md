# Feature Specification: Overview Dashboard Page

**Feature Branch**: `003-overview-dashboard`  
**Created**: 2026-03-31  
**Status**: Draft  
**Input**: User description: "Overview Dashboard Page — Executive summary of the dataset with KPI grid, advanced insights & analytics, and dynamic highlights panel"

---

## Background

The foundation (002-app-foundation) is complete. The app shell, `PreferencesService`, `EducationDataService`, `GlobalFilterService`, `LoadingStateComponent`, `EmptyStateComponent`, `ErrorStateComponent`, and the `ViewState<T>` pattern are all in place. The Overview page stub already exists and wires the 4-state pattern end-to-end (Task T028 + T040). This feature replaces that stub with a fully-featured executive summary dashboard.

---

## Clarifications

### Session 2026-03-31
- Q: Growth Rate KPI Baseline: How should it behave if the 2016 baseline year is excluded by a year filter? → A: Always compare the selected year's data against the 2016 baseline, ignoring the year filter for the baseline value.
- Q: Gender Distribution KPI & Filter Interaction: How should the gender widgets behave if filtered to a single gender? → A: Render exactly matching the filtered criteria (showing 0 count and 0% for the excluded gender), keeping the gauge at "Maximum Imbalance".
- Q: Regional Performance Leaderboard Progress Bar Scale: How should the width be calculated? → A: Percentage relative to the top #1 region's count (the top region always has a 100% filled bar).
- Q: Insights & Highlights Selection Logic: How are they chosen? → A: Follow a static priority sequence (e.g., always show 1: Largest Region, 2: Growth Trend, 3: Gender Parity), computing the values dynamically for those specific topics.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — At-a-Glance KPI Summary (Priority: P1)

An analyst opens the Overview page and immediately sees four high-level metrics at the top of the screen: total student count, growth rate since the 2016 baseline, male/female distribution, and the largest (student-count-wise) region. The numbers reflect whatever is selected in the global filter bar (year, region, stage, gender). If all filters are at "All", the KPIs reflect the entire dataset.

**Why this priority**: This is the primary entry point to the application. A visitor should be able to read the headline numbers within 3 seconds without any additional interaction. It is the minimum viable useful state of the page.

**Independent Test**: Navigate to `/overview` with all filters at "All". Four KPI cards are visible. Each displays a clearly labelled numeric value. Change the "Year" filter to a single year — KPI values update immediately without page reload.

**Acceptance Scenarios**:

1. **Given** the application has loaded and all filters are at "All", **When** the user navigates to `/overview`, **Then** four KPI cards are visible — Total Students, Growth Rate, Gender Distribution, and Largest Region — each with a correct, non-zero value derived from the full dataset.
2. **Given** the KPI cards are visible, **When** the user selects a specific academic year in the filter bar, **Then** all four KPI cards update their values to reflect that year only, without any page reload or navigation.
3. **Given** the KPI cards are visible, **When** filtered data yields zero results (e.g. an impossible filter combination), **Then** the page transitions to the empty state and KPI cards are hidden.
4. **Given** the application is in Arabic (RTL) mode, **When** the user views the KPI cards, **Then** all labels and numbers render correctly in RTL direction and Arabic numerals format.

---

### User Story 2 — Advanced Insights & Analytics Panel (Priority: P2)

An analyst wants to understand trends and distribution, not just headline numbers. Below the KPI row they find three visual analytics widgets: a Year-over-Year growth bar chart, a Regional Performance leaderboard (ranked list with mini progress bars), and a Gender Parity Index gauge. All three widgets react to the global filter state.

**Why this priority**: These widgets convert raw numbers into actionable insight patterns. Without them, users cannot identify trends or regional inequalities — they can only see aggregates. This is the core data exploration value of the Overview page.

**Independent Test**: Navigate to `/overview`. Three analytics widgets are visible beneath the KPI row. The bar chart shows bars for each year in the dataset. The leaderboard lists regions in descending order of student count. The gauge displays a numeric parity index. Switching to dark mode updates chart colors immediately without reload.

**Acceptance Scenarios**:

1. **Given** the analytics panel is visible with all filters at "All", **When** the user reviews the bar chart, **Then** each available academic year is represented by a bar whose height corresponds to the year-over-year growth percentage.
2. **Given** the analytics panel is visible, **When** the user reviews the regional leaderboard, **Then** regions are sorted from highest to lowest student count, each row includes the region name, an inline visual bar proportional to its count, and the count value.
3. **Given** the analytics panel is visible, **When** the user reviews the Gender Parity Index, **Then** a gauge or equivalent visualization displays the female-to-male ratio as a decimal value with a qualitative interpretation label (e.g. "Near Parity", "Female Advantage", "Male Advantage").
4. **Given** the user is in dark mode, **When** the analytics panel is visible, **Then** all chart colors and surfaces use the dark-mode design tokens — no chart elements appear unreadable against dark backgrounds.

---

### User Story 3 — Insights & Highlights Panel (Priority: P2)

Next to the analytics panel, a dynamic text-based highlights section surfaces key takeaways derived from the data. Each insight is a bullet point with a category badge (e.g. "Growth", "Demographics", "Regional") and a plain-language sentence that includes specific data values. Insights update as filters change.

**Why this priority**: Raw charts require interpretation. The insights panel reduces the cognitive load of the analyst by surfacing the most notable patterns automatically, making the dashboard suitable for executive audiences who do not interpret charts directly.

**Independent Test**: Navigate to `/overview`. The insights panel on the right displays at least three bullet-point insights, each prefixed with a category badge. The text in each insight includes a specific number or percentage drawn from the dataset. Switching to Arabic updates all insight text to Arabic.

**Acceptance Scenarios**:

1. **Given** the page has loaded with data, **When** the insights panel is visible, **Then** at least three insights are shown, each with a distinct category badge (Growth, Demographics, Regional, or Education Stage) and a sentence containing at least one data value.
2. **Given** the insights are visible in English, **When** the user switches the language to Arabic, **Then** all insight category badges and sentence text switch to Arabic without page reload.
3. **Given** the user changes the active filter (e.g. selects a specific region), **When** the insights panel refreshes, **Then** the insight text reflects the filtered context (e.g. citing the selected region's specific numbers).

---

### User Story 4 — All View States are Handled (Priority: P1)

The Overview page must never show a blank, broken, or partially rendered state. A loading indicator appears during data fetch. An empty state appears if filters yield zero records. An error state appears if data fails to load, with a retry option.

**Why this priority**: Without proper state handling, the page may appear broken, eroding user trust. This is a baseline quality requirement shared by all feature pages.

**Independent Test**: Simulate a network error by blocking the dataset URL — the page shows a readable error state with a retry button. Add an impossible filter combination (e.g. a year for which no data exists) — the page shows an empty state. Restore network access and click retry — the page loads and shows content.

**Acceptance Scenarios**:

1. **Given** the application starts and data has not yet loaded, **When** the user navigates to `/overview`, **Then** a loading indicator is displayed and no KPI or chart content is visible.
2. **Given** data loads successfully, **When** the page transitions from loading to content, **Then** all KPI cards, analytics widgets, and insights are rendered and no loading indicator is visible.
3. **Given** the dataset fetch fails with a network or server error, **When** the user views the overview page, **Then** a readable error state is shown with a descriptive message and a "Retry" button — no blank zones or unhandled exceptions.
4. **Given** the active filter combination yields zero matching records, **When** the page evaluates the result, **Then** an empty state is shown with a translated, informative message and no KPI or chart content is visible.

---

### Edge Cases

- What happens if the 2016 baseline year is explicitly excluded from the global year filter? The Growth Rate KPI must still compute its baseline from the unfiltered 2016 data to provide a consistent comparative metric.
- What happens when the dataset contains only one academic year? The bar chart should render a single bar and YoY growth should show 0% or "N/A".
- What happens when all students belong to one gender (e.g., via the global filter)? The Gender Distribution KPI will show 0 count and 0% for the excluded gender, and the Parity Index gauge will show "Maximum Imbalance" or an equivalent extreme label.
- What happens when there is only one region in the dataset? The leaderboard shows a single row; no error occurs.
- What happens when the page is viewed at a 375px viewport? KPI cards, chart, leaderboard, gauge, and insights panel must all be readable and non-overflowing.
- What happens when insight text is very long in Arabic? The layout must not break; text wraps cleanly.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST display four KPI cards at the top of the content area: Total Students, Growth Rate (vs. 2016 baseline), Gender Distribution (male count/%, female count/%), and Largest Region (by student count).
- **FR-002**: All KPI values MUST be derived from the master dataset, filtered by the user's current active filter selections — no static or hardcoded values are permitted.
- **FR-003**: The page MUST support all four filter dimensions — academic year, region, education stage, and gender — so that all global filter controls are active when the user is on the Overview route.
- **FR-004**: The page MUST display a Year-over-Year growth bar chart showing percentage growth for each available academic year in the filtered dataset.
- **FR-005**: The page MUST display a Regional Performance leaderboard listing regions in descending order of student count, with an inline proportional bar and the count value per row.
- **FR-006**: The page MUST display a Gender Parity Index gauge (or equivalent visualization) showing the female-to-male student ratio as a decimal value with a qualitative label.
- **FR-007**: The page MUST display an Insights & Highlights panel with at least three dynamically generated text insights, each tagged with a category badge (Growth, Demographics, Regional, Education Stage).
- **FR-008**: All insight text and category labels MUST be generated from computed data values — no hardcoded insight sentences.
- **FR-009**: The page MUST explicitly handle all four view states: loading (data fetching in progress), error (fetch failed), empty (filters produce zero results), and content (data ready to display) — using the application's shared state UI components.
- **FR-010**: The error state MUST include a retry action that re-triggers the data fetch.
- **FR-011**: All user-visible text — KPI labels, chart axis labels, leaderboard headers, insight category names, and state messages — MUST use Transloco translation keys. Zero hardcoded English or Arabic strings are permitted.
- **FR-012**: Numeric KPI values (e.g. student counts) MUST be formatted with locale-appropriate number separators (comma in English; appropriate in Arabic).
- **FR-013**: Chart components MUST respond to theme changes (light ↔ dark) immediately without page reload — no chart should require a refresh to update its color scheme.
- **FR-014**: All charts MUST use the application's design-system color palette — no charting library default colors that conflict with the established visual identity.
- **FR-015**: The layout MUST use background color token shifts (e.g. `surface-container-low` vs `surface-container-lowest`) to separate visual areas. No 1px solid borders may be used for card/section separation.
- **FR-016**: The page MUST be mobile-first responsive: at 375px viewport, all content areas stack vertically and remain readable and non-overflowing.
- **FR-017**: The page MUST be RTL-safe: all layouts display correctly in both Arabic (RTL) and English (LTR) directions without left/right CSS assumptions.

### Key Entities *(include if feature involves data)*

- **MasterDataRecord**: A single row from `edu-master.json`. Contains `year`, `region`, `stage`, `gender`, and `student_count` fields used as the primary computation source.
- **OverviewViewModel**: Derived, ready-to-render data structure containing KPI values, chart series, leaderboard rows, parity index, and insight items — produced by the smart container and passed to presentational components.
- **KPI Item**: { label: translation key, value: formatted number or percentage, sublabel?: string, icon?: lucide icon name }
- **YoY Growth Series**: Array of { year: number, growthPercent: number } used to drive the bar chart.
- **Leaderboard Row**: { rank: number, region: string, studentCount: number, barWidthPercent: number } — *Note: barWidthPercent is calculated 0-100% relative to the #1 ranked region's student count.*
- **Parity Index**: { ratio: number, label: translation key (NearParity | FemaleAdvantage | MaleAdvantage | MaxImbalance) }
- **Insight Item**: { category: translation key, categoryVariant: 'growth' | 'demographics' | 'regional' | 'stage', text: translation key with interpolation params }

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four KPI values update within 300 milliseconds of a filter selection change — users perceive the dashboard as instantaneously responsive.
- **SC-002**: The Overview page reaches a content-rendered state within 2 seconds on a standard broadband connection on first visit.
- **SC-003**: The dashboard is fully readable and non-overflowing at all viewport widths from 375px to 1440px.
- **SC-004**: Switching between light and dark mode updates all chart colors and surface backgrounds in under 100 milliseconds — no partial rendering or flicker.
- **SC-005**: Switching the language from English to Arabic (or vice versa) updates all visible text on the Overview page without any page reload.
- **SC-006**: When filters yield zero results, the empty state is displayed within 2 render cycles — users never see a blank or partially-rendered page.
- **SC-007**: The page passes WCAG AA color contrast requirements for all text against its background at both light and dark themes.
- **SC-008**: All interactive elements (retry button, filter dropdowns in the shell) are keyboard-accessible and have visible focus indicators.
- **SC-009**: Zero hardcoded strings remain in any Overview-related template or component — confirmed by a Transloco key presence audit.

---

## Assumptions

- The `EducationDataService.getMaster()` observable returns data in the format described in `specs/002-app-foundation/data-model.md`, with fields `year`, `region`, `stage`, `gender`, and `student_count`.
- The 2016 year is always present in the dataset and serves as the fixed baseline for Growth Rate calculation.
- Gender values in the dataset are exactly two distinct values (e.g. "Male" / "Female" or their Arabic equivalents), making a binary parity index calculation valid.
- ECharts (or the charting library already integrated in the foundation) is used for bar chart and gauge rendering; this feature does not introduce a new chart library.
- The `ROUTE_FILTER_CONFIG` constant in `src/app/core/layout/shell/route-filter-config.ts` (T037) already maps `'overview'` to all four dimensions; this feature confirms and uses that existing configuration.
- The overview page component file at `src/app/features/overview/pages/overview-page.component.ts` already exists as a stub (from T028 + T040); this feature replaces its internals.
- Insights are generated programmatically from data — they are not fetched from an API. The algorithm follows a static priority sequence (e.g., always computing Largest Region, Gender Trend, Stage Distribution) and maps the computed values to pre-defined translation keys with interpolation parameters, avoiding complex anomaly-ranking algorithms for the MVP.
- Mobile layout is "content-first": on narrow screens, KPI cards stack 2-per-row (or 1-per-row on very small screens), followed by analytics widgets stacked vertically, followed by insights panel.
- The Regional leaderboard shows a maximum of 7 regions to avoid excessive scrolling on the overview page; a "View All" mechanism is out of scope for this feature.
