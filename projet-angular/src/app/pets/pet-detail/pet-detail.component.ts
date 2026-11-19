import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Comment, Pet } from '../../types/interface';
import { KeycloackService } from '../../services/keycloack.service';
import { ReportsService } from '../../services/reports.service';

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

  constructor(
    private route: ActivatedRoute,
    private petService: PetService,
    private keyCloakService: KeycloackService,
    private reportService: ReportsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.petService.getPetById(id).subscribe({
      next: pet => this.pet = pet,
      error: err => console.error('Failed to load pet', err)
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
      },
      error: err => {
        console.error('Failed to submit report', err);
        this.showReportModal = false;
      }
    });
  }

  likePet(): void {
    if (!this.pet) {
      return;
    }
    this.petService.likePet(this.pet.id).subscribe({
      next: pet => this.pet = pet,
      error: err => console.error('Failed to like pet', err)
    });
  }

  addComment(): void {
    if (!this.pet || !this.newComment.trim() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    // The server stamps the author and the date from the token.
    const comment = { content: this.newComment };

    this.petService.addComment(this.pet.id, comment).subscribe({
      next: pet => {
        this.pet = pet;
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
