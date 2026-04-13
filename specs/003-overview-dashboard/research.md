# Research: Overview Dashboard Page

**Branch**: `003-overview-dashboard` | **Date**: 2026-03-31  
**Purpose**: Resolve all unknowns before design and task generation. No external research needed — all decisions derive from the existing codebase.

---

## Finding 1: ECharts — GaugeChart Registration

**Decision**: Import `GaugeChart` from `echarts/charts` and add it to the `echarts.use([...])` call in `src/app/core/charts/echarts.config.ts`.

**Rationale**: The constitution mandates centralised ECharts registration in `echarts.config.ts`. The current config registers `LineChart`, `BarChart`, and `PieChart` — the gauge is missing for the Parity Index widget.

**Alternatives considered**: Per-component dynamic import — rejected because it bypasses the centralized module registration and may cause tree-shaking inconsistencies.

---

## Finding 2: Facade Pattern for OverviewViewModel

**Decision**: Create `src/app/features/overview/data-access/overview.facade.ts` as an injectable singleton that exposes a single `viewModel: Signal<ViewState<OverviewViewModel>>` derived via `computed()` from `EducationDataService.getMaster()` + `GlobalFilterService.state()`.

**Rationale**: Constitution Principle III: business logic must not live in templates or presentational components. The page component must remain thin — inject facade, render whatever it receives. The facade encapsulates all aggregation.

**Alternatives considered**: Inline `computed()` in `OverviewPage` — rejected; would turn the page into a 200-line god component.

---

## Finding 3: Pure Utility Functions for Aggregations

**Decision**: Create `src/app/features/overview/data-access/overview.utils.ts` with pure, exported functions: `sumStudents`, `computeGrowthRate`, `computeYoYSeries`, `buildLeaderboardRows`, `computeParityIndex`, `buildInsightItems`.

**Rationale**: Pure functions are the easiest to reason about and the easiest to test. Each formula (Growth Rate, GPI, YoY series) has its own distinct computation with different subset requirements.

**Alternatives considered**: Methods on the facade class — workable but harder to isolate; pure functions are preferred per mentorship code quality standards.

---

## Finding 4: Growth Rate Baseline Computation

**Decision**: The facade stores `allData: Signal<EducationMasterData[]>` — the unfiltered full dataset — separately from `filteredData`. The 2016 baseline is always derived from `allData.filter(r => r.year === 2016)`, regardless of any active year filter.

**Rationale**: Clarified in Q1 of `/speckit-clarify` session. All other KPIs are computed from `filteredData`.

**Key implementation note**: The facade subscribes to `getMaster()` once via `toSignal()` — the `allData` signal holds the full blob. `filteredData` is a `computed()` over `allData` + `filterService.state()`.

---

## Finding 5: Gender Parity Index — Filter Transparency

**Decision**: The GPI and Gender Distribution KPI always reflect the current `filteredData`. If the gender filter is set to "Male", the female count will be 0 (0%), the parity ratio will be `0 / total → 0` (or `total / 0 → Infinity`), and both edge cases map to the `max-imbalance` label.

**Rationale**: Clarified in Q2 — pure data fidelity is preferred over hiding or ignoring filters.

---

## Finding 6: Leaderboard Bar Width Calculation

**Decision**: `barWidthPercent = (row.studentCount / topRegionStudentCount) * 100`. The top-ranked region always renders at 100% width.

**Rationale**: Clarified in Q3 — creates a natural visual anchor; trailing bars show their relative size.

---

## Finding 7: Insight Generation — Static Priority Sequence

**Decision**: Five insights in a fixed priority order (Regional → Growth → Demographics → Education Stage → Peak Year). Each insight is a translation key with interpolated data values. All five are always shown when data is available.

**Rationale**: Clarified in Q4 — static sequence reduces complexity for MVP and keeps insight text deterministic and testable.

---

## Finding 8: ngx-echarts Theme API

**Decision**: `YoyBarChartComponent` and `ParityGaugeComponent` accept a `theme: InputSignal<'light' | 'dark'>`. They pass this to ngx-echarts via `[theme]` binding on `<div echarts>`. ECharts built-in "dark" theme is used for the dark TH case; the light theme uses the default (null or 'light').

**Rationale**: ngx-echarts `[theme]` input accepts a string theme name registered with echarts or the built-in `'dark'`. Binding `PreferencesService.theme()` to this input means theme changes cause ECharts to re-render with the correct colors immediately.

**Key note**: Chart series colors will still prefer `--chart-1..N` tokens via the ECharts `option.color` array, overriding theme defaults for series colors. The theme primarily controls background, text, axis, and tooltip styling.

---

## Finding 9: `EducationMasterData.studentCount` (not `student_count`)

**Decision**: The TypeScript interface uses camelCase `studentCount` (confirmed in `education-data.model.ts`). The spec's Key Entities section used `student_count` (snake_case from the underlying JSON field). All code will use `studentCount` matching the TypeScript model.

**Alternatives**: Spec mentions `student_count` — this was the raw JSON field name, not the typed property name. No change needed to the model.

---

## Finding 10: Overview Feature Folder Structure Gap

**Decision**: The feature folder currently has `components/` and `data/` (both empty) and `pages/`. Per the constitution's mandated structure, these must be renamed/established as `ui/` and `data-access/`. New components go into `ui/`, the facade and utils go into `data-access/`.

**Note**: The empty `components/` and `data/` folders currently exist. New files will be placed in the canonical paths; the old empty folders can remain (harmless) or be ignored.
