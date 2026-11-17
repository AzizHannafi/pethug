import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogsComponent } from './blogs.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { BlogCreateComponent } from './blog-create/blog-create.component';

const routes: Routes = [
  { 
    path: '', 
    component: BlogsComponent 
  },
    { 
      path: 'details/:id', 
      component: BlogDetailComponent 
    },
    { 
      path: 'create', 
      component: BlogCreateComponent 
    },
    { 
      path: 'edit/:id', 
      component: BlogCreateComponent 
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogsRoutingModule { }
