# Tasks: Overview Dashboard Page

**Input**: Design documents from `/specs/003-overview-dashboard/`
**Prerequisites**: plan.md ✓ | spec.md ✓ | research.md ✓ | data-model.md ✓ | contracts/ ✓ | quickstart.md ✓

**Organization**: Tasks grouped by user story for independent implementation and testing.
**Tests**: Not included (not requested in spec).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US#]**: User story this task belongs to

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prerequisite changes to shared infrastructure that every user story depends on. No Angular components yet — this unblocks all downstream work.

- [X] T001 Add `GaugeChart` import from `echarts/charts` and register it in the `echarts.use([...])` call in `src/app/core/charts/echarts.config.ts` (research Finding 1)
- [X] T002 [P] Add `.ds-insight-badge` base class and four variant classes (`.ds-insight-badge-growth`, `.ds-insight-badge-demographics`, `.ds-insight-badge-regional`, `.ds-insight-badge-stage`) to `src/styles/components.css` — use `--color-success-soft/success`, `--color-info-soft/info`, `--color-primary-soft/primary`, `--color-secondary-soft/secondary` respectively (plan.md §Phase 1 › Design System Extension)
- [X] T003 [P] Add full `overview.*` namespace to `public/i18n/en.json` — keys: `overview.page-title`, `overview.kpi.*` (8 keys), `overview.analytics.*` (9 keys), `overview.insights.*` (10 keys) — see `contracts/component-contracts.md §10` for exact key list with English values
- [X] T004 [P] Add full `overview.*` namespace to `public/i18n/ar.json` — same key structure as T003 but with accurate Arabic translations for all 28 keys

**Checkpoint**: App still compiles. ECharts renders without errors. Design system badge classes styled correctly in both themes. No Transloco key-missing warnings for `overview.*` in console.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models and pure utility functions that MUST be complete before any component or facade can be built.

⚠️ **CRITICAL**: No user story UI work can begin until this phase is complete.

- [X] T005 [P] Create `src/app/features/overview/models/overview.model.ts` — export all view model interfaces: `OverviewViewModel`, `KpiGridViewModel`, `KpiCardViewModel`, `GenderKpiViewModel`, `GenderSplitItem`, `YoyGrowthPoint`, `LeaderboardRow`, `ParityIndexViewModel`, `InsightCategory` union type, `InsightItem` — exact field definitions from `data-model.md §2`
- [X] T006 [P] Create `src/app/features/overview/data-access/overview.utils.ts` — implement and export all pure functions: `sumStudents`, `computeGrowthRate`, `computeYoySeries`, `buildLeaderboardRows`, `splitByGender`, `computeParityIndex`, `buildInsightItems` — function signatures and computation rules from `contracts/component-contracts.md §9` and `plan.md §Phase 1 › Data Computation Logic`; handle division-by-zero in `computeParityIndex` (ratio = 2 → `max-imbalance`); clamp parity ratio to [0, 2]; `buildLeaderboardRows` max 7 rows sorted descending; earliest year in YoY series gets `growthPercent = 0`

**Checkpoint**: Both files compile with zero TypeScript errors. All functions are exported. No service injection in utils. Data model interfaces match the field names in `EducationMasterData` (`studentCount`, not `student_count`).

---

## Phase 3: User Story 4 — All View States are Handled (Priority: P1) 🎯 MVP Prerequisite

**Goal**: The `OverviewFacade` is the single source of truth for the page's `ViewState<OverviewViewModel>`. It reacts to filter changes, handles the error and empty cases correctly, and exposes a `loadData()` retry hook. This is the prerequisite for US1, because US1's KPI card rendering requires the facade to exist.

**Independent Test**: Inject `OverviewFacade` in browser dev tools or via a test harness. Verify: initial signal is `loading`; after data resolves, signal transitions to `content` with a non-null `OverviewViewModel`. Apply a filter that zeroes results → signal transitions to `empty`. Verify KPI data values align with manual calculation from the raw dataset.

### Implementation for User Story 4 (View State Infrastructure)

