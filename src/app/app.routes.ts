import { Routes } from '@angular/router';
import { LoginPage } from './pages/auth/login-page/login-page';
import { RegisterPage } from './pages/auth/register-page/register-page';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginPage,
      },
      {
        path: 'register',
        component: RegisterPage,
      },
    ],
  },
  {
    path: 'songs',
    loadComponent: () => import('../app/pages/songs-page/songs-page').then((m) => m.SongsPage),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
