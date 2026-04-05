import { Routes } from "@angular/router";

export const trendsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/trends-page.component').then((m) => m.TrendsPageComponent),
  },
]