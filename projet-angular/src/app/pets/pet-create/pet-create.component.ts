import { Component, OnInit } from '@angular/core';
import { Pet } from '../../types/interface';
import { PetService } from '../../services/pet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-pet-create',
  standalone: false,
  templateUrl: './pet-create.component.html',
  styleUrl: './pet-create.component.css'
})
export class PetCreateComponent implements OnInit {

   pet: Partial<Pet> = {
    name: '',
    type: 'dog',
    breed: '',
    age: 1,
    size: 'medium',
    gender: 'male',
    color: '',
    description: '',
    imageUrl: '',
    isVaccinated: false,
    location: '',
    contactEmail: '',
    contactPhone: ''
  };

  isEditing = false;
  isSubmitting = false;
  petId: number | null = null;
  isUploadingImage = false;

  constructor(
    private petService: PetService,
    private router: Router,
    private route: ActivatedRoute,
    private notifications: NotificationService
  ){}


  ngOnInit(): void {
    this.petId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.petId) {
      this.isEditing = true;
      this.petService.getPetById(this.petId).subscribe({
        next: existingPet => this.pet = { ...existingPet },
        error: err => console.error('Failed to load pet', err)
      });
    }
  }


  onSubmit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    const request$ = this.isEditing && this.petId
      ? this.petService.updatePet(this.petId, this.pet as Pet)
      : this.petService.createPet(this.pet as Pet);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notifications.success(
          this.isEditing ? 'Listing updated' : 'Listing published',
          `${this.pet.name} is now in your space.`
        );
        this.router.navigate(['/account']);
      },
      error: () => {
        // The interceptor already explained the refusal.
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/account']);
  }

  onImageFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingImage = true;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pet.imageUrl = e.target.result;
        this.isUploadingImage = false;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.pet.imageUrl = '';
  }
}
