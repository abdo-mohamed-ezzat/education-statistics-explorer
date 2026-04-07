# Quickstart: Overview Dashboard Page

**Branch**: `003-overview-dashboard` | **Date**: 2026-03-31  
**Purpose**: Step-by-step guide for implementing this feature without circular imports or state issues.

---

## Prerequisites

All of the following are already complete and available:

- `EducationDataService.getMaster()` — cached observable in `core/services/`
- `GlobalFilterService.state()` — computed signal in `core/services/`
- `PreferencesService.theme()` — signal in `core/services/`
- `ViewState<T>` + `ViewStateHelpers` — in `shared/models/view-state.model.ts`
- `LoadingStateComponent`, `EmptyStateComponent`, `ErrorStateComponent` — in `shared/ui/`
- `EducationMasterData` interface — in `core/models/education-data.model.ts`
- ECharts core registered in `core/charts/echarts.config.ts` (needs `GaugeChart` added)
- `ROUTE_FILTER_CONFIG['overview']` already maps all 4 dimensions
- Overview page stub at `features/overview/pages/overview-page/`

---

## Implementation Order (follow strictly to avoid circular imports)

### Step 1 — Register GaugeChart in ECharts config

**File**: `src/app/core/charts/echarts.config.ts`

Add `GaugeChart` to the import from `echarts/charts` and to the `echarts.use([...])` call.

```typescript
import { LineChart, BarChart, PieChart, GaugeChart } from 'echarts/charts';
// ...
echarts.use([LineChart, BarChart, PieChart, GaugeChart, /* ... existing ... */]);
```

**Verify**: App still compiles. No GaugeChart-related runtime errors.

---

### Step 2 — Create the Overview View Model types

**File**: `src/app/features/overview/models/overview.model.ts`

Create all interfaces from `data-model.md`:
- `OverviewViewModel`
- `KpiGridViewModel`
- `KpiCardViewModel`
- `GenderKpiViewModel`
- `GenderSplitItem`
- `YoyGrowthPoint`
- `LeaderboardRow`
- `ParityIndexViewModel`
- `InsightCategory` (union type)
- `InsightItem`

**Verify**: File compiles with no errors. No imports from services (models only import other models).

---

### Step 3 — Create pure utility functions

**File**: `src/app/features/overview/data-access/overview.utils.ts`

Implement all functions from `contracts/component-contracts.md §9`:
- `sumStudents`
- `computeGrowthRate`
- `computeYoySeries`
- `buildLeaderboardRows`
- `splitByGender`
- `computeParityIndex`
- `buildInsightItems`

**Import only**: `EducationMasterData` from core models + overview view model types. No services injected here.

**Verify**: File compiles. Functions are exported, pure, and return strongly typed results.

**Critical math**:
- Growth rate = `((filteredTotal - baseline2016Total) / baseline2016Total) * 100`
- Parity ratio = `femaleCount / maleCount` — handle `maleCount === 0` → ratio = 2 (max imbalance)
- Leaderboard bars: `barWidthPercent = (row.studentCount / rows[0].studentCount) * 100`
- Earliest year in YoY series always gets `growthPercent = 0`

---

### Step 4 — Create OverviewFacade

**File**: `src/app/features/overview/data-access/overview.facade.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class OverviewFacade {
  private readonly dataService = inject(EducationDataService);
  private readonly filterService = inject(GlobalFilterService);

  // Unfiltered full dataset — toSignal handles the async loading
  private readonly allData = toSignal(this.dataService.getMaster(), {
    initialValue: null
  });

  // Loading/error state from the raw observable
  private readonly loadState = ...;  // track loading/error separately

  // Filtered data — computed from allData + filterState
  private readonly filteredData = computed(() => {
    const data = this.allData();
    if (!data) return [];
    const filters = this.filterService.state();
    return data.filter(row => {
      if (filters.year !== null && row.year !== filters.year) return false;
      if (filters.region !== null && row.region !== filters.region) return false;
      if (filters.stage !== null && row.stage !== filters.stage) return false;
      if (filters.gender !== null && row.gender !== filters.gender) return false;
      return true;
    });
  });

  // Full computed view state
  readonly viewState: Signal<ViewState<OverviewViewModel>> = computed(() => {
    // If still loading → loading
    // If error → error
    // If filteredData empty → empty
    // Else → content(buildViewModel(filteredData, allData))
  });

  loadData(): void { /* retrigger if error */ }
}
```

**Verify**: `viewState` signal is reactive to filter changes. Changing a filter re-triggers the `computed()`.

---

### Step 5 — Add translation keys

**Files**: `public/i18n/en.json` and `public/i18n/ar.json`

Add the full `overview` namespace from `contracts/component-contracts.md §10`.

**English values** (reference): see `plan.md §Phase 1 › Translation Key Namespace`.  
**Arabic values**: translate all keys accurately.

**Verify**: No Transloco warning about missing keys in the console after adding.

---

### Step 6 — Add design system classes

**File**: `src/styles/components.css`

Add the `.ds-insight-badge` base class and the four variant classes:
```css
.ds-insight-badge { ... }
.ds-insight-badge-growth { ... }
.ds-insight-badge-demographics { ... }
.ds-insight-badge-regional { ... }
.ds-insight-badge-stage { ... }
```

See `plan.md §Phase 1 › Design System Extension` for exact CSS.

**Verify**: Classes are visible and styled correctly in both light and dark themes.

---

### Step 7 — Build presentational components (can be done in parallel)

Each component lives in `src/app/features/overview/ui/`.

#### 7a. KpiCardComponent
- Selector: `app-kpi-card`
- Input: `vm = input.required<KpiCardViewModel>()`
- Template: `ds-kpi-card` container; `ds-label-sm` for label; `ds-display-md` for value
- CSS file empty (all styling from DS classes)

