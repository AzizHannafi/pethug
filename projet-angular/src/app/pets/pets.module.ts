import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PetsRoutingModule } from './pets-routing.module';
import { PetsComponent } from './pets.component';
import { PetDetailComponent } from './pet-detail/pet-detail.component';
import { FormsModule } from '@angular/forms';
import { PetCreateComponent } from './pet-create/pet-create.component';


@NgModule({
  declarations: [
    PetsComponent,
    PetDetailComponent,
    PetCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PetsRoutingModule
  ]
})
export class PetsModule { }
