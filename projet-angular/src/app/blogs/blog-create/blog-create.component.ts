import { Component, OnInit } from '@angular/core';
import { BlogPost } from '../../types/interface';
import { BlogService } from '../../services/blog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { KeycloackService } from '../../services/keycloack.service';

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
    private route: ActivatedRoute,
    private notifications: NotificationService,
    private keyCloakService: KeycloackService
  ){}

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.postId) {
      this.isEditing = true;
      this.blogService.getBlogPostById(this.postId).subscribe({
        next: existingPost => {
          // Tell the user up front, rather than letting them rewrite a whole
          // post only to be refused on submit.
          if (!this.keyCloakService.canManage(existingPost.authorId)) {
            this.notifications.denied(
              'You cannot edit this post',
              'Only its author, or an administrator, can.'
            );
            this.router.navigate(['/blogs/details', this.postId]);
            return;
          }
          this.blogPost = { ...existingPost };
          this.tagsString = (existingPost.tags ?? []).join(', ');
        },
        error: () => {}
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
        this.notifications.success(
          this.isEditing ? 'Post updated' : 'Post submitted',
          'A moderator reviews it before it becomes public.'
        );
        this.router.navigate(['/account']);
      },
      error: () => {
        // The interceptor already explained the refusal.
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
    this.router.navigate(['/account']);
  }

  removeImage(): void {
    this.blogPost.imageUrl = '';
  }

}
