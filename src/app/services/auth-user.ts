import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment.development';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthUser {
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);
  private apiUrl = `${environment.apiUrl}/auth`;

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          this.cookieService.set('token', response.token, { path: '/' });
        } else {
          console.error(response.message);
        }
      }),
    );
  }

  register(userData: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        if (response.token) {
          this.cookieService.set('token', response.token, { path: '/' });
        } else {
          console.error(response.message);
        }
      }),
    );
  }

  logout() {
    this.cookieService.delete('token', '/');
  }

  getToken() {
    return this.cookieService.get('token');
  }

  isAuthenticated(): boolean {
    return this.cookieService.check('token');
  }
}
