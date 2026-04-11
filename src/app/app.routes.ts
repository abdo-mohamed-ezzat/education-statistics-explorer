import { Routes } from '@angular/router';
import { filterResetGuard } from './core/guards/filter-reset.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  {
    path: 'overview',
    canActivate: [filterResetGuard],
    loadChildren: () => import('./features/overview/overview.routes').then((m) => m.overviewRoutes),
    data: { titleKey: 'overview.page-title' },
  },
  {
    path: 'trends',
    canActivate: [filterResetGuard],
    loadChildren: () => import('./features/trends/trends.routes').then((m) => m.trendsRoutes),
    data: { titleKey: 'trends.page-title' },
  },
  {
    path: 'regional-analysis',
    canActivate: [filterResetGuard],
    loadChildren: () =>
      import('./features/regional-analysis/regional-analysis.routes').then(
        (m) => m.regionalAnalysisRoutes,
      ),
    data: { titleKey: 'regional-analysis.page-title' },
  },
  { path: '**', redirectTo: 'overview' },
];
