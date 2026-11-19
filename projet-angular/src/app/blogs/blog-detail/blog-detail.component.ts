import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../../types/interface';
import { KeycloackService } from '../../services/keycloack.service';
import { ReportsService } from '../../services/reports.service';
import { NotificationService } from '../../services/notification.service';

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
  showDeleteModal = false;
  reportReason = '';
  reportDescription = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    public keyCloakService: KeycloackService,
    private reportService: ReportsService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.blogService.getBlogPostById(id).subscribe({
      next: post => this.blogPost = post,
      error: () => {}
    });
  }

  /** Same rule as the API: the author, or an administrator. */
  get canManage(): boolean {
    return this.keyCloakService.canManage(this.blogPost?.authorId);
  }

  get isMine(): boolean {
    return this.keyCloakService.owns(this.blogPost?.authorId);
  }

  get statusClass(): string {
    switch (this.blogPost?.status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  }

  get statusLabel(): string {
    switch (this.blogPost?.status) {
      case 'approved': return 'Published';
      case 'rejected': return 'Rejected';
      default: return 'Awaiting moderation';
    }
  }

  edit(): void {
    if (this.blogPost) {
      this.router.navigate(['/blogs/edit', this.blogPost.id]);
    }
  }

  confirmDelete(): void {
    if (!this.blogPost) {
      return;
    }
    const title = this.blogPost.title;
    this.showDeleteModal = false;
    this.blogService.deleteBlogPost(this.blogPost.id).subscribe({
      next: () => {
        this.notifications.success('Post deleted', `"${title}" is gone.`);
        this.router.navigate(['/account']);
      },
      error: () => {}
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
        this.notifications.success('Report sent', 'A moderator will look at it.');
      },
      error: () => this.showReportModal = false
    });
  }

  likeBlogPost(): void {
    if (!this.blogPost) {
      return;
    }
    this.blogService.likeBlogPost(this.blogPost.id).subscribe({
      next: post => this.blogPost = post,
      error: () => {}
    });
  }

  addComment(): void {
    if (!this.blogPost || !this.newComment.trim() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    // The server stamps the author and the date from the token.
    this.blogService.addComment(this.blogPost.id, { content: this.newComment }).subscribe({
      next: post => {
        this.blogPost = post;
        this.newComment = '';
        this.isSubmitting = false;
      },
      error: () => this.isSubmitting = false
    });
  }
}
