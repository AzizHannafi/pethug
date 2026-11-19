import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PetService } from '../services/pet.service';
import { KeycloackService } from '../services/keycloack.service';
import { Pet, SortOption } from '../types/interface';

@Component({
  selector: 'app-pets',
  standalone: false,
  templateUrl: './pets.component.html',
  styleUrl: './pets.component.css'
})
export class PetsComponent implements OnInit {

  pets: Pet[] = [];
  searchTerm = '';
  sortBy: SortOption = 'newest';
  typeFilter = '';
  isLoading = true;

  /** Ids being liked right now, so the button cannot be spammed. */
  private liking = new Set<number>();

  constructor(
    private petService: PetService,
    private router: Router,
    public keyCloakService: KeycloackService
  ) {}

  ngOnInit(): void {
    this.petService.refresh().subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false
    });
    this.applyFilters();
  }

  applyFilters(): void {
    this.petService.getFilteredPets(this.searchTerm, this.sortBy).subscribe(pets => {
      this.pets = this.typeFilter ? pets.filter(pet => pet.type === this.typeFilter) : pets;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.typeFilter = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  get hasFilters(): boolean {
    return !!this.searchTerm || !!this.typeFilter;
  }

  /** The button had no handler at all before: liking simply did nothing. */
  like(pet: Pet, event: Event): void {
    event.stopPropagation();
    if (this.liking.has(pet.id)) {
      return;
    }
    this.liking.add(pet.id);
    this.petService.likePet(pet.id).subscribe({
      next: updated => {
        pet.likes = updated.likes;
        this.liking.delete(pet.id);
      },
      error: () => this.liking.delete(pet.id)
    });
  }

  isLiking(pet: Pet): boolean {
    return this.liking.has(pet.id);
  }

  /** Owner or administrator: the same rule the API enforces. */
  canManage(pet: Pet): boolean {
    return this.keyCloakService.canManage(pet.ownerId);
  }

  isMine(pet: Pet): boolean {
    return this.keyCloakService.owns(pet.ownerId);
  }

  edit(pet: Pet, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/pets/edit', pet.id]);
  }

  publish(): void {
    this.router.navigate(['/pets/create']);
  }
}
