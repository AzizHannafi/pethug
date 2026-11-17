import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PetsComponent } from './pets.component';
import { PetDetailComponent } from './pet-detail/pet-detail.component';
import { PetCreateComponent } from './pet-create/pet-create.component';

const routes: Routes = [
  { 
    path: '', 
    component: PetsComponent 
  },
  { 
    path: 'details/:id', 
    component: PetDetailComponent 
  }
  ,
  { 
    path: 'create', 
    component: PetCreateComponent 
  },
  { 
    path: 'edit/:id', 
    component: PetCreateComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PetsRoutingModule { }
