import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { LoginService } from './login.service';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  console.log('AuthGuard is running');
  const loginService = inject(LoginService);
  const router = inject(Router);

  const accessToken = loginService.currentUserData.value;
  //console.log(accessToken);
  if (!accessToken) {
    router.navigate(['login']).then(() => {
      guardAlert();
    });
    return false;
  }
  return true;

  function guardAlert() {
    try {
      Swal.fire({
        title: 'Acceso Denegado!',
        text: 'Debes estar logueado en la aplicación',
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Aceptar',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload()
        }
      });
    } catch (error) {
      console.log('The process failed with error: ' + error);
    }
  }
};