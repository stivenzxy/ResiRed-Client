import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import Swal from 'sweetalert2'
import { LoginService } from '../../services/auth/login.service';
import { LoginRequest } from '../../services/auth/loginRequest';
import { ResetPasswordService } from '../../services/auth/reset-password.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  loginForm : FormGroup = new FormGroup('');
  hidePassword = true;

  constructor(private formBuilder : FormBuilder, private router: Router, private loginService : LoginService,
    private resetPasswordService: ResetPasswordService
  ) { 
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    })
  }

  ngOnInit(): void { }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  get email(){
    return this.loginForm.controls['email'];
  }

  get password(){
    return this.loginForm.controls['password'];
  }

  submitLoginData(){
    if(this.loginForm.valid){
      console.log('redirijir al servicio')
      this.loginService.login(this.loginForm.value as LoginRequest).subscribe({
        next: (userData) => {
          console.log(userData);
        },
        error: (errorData) => {
          console.error(errorData);
          Swal.fire({
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            icon: 'error',
            title: 'Oops...',
            text: errorData.message,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
        },
        complete: () => {
          console.info("Login completo");
          //this.loginForm.reset();
        }
      })
    } else {
      this.loginForm.markAllAsTouched();

      Swal.fire({
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000, // Duración del toast en milisegundos
        timerProgressBar: true,
        icon: 'error',
        title: 'Correo o contraseña incorrectos',
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })
    }
  }

  sendEmailAndRequestCode() {
    Swal.fire({
      title: 'Ingrese su correo electrónico',
      input: 'email',
      inputPlaceholder: 'su@correo.com',
      showCancelButton: true,
      confirmButtonColor: '#388261',
      confirmButtonText: 'Enviar',
      showLoaderOnConfirm: true, // Activar el loader cuando se envia el email
      preConfirm: (email) => {
        Swal.showLoading(); // Mostrar el loader explícitamente
        return new Promise((resolve, reject) => {
          this.resetPasswordService.requestResetPasswordCode(email).subscribe({
            next: (response) => {
              Swal.hideLoading(); // Ocultar el loader cuando la operación ha terminado
              resolve(response);
            },
            error: (error) => {
              Swal.hideLoading(); // Ocultar el loader si hay un error
              reject(new Error(error.error.message));
            }
          });
        }).then((response: any) => {
          Swal.fire('Correo Enviado Exitosamente!', `${response.message}`, 'success').then((result) => {
            console.log(response);
            if (result.isConfirmed) {
              this.router.navigate(['resetPassword']);
            }
          });
        }).catch(error => {
          Swal.fire('Error', error.message, 'error');
        });
      },
      allowOutsideClick: () => !Swal.isLoading() // No permitir clics fuera mientras carga
    });
  }  
  
}