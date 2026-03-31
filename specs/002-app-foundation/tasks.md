# Tasks: Application Foundation

**Input**: Design documents from `/specs/002-app-foundation/`
**Prerequisites**: plan.md ✓ | spec.md ✓ | research.md ✓ | data-model.md ✓ | contracts/ ✓ | quickstart.md ✓

**Organization**: Tasks grouped by user story for independent implementation and testing.  
**Tests**: Not included (not requested in spec).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US#]**: User story this task belongs to

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: File structure, placeholder assets, and translation scaffolding that every user story depends on.

- [X] T001 Verify existing dummy dataset files `public/datasets/education-records.json`, `public/datasets/edu-master.json`, `public/datasets/edu-summary.json` contain valid JSON data (from parent repo)
- [X] T002 [P] Create Arabic translation file `public/i18n/ar.json` with all required keys: `nav.*`, `topbar.*`, `state.*`, `filter.*` (see contracts/service-contracts.md §6)
- [X] T003 [P] Create English translation file `public/i18n/en.json` with all required keys: `nav.*`, `topbar.*`, `state.*`, `filter.*`

**Checkpoint**: Assets and translation files exist. App can be served without missing-file errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models and services that MUST be complete before any user story UI can be built.

⚠️ **CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Create `UserPreferences` model, types (`Language`, `Direction`, `Theme`), and `DEFAULT_PREFERENCES` constant in `src/app/core/models/user-preferences.model.ts`
- [X] T005 [P] Create `NavItem` interface in `src/app/core/models/nav-item.model.ts`
- [X] T006 [P] Create `DatasetKey` and `DatasetLoadStatus` types in `src/app/core/models/dataset.model.ts`
- [X] T007 [P] Create `ViewState<T>` discriminated union and factory helpers (`ViewStateLoading`, `ViewStateEmpty`, `viewStateData`, `viewStateError`) in `src/app/shared/models/view-state.model.ts`
- [X] T008 Implement `PreferencesService` (signals: `language`, `direction` computed, `theme`; methods: `toggleLanguage`, `toggleTheme`, `setLanguage`, `setTheme`; `effect()` for `dir`/theme/`localStorage`/Transloco side-effects; `PLATFORM_ID` + `isPlatformBrowser` guard; initial lang detection from `localStorage` then browser `navigator.language`) in `src/app/core/services/preferences.service.ts` (depends on T004)
- [X] T009 Implement `EducationDataService` (three `shareReplay(1)` cached `HttpClient` observables: `getRecords()`, `getMaster()`, `getSummary()`; strong return types; errors propagate — NOT swallowed) in `src/app/core/services/education-data.service.ts` (depends on T006)

**Checkpoint**: Models compile, `PreferencesService` toggles language/theme via signals, `EducationDataService` reads and caches JSON assets. Foundation ready for user story UI.

---

## Phase 3: User Story 1 — Consistent App Shell on Every Visit (Priority: P1) 🎯 MVP

**Goal**: Render a consistent, navigable layout shell (topbar + sidenav + router outlet) on every route. Language, direction, and theme preferences persist and are restored on return visits. Zero flash of wrong theme/direction on load.

**Independent Test**: Open app. Shell renders with topbar and nav. Switch to Arabic, close tab, reopen — shell opens in Arabic RTL. Switch to dark mode, close tab, reopen — dark mode is active. Navigate to `/overview`, `/trends`, `/regional-analysis` — shell remains consistent.

### Implementation for User Story 1

