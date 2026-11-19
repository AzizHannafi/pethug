import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../types/interface';
import { KeycloackService } from '../../services/keycloack.service';
import { ReportsService } from '../../services/reports.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-pet-detail',
  standalone: false,
  templateUrl: './pet-detail.component.html',
  styleUrl: './pet-detail.component.css'
})
export class PetDetailComponent {
  pet: Pet | undefined;
  newComment = '';
  isSubmitting = false;
  reportReason = '';
  reportDescription = '';
  showReportModal = false;
  showDeleteModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petService: PetService,
    public keyCloakService: KeycloackService,
    private reportService: ReportsService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.petService.getPetById(id).subscribe({
      next: pet => this.pet = pet,
      error: () => {}
    });
  }

  /** Same rule as the API: the owner, or an administrator. */
  get canManage(): boolean {
    return this.keyCloakService.canManage(this.pet?.ownerId);
  }

  get isMine(): boolean {
    return this.keyCloakService.owns(this.pet?.ownerId);
  }

  edit(): void {
    if (this.pet) {
      this.router.navigate(['/pets/edit', this.pet.id]);
    }
  }

  confirmDelete(): void {
    if (!this.pet) {
      return;
    }
    const name = this.pet.name;
    this.showDeleteModal = false;
    this.petService.deletePet(this.pet.id).subscribe({
      next: () => {
        this.notifications.success('Listing deleted', `"${name}" is gone.`);
        this.router.navigate(['/account']);
      },
      error: () => {}
    });
  }

  submitReport(): void {
    if (!this.pet) {
      return;
    }

    this.reportService.createReport({
      type: 'pet',
      itemId: this.pet.id,
      itemTitle: this.pet.name,
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

  likePet(): void {
    if (!this.pet) {
      return;
    }
    this.petService.likePet(this.pet.id).subscribe({
      next: pet => this.pet = pet,
      error: () => {}
    });
  }

  addComment(): void {
    if (!this.pet || !this.newComment.trim() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    // The server stamps the author and the date from the token.
    this.petService.addComment(this.pet.id, { content: this.newComment }).subscribe({
      next: pet => {
        this.pet = pet;
        this.newComment = '';
        this.isSubmitting = false;
      },
      error: () => this.isSubmitting = false
    });
  }
}
