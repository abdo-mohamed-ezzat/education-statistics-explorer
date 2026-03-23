# Research: Application Foundation (002-app-foundation)

**Phase 0 Output** | Generated: 2026-03-23

---

## Research Summary

All technical choices for this feature are **fixed by the project constitution**. No technology is uncertain. This document records the rationale for each decision and any patterns / best-practices that must guide implementation.

---

## Decision Log

### 1. Framework & Language

**Decision**: Angular (v20+, standalone components) with TypeScript strict mode  
**Rationale**: Mandated by constitution. Angular's signals API (introduced in v17) provides fine-grained reactivity without RxJS boilerplate for simple state machines. Standalone components eliminate NgModule overhead and make lazy loading trivially declarative.  
**Alternatives considered**: React, Vue — rejected; project is explicitly Angular-only.

---

### 2. State Management (User Preferences + Feature View State)

**Decision**: Angular signals (`signal()`, `computed()`, `effect()`) for all reactive state; no external state library.  
**Rationale**:
- User preferences (lang, dir, theme) are a small, cross-cutting concern. A singleton `core/services/preferences.service.ts` with signals is the right scope — simple to read, no boilerplate, SSR-compatible via Angular's `PLATFORM_ID` guard for `localStorage`.
- The 4-state feature model (`loading | empty | data<T> | error`) is a discriminated union. Representing it as a signal of type `ViewState<T>` inside each page's container component is idiomatic Angular signals usage.
- `computed()` is used to derive display flags (e.g. `isLoading`, `hasError`) from the raw `ViewState<T>` signal.

**Best Practices**:
- Use `effect()` (with `allowSignalWrites: false` by default) only for side-effects such as writing to `localStorage`.
- Never call `mutate()` on signals (deprecated); always use `.set()` or `.update()`.
- Inject services with `inject()` in the body of the class, not in the constructor.

**Alternatives considered**: NgRx, Akita — rejected as over-engineered for a 5-feature dashboard with no complex async workflows.

---

### 3. Translation (Bilingual Arabic / English + RTL)

**Decision**: Transloco with `provideTranslocoPersistLang` (localStorage), `provideTranslocoLocale`, and runtime `reRenderOnLangChange: true`.  
**Rationale**: Already configured in `app.config.ts`. Transloco natively supports structural directives (`*transloco`), the `TranslocoService`, and lazy language file loading via HTTP. It ships a `PersistLangPlugin` that restores the active language from `localStorage` on cold start — satisfying FR-006, FR-007, and FR-008 without custom code.

**Translation file location**: `src/assets/i18n/ar.json` and `src/assets/i18n/en.json`.

**RTL strategy**:
- The `dir` attribute on `<html>` must be set synchronously (before first paint) to avoid a flash: managed by the `PreferencesService` using an `effect()` that calls `document.documentElement.setAttribute('dir', ...)`.
- All layout uses logical CSS properties (inline-start/end, block-start/end) and flex/grid that mirror naturally — no hard left/right alignment in component CSS.

**Best Practices**:
- Expose `TranslocoService.langChanges$` as a signal via `toSignal()` if reactive language metadata is needed inside templates.
- Keep translation keys flat-namespaced: `nav.overview`, `state.loading`, `state.error`, etc.

**Alternatives considered**: ngx-translate — rejected; Transloco is already installed and is the constitution choice.

---

### 4. Theme Toggling (Light / Dark)

**Decision**: CSS class-based theming on the `<html>` element — add/remove `.dark` class; CSS variables pivot in `themes.css`.  
**Rationale**: The design system in `src/styles/themes.css` already drives the theme through CSS custom properties. Toggling a class on the root element is the lowest-overhead, flash-free approach — no Angular CDK overlay theming needed. The `PreferencesService` effect writes both `localStorage` and mutates `document.documentElement.classList`.

**Flash prevention (FR-008)**: A tiny inline `<script>` injected into `index.html` `<head>` reads `localStorage` and applies the theme class before Angular bootstraps. This eliminates the FOUC.

**Alternatives considered**: Angular Material theming — not used in this project; Tailwind `dark:` variant — Tailwind v4 requires `darkMode: 'class'` to be set in `tailwind.config`. The existing design system is CSS-variable based, so the inline-script + class toggle approach is used.

---

### 5. Data Access Layer (Education Data Service)

