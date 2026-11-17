import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { ReportsComponent } from './reports/reports.component';
import { PetsManagementComponent } from './pets-management/pets-management.component';
import { BlogsManagementComponent } from './blogs-management/blogs-management.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AdminComponent,
    ReportsComponent,
    PetsManagementComponent,
    BlogsManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
