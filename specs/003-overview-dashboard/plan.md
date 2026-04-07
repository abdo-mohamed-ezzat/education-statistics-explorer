# Implementation Plan: Overview Dashboard Page

**Branch**: `003-overview-dashboard` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-overview-dashboard/spec.md`

---

## Summary

Build the full Overview Dashboard page, replacing the existing stub (`OverviewPage`) with a production-grade executive summary screen. The smart container will compute an `OverviewViewModel` from the master dataset filtered by `GlobalFilterService.state()`, then pass it to five focused presentational components: a KPI card grid, a YoY growth bar chart, a regional leaderboard, a gender parity gauge, and a dynamic insights list. All chart components react to theme changes via `PreferencesService.theme()` input. The Overview page serves as the reference implementation for all future feature pages.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: Angular (standalone, signals, OnPush), ngx-echarts + Apache ECharts (modular; `BarChart`, `GaugeChart` added via `echarts.config.ts`), Transloco (runtime i18n), Lucide Angular (icons)  
**Storage**: N/A — read-only JSON via `EducationDataService.getMaster()` (cached `shareReplay(1)`)  
**Testing**: Not in scope for this feature  
**Target Platform**: Browser (SPA)  
**Performance Goals**: KPI recomputation < 300ms on filter change; initial content render < 2s  
**Constraints**: `GaugeChart` must be added to `echarts.config.ts`; no new npm packages; `@apply` only with native Tailwind utilities; zero hardcoded color values; RTL-safe layout  
**Scale/Scope**: 1 page, 5 presentational components, 1 facade, 1 mapper/utility

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| **I. Feature-First Architecture** | All new files reside in `features/overview/{pages,ui,data-access,models}/`. No logic in shared/ | ✅ PASS |
| **II. Design System Supremacy** | KPI uses `ds-kpi-card`, analytics section uses `ds-section`, chart cards use `ds-chart-card`. `--chart-1..N` tokens for series. `@apply` only with Tailwind utilities. No hardcoded hex. | ✅ PASS |
| **III. Clean Data Flow** | `OverviewFacade` owns all aggregation. `OverviewPage` passes `OverviewViewModel` to dumb components. Templates contain zero business logic. | ✅ PASS |
| **IV. RTL-Safe, Mobile-First** | KPI grid uses `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`. Analytics panel stacks vertically on mobile. All layout uses logical properties or neutral flex/grid. | ✅ PASS |
| **V. Explicit Page States** | `@switch (viewState().status)` drives all 4 states. State components are from `shared/ui`. | ✅ PASS |

**Complexity Tracking**: No violations. No deviations from constitution.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-overview-dashboard/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
└── tasks.md             ← Phase 2 output (via /speckit-tasks)
```

### Source Code

```text
src/
├── app/
│   ├── core/
│   │   └── charts/
│   │       └── echarts.config.ts       [MODIFY] add GaugeChart registration
│   │
│   ├── features/
│   │   └── overview/
│   │       ├── models/
│   │       │   └── overview.model.ts   [NEW] OverviewViewModel + sub-types
│   │       ├── data-access/
│   │       │   ├── overview.facade.ts  [NEW] Reactive computed OverviewViewModel
│   │       │   └── overview.utils.ts   [NEW] Pure aggregation/math helpers
│   │       ├── ui/
│   │       │   ├── kpi-card/           [NEW] KpiCardComponent (dumb)
│   │       │   ├── yoy-bar-chart/      [NEW] YoyBarChartComponent (dumb, ECharts)
│   │       │   ├── regional-leaderboard/  [NEW] RegionalLeaderboardComponent (dumb)
│   │       │   ├── parity-gauge/       [NEW] ParityGaugeComponent (dumb, ECharts)
│   │       │   └── insights-list/      [NEW] InsightsListComponent (dumb)
│   │       └── pages/
│   │           └── overview-page/
│   │               ├── overview-page.ts   [MODIFY] inject facade; pass VM to children
│   │               └── overview-page.html [MODIFY] full dashboard layout
│   │
│   └── shared/
│       └── (no changes — shared components unchanged)
│
├── styles/
│   └── components.css  [MODIFY] add .ds-insight-badge-* semantic classes
│
└── public/
    └── i18n/
        ├── en.json     [MODIFY] add overview.* keys
        └── ar.json     [MODIFY] add overview.* keys
```

