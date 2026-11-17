import { Component, OnInit } from '@angular/core';
import { BlogPost } from '../../types/interface';
import { BlogService } from '../../services/blog.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-blog-create',
  standalone: false,
  templateUrl: './blog-create.component.html',
  styleUrl: './blog-create.component.css'
})
export class BlogCreateComponent  implements OnInit {

   blogPost: Partial<BlogPost> = {
    title: '',
    content: '',
    imageUrl: '',
    author: '',
    tags: []
  };

  tagsString = '';
  isEditing = false;
  isSubmitting = false;
  postId: number | null = null;
  isUploadingImage = false;

  constructor(
    private blogService: BlogService,
    private router: Router,
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.postId) {
      this.isEditing = true;
      this.blogService.getBlogPostById(this.postId).subscribe({
        next: existingPost => {
          this.blogPost = { ...existingPost };
          this.tagsString = (existingPost.tags ?? []).join(', ');
        },
        error: err => console.error('Failed to load blog post', err)
      });
    }
  }


   onSubmit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    // Parse tags from string
    this.blogPost.tags = this.tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const request$ = this.isEditing && this.postId
      ? this.blogService.updateBlogPost(this.postId, this.blogPost as BlogPost)
      : this.blogService.createBlogPost(this.blogPost as BlogPost);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/admin/blogs']);
      },
      error: err => {
        console.error('Failed to save blog post', err);
        this.isSubmitting = false;
      }
    });
  }

    onImageFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingImage = true;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.blogPost.imageUrl = e.target.result;
        this.isUploadingImage = false;
      };
      reader.readAsDataURL(file);
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/blogs']);
  }

  removeImage(): void {
    this.blogPost.imageUrl = '';
  }

}
