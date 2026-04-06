import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  {
    path: 'overview',
    loadChildren: () => import('./features/overview/overview.routes').then((m) => m.overviewRoutes),
    data: { titleKey: 'overview.page-title' },
  },
  {
    path: 'trends',
    loadChildren: () => import('./features/trends/trends.routes').then((m) => m.trendsRoutes),
    data: { titleKey: 'trends.page-title' },
  },
  {
    path: 'regional-analysis',
    loadChildren: () =>
      import('./features/regional-analysis/regional-analysis.routes').then(
        (m) => m.regionalAnalysisRoutes,
      ),
    data: { titleKey: 'regional-analysis.page-title' },
  },
  { path: '**', redirectTo: 'overview' },
];
