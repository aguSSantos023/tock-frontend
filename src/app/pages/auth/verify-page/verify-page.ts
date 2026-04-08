import { Component, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { AuthUser } from '../../../services/auth-user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-page',
  imports: [],
  templateUrl: './verify-page.html',
  styleUrl: './verify-page.css',
})
export class VerifyPage {
  private authUser = inject(AuthUser);
  private router = inject(Router);

  otpInputs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');
  isSubmitting = signal(false);
  errorMessage = signal('');
  resendTimer = signal(0); // 60 segundos de cooldown

  isCodeComplete(): boolean {
    return this.getCurrentCode().length === this.otpInputs().length;
  }

  async onVerify() {
    if (!this.isCodeComplete() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      await this.authUser.verifyEmail(this.getCurrentCode());
      this.router.navigate(['/songs']);
    } catch (err: any) {
      const msg = err || 'Código inválido o error de red';
      this.errorMessage.set(msg);

      this.otpInputs().forEach((input) => (input.nativeElement.value = ''));
      this.otpInputs()[0].nativeElement.focus();

      this.isSubmitting.set(false);
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text').slice(0, 4).toUpperCase() || '';
    const inputs = this.otpInputs(); // Los inputs para introducir el codigo

    pasteData.split('').forEach((char, i) => {
      if (inputs[i]) {
        inputs[i].nativeElement.value = char;
      }
    });

    // Poner el foco en el último input llenado
    const lastIndex = Math.min(pasteData.length, 3);
    inputs[lastIndex].nativeElement.focus();
  }

  async onResend() {
    try {
      await this.authUser.resendCode();

      this.resendTimer.set(60);
      this.startTimer();
    } catch (err: any) {
      this.errorMessage.set(
        err.error.message ||
          'Temporalmente no se puede enviar códigos, intente de nuevo más tarde.',
      );
    }
  }

  onInput(event: any, index: number) {
    const val = event.target.value;

    // Mover el foco al siguiente input
    if (val && index < 3) {
      this.otpInputs()[index + 1].nativeElement.focus();
    }

    // Auto-submit
    if (this.isCodeComplete() && !this.isSubmitting()) {
      this.onVerify();
    }
  }

  onBackspace(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.otpInputs()[index - 1].nativeElement.focus();
    }
  }

  async onLogout() {
    try {
      await this.authUser.logout();
      this.router.navigate(['/auth/login']);
    } catch (err) {
      this.errorMessage.set('Error al cerrar la Sesión');
    }
  }

  private startTimer() {
    const interval = setInterval(() => {
      this.resendTimer.update((v) => v - 1);

      if (this.resendTimer() <= 0) clearInterval(interval);
    }, 1000);
  }

  private getCurrentCode(): string {
    return this.otpInputs()
      .map((input) => input.nativeElement.value.toUpperCase())
      .join('');
  }
}
