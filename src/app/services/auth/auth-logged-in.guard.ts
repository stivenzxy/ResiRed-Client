import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from './login.service';

export const authLoggedInGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  const isLoggedIn = loginService.currentUserLoginOn.value;
  console.log(isLoggedIn)
  
  if (isLoggedIn) {
    router.navigate(['dashboard'], {replaceUrl: true});
    return false; // Evita que se active la ruta de login
  }
  
  return true; // Permite activar la ruta si el usuario no está logueado
};