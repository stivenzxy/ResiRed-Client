import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
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
import { UserDecodeToken } from '../../services/auth/userDecodeToken';
import { LoginService } from '../../services/auth/login.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatTooltipModule],
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
  interval: any;

  constructor(
    private fb: FormBuilder,
    private resetPasswordService: ResetPasswordService,
    private router: Router,
    private location: Location
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
    this.interval = setInterval(() => {
      this.remainingTime--;
      this.updateTimeDisplay();
      if (this.remainingTime <= 0) {
        clearInterval(this.interval);
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

  goBack() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.location.replaceState('');
    this.router.navigate(['..']); // Navega a la página anterior
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