- [X] T007 [US4] Create `src/app/features/overview/data-access/overview.facade.ts` — injectable (`providedIn: 'root'`); inject `EducationDataService`, `GlobalFilterService`; use `toSignal(getMaster(), { initialValue: null })` for `allData`; use a writable `signal<'loading' | 'error' | 'error-message'>` for error tracking; `filteredData = computed()` over `allData + filterState` applying all 4 filter dimensions (year, region, stage, gender); `viewState: Signal<ViewState<OverviewViewModel>> = computed()` that returns `ViewStateHelpers.loading()` while `allData()` is null, `ViewStateHelpers.error(message)` if load failed, `ViewStateHelpers.empty()` if `filteredData().length === 0`, otherwise `ViewStateHelpers.content(buildViewModel(filteredData(), allData()))` where `buildViewModel` calls all util functions from T006 — implement `buildViewModel` as a private method on the facade (depends on T005, T006)
- [X] T008 [US4] Refactor `src/app/features/overview/pages/overview-page/overview-page.ts` — replace current stub implementation: remove manual `subscribe` + `ngOnInit` pattern; inject `OverviewFacade` and `PreferencesService`; expose `protected readonly viewState = this.facade.viewState`, `protected readonly theme = this.prefsService.theme`, `protected loadData() { this.facade.loadData(); }`; import all 6 presentational component classes (to be created in later phases — add as forward references or create stub imports); remove `EducationDataService` and `GlobalFilterService` direct injections (depends on T007)

**Checkpoint**: App compiles. Navigating to `/overview` shows loading then content. Filter changes in the shell cause the computed viewState to update — verify by logging `viewState()` in browser console. `viewState` transitions to `empty` on impossible filter combination.

---

## Phase 4: User Story 1 — At-a-Glance KPI Summary (Priority: P1) 🎯 MVP

**Goal**: Four KPI cards render at the top of the Overview page. Total Students, Growth Rate, Gender Distribution, and Largest Region are each shown with their computed value, correctly reflecting the active filter state. The 2016 baseline for Growth Rate always uses unfiltered data.

**Independent Test**: Navigate to `/overview` with all filters at "All". Four KPI cards are visible with non-zero values. Apply Year = 2020 filter — all four KPI values update without page reload. Verify Growth Rate uses the 2016 baseline regardless of year filter by calculating expected value manually. Verify Gender Distribution matches the active gender filter (if gender = "Male" selected, female count = 0).

### Implementation for User Story 1

- [X] T009 [P] [US1] Create `src/app/features/overview/ui/kpi-card/kpi-card.component.ts` and `kpi-card.component.html` — selector `app-kpi-card`; input `vm = input.required<KpiCardViewModel>()`; `ChangeDetectionStrategy.OnPush`; template uses `ds-kpi-card` container class, `ds-label-sm` for `vm().labelKey | transloco`, `ds-display-md` for `vm().value`, `ds-caption` for optional sub-label with `vm().sublabelKey | transloco : vm().sublabelParams`, conditional trend arrow icon (lucide `trending-up`/`trending-down`) when `vm().trend` is 'up'/'down', optional lucide icon when `vm().iconName` is present; imports: `TranslocoPipe`, `LucideAngularModule` (depends on T005)
- [X] T010 [P] [US1] Create `src/app/features/overview/ui/kpi-card/gender-kpi-card.component.ts` and `gender-kpi-card.component.html` — selector `app-gender-kpi-card`; input `vm = input.required<GenderKpiViewModel>()`; `ChangeDetectionStrategy.OnPush`; template uses `ds-kpi-card` container, `ds-label-sm` for card title, `grid grid-cols-2 gap-3` split layout for male/female items, each item: lucide icon + `ds-display-sm` for formatted count + `ds-caption` for percentage; RTL-safe: use `gap-3` not left/right margins; imports: `TranslocoPipe`, `LucideAngularModule` (depends on T005)
- [X] T011 [US1] Update `src/app/features/overview/pages/overview-page/overview-page.html` — replace stub content region with the KPI grid layout: `<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">` containing `<app-kpi-card>` × 3 and `<app-gender-kpi-card>` × 1, bound to `viewState().data.kpis.*`; keep `@switch` structure with `loading`, `error`, `empty` cases intact; add `<app-kpi-card>` and `<app-gender-kpi-card>` to the page's `imports` array (depends on T008, T009, T010)

**Checkpoint**: Four KPI cards render in the content state. Values are non-zero. Filter changes propagate correctly. Growth Rate is +N% relative to 2016. Gender Distribution split is correct. Largest Region shows the region name as the KPI value. Layout is 1-col on mobile, 2-col on sm, 4-col on xl.

---

## Phase 5: User Story 2 — Advanced Insights & Analytics Panel (Priority: P2)

**Goal**: Three chart/visualization widgets appear below the KPI row inside a `ds-section` container: YoY bar chart, regional leaderboard, and Gender Parity Index gauge. All three react to filter changes and to theme switching (light ↔ dark).

