import { Component } from '@angular/core';
import { KeycloackService } from '../services/keycloack.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  
  searchTerm = '';

  constructor(public keyCloakService: KeycloackService) {}

  onSearch(): void {
    // this.searchChanged.emit(this.searchTerm);
  }


  logout(): void {
    this.keyCloakService.logout();
  }

  modifyDetails() {
    this.keyCloakService.keycloak.accountManagement()
  }
}
