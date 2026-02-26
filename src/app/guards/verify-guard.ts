import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthUser } from '../services/auth-user';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const verifyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthUser);
  const router = inject(Router);

  return toObservable(authService.status).pipe(
    filter((status) => status !== 'checking'),
    take(1),
    map((status) => {
      if (status === 'unverified') return true;
      if (status === 'authenticated') return router.parseUrl('/songs');
      return router.parseUrl('/auth/login');
    }),
  );
};
