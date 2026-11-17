import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KeycloackService } from './services/keycloack.service';
import { AppConfigService } from './services/app-config.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { httpTokenInterceptor } from './interceptor/http-token.interceptor';

/**
 * Runtime configuration must be read before Keycloak is initialised,
 * since the realm/client/url come from it.
 */
export function appInitFactory(configService: AppConfigService, kcService: KeycloackService) {
  return async () => {
    await configService.load();
    await kcService.init();
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule,

  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      deps: [AppConfigService, KeycloackService],
      useFactory: appInitFactory,
      multi: true
    },
    provideHttpClient(
      withInterceptors([httpTokenInterceptor]),
    ),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
