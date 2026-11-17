import { CanActivateFn, Router } from '@angular/router';
import { KeycloackService } from '../services/keycloack.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
    const tokenService = inject(KeycloackService);
  const router = inject(Router);
  if (tokenService.keycloak.isTokenExpired()) {
    router.navigate(['login']);
    return false;
  }
  return true;
};
