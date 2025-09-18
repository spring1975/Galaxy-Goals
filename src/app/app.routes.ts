import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('src/app/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
