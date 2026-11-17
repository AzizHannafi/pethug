import { Component } from '@angular/core';
import { PetService } from '../services/pet.service';
import { Pet, SortOption } from '../types/interface';

@Component({
  selector: 'app-pets',
  standalone: false,
  templateUrl: './pets.component.html',
  styleUrl: './pets.component.css'
})
export class PetsComponent {
    pets: Pet[] = [];
      searchTerm = '';
  sortBy: SortOption = 'newest';
  typeFilter = '';

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


}
