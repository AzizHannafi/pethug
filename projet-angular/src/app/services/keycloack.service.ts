import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { UserProfile } from './user-profile';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class KeycloackService {

  private readonly appConfig = inject(AppConfigService);

  private _keycloak: Keycloak | undefined;

  get keycloak() {
    if (!this._keycloak) {
      const { url, realm, clientId } = this.appConfig.keycloak;
      this._keycloak = new Keycloak({ url, realm, clientId });
    }
    return this._keycloak;
  }

  private _profile: UserProfile | undefined;

  get profile(): UserProfile | undefined {
    return this._profile;
  }

  async init() {
    const authenticated = await this.keycloak.init({
      onLoad: 'login-required',
    });

    if (authenticated) {
      this._profile = (await this.keycloak.loadUserProfile()) as UserProfile;
      this._profile.token = this.keycloak.token || '';
      // loadUserProfile() does not always carry the id: fall back to the token subject.
      if (!this._profile.id) {
        this._profile.id = this.keycloak.subject || '';
      }
    }
  }

  login() {
    return this.keycloak.login();
  }

  logout() {
    return this.keycloak.logout();
  }
}
