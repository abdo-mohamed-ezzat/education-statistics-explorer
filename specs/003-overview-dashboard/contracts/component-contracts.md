# Component Contracts: Overview Dashboard Page

**Branch**: `003-overview-dashboard` | **Date**: 2026-03-31  
**Type**: Angular UI component input/output contracts

---

## 1. OverviewFacade

**Location**: `src/app/features/overview/data-access/overview.facade.ts`  
**Type**: Injectable service (singleton for this feature; `providedIn: 'root'` or provided in route)

```typescript
class OverviewFacade {
  // ─── Public API ──────────────────────────────────────────────
  readonly viewState: Signal<ViewState<OverviewViewModel>>;
  // Transitions: loading → content | empty | error
  // 'content' when filteredData.length > 0
  // 'empty' when getMaster() resolves but filteredData.length === 0
  // 'error' when getMaster() throws

  loadData(): void;
  // Triggers a re-subscribe to getMaster() (retry on error)
}
```

**Dependencies**:
- `EducationDataService` — `getMaster()` (cached observable)
- `GlobalFilterService` — `state()` computed signal
- `PreferencesService` — not injected here; theme passed as input to chart components from page

**Internal signals**:
- `allData: Signal<EducationMasterData[]>` — unfiltered full dataset (from `toSignal`)
- `filteredData: Signal<EducationMasterData[]>` — `computed()` over `allData + filterState`
- `viewModel: Signal<OverviewViewModel>` — `computed()` over `filteredData + allData`

---

## 2. OverviewPage (smart container)

**Location**: `src/app/features/overview/pages/overview-page/overview-page.ts`  
**Type**: Smart container — no `@Input()`, no `@Output()`

**Injects**: `OverviewFacade`, `PreferencesService`

**Exposes to template**:
```typescript
protected readonly viewState: Signal<ViewState<OverviewViewModel>>;
protected readonly theme: Signal<'light' | 'dark'>;
protected loadData(): void;
```

---

## 3. KpiCardComponent

**Location**: `src/app/features/overview/ui/kpi-card/kpi-card.component.ts`  
**Selector**: `app-kpi-card`

```typescript
// Inputs
vm = input.required<KpiCardViewModel>();

// No outputs
```

**Rendering contract**:
- Label: `ds-label-sm` class + Transloco pipe for `vm().labelKey`
- Value: `ds-display-md` class (font-display) for `vm().value`
- Sub-label: `ds-caption` class + Transloco pipe for `vm().sublabelKey` with `vm().sublabelParams`
- Icon: `lucide-angular` icon named `vm().iconName` if present
- Trend: an up/down arrow icon when `vm().trend` is 'up'/'down'
- Container: `ds-kpi-card` class

---

## 4. GenderKpiCardComponent

**Location**: `src/app/features/overview/ui/kpi-card/gender-kpi-card.component.ts`  
**Selector**: `app-gender-kpi-card`

```typescript
// Inputs
vm = input.required<GenderKpiViewModel>();

// No outputs
```

**Rendering contract**:
- Label: `ds-label-sm` for `vm().labelKey`
- Two-column split layout (male | female) — uses `grid grid-cols-2`
- Each split: icon + `ds-display-sm` for count + `ds-caption` for percent
- Container: `ds-kpi-card` class

---

## 5. YoyBarChartComponent

**Location**: `src/app/features/overview/ui/yoy-bar-chart/yoy-bar-chart.component.ts`  
**Selector**: `app-yoy-bar-chart`

```typescript
// Inputs
series = input.required<YoyGrowthPoint[]>();
theme  = input.required<'light' | 'dark'>();

// No outputs
```

**ECharts option contract**:
- Chart type: `bar`
- xAxis: year values from `series` (string)
- yAxis: percentage values; suffix `%`
- Series color: `--chart-1` token value
- Bar label: hidden by default; shown in tooltip
- Earliest year bar: 0 height; tooltip shows "Baseline Year"
- Container: `ds-chart-card` class; chart div must have explicit `height: 280px`
- `[theme]="theme()"` bound on `<div echarts>`

---

## 6. RegionalLeaderboardComponent

**Location**: `src/app/features/overview/ui/regional-leaderboard/regional-leaderboard.component.ts`  
**Selector**: `app-regional-leaderboard`

```typescript
// Inputs
rows = input.required<LeaderboardRow[]>();

// No outputs
```

**Rendering contract**:
- Container: `ds-chart-card` class
- Title: Transloco key `overview.analytics.leaderboard-title` (`ds-title-sm`)
- Each row: rank number + region name + inline bar + formatted count
- Inline bar: `height: 4px; border-radius: var(--radius-pill); background: var(--chart-1); width: {{ row.barWidthPercent }}%`
- Rank 1 bar: always 100% width, `--chart-1` color
- Row alternating bg: use `bg-surface-low` on even rows only
- Max 7 rows rendered
- RTL-safe: bar visually fills from the start of the reading direction

