import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { KeycloackService } from '../services/keycloack.service';
import { BlogPost, SortOption } from '../types/interface';

@Component({
  selector: 'app-blogs',
  standalone: false,
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent implements OnInit {

  blogPosts: BlogPost[] = [];
  searchTerm = '';
  sortBy: SortOption = 'newest';
  isLoading = true;

  private liking = new Set<number>();

  constructor(
    private blogService: BlogService,
    private router: Router,
    public keyCloakService: KeycloackService
  ) {}

  ngOnInit(): void {
    this.blogService.refresh().subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false
    });
    this.applyFilters();
  }

  applyFilters(): void {
    this.blogService.getFilteredBlogPosts(this.searchTerm, this.sortBy).subscribe(posts => {
      // The public blog shows what moderation approved. Your own drafts stay
      // visible to you (clearly marked), and administrators see everything.
      this.blogPosts = posts.filter(post =>
        post.status === 'approved'
        || this.keyCloakService.isAdmin
        || this.keyCloakService.owns(post.authorId)
      );
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  get hasFilters(): boolean {
    return !!this.searchTerm;
  }

  /** The button had no handler at all before: liking simply did nothing. */
  like(post: BlogPost, event: Event): void {
    event.stopPropagation();
    if (this.liking.has(post.id)) {
      return;
    }
    this.liking.add(post.id);
    this.blogService.likeBlogPost(post.id).subscribe({
      next: updated => {
        post.likes = updated.likes;
        this.liking.delete(post.id);
      },
      error: () => this.liking.delete(post.id)
    });
  }

  isLiking(post: BlogPost): boolean {
    return this.liking.has(post.id);
  }

  canManage(post: BlogPost): boolean {
    return this.keyCloakService.canManage(post.authorId);
  }

  isMine(post: BlogPost): boolean {
    return this.keyCloakService.owns(post.authorId);
  }

  edit(post: BlogPost, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/blogs/edit', post.id]);
  }

  write(): void {
    this.router.navigate(['/blogs/create']);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'approved': return 'Published';
      case 'rejected': return 'Rejected';
      default: return 'Awaiting moderation';
    }
  }
}
