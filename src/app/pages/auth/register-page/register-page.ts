import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthUser } from '../../../services/auth-user';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthUser);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.registerForm.invalid) return;

    // Reset estado
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.registerForm.getRawValue();

    this.authService.register({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/songs']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error al registrar cuenta.');
        this.isSubmitting.set(false);
      },
    });
  }
}
