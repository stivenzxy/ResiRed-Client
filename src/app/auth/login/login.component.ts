import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'
import { LoginService } from '../../services/auth/login.service';
import { LoginRequest } from '../../services/auth/loginRequest';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  loginForm : FormGroup = new FormGroup('');

  hidePassword = true;

  constructor(private formBuilder : FormBuilder, private router: Router, private loginService : LoginService) { 
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {

  }

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

  rememberPassword(){
    
  }
}

