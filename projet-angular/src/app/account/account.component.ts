import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
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

@Component({
  selector: 'app-account',
  standalone: false,
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {

  activeTab: Tab = 'pets';

  myPets: Pet[] = [];
  myPosts: BlogPost[] = [];
  myReports: Report[] = [];

  isLoading = true;
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
    this.isLoading = true;
    // One round trip for the three lists, so the page settles in one go.
    forkJoin({
      pets: this.petService.getMyPets(),
      posts: this.blogService.getMyBlogPosts(),
      reports: this.reportsService.getMyReports()
    }).subscribe({
      next: ({ pets, posts, reports }) => {
        this.myPets = pets;
        this.myPosts = posts;
        this.myReports = reports;
        this.isLoading = false;
      },
      error: () => {
        // The interceptor already told the user what went wrong.
        this.isLoading = false;
      }
    });
  }

  select(tab: Tab): void {
    this.activeTab = tab;
  }

  get pendingPosts(): number {
    return this.myPosts.filter(post => post.status === 'pending').length;
  }

  get openReports(): number {
    return this.myReports.filter(report => report.status !== 'resolved').length;
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
      // A refusal is already explained by the interceptor.
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
