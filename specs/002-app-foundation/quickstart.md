# Quickstart: Application Foundation (002-app-foundation)

**Phase 1 Output** | Generated: 2026-03-23

---

## What This Feature Delivers

The application foundation is the invisible backbone every feature page depends on. After implementing this feature, any future feature page can be built by:
1. Creating a `features/<name>/` folder with `pages/`, `ui/`, `data-access/`, `models/`
2. Adding a route to `app.routes.ts`
3. Calling `EducationDataService` from a facade
4. Using a `signal<ViewState<T>>` in the page component with the 4-state template pattern

---

## File Map

```
education-statistics/
└── src/
    ├── index.html                          ← Add FOUC-prevention inline script (theme + dir)
    ├── assets/
    │   ├── i18n/
    │   │   ├── ar.json                     ← Arabic translation strings (NEW)
    │   │   └── en.json                     ← English translation strings (NEW)
    │   └── datasets/
    │       ├── records.json                ← Placeholder (populated by later features)
    │       ├── master.json                 ← Placeholder
    │       └── summary.json                ← Placeholder
    └── app/
        ├── app.ts                          ← Simplified: only renders <app-shell>
        ├── app.html                        ← Replaced with just <app-shell />
        ├── app.config.ts                   ← Already configured; keep as-is
        ├── app.routes.ts                   ← Already configured; keep as-is
        ├── core/
        │   ├── models/
        │   │   ├── user-preferences.model.ts  ← Language, Direction, Theme, UserPreferences
        │   │   ├── dataset.model.ts            ← DatasetKey, DatasetLoadStatus
        │   │   └── nav-item.model.ts           ← NavItem
        │   ├── services/
        │   │   ├── preferences.service.ts      ← Signals, localStorage, DOM side-effects
        │   │   └── education-data.service.ts   ← HttpClient + shareReplay cache
        │   └── layout/
        │       ├── shell/
        │       │   └── shell.component.ts      ← App layout wrapper (smart)
        │       ├── topbar/
        │       │   └── topbar.component.ts     ← Header bar (dumb)
        │       └── nav/
        │           └── nav.component.ts        ← Sidebar/bottom nav (dumb)
        └── shared/
            ├── models/
            │   └── view-state.model.ts         ← ViewState<T> + factory helpers
            └── ui/
                ├── loading-state/
                │   └── loading-state.component.ts
                ├── empty-state/
                │   └── empty-state.component.ts
                └── error-state/
                    └── error-state.component.ts
```

---

## Implementation Order

Follow this order to avoid circular dependencies and broken builds at each step:

1. **Models first** (no dependencies)
   - `core/models/user-preferences.model.ts`
   - `core/models/nav-item.model.ts`
   - `core/models/dataset.model.ts`
   - `shared/models/view-state.model.ts`

2. **Services** (depend only on Angular + models)
   - `core/services/preferences.service.ts`
   - `core/services/education-data.service.ts`

3. **Translation files** (static JSON)
   - `assets/i18n/ar.json`
   - `assets/i18n/en.json`

4. **Shared state UI components** (depend on models, translate pipe)
   - `shared/ui/loading-state/`
   - `shared/ui/empty-state/`
   - `shared/ui/error-state/`

5. **Layout shell components** (depend on services, nav model, router)
   - `core/layout/topbar/topbar.component.ts`
   - `core/layout/nav/nav.component.ts`
   - `core/layout/shell/shell.component.ts`

6. **App root** (wires everything together)
   - Update `app.ts` + `app.html` to use `<app-shell>`
   - Add FOUC-prevention script to `index.html`

---

## Key Patterns to Follow

### PreferencesService signal pattern
```ts
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly translocoService = inject(TranslocoService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _language = signal<Language>(this.resolveInitialLang());
  private readonly _theme    = signal<Theme>(this.resolveInitialTheme());

  readonly language  = this._language.asReadonly();
  readonly theme     = this._theme.asReadonly();
  readonly direction = computed((): Direction => this._language() === 'ar' ? 'rtl' : 'ltr');

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const lang = this._language();
        const dir  = this.direction();
        const theme = this._theme();
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', dir);
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('lang', lang);
        localStorage.setItem('theme', theme);
      }
      this.translocoService.setActiveLang(this._language());
    });
  }
  // ...
}
```

### ViewState in a feature page
```ts
protected readonly state = signal<ViewState<OverviewViewModel>>(ViewStateLoading);

ngOnInit() {
  this.facade.getOverviewData()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next:  (vm) => this.state.set(vm ? viewStateData(vm) : ViewStateEmpty),
      error: (e)  => this.state.set(viewStateError('state.error')),
    });
}
```

### Template 4-state pattern
```html
@switch (state().status) {
  @case ('loading') { <app-loading-state /> }
  @case ('empty')   { <app-empty-state /> }
  @case ('error')   { <app-error-state [message]="state().message" (retry)="reload()" /> }
  @case ('data')    { <!-- feature content using state().data --> }
}
```

---

## Verification Checklist

After implementation, verify each requirement manually:

| Check | How |
|-------|-----|
| FR-001 Layout shell visible on all routes | Navigate to `/overview`, `/trends`, `/regional-analysis` |
| FR-002/003 Lang + theme toggles visible | Check topbar |
| FR-004 Language switch without reload | Toggle lang; verify all text updates immediately |
| FR-005 RTL layout on Arabic | Switch to Arabic; verify layout mirrors |
| FR-006 Preferences persisted | Set Arabic + dark; close and reopen tab |
| FR-007 Browser lang fallback | Clear localStorage; open app; verify uses browser lang |
| FR-008 No FOUC | Hard reload; check Network → Preserve log; no flash |
| FR-009 Data loaded through service | Check Network tab; only 1 request per dataset |
| FR-010 Cache works | Navigate between feature pages; no repeat fetches |
| FR-011–015 4 states work | Add `debugDelay` to service to see loading state; break URL to see error |
| FR-016 Mobile layout | Resize to 375px; check layout remains functional |
| FR-017 Keyboard accessibility | Tab through all nav + toggle controls |
| FR-018 No hardcoded strings | grep for any literal Arabic/English text in templates |

---

## Dependencies (Already Installed)

| Package | Purpose |
|---------|---------|
| `@jsverse/transloco` | Runtime i18n |
| `@jsverse/transloco-persist-lang` | localStorage lang persistence |
| `@jsverse/transloco-locale` | Locale formatting |
| `ngx-echarts` | Chart rendering (used in later features) |
| `lucide-angular` | Icon system |
| `@angular/common/http` | `HttpClient` for dataset loading |

No new packages need to be installed for this feature.