- [X] T010 [P] [US1] Implement `TopbarComponent` (dumb; inputs: `lang`, `theme`; outputs: `languageToggle`, `themeToggle`; displays app title; uses `ds-glassbar` + design system classes; Lucide icons for lang/theme toggles; accessible button targets with `aria-label` from translation keys) in `src/app/core/layout/topbar/topbar.component.ts` (depends on T004)
- [X] T011 [P] [US1] Implement `NavComponent` (dumb; input: `items: NavItem[]`, `activeRoute: string`; output: `navigate: string`; renders nav links using Lucide icons + translation keys; `aria-current="page"` on active link; mobile-friendly; RTL-safe) in `src/app/core/layout/nav/nav.component.ts` (depends on T005)
- [X] T012 [US1] Implement `ShellComponent` (smart container; injects `PreferencesService`, `Router`; defines `NAV_ITEMS: NavItem[]` constant for all 5 routes; reads `language()`, `theme()`, `direction()` signals; passes data to `TopbarComponent` and `NavComponent`; handles `languageToggle`/`themeToggle` outputs; contains `<router-outlet>`; uses `ds-shell` layout class; mobile-first responsive layout; RTL-safe) in `src/app/core/layout/shell/shell.component.ts` (depends on T008, T010, T011)
- [X] T013 [US1] Simplify `AppComponent` to only render `<app-shell>` — strip all Angular default placeholder HTML and inline styles from `src/app/app.html` and `src/app/app.ts`
- [X] T014 [US1] Add FOUC-prevention inline `<script>` to `<head>` of `index.html` — reads `localStorage('lang')` and `localStorage('theme')`, sets `document.documentElement.setAttribute('dir', ...)` and `document.documentElement.classList.add('dark'/'light')` synchronously before Angular boots

**Checkpoint**: Shell renders consistently on all routes. Language/theme toggles work. Preferences persist. No flash on hard reload. Layout is mobile-first and RTL-safe on Arabic.

---

## Phase 4: User Story 2 — Language and Direction Switching (Priority: P2)

**Goal**: A bilingual user can toggle between Arabic (RTL) and English (LTR) via a visible topbar control. The full interface — text, direction, layout — switches immediately without a page reload. The choice persists.

**Independent Test**: App is in English. Tap language toggle → interface switches to Arabic, text is in Arabic, layout direction reverses. Tap language toggle again → returns to English LTR. Reload in Arabic → app opens in Arabic RTL. All nav labels and state messages appear in the active language.

### Implementation for User Story 2

- [X] T015 [US2] Verify `TranslocoService.setActiveLang()` is called from `PreferencesService` `effect()` on every language change — confirm Transloco `reRenderOnLangChange: true` is set in `app.config.ts` (already present; add test step only if missing) in `app.config.ts` + `src/app/core/services/preferences.service.ts` (depends on T008)
- [X] T016 [US2] Ensure all text in `TopbarComponent`, `NavComponent`, and `ShellComponent` templates uses `transloco` pipe or `TranslocoDirective` — NO hardcoded Arabic or English strings in any template in `src/app/core/layout/` (depends on T010, T011, T012)
- [X] T017 [P] [US2] Add Arabic translation values to `public/i18n/ar.json` for all shell + nav + state keys (fill in actual Arabic text for all keys defined at T002) (depends on T002)
- [X] T018 [P] [US2] Add English translation values to `public/i18n/en.json` for all shell + nav + state keys (fill in actual English text for all keys defined at T003) (depends on T003)
- [X] T019 [US2] Verify `dir` attribute is applied to `<html>` element reactively when language changes — confirm `document.documentElement.setAttribute('dir', ...)` side-effect runs inside the `PreferencesService` `effect()` (if not yet done in T008, fix here) in `src/app/core/services/preferences.service.ts` (depends on T008)

**Checkpoint**: Toggle lang button → all visible labels update immediately to Arabic/English; layout direction flips; preference persists across reload.

---

## Phase 5: User Story 3 — Theme Toggle (Priority: P2)

**Goal**: A user can switch to dark mode using a visible theme toggle in the topbar. The switch is immediate, all surfaces update, and the preference persists on their next visit.

**Independent Test**: App is in light mode. Tap theme toggle → all surfaces, text, and backgrounds shift to dark-appropriate styling using design system tokens. Reload → app opens in dark mode. Tap toggle again → returns to light.

### Implementation for User Story 3

- [X] T020 [US3] Verify `themes.css` has a `.dark` (or `[class~="dark"]`) selector block that pivots all `--color-*` tokens to dark-appropriate values — if the class-based dark pivot does not exist, add it to `src/styles/themes.css` (depends on T012)
- [X] T021 [US3] Verify `PreferencesService` `effect()` uses `document.documentElement.classList.toggle('dark', theme === 'dark')` to apply/remove the dark class reactively on theme change, and that this is **also** done by the FOUC inline script in `index.html` — cross-check T008 and T014 outputs in `src/app/core/services/preferences.service.ts` + `index.html` (depends on T008, T014)
- [X] T022 [US3] Verify theme toggle button in `TopbarComponent` uses a Lucide `sun` icon in dark mode and `moon` icon in light mode (or equivalent accessible toggle) and emits `themeToggle` output on click in `src/app/core/layout/topbar/topbar.component.ts` (depends on T010)

