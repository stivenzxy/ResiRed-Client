import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'


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

  constructor(private formBuilder : FormBuilder, private router: Router) { 
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')]]
    })
  }

  ngOnInit(): void {

  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  submitLoginData(){
    if(this.loginForm.valid){
      console.log('redirijir al servicio')
      this.router.navigateByUrl('/dashboard');
      this.loginForm.reset();
    } else {
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000, // Duración del toast en milisegundos
        timerProgressBar: true,
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingresa datos en el form',
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