**Independent Test**: Navigate to `/overview`. Three widgets are visible beneath the KPI row. The bar chart renders bars for each year. The leaderboard shows regions ranked descending with inline bars; rank 1 always has a 100%-wide bar. The gauge displays a decimal ratio with a qualitative label. Switch to dark mode — charts update colors immediately without reload.

### Implementation for User Story 2

- [X] T012 [P] [US2] Create `src/app/features/overview/ui/yoy-bar-chart/yoy-bar-chart.component.ts` and `yoy-bar-chart.component.html` — selector `app-yoy-bar-chart`; inputs: `series = input.required<YoyGrowthPoint[]>()`, `theme = input.required<'light' | 'dark'>()`; `ChangeDetectionStrategy.OnPush`; `chartOptions = computed(() => buildYoyChartOption(series(), theme()))` where `buildYoyChartOption` is a private pure function in the same file returning an ECharts `EChartsOption` object — bar chart with `xAxis` = year labels, `yAxis` = percent, series color from `var(--chart-1)` resolved at runtime, tooltip suffix `%`, earliest year bar shows "Baseline" in tooltip; template: `ds-chart-card` wrapper + title `overview.analytics.yoy-title | transloco`, subtitle `overview.analytics.yoy-subtitle | transloco`; `<div echarts [options]="chartOptions()" [theme]="theme()" style="height:280px">`; imports: `NgxEchartsDirective`, `TranslocoPipe` (depends on T005)
- [X] T013 [P] [US2] Create `src/app/features/overview/ui/regional-leaderboard/regional-leaderboard.component.ts` and `regional-leaderboard.component.html` — selector `app-regional-leaderboard`; input: `rows = input.required<LeaderboardRow[]>()`; `ChangeDetectionStrategy.OnPush`; template: `ds-chart-card` wrapper, `ds-title-sm` title `overview.analytics.leaderboard-title | transloco`, `<ol>` list (semantic HTML), `@for (row of rows(); track row.rank)` — each item: rank number + region name (`ds-body-sm`) + inline bar div + formatted count; inline bar: `[style.width]="row.barWidthPercent + '%'"`, fixed height `4px`, `border-radius: var(--radius-pill)`, `background-color: var(--chart-1)` via inline style; RTL-safe: bar starts from `inline-start`; imports: `TranslocoPipe` (depends on T005)
- [X] T014 [P] [US2] Create `src/app/features/overview/ui/parity-gauge/parity-gauge.component.ts` and `parity-gauge.component.html` — selector `app-parity-gauge`; inputs: `vm = input.required<ParityIndexViewModel>()`, `theme = input.required<'light' | 'dark'>()`; `ChangeDetectionStrategy.OnPush`; `gaugeOptions = computed(() => buildParityGaugeOption(vm(), theme()))` — gauge range 0–2, value = `vm().ratio`, display value formatted to 2 decimal places, color zones: 0–0.475 → `var(--chart-4)`, 0.475–1.525 → `var(--chart-2)`, 1.525–2 → `var(--chart-3)`, no pointer (progress bar style gauge), center label shows ratio; template: `ds-chart-card` wrapper, title `overview.analytics.parity-title | transloco`, `<div echarts>` with `style="height:260px"`, below gauge: translated label `vm().labelKey | transloco`; decorative male/female lucide icons (aria-hidden); imports: `NgxEchartsDirective`, `TranslocoPipe`, `LucideAngularModule` (depends on T005)
- [X] T015 [US2] Update `src/app/features/overview/pages/overview-page/overview-page.html` — add the analytics + insights row below the KPI grid: `<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">` containing a `<div class="ds-section lg:col-span-2 ds-stack-4">` analytics panel with `<h2>` title and `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">` holding `<app-yoy-bar-chart>`, `<app-regional-leaderboard>`, `<app-parity-gauge>` bound to `viewState().data.*`; pass `theme()` to chart components; add the 3 new component classes to page `imports` array (depends on T011, T012, T013, T014)

**Checkpoint**: All three analytics widgets visible. YoY bar chart shows one bar per year. Leaderboard shows up to 7 rows, rank-1 bar is always 100% wide. Gauge displays the decimal ratio value with the correct qualitative label. Toggling dark mode causes chart colors to update immediately.

---

## Phase 6: User Story 3 — Insights & Highlights Panel (Priority: P2)

**Goal**: The insights panel sits alongside the analytics section and displays 5 dynamically generated text bullet points, each with a category badge. All text uses Transloco keys with data interpolation. Insights update when filters change.

