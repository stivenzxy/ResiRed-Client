import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import {catchError, map, of} from 'rxjs'
import { ManageAssembliesService } from './manage-assemblies.service';
import { Location } from '@angular/common';

export const protectedAssemblyGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
) => {
  const assemblyService = inject(ManageAssembliesService);
  const router = inject(Router)
  const location = inject(Location)

  return assemblyService.getScheduledAssembly().pipe(
    map(assembly => {
      if (assembly.isAvailable) {
        return true;
      } else {
        location.replaceState('');
        router.navigate(['..']);
        return false;
      }
    }),
    catchError((error) => {
      console.error('Error checking assembly availability', error);
      location.replaceState('');
      router.navigate(['..']);
      return of(false);
    })
  );
};