#### 7b. GenderKpiCardComponent
- Selector: `app-gender-kpi-card`
- Input: `vm = input.required<GenderKpiViewModel>()`
- Template: `ds-kpi-card` container; `grid grid-cols-2` split for male/female

#### 7c. YoyBarChartComponent
- Selector: `app-yoy-bar-chart`
- Inputs: `series = input.required<YoyGrowthPoint[]>()`, `theme = input.required<'light' | 'dark'>()`
- Template: `ds-chart-card` wrapper; `<div echarts [options]="chartOptions()" [theme]="theme()" style="height:280px">`
- `chartOptions = computed(() => buildBarChartOptions(series(), theme()))`
- Helper `buildBarChartOptions` function — either inline or in a separate `yoy-chart.builder.ts` file in `data-access/`

#### 7d. RegionalLeaderboardComponent
- Selector: `app-regional-leaderboard`
- Input: `rows = input.required<LeaderboardRow[]>()`
- Template: `ds-chart-card` wrapper; `@for` over rows; inline bar via `[style.width]="row.barWidthPercent + '%'"`

#### 7e. ParityGaugeComponent
- Selector: `app-parity-gauge`
- Inputs: `vm = input.required<ParityIndexViewModel>()`, `theme = input.required<'light' | 'dark'>()`
- Template: `ds-chart-card` wrapper; `<div echarts [options]="gaugeOptions()" [theme]="theme()" style="height:260px">`

#### 7f. InsightsListComponent
- Selector: `app-insights-list`
- Input: `insights = input.required<InsightItem[]>()`
- Template: `ds-section` container; `<ul>` with `<li>` per insight; badge + Transloco text

**Verify each component**: Renders correctly with mock data. No hardcoded strings. Correct DS classes used.

---

### Step 8 — Refactor OverviewPage

**File**: `src/app/features/overview/pages/overview-page/overview-page.ts`

Replace stub implementation:
1. Inject `OverviewFacade` and `PreferencesService`
2. Expose `viewState = this.facade.viewState`
3. Expose `theme = this.prefsService.theme`
4. Expose `loadData()` (delegates to facade)
5. Import all 6 presentational components

**File**: `src/app/features/overview/pages/overview-page/overview-page.html`

Full layout:
```html
<div class="ds-stack-6 h-full">
  @switch (viewState().status) {
    @case ('loading') { <app-loading-state /> }
    @case ('error') { <app-error-state [error]="..." (retry)="loadData()" /> }
    @case ('empty') { <app-empty-state /> }
    @case ('content') {
      <!-- KPI Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <app-kpi-card [vm]="viewState().data.kpis.totalStudents" />
        <app-kpi-card [vm]="viewState().data.kpis.growthRate" />
        <app-gender-kpi-card [vm]="viewState().data.kpis.genderDistribution" />
        <app-kpi-card [vm]="viewState().data.kpis.largestRegion" />
      </div>

      <!-- Analytics + Insights row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Analytics: spans 2 of 3 cols on lg -->
        <div class="ds-section lg:col-span-2 ds-stack-4">
          <h2 class="ds-title-md text-main">{{ 'overview.analytics.section-title' | transloco }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <app-yoy-bar-chart [series]="..." [theme]="theme()" />
            <app-regional-leaderboard [rows]="..." />
            <app-parity-gauge [vm]="..." [theme]="theme()" />
          </div>
        </div>
        <!-- Insights -->
        <app-insights-list [insights]="..." />
      </div>
    }
  }
</div>
```

**Verify**: Page renders full layout. Filter changes update all KPIs and charts. Theme toggle updates charts immediately. Language toggle updates all text. Empty/error states shown correctly.

---

### Step 9 — Polish

#### RTL audit
- Switch language to Arabic
- Verify KPI grid layout mirrors correctly
- Verify leaderboard bars start from the reading-direction start
- Verify insight badges and bullets align correctly

#### Mobile audit (375px DevTools)
- KPI cards: 1-per-row on xs, 2-per-row on sm
- Analytics panel stacks vertically
- Insights panel below analytics
- No horizontal overflow

#### Accessibility check
- All `<img>`/icon elements: `aria-hidden="true"` for decorative icons
- KPI values: `aria-label` with full plain-language description if number is abbreviated
- Retry button: accessible label via Transloco key
- Chart containers: `role="img"` with `aria-label` for the chart title

#### Transloco key audit
```bash
grep -r "\"[A-Za-z]" src/app/features/overview/ --include="*.html"
```
Any result is a hardcoded string violation.

---

## Checkpoint Gates

| Gate | Verification |
|------|-------------|
| 1. ECharts + GaugeChart | App compiles; no missing chart type error |
| 2. Models compile | `overview.model.ts` has zero TS errors |
| 3. Utils compile | `overview.utils.ts` has zero TS errors; all functions exported |
| 4. Facade reactive | Changing filter in browser → `viewState` signal updates |
| 5. Components render | Each component renders with mock input in isolation |
| 6. Full page layout | Overview page shows all 4 sections in content state |
| 7. Theme reacts | Toggle dark mode → bar chart + gauge change colors immediately |
| 8. Language reacts | Toggle Arabic → all text updates without reload |
| 9. Mobile layout | 375px viewport — no overflow, correct stacking |
| 10. RTL layout | Arabic direction — all layouts mirror correctly |
| 11. Empty state | Impossible filter combination shows EmptyStateComponent |
| 12. Error state | Blocked network → ErrorStateComponent with retry |
| 13. Zero hardcoded strings | grep finds no quotes in .html files |