**Independent Test**: Navigate to `/overview`. Insights panel shows 5 bullets. Each has a colored badge (Growth, Demographics, Regional, Education Stage). Insight text contains specific numbers. Switch to Arabic — all badges and text update to Arabic without reload. Change the region filter — insight text for "Largest Region" cites the filtered region's numbers.

### Implementation for User Story 3

- [X] T016 [P] [US3] Create `src/app/features/overview/ui/insights-list/insights-list.component.ts` and `insights-list.component.html` — selector `app-insights-list`; input: `insights = input.required<InsightItem[]>()`; `ChangeDetectionStrategy.OnPush`; template: `ds-section` container (different surface than chart cards — creates visual distinction), `ds-title-sm` title `overview.insights.section-title | transloco`, `<ul class="ds-stack-4">` list, `@for (item of insights(); track item.textKey)` — each `<li class="flex items-start gap-3">`: bullet dot `<span aria-hidden="true">` + `<span [class]="'ds-insight-badge ds-insight-badge-' + item.category">{{ item.badgeLabelKey | transloco }}</span>` + `<span class="ds-body-sm text-soft">{{ item.textKey | transloco : item.textParams }}</span>`; RTL-safe: `flex items-start gap-3` mirrors naturally; imports: `TranslocoPipe` (depends on T002, T005)
- [X] T017 [US3] Update `src/app/features/overview/pages/overview-page/overview-page.html` — add `<app-insights-list>` to the `lg:col-span-1` column of the analytics row (sibling of the analytics `ds-section` div); bind `[insights]="viewState().data.insights"`; add `InsightsListComponent` to page `imports` array (depends on T015, T016)

**Checkpoint**: Insights panel renders with 5 items visible. Each item has a correctly colored badge per its category. Insight text includes interpolated data values. Switching to Arabic updates all text. Changing the region filter updates the "largest region" insight to reflect the filtered data.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass covering RTL safety, mobile layout, accessibility, hardcoded string audit, and empty/error state verification.

- [X] T018 [P] RTL audit — switch language to Arabic (`ar`), inspect the full Overview page in DevTools at 1280px: verify KPI card text aligns to `inline-start`, leaderboard bars start at `inline-start`, insight badge and text read left-to-right within each item (badge at start, text after), analytics section header aligns correctly; fix any `left`/`right` CSS assumptions in component stylesheets
- [X] T019 [P] Mobile layout audit at 375px viewport — verify KPI cards: 1-per-row on xs, 2-per-row on sm; analytics panel (`ds-section`) stacks to full width; YoY chart, leaderboard, and gauge each stack vertically in `grid-cols-1 md:grid-cols-3`; insights panel appears below analytics section; no horizontal overflow on any element; chart containers maintain explicit heights and do not collapse
- [X] T020 [P] Accessibility audit — every lucide icon used decoratively has `aria-hidden="true"`; chart container `<div echarts>` elements have `role="img"` and `aria-label` attributes using Transloco keys; all interactive elements (retry button, filter bar items) have visible focus rings; KPI value elements include a human-readable `aria-label` if the displayed value is abbreviated (e.g. "6.85M")
- [X] T021 Transloco key audit — run `grep -rn '"[A-Z]' src/app/features/overview/ --include="*.html"` and `grep -rn "'[A-Z]" src/app/features/overview/ --include="*.html"` — any match is a hardcoded English string violation; fix all findings by replacing with appropriate Transloco keys; also verify all 28 `overview.*` keys exist in both `en.json` and `ar.json` with non-empty values
- [X] T022 [P] Empty and error state verification — (a) select an impossible filter combination in the browser (e.g. Year = 2024 + Region = A + Stage = B + Gender = C where no row matches) and confirm `EmptyStateComponent` renders with its translated message; (b) temporarily rename `datasets/edu-master.json` to break the HTTP request, reload, and confirm `ErrorStateComponent` renders with the retry button visible and functional; restore the file afterwards
- [X] T023 Run all 13 checkpoint gates from `quickstart.md §Checkpoint Gates` systematically and document any remaining gaps

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    └── No dependencies — start immediately
        T001, T002, T003, T004 can all run in parallel

Phase 2 (Foundational)
    └── Depends on: Phase 1 complete (T001 needed for compilation)
    └── BLOCKS: All user story phases

Phase 3 (US4 — Facade & View State)
    └── Depends on: Phase 2 complete (T005, T006)
    └── BLOCKS: US1, US2, US3 (UI components need facade to receive data)

