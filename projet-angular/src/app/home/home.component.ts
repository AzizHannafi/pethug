import { Component } from '@angular/core';
import { BlogService } from '../services/blog.service';
import { PetService } from '../services/pet.service';
import { Pet, BlogPost } from '../types/interface';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  featuredPets: Pet[] = [];
  latestPosts: BlogPost[] = [];

  constructor(
    private petService: PetService,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.petService.getPets().subscribe(pets => {
      this.featuredPets = pets
    });

    this.blogService.getBlogPosts().subscribe(posts => {
      this.latestPosts = posts.slice(0, 3);
    });
  }
}
