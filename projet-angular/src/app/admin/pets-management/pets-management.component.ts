import { Component } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { Pet, SortOption } from '../../types/interface';

@Component({
  selector: 'app-pets-management',
  standalone: false,
  templateUrl: './pets-management.component.html',
  styleUrl: './pets-management.component.css'
})
export class PetsManagementComponent {
    pets: Pet[] = [];
    searchTerm = '';
    sortBy: SortOption = 'newest';
    typeFilter = '';
    showDeleteConfirmation = false;
    petToDelete: number | null = null;


  constructor(
    private petService: PetService
  ) {}

  ngOnInit(): void {
      this.applyFilters();
  }

  applyFilters(): void {
    this.petService.getFilteredPets(this.searchTerm, this.sortBy).subscribe(pets => {
      if (this.typeFilter) {
        this.pets = pets.filter(pet => pet.type === this.typeFilter);
      } else {
        this.pets = pets;
      }
    });
  }

  deletePet(petId: number): void {
    this.showDeleteConfirmation = true;
    this.petToDelete = petId;

  }

  confirmDelete(): void {
    if (this.petToDelete) {
      this.petService.deletePet(this.petToDelete).subscribe({
        next: () => this.applyFilters(),
        error: err => console.error('Failed to delete pet', err)
      });
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.petToDelete = null;
  }
}