**Decision**: A single `EducationDataService` in `core/services/` that uses Angular's `HttpClient` with `shareReplay(1)` (or a signal-based cache) to load JSON datasets from `src/assets/datasets/`.  
**Rationale**:
- FR-009 and FR-010 require a single access layer and session-level caching.
- Using `HttpClient` (with `withFetch()`) and caching the `Observable` with `shareReplay(1)` ensures each dataset file is fetched at most once. The subscription model lets multiple feature pages subscribe with zero additional HTTP calls.
- The service returns typed Observables; feature facades pipe the data into specific view models.

**Dataset files** (to be confirmed when feature pages are built):
- `records.json` — full record set
- `master.json` — metadata / dimension tables
- `summary.json` — pre-aggregated KPI values

**Best Practices**:
- Cache at the Observable level: `private readonly records$ = this.http.get<EducationRecord[]>('/assets/datasets/records.json').pipe(shareReplay(1))`.
- Expose public getter methods; do not expose the cached Observable directly.
- Return typed arrays with strong interfaces — no `any[]`.

**Alternatives considered**: Storing datasets in a NgRx store — rejected (over-engineered); reading JSON files with `import` — rejected (not compatible with `HttpClient` interceptors or future API migration).

---

### 6. Layout Shell

**Decision**: A `ShellComponent` in `core/` that wraps `<router-outlet>` and renders the topbar and sidenav.  
**Rationale**:
- The spec requires a consistent layout on every page (FR-001). A shell component at the app root is the standard Angular pattern.
- The shell is a smart component (it reads from `PreferencesService` and `TranslocoService`), but it passes only display data to child presentational components (topbar pills, nav links).
- The `app.ts` root component simply hosts `<app-shell>` + `<router-outlet>` inside.

**Layout structure**:
```
AppComponent (root, minimal)
  └── ShellComponent (core/layout/shell/)
        ├── TopbarComponent (core/layout/topbar/) ← lang toggle, theme toggle, app title
        ├── NavComponent (core/layout/nav/)        ← sidebar/bottom navigation
        └── <router-outlet>                        ← feature pages render here
```

---

### 7. Shared State Components (Loading / Empty / Error)

**Decision**: Three presentational components in `shared/ui/`:
- `LoadingStateComponent` — animated skeleton/spinner
- `EmptyStateComponent` — friendly icon + translated message
- `ErrorStateComponent` — caution icon + translated message + optional retry

**Rationale**: FR-015 requires reusability with no duplication. Three focused components, each receiving a `message` input (from translation), satisfy the open/closed principle: extending the visual detail of an empty state should not require touching the container logic.

**Design**: Uses `ds-state-panel` semantic class from the design system. Icons from Lucide Angular. Messages via Transloco `translocoRead` pipe.

---

### 8. Feature ViewState Model

**Decision**: Typed discriminated union defined once in `shared/models/view-state.model.ts`.

```ts
export type ViewState<T> =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'data'; data: T }
  | { status: 'error'; message: string };
```

**Rationale**: A discriminated union enforces exhaustive handling — the compiler catches any missing state branch. `T` is generic so every feature page can parameterize the data payload type.

**Alternatives considered**: Boolean flags (`isLoading`, `hasError`) — rejected; easy to get into invalid combinations like `isLoading = true && hasError = true`.

---

### 9. Testing Strategy

**Decision**: Unit tests with Angular's built-in `TestBed` + Jasmine/Karma (default Angular setup). No additional testing framework introduced.  
**Rationale**: Constitution does not mandate a specific testing library; the project scaffold uses Karma. Services and pure utility functions are the highest-value test targets for this feature.

**What to test**:
- `PreferencesService`: preference defaults, preference persistence, `localStorage` unavailability fallback.
- `EducationDataService`: caching behaviour (single HTTP call for repeated subscriptions).
- Shell / topbar: language toggle triggers a `TranslocoService.setActiveLang` call; theme toggle updates `document.documentElement.classList`.

---

## Resolved Unknowns

| Unknown | Resolution |
|---------|-----------|
| Theme toggle mechanism | CSS class on `<html>` + inline `<script>` in `index.html` for FOUC prevention |
| Caching strategy | `shareReplay(1)` on `HttpClient` observables in `EducationDataService` |
| Preference persistence | `PreferencesService` + Transloco PersistLang plugin (localStorage) |
| RTL implementation | `direction` CSS property on `<html>` set via `effect()` in `PreferencesService` |
| 4-state model shape | Discriminated union `ViewState<T>` in `shared/models/` |
| Translation file location | `src/assets/i18n/ar.json` + `en.json` |
| Layout shell location | `src/app/core/layout/shell/` |
| Shared state components location | `src/app/shared/ui/` |
