import { Injectable } from '@angular/core';

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

export interface AppConfig {
  /** Base URL of the REST API. Relative by default: the front-end proxies /api. */
  apiUrl: string;
  keycloak: KeycloakConfig;
}

/** Used when config.json is missing or unreadable, so the app still boots. */
const DEFAULT_CONFIG: AppConfig = {
  apiUrl: '/api',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'pet',
    clientId: 'pet-hug-front'
  }
};

/**
 * Runtime configuration, read from /config.json at startup.
 * Keeping it out of the bundle means the same build runs anywhere:
 * edit config.json, reload, done - no rebuild.
 */
@Injectable({ providedIn: 'root' })
export class AppConfigService {

  private config: AppConfig = DEFAULT_CONFIG;

  async load(): Promise<void> {
    try {
      const response = await fetch('config.json', { cache: 'no-cache' });
      if (response.ok) {
        const loaded = await response.json();
        this.config = {
          ...DEFAULT_CONFIG,
          ...loaded,
          keycloak: { ...DEFAULT_CONFIG.keycloak, ...(loaded?.keycloak ?? {}) }
        };
      }
    } catch {
      // Keep the defaults: a missing config.json must not break the app.
      console.warn('config.json not found, falling back to default configuration');
    }
  }

  /** API base URL without a trailing slash. */
  get apiUrl(): string {
    return this.config.apiUrl.replace(/\/+$/, '');
  }

  get keycloak(): KeycloakConfig {
    return this.config.keycloak;
  }
}