**Checkpoint**: Theme toggle is visible, switches immediately, persists across reload, no partially-styled elements.

---

## Phase 6: User Story 4 — Data Loads Cleanly Without Blank States (Priority: P3)

**Goal**: Any feature page shows a loading indicator while data is fetching, shows the content once loaded, renders a friendly empty state if no data matches, and shows a readable error state if the load fails. No blank panels ever appear.

**Independent Test**: Navigate to any feature page. See loading state while data fetches. When data resolves, content renders. Rename `education-records.json` to cause a 404 → error state shows with a readable message, no blank zone. Clear records array → empty state shows with a translated message.

### Implementation for User Story 4

- [X] T023 [P] [US4] Implement `LoadingStateComponent` (presentational; optional `message` input; uses `ds-state-panel` class; animated Lucide `loader-2` icon or skeleton shimmer; transloco-based default message `state.loading`; `OnPush`) in `src/app/shared/ui/loading-state/loading-state.component.ts` (depends on T007)
- [X] T024 [P] [US4] Implement `EmptyStateComponent` (presentational; optional `title` and `detail` inputs; uses `ds-state-panel` class; Lucide `inbox` or `search-x` icon; default messages from `state.empty` + `state.empty-detail` translation keys; `OnPush`) in `src/app/shared/ui/empty-state/empty-state.component.ts` (depends on T007)
- [X] T025 [P] [US4] Implement `ErrorStateComponent` (presentational; optional `message` input; `retry` output emitter; uses `ds-state-panel` class; Lucide `triangle-alert` icon; default message from `state.error` + `state.error-detail` keys; retry button using `ds-btn-outline` class; `OnPush`) in `src/app/shared/ui/error-state/error-state.component.ts` (depends on T007)
- [X] T026 [US4] Add `state.*` translation values to `public/i18n/ar.json`: `state.loading`, `state.empty`, `state.empty-detail`, `state.error`, `state.error-detail`, `state.retry` (actual Arabic text) (depends on T017)
- [X] T027 [US4] Add `state.*` translation values to `public/i18n/en.json`: same keys but English text (depends on T018)
- [X] T028 [US4] Wire `ViewState<T>` pattern into the stub/placeholder for `overview` feature page to demonstrate and verify the 4-state model end-to-end: use `signal<ViewState<unknown>>(ViewStateLoading)`, subscribe to `EducationDataService.getRecords()`, and handle error gracefully with `viewStateError` — this proves the pattern works before other feature pages are built. Use the `@switch` template pattern from `contracts/service-contracts.md §5` in `src/app/features/overview/pages/overview-page.component.ts` (depends on T007, T009, T023, T024, T025; note: overview page stub must exist)

**Checkpoint**: Overview page cycles through all 4 states. Shared state components render correctly in both languages. Error state shows meaningful message, never a blank.

---

## Phase 6.5: User Story 5 — Unified Data Exploration Filters (Priority: P2)

**Goal**: Provide a shared global filter bar in the layout header that allows users to filter dashboard data by academic year, region, stage, and gender. Filter state is shared across all feature pages via a single `GlobalFilterService`. Each route declares which filters are visible. Filter selections persist during navigation.

**Independent Test**: Open overview page. Select year 2020 and region الرياض. Navigate to trends — same year and region preselected. Navigate to regional analysis — year filter visible and preselected; region filter may not appear if the page doesn't declare it. Click reset → all filters return to default.

### Implementation for User Story 5

