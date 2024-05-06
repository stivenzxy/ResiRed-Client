import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { ResetPasswordService } from '../../services/auth/reset-password.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent implements OnInit {
  resetPasswordForm: FormGroup = new FormGroup('');
  message: string = '';
  messageClass: string = '';
  timerActive: boolean = false;
  remainingTime: number = 120; // 2 minutos
  timeDisplay: string = '';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private resetPasswordService: ResetPasswordService,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      token: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^[0-9]+$/),
      ]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/),
      ]),
    });
  }

  ngOnInit(): void {
    this.startRequestCodeTimer();
  }

  get token() {
    return this.resetPasswordForm.controls['token'];
  }

  get newPassword() {
    return this.resetPasswordForm.controls['newPassword'];
  }

  startRequestCodeTimer() {
    this.timerActive = true;
    this.remainingTime = 120;
    const interval = setInterval(() => {
      this.remainingTime--;
      this.updateTimeDisplay();
      if (this.remainingTime <= 0) {
        clearInterval(interval);
        this.timerActive = false;
        this.remainingTime = 120; // Reiniciar el contador
        this.timeDisplay = ''; // Limpiar el texto
      }
    }, 1000);
  }

  updateTimeDisplay() {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    this.timeDisplay = `Podrás solicitar un nuevo código dentro de: ${minutes} minuto(s) y ${seconds} segundo(s).`;
  }

  requestNewToken() {
    this.startRequestCodeTimer();
  }

  resetPassword() {
    if (this.resetPasswordForm.valid) {
      if (this.resetPasswordForm.valid) {
        const { token, newPassword } = this.resetPasswordForm.value;
        this.resetPasswordService.resetPassword(token, newPassword).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Completado!',
              text: `${response.message}, inicie sesión`,
            }).then(result => {
              if(result.isConfirmed) {
                this.router.navigate(['login'], {replaceUrl: true});
              }
            })
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `${error.error.message}`,
            });
          },
        });
      } else {
        this.resetPasswordForm.markAllAsTouched();
      }
    }
  }
}
