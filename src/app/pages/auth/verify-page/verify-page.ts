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
  private authUserService = inject(AuthUser);
  private router = inject(Router);

  otpInputs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');
  isSubmitting = signal(false);
  errorMessage = signal('');
  resendTimer = signal(0); // 60 segundos de cooldown

  isCodeComplete(): boolean {
    return this.getCurrentCode().length === this.otpInputs().length;
  }

  onVerify() {
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authUserService.verifyEmail(this.getCurrentCode()).subscribe({
      next: () => this.router.navigate(['/songs']),
      error: (err) => {
        this.errorMessage.set(err.error.message || 'Código inválido');
        this.isSubmitting.set(false);
      },
    });
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

  onResend() {
    this.authUserService.resendCode().subscribe({
      next: () => {
        this.resendTimer.set(60);
        this.startTimer();
      },
      error: (err) => {
        this.errorMessage.set(
          err.error.message ||
            'Temporalmente no se puede enviar códigos, intente de nuevo más tarde.',
        );
      },
    });
  }

  onInput(event: any, index: number) {
    const val = event.target.value;

    // auto-submit
    if (this.isCodeComplete() && !this.isSubmitting()) {
      this.onVerify();
    }

    //Cambia al siguiente input al rellenarlo
    if (val && index < 3) {
      this.otpInputs()[index + 1].nativeElement.focus();
    }
  }

  onBackspace(index: number) {
    if (index > 0) {
      //el setTimeout permite que primero se elimine y despues se retroceda de input
      setTimeout(() => this.otpInputs()[index - 1].nativeElement.focus(), 0);
    }
  }

  onLogout() {
    this.authUserService.logout();
    this.router.navigate(['/auth/login']);
  }

  private startTimer() {
    const interval = setInterval(() => {
      this.resendTimer.update((v) => v - 1);

      if (this.resendTimer() <= 0) clearInterval(interval);
    }, 1000);
  }

  private getCurrentCode(): string {
    return this.otpInputs()
      .map((input) => input.nativeElement.value)
      .join('');
  }
}