---

## Phase 0: Research

*Findings consolidated from codebase scan. No external unknowns.*

### Decision Log

| Decision | Rationale | Alternatives Rejected |
|----------|-----------|----------------------|
| **`OverviewFacade` holds all `computed()` signals** | Keeps `OverviewPage` thin; facade is fully testable in isolation; aligns with constitution Principle III | Inline `computed()` in page — violates clean data flow |
| **`overview.utils.ts` for pure math** | Functions like `computeYoYGrowth`, `computeParityIndex`, `buildLeaderboard` are pure and reusable. No class overhead needed | Static class — unnecessary for pure functions |
| **`GaugeChart` added to `echarts.config.ts`** | ECharts is already configured centrally; adding gauge at the module level keeps tree-shaking intact | Per-component dynamic import — violates constitution's centralization rule |
| **Insight selection: static priority sequence** | Clarified in Q4 of speckit-clarify session. Reduces complexity for MVP | Dynamic anomaly ranking — deferred |
| **Leaderboard bar width: relative to #1 region** | Clarified in Q3. Creates clear visual anchor | Relative to total — less intuitive |
| **Growth Rate: always uses unfiltered 2016 baseline** | Clarified in Q1. Provides a stable, consistent comparative KPI | Earliest year in filter — inconsistent behavior |
| **Gender filter → Gender KPI shows partial data** | Clarified in Q2. Pure data fidelity; gauge shows MaxImbalance when one gender is zero | Hide widgets — hides information from user |
| **`ngx-echarts` with `[options]` binding + `theme` input** | Already used in project. `theme` input is a string (`'light'` or `'dark'`); bound to `PreferencesService.theme()` | Manual ECharts instance management — bypasses ngx-echarts API |

---

## Phase 1: Design & Contracts

### Architecture Flow

```
OverviewPage (smart/container)
  │
  ├── injects: OverviewFacade
  │   └── injects: EducationDataService, GlobalFilterService, PreferencesService
  │       └── computed(): OverviewViewModel
  │
  └── template @switch (viewState().status)
       └── @case('content')
            ├── <app-kpi-card> × 4       (receives: KpiCardViewModel)
            ├── <app-yoy-bar-chart>       (receives: YoyGrowthSeries[], theme)
            ├── <app-regional-leaderboard>(receives: LeaderboardRow[])
            ├── <app-parity-gauge>        (receives: ParityIndexViewModel, theme)
            └── <app-insights-list>       (receives: InsightItem[])
```

### Data Computation Logic

#### Total Students KPI
```
sum(filteredData, row => row.studentCount)
```

#### Growth Rate KPI
```
baselineTotal = sum(allData.filter(r => r.year === 2016), r => r.studentCount)
currentTotal  = sum(filteredData, r => r.studentCount)
growthRate    = ((currentTotal - baselineTotal) / baselineTotal) * 100
```
*Note: `allData` is the unfiltered full dataset. `filteredData` applies all current global filter selections.*

#### Largest Region KPI
```
group filteredData by region → sum studentCount per group → argmax by studentCount
```

#### Gender Distribution KPI
```
maleTotal   = sum(filteredData.filter(r => r.gender === 'ذكور' || 'male'), r => r.studentCount)
femaleTotal = sum(filteredData.filter(r => r.gender === 'إناث' || 'female'), r => r.studentCount)
malePercent   = (maleTotal / total) * 100
femalePercent = (femaleTotal / total) * 100
```

#### YoY Growth Series
```
group allYearsData by year → sort years ascending
for each consecutive pair (prevYear, currYear):
  growth[currYear] = ((totalByYear[currYear] - totalByYear[prevYear]) / totalByYear[prevYear]) * 100
```
*Uses filteredData grouped by year (excluding the year filter dimension if set).*

#### Regional Leaderboard
```
group filteredData by region → sort desc by studentCount → take top 7
maxCount = leaderboard[0].studentCount
each row: barWidthPercent = (row.studentCount / maxCount) * 100
```

#### Gender Parity Index (GPI)
```
ratio = femaleTotal / maleTotal   (clamped between 0 and 2)
label = ratio > 1.05 ? 'female-advantage'
      : ratio < 0.95 ? 'male-advantage'
      : ratio === 0 || ratio === Infinity ? 'max-imbalance'
      : 'near-parity'
```

