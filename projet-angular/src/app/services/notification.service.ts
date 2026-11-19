import { Injectable, signal } from '@angular/core';

export type NotificationKind = 'success' | 'error' | 'denied' | 'info';

export interface Notification {
  id: number;
  kind: NotificationKind;
  title: string;
  message?: string;
}

/**
 * Small toast queue. Used by the HTTP interceptor to explain refusals coming
 * from the API, and by the screens to confirm what just happened.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {

  /** Read by the toast component. */
  readonly notifications = signal<Notification[]>([]);

  private nextId = 1;

  private push(kind: NotificationKind, title: string, message?: string, timeout = 6000): void {
    const notification: Notification = { id: this.nextId++, kind, title, message };
    this.notifications.update(list => [...list, notification]);
    setTimeout(() => this.dismiss(notification.id), timeout);
  }

  success(title: string, message?: string): void {
    this.push('success', title, message, 4000);
  }

  error(title: string, message?: string): void {
    this.push('error', title, message);
  }

  /** A 403: the action exists, but this account may not perform it. */
  denied(title: string, message?: string): void {
    this.push('denied', title, message, 8000);
  }

  info(title: string, message?: string): void {
    this.push('info', title, message);
  }

  dismiss(id: number): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }
}