Phase 4 (US1 — KPI Cards) ← MVP after Phase 3
Phase 5 (US2 — Analytics Panel)
Phase 6 (US3 — Insights Panel)
    └── All depend on: Phase 3 complete
    └── US1 must complete before US2 (T015 extends T011's layout)
    └── US2 must complete before US3 (T017 extends T015's layout)

Phase 7 (Polish)
    └── Depends on: All user story phases complete
```

### User Story Dependencies

| Story | Priority | Depends On | Can Parallelize With |
|-------|----------|-----------|---------------------|
| US4 — View State / Facade | P1 | Phase 2 complete | — |
| US1 — KPI Summary | P1 | US4 (T007, T008) | T009 and T010 parallel each other |
| US2 — Analytics Panel | P2 | US1 (T011 layout) | T012, T013, T014 parallel each other |
| US3 — Insights Panel | P2 | US2 (T015 layout) | T016 parallel with T015/T017 |

### Within Each Phase

- Phase 1: T001, T002, T003, T004 → all in parallel (different files)
- Phase 2: T005, T006 → in parallel (different files)
- Phase 3: T007 → then T008 (T008 imports facade from T007)
- Phase 4: T009, T010 → in parallel → then T011
- Phase 5: T012, T013, T014 → in parallel → then T015
- Phase 6: T016 → then T017
- Phase 7: T018, T019, T020, T021, T022 → in parallel → then T023

---

## Parallel Execution Examples

### Phase 1 (all parallel):
```
T001 ECharts GaugeChart registration
T002 Design system badge CSS classes
T003 English translation keys (overview.*)
T004 Arabic translation keys (overview.*)
```

### Phase 2 (parallel):
```
T005 overview.model.ts (all view model types)
T006 overview.utils.ts (all pure computation functions)
```

### Phase 4 — US1 (T009, T010 parallel):
```
T009 KpiCardComponent
T010 GenderKpiCardComponent
    ↓ both complete
T011 OverviewPage HTML — KPI grid layout
```

### Phase 5 — US2 (T012, T013, T014 parallel):
```
T012 YoyBarChartComponent
T013 RegionalLeaderboardComponent
T014 ParityGaugeComponent
    ↓ all complete
T015 OverviewPage HTML — analytics panel layout
```

### Phase 7 — Polish (T018–T022 parallel):
```
T018 RTL audit
T019 Mobile layout audit
T020 Accessibility audit
T021 Transloco key audit
T022 Empty/error state verification
    ↓ all complete
T023 Full quickstart.md checkpoint gates
```

---

## Implementation Strategy

### MVP Scope (US4 + US1 only — minimum valuable page state)

1. Complete Phase 1 (T001–T004)
2. Complete Phase 2 (T005–T006)
3. Complete Phase 3/US4 (T007–T008) — facade and page wiring
4. Complete Phase 4/US1 (T009–T011) — four KPI cards
5. **STOP and VALIDATE**: Four KPI cards render with correct live data; filter changes update values; all 4 view states cycle correctly
6. Deliver/demo: Page has a working KPI summary — this is the "Digital Curator" executive summary value proposition

### Incremental Delivery

1. Phase 1 + 2 → Infrastructure ready
2. Phase 3 (US4) → Facade signal chain proven end-to-end
3. Phase 4 (US1) → KPI cards MVP — validate and demo ⭐
4. Phase 5 (US2) → Analytics charts added — validate
5. Phase 6 (US3) → Insights panel added — validate
6. Phase 7 → Full quality pass

---

## Notes

- All file paths are relative to `src/app/` unless otherwise stated
- `[P]` tasks touch different files and have no mutual dependencies — safe to implement simultaneously
- `[US#]` label traces each task back to its user story for review and testing traceability
- `EducationMasterData.studentCount` uses camelCase — NOT `student_count` (research Finding 9)
- Gender filter awareness: the Gender Distribution KPI and Parity Gauge always reflect `filteredData` — if gender is filtered to one value, the excluded gender will show 0 (research Finding 5)
- Growth Rate baseline: always computed against unfiltered `allData.filter(r => r.year === 2016)` (research Finding 4)
- YoY series uses `filteredData` but the year filter dimension is intentionally excluded from the series computation so all years appear on the chart (plan.md §YoY Series specifics)
- The `OverviewFacade` should be `providedIn: 'root'` to avoid multiple instances when navigating away and back
- Stop at each **Checkpoint** to verify the user story is independently functional before proceeding to the next
