# Data Model: Application Foundation (002-app-foundation)

**Phase 1 Output** | Generated: 2026-03-23

---

## Overview

This document defines all entities introduced or formalized by the Application Foundation feature. These models are **shared** — they live in `core/models/` (app-wide singletons) or `shared/models/` (cross-feature reuse). No feature-local models are defined in this feature.

---

## 1. UserPreferences

**Location**: `src/app/core/models/user-preferences.model.ts`  
**Scope**: App-wide singleton. Managed by `PreferencesService`.

```ts
export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';
export type Theme = 'light' | 'dark';

export interface UserPreferences {
  /** Active display language */
  language: Language;
  /** Layout direction derived from language */
  direction: Direction;
  /** Active color theme */
  theme: Theme;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'ar',
  direction: 'rtl',
  theme: 'light',
};
```

**Relationships**:
- `language === 'ar'` → `direction === 'rtl'` (derived, never stored independently)
- `Direction` is always computed from `Language` to avoid desync

**Validation rules**:
- `language` must be one of `['ar', 'en']`; anything else falls back to `'ar'`
- If `localStorage` is unavailable (private browsing / SSR), use `DEFAULT_PREFERENCES` for the session; do not throw

**State transitions**:
```
Initial (no stored prefs) → detect browser lang → set Language + derive Direction
Language toggle → update Language + derive Direction → persist to localStorage
Theme toggle → update Theme → persist to localStorage
```

---

## 2. ViewState<T> (Discriminated Union)

**Location**: `src/app/shared/models/view-state.model.ts`  
**Scope**: Shared across all feature pages.

```ts
/**
 * Generic discriminated union representing the 4 possible states
 * of any feature page that loads async data.
 *
 * Use as the type of a Signal<ViewState<T>> in container components.
 */
export type ViewState<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'empty' }
  | { readonly status: 'data'; readonly data: T }
  | { readonly status: 'error'; readonly message: string };

// ─── Factory helpers ─────────────────────────────────────────────────────────

export const ViewStateLoading: ViewState<never> = { status: 'loading' };

export const ViewStateEmpty: ViewState<never> = { status: 'empty' };

export function viewStateData<T>(data: T): ViewState<T> {
  return { status: 'data', data };
}

export function viewStateError(message: string): ViewState<never> {
  return { status: 'error', message };
}
```

**Usage pattern in container components**:
```ts
// In a page component:
protected readonly state = signal<ViewState<OverviewViewModel>>(ViewStateLoading);

// Loading data:
this.overviewFacade.getData().pipe(takeUntilDestroyed()).subscribe({
  next: (data) => this.state.set(data.length ? viewStateData(data) : ViewStateEmpty),
  error: (err)  => this.state.set(viewStateError(err.message)),
});
```

**Validation rules**:
- `data` field only present on `status === 'data'`
- `message` field only present on `status === 'error'`
- Compiler enforces exhaustive handling via TypeScript discriminated union narrowing

---

## 3. DatasetStatus

**Location**: `src/app/core/models/dataset.model.ts`  
**Scope**: Used internally by `EducationDataService` to track load state per dataset key.

```ts
export type DatasetKey = 'records' | 'master' | 'summary';

export type DatasetLoadStatus = 'pending' | 'loaded' | 'failed';

export interface DatasetMeta {
  key: DatasetKey;
  status: DatasetLoadStatus;
  loadedAt?: number; // epoch ms, set when status transitions to 'loaded'
}
```

**Note**: `EducationDataService` caches the Observable result via `shareReplay(1)`. The `DatasetMeta` is an optional internal accounting structure and may be omitted in the initial implementation.

---

## 4. NavItem

**Location**: `src/app/core/models/nav-item.model.ts`  
**Scope**: Used by `ShellComponent` and `NavComponent` to render navigation links.

```ts
export interface NavItem {
  /** Translation key for the label (e.g. 'nav.overview') */
  labelKey: string;
  /** Angular router path segment (e.g. 'overview') */
  path: string;
  /** Lucide icon name, e.g. 'layout-dashboard' */
  icon: string;
}
```

**Defined statically** in `ShellComponent` or a config constant — not fetched from a service.

---

## 5. GlobalFilterState

**Location**: `src/app/shared/models/global-filter.model.ts`  
**Scope**: Shared across all feature pages. Managed by `GlobalFilterService`.

```ts
export type FilterDimension = 'year' | 'region' | 'stage' | 'gender';

export interface GlobalFilterState {
  /** Selected academic year, or null for "all years" */
  year: number | null;
  /** Selected region name, or null for "all regions" */
  region: string | null;
  /** Selected education stage, or null for "all stages" */
  stage: string | null;
  /** Selected gender, or null for "all genders" */
  gender: string | null;
}

export const DEFAULT_FILTER_STATE: GlobalFilterState = {
  year: null,
  region: null,
  stage: null,
  gender: null,
};

/**
 * Defines which filter dimensions are visible for a given feature route.
 * Used by ShellComponent to show/hide dropdowns in the global filter bar.
 */
export type FilterConfig = FilterDimension[];
```

**Relationships**:
- `GlobalFilterService` owns a `signal<GlobalFilterState>` initialized to `DEFAULT_FILTER_STATE`
- `FilterBarComponent` receives `FilterConfig` as input to determine which dropdowns to render
- Route changes update the active `FilterConfig` via `ROUTE_FILTER_CONFIG` constant

**State transitions**:
```
Default (all null) → user selects a dimension value → update signal + derived data re-evaluates
User navigates to another page → filter state preserved, visible dimensions change per route config
User clicks reset → all filter values return to null
```

---

## 6. Translation Keys (Contract)

**Location**: `public/i18n/ar.json` and `public/i18n/en.json`  
**Scope**: All UI strings for the foundation shell and shared state components.

Minimum required keys for this feature:

```json
{
  "nav": {
    "overview": "...",
    "trends": "...",
    "regional-analysis": "...",
    "gender-analysis": "...",
    "stage-analysis": "..."
  },
  "topbar": {
    "app-title": "...",
    "toggle-lang": "...",
    "toggle-theme": "..."
  },
  "state": {
    "loading": "...",
    "empty": "...",
    "empty-detail": "...",
    "error": "...",
    "error-detail": "...",
    "retry": "..."
  },
  "filter": {
    "year": "...",
    "region": "...",
    "stage": "...",
    "gender": "...",
    "all": "...",
    "reset": "..."
  }
}
```

---

## Entity Relationship Summary

```
UserPreferences (1) ──managed by──► PreferencesService (singleton)
                                         │
                                         ├──► sets document.documentElement[dir]
                                         ├──► sets document.documentElement.classList (theme)
                                         └──► calls TranslocoService.setActiveLang()

ViewState<T> (generic) ──used by──► every feature page container (signal<ViewState<T>>)
                                         │
                                         ├──► LoadingStateComponent
                                         ├──► EmptyStateComponent
                                         └──► ErrorStateComponent

NavItem[] ──rendered by──► NavComponent ──hosted by──► ShellComponent
DatasetKey ──loaded by──► EducationDataService (shareReplay cache)

GlobalFilterState (1) ──managed by──► GlobalFilterService (singleton)
                                          │
                                          ├──► FilterBarComponent (renders dropdowns)
                                          ├──► derives options from EducationDataService.getMaster()
                                          └──► consumed by feature page computed() signals

FilterConfig ──defined in──► ROUTE_FILTER_CONFIG ──read by──► ShellComponent (on route change)
```