---

## 7. ParityGaugeComponent

**Location**: `src/app/features/overview/ui/parity-gauge/parity-gauge.component.ts`  
**Selector**: `app-parity-gauge`

```typescript
// Inputs
vm    = input.required<ParityIndexViewModel>();
theme = input.required<'light' | 'dark'>();

// No outputs
```

**ECharts option contract**:
- Chart type: `gauge`
- Range: 0 to 2 (where 1.0 = perfect parity)
- Value displayed: `vm().ratio.toFixed(2)` centered in gauge
- Below value: Transloco label for `vm().labelKey`
- Color zones:
  - 0 – 0.475 (extreme male): `--chart-4`
  - 0.475 – 0.525 (near parity): `--chart-2` (success/green)
  - 0.525 – 1.0 (female range, near parity): `--chart-2`
  - 1.0 – 2.0 (female advantage): `--chart-3`
- Pointer: none (dial-style, not pointer-style)
- Icons: male + female Lucide icons below the gauge (decorative, `aria-hidden`)
- Container: `ds-chart-card` class; chart div explicit `height: 260px`
- `[theme]="theme()"` bound on `<div echarts>`

---

## 8. InsightsListComponent

**Location**: `src/app/features/overview/ui/insights-list/insights-list.component.ts`  
**Selector**: `app-insights-list`

```typescript
// Inputs
insights = input.required<InsightItem[]>();

// No outputs
```

**Rendering contract**:
- Container: `ds-section` class (distinct from chart cards — uses `surface-low` bg)
- Title: `overview.insights.section-title` (`ds-title-sm`)
- Each insight is a `<li>` (semantic HTML, `<ul>` list)
- Each item: bullet dot + badge + text span
- Badge: `ds-insight-badge ds-insight-badge-{{ insight.category }}` from design system
- Text: Transloco pipe with `insight.textKey` + `insight.textParams`
- RTL-safe: bullet and badge always at the start of the reading direction

---

## 9. overview.utils.ts — Pure Functions Contract

**Location**: `src/app/features/overview/data-access/overview.utils.ts`

```typescript
// Sum all studentCount values
export function sumStudents(data: EducationMasterData[]): number

// Growth rate vs. unfiltered 2016 baseline
export function computeGrowthRate(
  filteredData: EducationMasterData[],
  allData: EducationMasterData[],
  baselineYear: number   // always 2016
): number  // percentage, e.g. 18.3

// YoY series — groups filteredData by year (ignores year filter)
export function computeYoySeries(
  data: EducationMasterData[]
): YoyGrowthPoint[]

// Builds top-N leaderboard rows from filteredData
export function buildLeaderboardRows(
  data: EducationMasterData[],
  maxRows: number  // 7
): LeaderboardRow[]

// Splits student count by gender label
export function splitByGender(
  data: EducationMasterData[]
): { maleCount: number; femaleCount: number }

// Computes parity index from split counts
export function computeParityIndex(
  maleCount: number,
  femaleCount: number
): ParityIndexViewModel

// Builds 5-item static insight list
export function buildInsightItems(
  filteredData: EducationMasterData[],
  allData: EducationMasterData[],
  yoySeries: YoyGrowthPoint[]
): InsightItem[]
```

**Rules**:
- All functions are pure (no side effects, no service injection)
- All accept typed arrays and return typed values
- `buildLeaderboardRows` must sort descending before slicing to top-N
- `computeParityIndex` must clamp ratio to [0, 2] and handle division-by-zero (return `max-imbalance`)

---

## 10. Translation Keys Contract

Both `public/i18n/en.json` and `public/i18n/ar.json` MUST gain the `overview` namespace:

```jsonc
{
  "overview": {
    "page-title": "...",
    "kpi": {
      "total-students": "...",
      "total-students-sub": "...",  // supports {{ startYear }}, {{ endYear }}
      "growth-rate": "...",
      "growth-rate-sub": "...",     // supports {{ baseYear }}
      "gender-distribution": "...",
      "male-students": "...",
      "female-students": "...",
      "largest-region": "...",
      "largest-region-sub": "..."   // supports {{ count }}
    },
    "analytics": {
      "section-title": "...",
      "yoy-title": "...",
      "yoy-subtitle": "...",
      "leaderboard-title": "...",
      "parity-title": "...",
      "parity-near": "...",
      "parity-female": "...",
      "parity-male": "...",
      "parity-max": "..."
    },
    "insights": {
      "section-title": "...",
      "badge-growth": "...",
      "badge-demographics": "...",
      "badge-regional": "...",
      "badge-stage": "...",
      "insight-largest-region": "...",  // supports {{ region }}
      "insight-growth-rate": "...",     // supports {{ direction }}, {{ value }}
      "insight-female-share": "...",    // supports {{ value }}
      "insight-primary-share": "...",   // supports {{ value }}
      "insight-peak-year": "..."        // supports {{ year }}, {{ value }}
    }
  }
}
```
