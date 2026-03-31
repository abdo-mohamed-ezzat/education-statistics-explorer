# Service Contracts: Application Foundation (002-app-foundation)

**Phase 1 Output** | Generated: 2026-03-23

---

## 1. PreferencesService — Public API

**Location**: `src/app/core/services/preferences.service.ts`

This is an app-wide singleton (`providedIn: 'root'`). It owns all user preference state and exposes it as Angular signals.

```ts
interface PreferencesService {
  // ─── Read (signals) ──────────────────────────────────────────────────
  readonly language: Signal<Language>; // 'ar' | 'en'
  readonly direction: Signal<Direction>; // 'rtl' | 'ltr' — derived from language
  readonly theme: Signal<Theme>; // 'light' | 'dark'

  // ─── Write (commands) ────────────────────────────────────────────────
  toggleLanguage(): void; // switches 'ar' ↔ 'en', persists to localStorage
  setLanguage(lang: Language): void; // sets explicitly
  toggleTheme(): void; // switches 'light' ↔ 'dark', persists to localStorage
  setTheme(theme: Theme): void; // sets explicitly
}
```

**Side effects (via `effect()`)**:

- On every `language` change → sets `document.documentElement.setAttribute('dir', direction())`
- On every `language` change → calls `translocoService.setActiveLang(language())`
- On every `theme` change → toggles `document.documentElement.classList` between `.light` and `.dark`
- On every preference change → writes to `localStorage` (guarded by platform check)

**FOUC Prevention contract**: `index.html` must include an inline `<script>` in `<head>` that reads `localStorage` and applies `dir` attribute and theme class before Angular boots.

---

## 2. EducationDataService — Public API

**Location**: `src/app/core/services/education-data.service.ts`

Singleton service responsible for all dataset loading and session-level caching.

```ts
interface EducationDataService {
  // Returns cached Observable; HTTP call made at most once per dataset per session
  getRecords(): Observable<EducationRecord[]>;
  getMaster(): Observable<MasterData>;
  getSummary(): Observable<SummaryData>;
}
```

**Caching contract**: Each method returns an Observable backed by `shareReplay(1)`. The first subscriber triggers the HTTP fetch; all subsequent subscribers receive the cached emission.

**Error contract**: HTTP errors are NOT swallowed. They propagate to the subscriber's `error` handler, which is responsible for mapping to a `ViewState<T>` error state.

**Dataset URLs** (relative to app origin):

- `public/datasets/education-records.json`
- `public/datasets/edu-master.json`
- `public/datasets/edu-summary.json`

---

## 3. GlobalFilterService — Public API

**Location**: `src/app/core/services/global-filter.service.ts`

Singleton service managing cross-feature filter state. Derives available filter options from the master dataset.

```ts
interface GlobalFilterService {
  // ─── Read (signals) ─────────────────────────────────────────────────
  readonly year: Signal<number | null>;
  readonly region: Signal<string | null>;
  readonly stage: Signal<string | null>;
  readonly gender: Signal<string | null>;
  readonly state: Signal<GlobalFilterState>; // computed from above

  // ─── Available options (derived from dataset) ─────────────────────
  readonly availableYears: Signal<number[]>;
  readonly availableRegions: Signal<string[]>;
  readonly availableStages: Signal<string[]>;
  readonly availableGenders: Signal<string[]>;

  // ─── Active route config ────────────────────────────────────────
  readonly activeConfig: Signal<FilterConfig>;

  // ─── Write (commands) ───────────────────────────────────────────
  setFilter(dimension: FilterDimension, value: string | number | null): void;
  resetAll(): void;
  setActiveConfig(config: FilterConfig): void;
}
```

**Initialization**: Subscribes to `EducationDataService.getMaster()` and extracts unique values for years, regions, stages, and genders to populate available options.

**Persistence contract**: Filter state is NOT persisted to localStorage — it resets on page reload. Only user preferences (language, theme) persist.

## 4. ShellComponent — Input/Output Contract

**Location**: `src/app/core/layout/shell/shell.component.ts`

Smart container. No inputs/outputs — it owns the layout and reads directly from `PreferencesService` and `TranslocoService`.

**Child contracts**:

### TopbarComponent

```ts
// Inputs
navTitle: InputSignal<string>; // App display title (translated)
lang: InputSignal<Language>; // Current active language
theme: InputSignal<Theme>; // Current active theme

// Outputs
languageToggle: OutputEmitterRef<void>;
themeToggle: OutputEmitterRef<void>;
```

### NavComponent

```ts
// Inputs
items: InputSignal<NavItem[]>; // Navigation link definitions
activeRoute: InputSignal<string>; // Currently active route path (for aria-current)

// Outputs
navigate: OutputEmitterRef<string>; // Emits path on nav item click (ShellComponent handles router.navigate)
```

---

### FilterBarComponent

```ts
// Inputs
availableYears: InputSignal<number[]>;
availableRegions: InputSignal<string[]>;
availableStages: InputSignal<string[]>;
availableGenders: InputSignal<string[]>;
currentState: InputSignal<GlobalFilterState>;
visibleDimensions: InputSignal<FilterDimension[]>;

// Outputs
filterChange: OutputEmitterRef<{
  dimension: FilterDimension;
  value: string | number | null;
}>;
reset: OutputEmitterRef<void>;
```

---

## 5. Shared State Components — Input Contracts

**Location**: `src/app/shared/ui/`

### LoadingStateComponent

```ts
// No required inputs.
// Optional:
message: InputSignal<string>; // Override default "Loading..." translation key
```

### EmptyStateComponent

```ts
// Optional:
title: InputSignal<string>; // Override default "No data available" title
detail: InputSignal<string>; // Override default detail message
```

### ErrorStateComponent

```ts
// Optional:
message: InputSignal<string>; // Override default "Something went wrong" message
// Output:
retry: OutputEmitterRef<void>; // Emitted when user taps "Retry" button
```

---

## 6. ViewState Usage Contract (for Feature Pages)

Any feature page container MUST:

1. Declare: `protected readonly state = signal<ViewState<FeatureViewModel>>(ViewStateLoading)`
2. Handle all 4 states in template using `@switch (state().status)`:
   ```html
   @switch (state().status) { @case ('loading') { <app-loading-state /> } @case
   ('empty') { <app-empty-state /> } @case ('error') {
   <app-error-state [message]="state().message" /> } @case ('data') {
   <!-- render feature UI with state().data -->
   } }
   ```
3. NEVER pass raw loading/error flags as inputs to presentational components.
4. NEVER handle data fetch errors silently — always transition to `error` state.

---

## 7. Translation File Contract

Both `public/i18n/ar.json` and `public/i18n/en.json` MUST contain the following namespaces **at minimum** after this feature lands:

| Namespace  | Keys                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| `nav.*`    | `overview`, `trends`, `regional-analysis`, `gender-analysis`, `stage-analysis` |
| `topbar.*` | `app-title`, `toggle-lang`, `toggle-theme`                                     |
| `state.*`  | `loading`, `empty`, `empty-detail`, `error`, `error-detail`, `retry`           |
| `filter.*` | `year`, `region`, `stage`, `gender`, `all`, `reset`                            |

Missing keys will cause Transloco to log a warning and show the raw key string.
