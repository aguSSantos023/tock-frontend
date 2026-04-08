import { Routes } from '@angular/router';
import { LoginPage } from './pages/auth/login-page/login-page';
import { RegisterPage } from './pages/auth/register-page/register-page';
import { authGuard } from './guards/auth-guard';
import { VerifyPage } from './pages/auth/verify-page/verify-page';
import { guestGuard } from './guards/guest-guard';
import { verifyGuard } from './guards/verify-guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginPage,
        canActivate: [guestGuard],
      },
      {
        path: 'register',
        component: RegisterPage,
      },
      {
        path: 'verify-email',
        component: VerifyPage,
        canActivate: [verifyGuard],
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
