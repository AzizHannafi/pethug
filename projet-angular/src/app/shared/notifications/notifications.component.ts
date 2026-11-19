import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent {
  private readonly service = inject(NotificationService);

  readonly notifications = this.service.notifications;

  dismiss(id: number): void {
    this.service.dismiss(id);
  }
}
