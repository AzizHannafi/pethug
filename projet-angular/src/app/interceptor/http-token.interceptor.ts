import { HttpInterceptorFn } from '@angular/common/http';
import { KeycloackService } from '../services/keycloack.service';
import { inject } from '@angular/core';

export const httpTokenInterceptor: HttpInterceptorFn = (req, next) => {

  // config.json is fetched before Keycloak is ready and needs no token.
  if (req.url.endsWith('config.json')) {
    return next(req);
  }

  const keycloakService = inject(KeycloackService);

  const token = keycloakService.keycloak.token;

  if (token) {
    // setHeaders keeps the headers Angular adds (Content-Type, ...) instead of replacing them.
    return next(req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }));
  }

  return next(req);
};
