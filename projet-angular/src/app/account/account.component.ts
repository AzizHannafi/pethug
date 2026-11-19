import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BlogPost, Pet, Report } from '../types/interface';
import { PetService } from '../services/pet.service';
import { BlogService } from '../services/blog.service';
import { ReportsService } from '../services/reports.service';
import { KeycloackService } from '../services/keycloack.service';
import { NotificationService } from '../services/notification.service';

type Tab = 'pets' | 'posts' | 'reports';

type PendingDeletion =
  | { kind: 'pet'; id: number; label: string }
  | { kind: 'post'; id: number; label: string };

/** Each list loads on its own, so one broken endpoint cannot blank the page. */
interface Section<T> {
  items: T[];
  loading: boolean;
  failed: boolean;
}

@Component({
  selector: 'app-account',
  standalone: false,
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {

  activeTab: Tab = 'pets';

  pets: Section<Pet> = { items: [], loading: true, failed: false };
  posts: Section<BlogPost> = { items: [], loading: true, failed: false };
  reports: Section<Report> = { items: [], loading: true, failed: false };

  pendingDeletion: PendingDeletion | null = null;

  constructor(
    private petService: PetService,
    private blogService: BlogService,
    private reportsService: ReportsService,
    private router: Router,
    public keyCloakService: KeycloackService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.fill(this.pets, this.petService.getMyPets());
    this.fill(this.posts, this.blogService.getMyBlogPosts());
    this.fill(this.reports, this.reportsService.getMyReports());
  }

  /**
   * Showing "0" when the request failed is a lie: the section says so instead,
   * and offers to try again.
   */
  private fill<T>(section: Section<T>, request$: Observable<T[]>): void {
    section.loading = true;
    section.failed = false;
    request$.subscribe({
      next: items => {
        section.items = items ?? [];
        section.loading = false;
      },
      error: () => {
        // The interceptor already explained what went wrong.
        section.items = [];
        section.loading = false;
        section.failed = true;
      }
    });
  }

  retry(): void {
    this.load();
  }

  select(tab: Tab): void {
    this.activeTab = tab;
  }

  get isLoading(): boolean {
    return this.pets.loading || this.posts.loading || this.reports.loading;
  }

  get anyFailed(): boolean {
    return this.pets.failed || this.posts.failed || this.reports.failed;
  }

  get pendingPosts(): number {
    return this.posts.items.filter(post => post.status === 'pending').length;
  }

  get openReports(): number {
    return this.reports.items.filter(report => report.status !== 'resolved').length;
  }

  // ---------------------------------------------------------------- actions

  newPet(): void {
    this.router.navigate(['/pets/create']);
  }

  editPet(id: number): void {
    this.router.navigate(['/pets/edit', id]);
  }

  newPost(): void {
    this.router.navigate(['/blogs/create']);
  }

  editPost(id: number): void {
    this.router.navigate(['/blogs/edit', id]);
  }

  askDelete(kind: 'pet' | 'post', id: number, label: string): void {
    this.pendingDeletion = { kind, id, label } as PendingDeletion;
  }

  cancelDelete(): void {
    this.pendingDeletion = null;
  }

  confirmDelete(): void {
    const target = this.pendingDeletion;
    if (!target) {
      return;
    }
    this.pendingDeletion = null;

    const request$ = target.kind === 'pet'
      ? this.petService.deletePet(target.id)
      : this.blogService.deleteBlogPost(target.id);

    request$.subscribe({
      next: () => {
        this.notifications.success(
          target.kind === 'pet' ? 'Listing deleted' : 'Post deleted',
          `"${target.label}" is gone.`
        );
        this.load();
      },
      error: () => {}
    });
  }

  // ------------------------------------------------------------- presentation

  statusClass(status: string): string {
    switch (status) {
      case 'approved':
      case 'resolved':
        return 'bg-emerald-100 text-emerald-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'reviewed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'approved': return 'Published';
      case 'rejected': return 'Rejected';
      case 'resolved': return 'Resolved';
      case 'reviewed': return 'Under review';
      default: return 'Awaiting moderation';
    }
  }
}
