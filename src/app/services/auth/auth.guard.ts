import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { LoginService } from './login.service';
import { map, take, tap } from 'rxjs';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  return loginService.userLoginOn.pipe(
    tap(isLoggedIn => {
      if (!isLoggedIn) {
        router.navigate(['login']); // Redirige si no está logueado
      }
    }),
    map(isLoggedIn => {
      return isLoggedIn; // Retorna el estado de isLoggedIn directamente
    })
  );
};
