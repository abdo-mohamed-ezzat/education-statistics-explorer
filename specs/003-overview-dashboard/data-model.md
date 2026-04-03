# Data Model: Overview Dashboard Page

**Branch**: `003-overview-dashboard` | **Date**: 2026-03-31  
**Source**: `EducationMasterData` from `edu-master.json`, filtered via `GlobalFilterService`

---

## 1. Input Entity (existing — no changes)

### `EducationMasterData`
*Location*: `src/app/core/models/education-data.model.ts`

| Field | Type | Description |
|-------|------|-------------|
| `year` | `number` | Academic year (e.g. 2016–2024) |
| `region` | `string` | Region name in Arabic |
| `stage` | `string` | Education stage name in Arabic |
| `gender` | `string` | Gender label in Arabic (e.g. "ذكور" / "إناث") |
| `studentCount` | `number` | Count of students for this row |
| `teacherCount` | `number` | Count of teachers (not used by Overview) |
| `schoolCount` | `number` | Count of schools (not used by Overview) |
| `administratorCount` | `number` | Count of administrators (not used by Overview) |

---

## 2. Overview View Model (new — `overview.model.ts`)

*Location*: `src/app/features/overview/models/overview.model.ts`

### `OverviewViewModel`
Top-level view model passed from `OverviewFacade` → `OverviewPage` → child components.

```typescript
export interface OverviewViewModel {
  kpis: KpiGridViewModel;
  yoySeries: YoyGrowthPoint[];
  leaderboard: LeaderboardRow[];
  parityIndex: ParityIndexViewModel;
  insights: InsightItem[];
}
```

---

### `KpiGridViewModel`
Four KPI cards composed into a single object for clarity.

```typescript
export interface KpiGridViewModel {
  totalStudents: KpiCardViewModel;
  growthRate: KpiCardViewModel;
  genderDistribution: GenderKpiViewModel;
  largestRegion: KpiCardViewModel;
}
```

---

### `KpiCardViewModel`
Generic single-value KPI card. Used for Total Students, Growth Rate, Largest Region.

```typescript
export interface KpiCardViewModel {
  labelKey: string;         // Transloco key, e.g. 'overview.kpi.total-students'
  value: string;            // Formatted display value, e.g. '6,850,000' or '+18%'
  sublabelKey?: string;     // Optional Transloco key for sub-label
  sublabelParams?: Record<string, string | number>;  // Transloco interpolation params
  trend?: 'up' | 'down' | 'neutral';  // Optional trend indicator for visual cue
  iconName?: string;        // Lucide icon name, e.g. 'graduation-cap'
}
```

---

### `GenderKpiViewModel`
Split KPI card for gender distribution (two values in one card).

```typescript
export interface GenderKpiViewModel {
  labelKey: string;           // 'overview.kpi.gender-distribution'
  male: GenderSplitItem;
  female: GenderSplitItem;
}

export interface GenderSplitItem {
  labelKey: string;           // 'overview.kpi.male-students' | 'overview.kpi.female-students'
  count: string;              // Formatted count, e.g. '3,530,000'
  percent: string;            // Formatted percent, e.g. '51.5%'
  iconName: string;           // Lucide icon: 'user' for male, 'user' for female (or distinct)
}
```

---

### `YoyGrowthPoint`
One data point for the Year-over-Year bar chart.

```typescript
export interface YoyGrowthPoint {
  year: number;               // Academic year
  growthPercent: number;      // Percentage growth vs previous year (0 for earliest year)
}
```

**Constraint**: The earliest available year always has `growthPercent = 0` (baseline; displayed as "N/A" in tooltip or 0-height bar).

---

### `LeaderboardRow`
One row in the Regional Performance leaderboard.

```typescript
export interface LeaderboardRow {
  rank: number;               // 1-based rank (1 = highest student count)
  region: string;             // Region name
  studentCount: number;       // Raw student count
  formattedCount: string;     // Display value, e.g. '6,50K' or '6,500,000'
  barWidthPercent: number;    // 0–100; relative to rank-1 region's count
}
```

**Constraint**: Maximum 7 rows returned. `barWidthPercent` is always 100 for rank 1.

---

### `ParityIndexViewModel`
Data for the Gender Parity Index gauge.

```typescript
export interface ParityIndexViewModel {
  ratio: number;              // female / male ratio; clamped to [0, 2]
  labelKey: string;           // Transloco key for qualitative label
  // label thresholds:
  // ratio >  1.05  → 'overview.analytics.parity-female'
  // ratio >= 0.95  → 'overview.analytics.parity-near'
  // ratio <  0.95  → 'overview.analytics.parity-male'
  // ratio === 0 or === 2 → 'overview.analytics.parity-max'
}
```

---

### `InsightItem`
One entry in the Insights & Highlights panel.

```typescript
export type InsightCategory = 'growth' | 'demographics' | 'regional' | 'stage';

export interface InsightItem {
  badgeLabelKey: string;      // e.g. 'overview.insights.badge-regional'
  category: InsightCategory;  // drives badge color variant class
  textKey: string;            // Transloco key with interpolation
  textParams: Record<string, string | number>;  // interpolation values
}
```

**Static priority order** (indices 0–4):
| Index | Category | `textKey` |
|-------|----------|-----------|
| 0 | `regional` | `overview.insights.insight-largest-region` |
| 1 | `growth` | `overview.insights.insight-growth-rate` |
| 2 | `demographics` | `overview.insights.insight-female-share` |
| 3 | `stage` | `overview.insights.insight-primary-share` |
| 4 | `growth` | `overview.insights.insight-peak-year` |

---

## 3. Computation Rules Summary

| KPI | Source data | Filter applied |
|-----|-------------|----------------|
| Total Students | `filteredData` | All active filters |
| Growth Rate | `filteredData` vs. unfiltered 2016 baseline | Year filter excluded from baseline |
| Gender Distribution | `filteredData` (split by gender label) | All active filters |
| Largest Region | `filteredData` (grouped by region) | All active filters |
| YoY Series | `filteredData` (grouped by year) | Year filter excluded (show all years) |
| Leaderboard | `filteredData` (top 7 by region) | All active filters |
| Parity Index | `filteredData` (derived from gender split) | All active filters |
| Insights | `filteredData` + `allData` for growth | Mixed (see per-insight logic) |

**Important**: `allData` = full unfiltered master cache. `filteredData` = `allData` with all non-null filter values applied.

**YoY Series specifics**: The year filter is intentionally excluded when computing YoY series to always show all years on the chart — the year filter on KPIs means "show stats for this year" not "hide other bars from the chart". This matches the UX intent of the bar chart.

---

## 4. State Transitions

```
OverviewPage viewState:
  ┌─────────┐
  │ loading │  ← initial state
  └────┬────┘
       │ getMaster() resolves
       ▼
  ┌─────────┐              ┌────────────────────────────┐
  │ content │ ←────────────│ filteredData.length > 0    │
  └─────────┘              └────────────────────────────┘
       │
       │ filteredData.length === 0 (filter eliminates all)
       ▼
  ┌─────────┐
  │  empty  │
  └─────────┘

  ┌─────────┐
  │  error  │  ← getMaster() throws
  └─────────┘
```

**Note**: The `viewState` signal transitions between `content` and `empty` reactively — the `OverviewFacade` uses `computed()` to check `filteredData.length` and emits the appropriate `ViewState<OverviewViewModel>`.
