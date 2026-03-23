import { Routes } from '@angular/router';
export const routes: Routes = [
    { path: '', redirectTo: 'overview', pathMatch: 'full' },
    { path: 'overview', loadChildren: () => import('./features/overview/overview.routes').then(m => m.overviewRoutes) },
    { path: 'trends', loadChildren: () => import('./features/trends/trends.routes').then(m => m.trendsRoutes) },
    { path: 'regional-analysis', loadChildren: () => import('./features/regional-analysis/regional-analysis.routes').then(m => m.regionalAnalysisRoutes) },
    { path: '**', redirectTo: 'overview' }
];
