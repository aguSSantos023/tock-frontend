import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthUser } from '../services/auth-user';

export const authGuard: CanActivateFn = (route, state) => {
  const authUserService = inject(AuthUser);
  const router = inject(Router);

  if (authUserService.isAuthenticated()) return true;

  console.warn('Acceso denegado: No estás logueado');
  router.navigate(['/auth/login']);
  return false;
};
