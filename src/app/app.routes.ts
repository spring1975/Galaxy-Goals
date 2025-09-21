import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    children: [
      {
        path: '',
        loadComponent: () => import('src/app/pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'spellinglist/:id/edit',
        loadComponent: () => import('src/app/pages/home/home.component').then(m => m.HomeComponent)
      }
    ]
  },
  {
    path: 'practice',
    loadComponent: () => import('src/app/pages/practice/practice.component').then(m => m.PracticeComponent)
  },
  {
    path: 'export',
    loadComponent: () => import('src/app/pages/export/export.component').then(m => m.ExportComponent)
  },
  {
    path: 'import',
    loadComponent: () => import('src/app/pages/import/import.component').then(m => m.ImportComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
