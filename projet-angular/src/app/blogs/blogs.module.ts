import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogsRoutingModule } from './blogs-routing.module';
import { BlogsComponent } from './blogs.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { FormsModule } from '@angular/forms';
import { BlogCreateComponent } from './blog-create/blog-create.component';


@NgModule({
  declarations: [
    BlogsComponent,
    BlogDetailComponent,
    BlogCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BlogsRoutingModule
  ]
})
export class BlogsModule { }
