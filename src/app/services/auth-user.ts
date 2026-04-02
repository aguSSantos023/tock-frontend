import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest } from '../shared/interface/auth.interface';
import { AuthStatus } from '../shared/interface/auth-status.type';
import { OtpResponse } from '../shared/interface/otp-response.interface';
import { of, throwError } from 'rxjs';
import { UserData } from '../shared/interface/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthUser {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  #status = signal<AuthStatus>('checking');
  #userData = signal<UserData | null>(null);

  public status = this.#status.asReadonly();
  public userData = this.#userData.asReadonly();

  public userEmail = computed(() => this.#userData()?.email || null);

  public storagePercent = computed(() => {
    const data = this.userData();
    if (!data) return 0;

    const used = Number(data.storage_used);
    const limit = Number(data.storage_limit);

    if (limit === 0) return 0;

    const percent = (used / limit) * 100;
    return Math.min(percent, 100);
  });

  public storageStatusColor = computed(() => {
    const percent = this.storagePercent();
    if (percent >= 90) return '#ef4444'; // Rojo fuerte (text-red-500)
    if (percent >= 70) return '#f97316'; // Naranja (text-orange-500)
    return '#6366f1'; // Indigo (text-indigo-500)
  });

  constructor() {
    this.checkAuthStatus();
  }

  /**
   * Helper para centralizar la captura de errores
   */
  private handleError(err: any) {
    const message = err.error?.error || err.error?.message || 'Error inesperado en el servidor';

    if (err.status >= 500) {
      console.error('🔥 Error Crítico del Servidor:', message);
    }
    return throwError(() => message);
  }

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.#status.set(res.isVerified ? 'authenticated' : 'unverified');
        if (res.user) {
          this.#userData.set(res.user);
        }
      }),
      catchError(this.handleError),
    );
  }

  register(userData: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        this.#status.set('unverified');
        if (res.user) {
          this.#userData.set(res.user);
        }
      }),
      catchError(this.handleError),
    );
  }

  verifyEmail(code: string) {
    return this.http.post<OtpResponse>(`${this.apiUrl}/verify-otp`, { otpCode: code }).pipe(
      tap(() => this.#status.set('authenticated')),
      catchError(this.handleError),
    );
  }

  resendCode() {
    return this.http
      .post<OtpResponse>(`${this.apiUrl}/resend-otp`, {})
      .pipe(catchError(this.handleError));
  }

  checkAuthStatus(): void {
    // Definimos el tipo de respuesta esperado en el .post<...>
    this.http
      .post<{ status: AuthStatus; user?: UserData }>(`${this.apiUrl}/validate-token`, {})
      .pipe(
        catchError(() => {
          this.#status.set('unauthenticated');
          this.#userData.set(null);
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.#status.set(res.status);
          if (res.user) {
            this.#userData.set(res.user);
          }
        }
      });
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        this.#status.set('unauthenticated');
        window.location.reload();
      },
      error: () => {
        this.#status.set('unauthenticated');
        window.location.reload();
      },
    });
  }

  deleteAccount() {
    return this.http.delete(`${this.apiUrl}/delete-account`).pipe(
      tap(() => {
        this.#status.set('unauthenticated');
        this.#userData.set(null);
        window.location.reload();
      }),
      catchError(this.handleError),
    );
  }
}
