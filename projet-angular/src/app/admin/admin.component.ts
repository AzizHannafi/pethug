import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { BlogService } from '../services/blog.service';
import { PetService } from '../services/pet.service';
import { ReportsService } from '../services/reports.service';
import { KeycloackService } from '../services/keycloack.service';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  petCount = 0;
  postCount = 0;
  pendingPosts = 0;
  reportCount = 0;
  openReports = 0;

  isLoading = true;

  constructor(
    private petService: PetService,
    private blogService: BlogService,
    private reportsService: ReportsService,
    public keyCloakService: KeycloackService
  ) {}

  ngOnInit(): void {
    // Real numbers, so the dashboard says what needs attention.
    forkJoin({
      pets: this.petService.refresh(),
      posts: this.blogService.refresh(),
      reports: this.reportsService.refresh()
    }).subscribe({
      next: ({ pets, posts, reports }) => {
        this.petCount = pets.length;
        this.postCount = posts.length;
        this.pendingPosts = posts.filter(p => p.status === 'pending').length;
        this.reportCount = reports.length;
        this.openReports = reports.filter(r => r.status !== 'resolved').length;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
