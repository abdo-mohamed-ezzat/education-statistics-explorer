# Implementation Plan: Application Foundation

**Branch**: `002-app-foundation` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-app-foundation/spec.md`

---

## Summary

Build the structural and behavioral backbone of the Education Statistics Explorer: a reusable main layout shell (topbar + sidenav + router outlet), a singleton `PreferencesService` that manages language/direction/theme via Angular signals and persists to localStorage, bilingual support (Arabic/English) via Transloco, a single-responsibility `EducationDataService` that loads JSON datasets with session caching, a generic `ViewState<T>` discriminated union shared by all feature pages, and three shared UI state components (loading, empty, error) built on the `ds-state-panel` design system class.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Angular 20+ (standalone, signals)  
**Primary Dependencies**: Transloco, `ngx-echarts`, `lucide-angular`, Angular HttpClient  
**Storage**: `localStorage` (user preferences only; session-scoped via in-memory for SSR/private browse)  
**Testing**: Jasmine + Karma (Angular default scaffold)  
**Target Platform**: Browser SPA (Angular SSR scaffold is present but app is effectively CSR for this project)  
**Project Type**: Web dashboard (single-page application)  
**Performance Goals**: Language/theme switch ≤ 2s (SC-001/SC-002); each dataset fetched at most once per session (SC-005)  
**Constraints**: No backend; no authentication; datasets ≤ memory budget; localStorage may be unavailable (FR-007 fallback)  
**Scale/Scope**: 5 feature pages; 2 languages; 3 datasets; 1 shared state model

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Gate | Principle | Status | Evidence |
|------|-----------|--------|---------|
| Architecture | I. Feature-First Angular Architecture | ✅ PASS | Core layout lives in `core/layout/`; shared state in `shared/models/` + `shared/ui/`; no NgModules; smart/dumb split clear |
| Design System | II. Design System Supremacy | ✅ PASS | State components use `ds-state-panel`; shell uses `ds-shell`, `ds-glassbar`; no hardcoded hex colors; chart tokens not touched by this feature |
| Data Flow | III. Clean Data Flow | ✅ PASS | JSON loading centralized in `EducationDataService`; `OnPush` required on all components; signals drive preferences; no business logic in shell |
| RTL + Mobile | IV. RTL-Safe, Mobile-First UI | ✅ PASS | `dir` set on `<html>` from preferences; layout built mobile-first; `ds-shell` is RTL-safe; FOUC prevented via inline script |
| Page States | V. Explicit Page States | ✅ PASS | `ViewState<T>` discriminated union + 3 shared state components defined; usage contract in `contracts/service-contracts.md` |

No violations. Complexity Tracking table not required.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-app-foundation/
├── plan.md              ← This file
├── research.md          ← Phase 0 output (technology decisions + best practices)
├── data-model.md        ← Phase 1 output (entities + TypeScript interfaces)
├── quickstart.md        ← Phase 1 output (file map + implementation order + verification)
├── contracts/
│   └── service-contracts.md  ← Phase 1 output (service APIs + component contracts)
└── tasks.md             ← Phase 2 output (NOT created by /speckit-plan; run /speckit-tasks)
```

### Source Code (repository)

```text
education-statistics/
└── src/
    ├── index.html                              ← Modified: FOUC-prevention inline script
    ├── assets/
    │   ├── i18n/
    │   │   ├── ar.json                         ← NEW: Arabic UI strings
    │   │   └── en.json                         ← NEW: English UI strings
    │   └── datasets/
    │       ├── records.json                    ← NEW: placeholder (populated later)
    │       ├── master.json                     ← NEW: placeholder
    │       └── summary.json                    ← NEW: placeholder
    └── app/
        ├── app.ts                              ← Modified: render <app-shell> only
        ├── app.html                            ← Replaced: just <app-shell />
        ├── app.config.ts                       ← Unchanged (already configured)
        ├── app.routes.ts                       ← Unchanged (already configured)
        ├── core/
        │   ├── models/
        │   │   ├── user-preferences.model.ts   ← NEW
        │   │   ├── dataset.model.ts            ← NEW
        │   │   └── nav-item.model.ts           ← NEW
        │   ├── services/
        │   │   ├── preferences.service.ts      ← NEW (signals + effects + localStorage)
        │   │   └── education-data.service.ts   ← NEW (HttpClient + shareReplay cache)
        │   └── layout/
        │       ├── shell/
        │       │   └── shell.component.ts      ← NEW (smart container)
        │       ├── topbar/
        │       │   └── topbar.component.ts     ← NEW (dumb: lang+theme toggle)
        │       └── nav/
        │           └── nav.component.ts        ← NEW (dumb: nav links)
        └── shared/
            ├── models/
            │   └── view-state.model.ts         ← NEW (ViewState<T> + factory helpers)
            └── ui/
                ├── loading-state/
                │   └── loading-state.component.ts  ← NEW
                ├── empty-state/
                │   └── empty-state.component.ts    ← NEW
                └── error-state/
                    └── error-state.component.ts    ← NEW
```

**Structure Decision**: Angular feature-first SPA (Option 1 variant). Single project under `education-statistics/`. All source files live under `src/app/` following the `core/` / `shared/` / `features/` split mandated by the constitution.

---

## Complexity Tracking

> No constitution violations. Table not required.
