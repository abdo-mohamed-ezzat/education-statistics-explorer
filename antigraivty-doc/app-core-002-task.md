# Task: Application Foundation Implementation

Track progress for the 002-app-foundation feature implementation.

## Phase 1: Setup (Shared Infrastructure)
- [x] Move `.git` repo to the project folder
- [ ] `[/]` T001 Verify existing dummy dataset files contain valid JSON data
- [ ] `[ ]` T002 Create Arabic translation file `ar.json`
- [ ] `[ ]` T003 Create English translation file `en.json`

## Phase 2: Foundational (Blocking Prerequisites)
- [ ] `[ ]` T004 Create `UserPreferences` model
- [ ] `[ ]` T005 Create `NavItem` interface
- [ ] `[ ]` T006 Create `DatasetKey` and `DatasetLoadStatus` types
- [ ] `[ ]` T007 Create `ViewState<T>` discriminated union
- [ ] `[ ]` T008 Implement `PreferencesService`
- [ ] `[ ]` T009 Implement `EducationDataService`

## Phase 3: User Story 1 — Consistent App Shell (MVP)
- [ ] `[ ]` T010 Implement `TopbarComponent`
- [ ] `[ ]` T011 Implement `NavComponent`
- [ ] `[ ]` T012 Implement `ShellComponent`
- [ ] `[ ]` T013 Simplify `AppComponent` to only render `<app-shell>`
- [ ] `[ ]` T014 Add FOUC-prevention inline `<script>` to `index.html`

## Phase 4: User Story 2 — Language and Direction Switching
- [ ] `[ ]` T015 Verify `TranslocoService.setActiveLang()`
- [ ] `[ ]` T016 Ensure `transloco` pipe used securely
- [ ] `[ ]` T017 Add Arabic UI translation values
- [ ] `[ ]` T018 Add English UI translation values
- [ ] `[ ]` T019 Verify `dir` attribute is applied to `<html>`

## Phase 5: User Story 3 — Theme Toggle
- [ ] `[ ]` T020 Verify `themes.css` dark mode pivot
- [ ] `[ ]` T021 Verify `PreferencesService` updates `.dark`
- [ ] `[ ]` T022 Implement toggle logic in `TopbarComponent`

## Phase 6: User Story 4 — Data Loads Cleanly
- [ ] `[ ]` T023 Implement `LoadingStateComponent`
- [ ] `[ ]` T024 Implement `EmptyStateComponent`
- [ ] `[ ]` T025 Implement `ErrorStateComponent`
- [ ] `[ ]` T026 Add `state.*` to Arabic translations
- [ ] `[ ]` T027 Add `state.*` to English translations
- [ ] `[ ]` T028 Wire `ViewState<T>` pattern into overview stub

## Phase 6.5: User Story 5 — Global Filters
- [ ] `[ ]` T034 Create `GlobalFilterState` interface
- [ ] `[ ]` T035 Implement `GlobalFilterService`
- [ ] `[ ]` T036 Implement `FilterBarComponent`
- [ ] `[ ]` T037 Define route filter configurations
- [ ] `[ ]` T038 Integrate `FilterBarComponent` into `ShellComponent`
- [ ] `[ ]` T039 Add `filter.*` translations
- [ ] `[ ]` T040 Wire `GlobalFilterService` filter state into overview page

## Phase 8: Polish & Audit
- [ ] `[ ]` T029 Audit for hardcoded strings
- [ ] `[ ]` T030 Verify keyboard accessibility
- [ ] `[ ]` T031 Verify mobile layout
- [ ] `[ ]` T032 Verify RTL layout
- [ ] `[ ]` T033 Run quickstart.md verification checklist
