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

  /** Keycloak id of the signed-in user. Matches ownerId / authorId from the API. */
  get userId(): string {
    return this.profile?.id || this.keycloak.subject || '';
  }

  get fullName(): string {
    const profile = this.profile;
    return [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')
      || profile?.username
      || 'Anonymous';
  }

  /**
   * Client roles carried by the token, the very same ones the API reads from
   * resource_access to decide what is allowed.
   */
  get roles(): string[] {
    const clientId = this.appConfig.keycloak.clientId;
    return this.keycloak.tokenParsed?.resource_access?.[clientId]?.roles ?? [];
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  /** Mirrors hasRole('client_admin') on the API side. */
  get isAdmin(): boolean {
    return this.hasRole('client_admin');
  }

  /** True when the signed-in user owns that piece of content. */
  owns(ownerId: string | undefined | null): boolean {
    return !!ownerId && ownerId === this.userId;
  }

  /** What the UI should offer: admins manage everything, authors their own. */
  canManage(ownerId: string | undefined | null): boolean {
    return this.isAdmin || this.owns(ownerId);
  }

  login() {
    return this.keycloak.login();
  }

  logout() {
    return this.keycloak.logout();
  }
}