- [X] T034 [P] [US5] Create `GlobalFilterState` interface, `FilterDimension` union type (`'year' | 'region' | 'stage' | 'gender'`), `FilterConfig` interface (maps route path to allowed dimensions), and `DEFAULT_FILTER_STATE` constant (all values `null` meaning "all") in `src/app/shared/models/global-filter.model.ts`
- [X] T035 [US5] Implement `GlobalFilterService` (singleton; signals: `year: Signal<number | null>`, `region: Signal<string | null>`, `stage: Signal<string | null>`, `gender: Signal<string | null>`, `state: computed<GlobalFilterState>`, `activeConfig: Signal<FilterConfig>`; methods: `setFilter(dimension, value)`, `resetAll()`, `setActiveConfig(config: FilterConfig)`; derives available options from `EducationDataService.getMaster()` — extracts unique years, regions, stages, genders at init; exposes `availableYears`, `availableRegions`, `availableStages`, `availableGenders` as signals) in `src/app/core/services/global-filter.service.ts` (depends on T034, T009)
- [X] T036 [US5] Implement `FilterBarComponent` (presentational/dumb; inputs: `availableYears: number[]`, `availableRegions: string[]`, `availableStages: string[]`, `availableGenders: string[]`, `currentState: GlobalFilterState`, `visibleDimensions: FilterDimension[]`; outputs: `filterChange: {dimension: FilterDimension, value: string | number | null}`, `reset: void`; renders `ds-select` dropdowns for each visible dimension; includes a reset button using `ds-btn-tertiary`; uses Transloco for labels `filter.year`, `filter.region`, `filter.stage`, `filter.gender`, `filter.all`, `filter.reset`; mobile-first responsive layout; RTL-safe; `OnPush`) in `src/app/shared/ui/filter-bar/filter-bar.component.ts` (depends on T034)
- [X] T037 [US5] Define route filter configurations: add `ROUTE_FILTER_CONFIG: Record<string, FilterDimension[]>` constant mapping each feature route to its allowed filter dimensions (e.g., `'overview': ['year', 'region', 'stage', 'gender']`, `'trends': ['year', 'region', 'stage']`, `'regional-analysis': ['year', 'stage', 'gender']`) in `src/app/core/layout/shell/route-filter-config.ts` (depends on T034)
- [X] T038 [US5] Integrate `FilterBarComponent` into `ShellComponent`: inject `GlobalFilterService`; read `Router.events` to detect route changes and call `globalFilterService.setActiveConfig(ROUTE_FILTER_CONFIG[activeRoute])`; render `<app-filter-bar>` inside the shell below the topbar, passing current filter state, available options, and visible dimensions; handle `filterChange` and `reset` outputs by calling `GlobalFilterService` methods in `src/app/core/layout/shell/shell.component.ts` (depends on T012, T035, T036, T037)
- [X] T039 [P] [US5] Add `filter.*` translation keys to both `public/i18n/ar.json` and `public/i18n/en.json`: `filter.year`, `filter.region`, `filter.stage`, `filter.gender`, `filter.all` ("الكل" / "All"), `filter.reset` ("إعادة تعيين" / "Reset Filters") (depends on T017, T018)
- [X] T040 [US5] Wire `GlobalFilterService` filter state into the overview page: inject `GlobalFilterService`, use `computed()` to derive filtered data from `EducationDataService.getMaster()` based on active filters — update the `ViewState` pipeline to re-evaluate on every filter change in `src/app/features/overview/pages/overview-page.component.ts` (depends on T028, T035)

**Checkpoint**: Global filter bar visible on all feature pages. Selecting a filter on overview carries to trends. Each page shows only its relevant filters. Reset clears all. Filter options derived from dataset, not hardcoded.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass covering accessibility, mobile layout, RTL verification, FR-018 (no hardcoded strings), and FR-019–FR-028 (filter system).

- [X] T029 [P] Audit all templates in `core/layout/` and `shared/ui/` for hardcoded English or Arabic strings — replace any found with Transloco keys (FR-018) in `src/app/core/layout/` + `src/app/shared/ui/`
- [X] T030 [P] Verify keyboard accessibility: tab through topbar toggles, nav links, filter dropdowns, filter reset button, and error-state retry button — all must be reachable and operable by keyboard alone, with visible focus indicators (FR-017)
- [X] T031 [P] Verify mobile layout at 375px viewport: shell does not overflow, nav is accessible, topbar controls are touch-friendly, filter bar stacks vertically on narrow screens (FR-016, SC-015) — fix any layout issues in `src/app/core/layout/shell/shell.component.ts` or design system CSS
- [X] T032 Verify RTL layout at all breakpoints: switch to Arabic, inspect all layout containers in `ShellComponent`, `TopbarComponent`, `NavComponent`, `FilterBarComponent` for left/right assumptions — fix any direction-specific CSS in component styles (FR-005, SC-009)
- [X] T033 Run full verification checklist from `quickstart.md` — check FR-001 through FR-028 systematically and document any remaining gaps

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    └── No dependencies — start immediately