#### Insights (static priority sequence)
1. **Regional** — "Largest region [X] accounts for [Y%] of total students"
2. **Growth** — "Student enrollment grew [+X%] compared to 2016 baseline"
3. **Demographics** — "Female students account for [X%] of the enrolled population"
4. **Education Stage** — "Primary education accounts for [X%] of all students"
5. (if 5th slot available): **Growth** — "Year [X] recorded the highest YoY growth at [Y%]"

### Translation Key Namespace: `overview.*`

New keys required (both `en.json` and `ar.json`):

```json
{
  "overview": {
    "page-title": "Overview",
    "kpi": {
      "total-students": "Total Students",
      "total-students-sub": "{{ startYear }} – {{ endYear }} | All Years",
      "growth-rate": "Growth Rate",
      "growth-rate-sub": "since {{ baseYear }}",
      "gender-distribution": "Gender Distribution",
      "male-students": "Male Students",
      "female-students": "Female Students",
      "largest-region": "Largest Region",
      "largest-region-sub": "{{ count }} students"
    },
    "analytics": {
      "section-title": "Advanced Insights & Analytics",
      "yoy-title": "Year-over-Year Growth Comparison",
      "yoy-subtitle": "% growth by year",
      "leaderboard-title": "Regional Performance Leaderboard",
      "parity-title": "Gender Parity Index",
      "parity-near": "Near Parity",
      "parity-female": "Female Advantage",
      "parity-male": "Male Advantage",
      "parity-max": "Maximum Imbalance"
    },
    "insights": {
      "section-title": "Insights & Highlights",
      "badge-growth": "Growth",
      "badge-demographics": "Demographics",
      "badge-regional": "Regional",
      "badge-stage": "Education Stage",
      "insight-largest-region": "{{ region }} region recorded the highest student population.",
      "insight-growth-rate": "Student enrollment {{ direction }} by {{ value }}% compared to 2016.",
      "insight-female-share": "Female student enrollment accounts for {{ value }}% of all students.",
      "insight-primary-share": "Primary education accounts for {{ value }}% of all students.",
      "insight-peak-year": "Year {{ year }} recorded the highest YoY growth at {{ value }}%."
    }
  }
}
```

### ECharts Registration Change

`src/app/core/charts/echarts.config.ts` must import and register `GaugeChart` from `echarts/charts` alongside the existing registrations:

```typescript
import { LineChart, BarChart, PieChart, GaugeChart } from 'echarts/charts';
// ... existing uses array gains GaugeChart
```

### Design System Extension

One new reusable semantic class block in `components.css` — insight badge variants:

```css
.ds-insight-badge {
  @apply inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold;
  border-radius: var(--radius-pill);
}
.ds-insight-badge-growth      { background-color: var(--color-success-soft); color: var(--color-success); }
.ds-insight-badge-demographics{ background-color: var(--color-info-soft); color: var(--color-info); }
.ds-insight-badge-regional    { background-color: var(--color-primary-soft); color: var(--color-primary); }
.ds-insight-badge-stage       { background-color: var(--color-secondary-soft); color: var(--color-secondary); }
```

---

## Implementation Phases (for task generation)

### Phase A — Foundation prep (no UI yet)

1. Add `GaugeChart` to `echarts.config.ts`
2. Create `overview.model.ts` (all view model types)
3. Create `overview.utils.ts` (pure math functions)
4. Create `OverviewFacade` (`overview.facade.ts`) with `computed()` OverviewViewModel
5. Add `overview.*` keys to both `en.json` and `ar.json`
6. Add `.ds-insight-badge*` classes to `components.css`

### Phase B — Presentational components (dumb, all parallel)

7. `KpiCardComponent` — generic KPI card rendering `KpiCardViewModel`
8. `YoyBarChartComponent` — ECharts bar chart with theme input
9. `RegionalLeaderboardComponent` — ranked list with inline bars
10. `ParityGaugeComponent` — ECharts gauge with theme input
11. `InsightsListComponent` — category-badged text list

### Phase C — Smart container wiring

12. Refactor `OverviewPage` to inject `OverviewFacade`; pass VM to components
13. Rewrite `overview-page.html` with full dashboard layout

### Phase D — Polish

14. RTL audit + mobile layout verification (375px)
15. Transloco key presence audit (zero hardcoded strings)
16. Accessibility check (WCAG AA contrast, keyboard access, aria labels)
