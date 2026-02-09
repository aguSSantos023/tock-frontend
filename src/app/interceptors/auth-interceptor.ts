import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthUser } from '../services/auth-user';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authUserService = inject(AuthUser);
  const token = authUserService.getToken();

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(authReq);
  }

  return next(req);
};
