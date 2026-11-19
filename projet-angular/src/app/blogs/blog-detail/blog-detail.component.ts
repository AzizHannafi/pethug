import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogPost, Comment } from '../../types/interface';
import { KeycloackService } from '../../services/keycloack.service';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-blog-detail',
  standalone: false,
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css'
})
export class BlogDetailComponent {
  blogPost: BlogPost | undefined;
  newComment = '';
  isSubmitting = false;
  showReportModal = false;
  reportReason = '';
  reportDescription = '';

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private keyCloakService: KeycloackService,
    private reportService: ReportsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.blogService.getBlogPostById(id).subscribe({
      next: post => this.blogPost = post,
      error: err => console.error('Failed to load blog post', err)
    });
  }

  submitReport(): void {
    if (!this.blogPost) {
      return;
    }

    this.reportService.createReport({
      type: 'blog',
      itemId: this.blogPost.id,
      itemTitle: this.blogPost.title,
      reason: this.reportReason,
      description: this.reportDescription
    }).subscribe({
      next: () => {
        this.showReportModal = false;
        this.reportReason = '';
        this.reportDescription = '';
      },
      error: err => {
        console.error('Failed to submit report', err);
        this.showReportModal = false;
      }
    });
  }

  likeBlogPost(): void {
    if (!this.blogPost) {
      return;
    }
    this.blogService.likeBlogPost(this.blogPost.id).subscribe({
      next: post => this.blogPost = post,
      error: err => console.error('Failed to like blog post', err)
    });
  }

  addComment(): void {
    if (!this.blogPost || !this.newComment.trim() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    // The server stamps the author and the date from the token.
    const comment = { content: this.newComment };

    this.blogService.addComment(this.blogPost.id, comment).subscribe({
      next: post => {
        this.blogPost = post;
        this.newComment = '';
        this.isSubmitting = false;
      },
      error: err => {
        console.error('Failed to add comment', err);
        this.isSubmitting = false;
      }
    });
  }
}
