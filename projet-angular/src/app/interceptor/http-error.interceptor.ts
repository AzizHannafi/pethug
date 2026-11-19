import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { KeycloackService } from '../services/keycloack.service';

/** Turns the API method + path into something a human recognises. */
function describe(method: string, url: string): string {
  const path = url.split('?')[0];
  const isPet = path.includes('/api/pets');
  const isBlog = path.includes('/api/blogs');
  const isReport = path.includes('/api/reports');
  const isUser = path.includes('/api/users');

  if (path.includes('/status')) {
    return isReport ? 'handle this report' : 'approve or reject this post';
  }
  if (isReport && method === 'GET') return 'open the moderation queue';
  if (isUser) return 'open the user directory';

  const subject = isPet ? 'this pet listing' : isBlog ? 'this post' : 'this item';
  if (method === 'POST') return `create ${subject}`;
  if (method === 'PUT' || method === 'PATCH') return `edit ${subject}`;
  if (method === 'DELETE') return `delete ${subject}`;
  return `access ${subject}`;
}

/**
 * Explains API refusals instead of leaving a silent console error.
 * A 403 is the interesting one: the request was understood and the user is
 * properly signed in, they simply are not allowed to do that.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const keycloakService = inject(KeycloackService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (req.url.endsWith('config.json')) {
        return throwError(() => error);
      }

      const action = describe(req.method, req.url);

      switch (error.status) {
        case 0:
          notifications.error(
            'Server unreachable',
            'The API did not answer. Is it running on port 8086?'
          );
          break;

        case 401:
          notifications.error(
            'Session expired',
            'Please sign in again to continue.'
          );
          keycloakService.login();
          break;

        case 403:
          notifications.denied(
            `You cannot ${action}`,
            keycloakService.isAdmin
              ? 'The server refused this action.'
              : 'This is reserved for administrators, or for the person who published it. You can always manage your own content from "My space".'
          );
          break;

        case 404:
          notifications.error('Not found', 'This item no longer exists.');
          break;

        default:
          if (error.status >= 500) {
            notifications.error(
              'Server error',
              'Something went wrong on the API side. Please try again.'
            );
          }
      }

      return throwError(() => error);
    })
  );
};
