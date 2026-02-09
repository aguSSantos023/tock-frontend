import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthUser } from '../../../services/auth-user';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthUser);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['marisa@gmail.com', [Validators.required, Validators.email]],
    password: ['23483', [Validators.required]],
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    // Reset estado
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: () => {
        console.log('iniciado');

        this.router.navigate(['/songs']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Usuario o contraseña incorrectos.');
        this.isSubmitting.set(false);
      },
    });
  }
}
