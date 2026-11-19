import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { authGuard } from './guard/auth.guard';
import { adminGuard } from './guard/admin.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'pets',
    canActivate: [authGuard],
    loadChildren: () => import('./pets/pets.module').then(m => m.PetsModule)
  },
  {
    path: 'blogs',
    canActivate: [authGuard],
    loadChildren: () => import('./blogs/blogs.module').then(m => m.BlogsModule)
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule)
  },
  {
    // Everyone's own space: their listings, their posts, their reports.
    path: 'account',
    canActivate: [authGuard],
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule)
  },
  {
    // Administrators only. Standard users are sent to /account instead.
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