Phase 2 (Foundational)
    └── Depends on: Phase 1 complete
    └── BLOCKS: All user story phases

Phase 3 (US1 — Shell) ← MVP start after Phase 2
Phase 4 (US2 — Language)
Phase 5 (US3 — Theme)
Phase 6 (US4 — Data States)
Phase 6.5 (US5 — Global Filters)
    └── All depend on: Phase 2 complete
    └── US1 should be done before US2/US3/US5 (topbar/shell must exist)
    └── US2/US3 can proceed in parallel after US1
    └── US4 shared components can start in parallel with US1 (T023–T025)
    └── US5 depends on US1 (shell) + US4 (overview demo) + EducationDataService (T009)

Phase 8 (Polish)
    └── Depends on: All user story phases complete
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|-----------|---------------------|
| US1 — Shell (P1) | Phase 2 complete | US4 shared components (T023–T025) |
| US2 — Language (P2) | US1 complete (topbar/nav exist) | US3 |
| US3 — Theme (P2) | US1 complete (topbar exists) | US2 |
| US4 — Data States (P3) | Phase 2 complete (shared components); US1 for overview demo | US5 model (T034) |
| US5 — Global Filters (P2) | US1 (shell), US4 (overview demo), T009 (data service) | — |

### Within Each Phase

- Models (T004–T007) → before Services (T008–T009)
- `PreferencesService` (T008) → before Shell components (T010–T013)
- Shell components (T010–T012) → before language/theme polish (T015–T022)
- `ViewState<T>` (T007) → before state components (T023–T025) → before overview demo (T028)
- `GlobalFilterState` model (T034) → before `GlobalFilterService` (T035) → before `FilterBarComponent` (T036)
- `GlobalFilterService` (T035) + Shell (T012) → before shell integration (T038)
- Overview demo (T028) + `GlobalFilterService` (T035) → before filtered overview (T040)

---

## Parallel Execution Examples

### Phase 2 (can all run in parallel after Phase 1):
```
T004 user-preferences.model.ts
T005 nav-item.model.ts
T006 dataset.model.ts
T007 view-state.model.ts
```

### Phase 3, US1 (T010 and T011 can run in parallel):
```
T010 TopbarComponent
T011 NavComponent
    ↓ both complete
T012 ShellComponent (depends on T010 + T011)
T013 AppComponent simplification
T014 FOUC script in index.html
```

### Phase 6, US4 state components (all parallel):
```
T023 LoadingStateComponent
T024 EmptyStateComponent
T025 ErrorStateComponent
```

---

## Implementation Strategy

### MVP (User Story 1 only — minimum viable shell)

1. Complete Phase 1 (T001–T003)
2. Complete Phase 2 (T004–T009)
3. Complete Phase 3 US1 (T010–T014)
4. **STOP and VALIDATE**: Shell renders, lang/theme persist, no FOUC
5. Deliver/demo: the app has a working layout shell

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 (US1) → Shell MVP — validate and demo
3. Phase 4 (US2) → Language switching fully works — validate
4. Phase 5 (US3) → Theme toggle fully works — validate (can overlap with US2)
5. Phase 6 (US4) → 4-state model proven end-to-end — validate
6. Phase 6.5 (US5) → Global filter system works cross-page — validate
7. Phase 8 (Polish) → Full FR coverage confirmed (FR-001 through FR-028)

### Suggested MVP Scope

> Implement Phases 1–3 first. This delivers a working shell that can host any feature page, with persistent preferences. Phases 4–6.5 are additive — they refine existing behaviour and add the global filter system.

---

## Notes

- All file paths are relative to the repository root `c:\Users\abdallah\mentorship\Education-Statistics-Explorer\`
- `[P]` tasks touch different files and have no mutual dependencies — safe to implement simultaneously
- `[US#]` label traces each task back to its user story for review and testing traceability
- Stop at each **Checkpoint** to verify the story is independently functional before proceeding
- Follow the implementation order from `quickstart.md` to avoid circular import errors
- Transloco `reRenderOnLangChange: true` is already set in `app.config.ts` — no changes needed there
- No new npm packages are required for this feature
