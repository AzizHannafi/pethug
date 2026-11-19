import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { KeycloackService } from '../services/keycloack.service';
import { NotificationService } from '../services/notification.service';

/**
 * Administration area. The API refuses these operations anyway; this guard is
 * there so a standard user is never shown a screen they cannot use.
 */
export const adminGuard: CanActivateFn = () => {
  const keycloakService = inject(KeycloackService);
  const notifications = inject(NotificationService);
  const router = inject(Router);

  if (keycloakService.isAdmin) {
    return true;
  }

  notifications.denied(
    'Administration area',
    'This section is reserved for administrators. Here is your own space instead.'
  );
  router.navigate(['/account']);
  return false;
};
