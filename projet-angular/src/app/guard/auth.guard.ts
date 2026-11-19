import { CanActivateFn } from '@angular/router';
import { KeycloackService } from '../services/keycloack.service';
import { inject } from '@angular/core';

/** Signed in, with a token that is still valid. */
export const authGuard: CanActivateFn = () => {
  const keycloakService = inject(KeycloackService);

  if (keycloakService.keycloak.isTokenExpired()) {
    keycloakService.login();
    return false;
  }
  return true;
};
