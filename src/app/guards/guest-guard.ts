import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthUser } from '../services/auth-user';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
  const authUserService = inject(AuthUser);
  const router = inject(Router);

  return toObservable(authUserService.status).pipe(
    filter((status) => status !== 'checking'), // Espera a que la API responda
    take(1),
    map((status) => {
      if (status === 'authenticated') return router.parseUrl('/songs');
      if (status === 'unverified') return router.parseUrl('/auth/verify-email');
      return true;
    }),
  );
};
