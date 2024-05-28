import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { LoginService } from '../../services/auth/login.service';
import { UserDecodeToken } from '../../services/auth/userDecodeToken';
import Swal from 'sweetalert2'
import { ResetPasswordService } from '../../services/auth/reset-password.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.css',
})
export class ProfileInfoComponent implements OnInit {
  user?:UserDecodeToken;

  constructor(private loginService : LoginService, private resetPasswordService: ResetPasswordService, private router: Router,
    private dialog: MatDialog
  ) {
    this.user = this.loginService.decodeToken();
  }

  ngOnInit() {}

  resetPassword() {
    const email = this.user!.email;
    Swal.fire({
      title: 'Enviando Correo...',
      text: 'Por favor espera mientras se envía el correo.',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: () => !Swal.isLoading(),
      willOpen: () => {
        Swal.showLoading(); // Mostrar el loader explícitamente
        this.resetPasswordService.requestResetPasswordCode(email).subscribe({
          next: (response) => {
            Swal.hideLoading(); // Ocultar el loader cuando la operación ha terminado
            Swal.fire('Correo Enviado Exitosamente!', `${response.message}`, 'success').then((result) => {
              console.log(response);
              if (result.isConfirmed) {
                this.dialog.closeAll();
                this.router.navigate(['resetPassword']);
              }
            });
          },
          error: (error) => {
            Swal.hideLoading(); // Ocultar el loader si hay un error
            Swal.fire('Error', error.error.message, 'error');
          }
        });
      }
    });
  }
}