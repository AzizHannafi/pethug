import { Component } from '@angular/core';
import { KeycloackService } from '../services/keycloack.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(public keyCloakService: KeycloackService) {}

  /** Two letters for the avatar, rather than a stock photo of a stranger. */
  get initials(): string {
    const profile = this.keyCloakService.profile;
    const letters = [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .map(part => part!.charAt(0));
    if (letters.length) {
      return letters.join('').toUpperCase();
    }
    return (profile?.username ?? '?').charAt(0).toUpperCase();
  }

  logout(): void {
    this.keyCloakService.logout();
  }

  modifyDetails(): void {
    this.keyCloakService.keycloak.accountManagement();
  }
}
