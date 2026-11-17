import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { ReportsComponent } from './reports/reports.component';
import { PetsManagementComponent } from './pets-management/pets-management.component';
import { BlogsManagementComponent } from './blogs-management/blogs-management.component';

const routes: Routes = [
  { 
    path: '', 
    component: AdminComponent 
  },
  {
    path: 'pets',
    component: PetsManagementComponent
  },
  {
    path: 'blogs',
    component: BlogsManagementComponent
  },
  {
    path: 'reports',
    component: ReportsComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
