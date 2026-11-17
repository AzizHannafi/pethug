import { Component } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { BlogPost, SortOption } from '../../types/interface';

@Component({
  selector: 'app-blogs-management',
  standalone: false,
  templateUrl: './blogs-management.component.html',
  styleUrl: './blogs-management.component.css'
})
export class BlogsManagementComponent {

    
    blogPosts: BlogPost[] = [];
    searchTerm = '';
    sortBy: SortOption = 'newest'; 
     statusFilter = 'all';
     showDeleteConfirmation = false;
    blogToDelete: number | null = null;

  
    constructor(
      private blogService: BlogService
    ) {}
  
    ngOnInit(): void {
        this.applyFilters();
    }
  
    applyFilters(): void {
      this.blogService.getFilteredBlogPosts(this.searchTerm, this.sortBy, this.statusFilter).subscribe(posts => {
        this.blogPosts = posts;
      });
    }

  updateStatus(postId: number, status: 'approved' | 'rejected'): void {
    this.blogService.updateBlogPostStatus(postId, status).subscribe({
      next: () => this.applyFilters(),
      error: err => console.error('Failed to update blog status', err)
    });
  }

  deleteBlogPost(postId: number): void {
    this.showDeleteConfirmation = true;
    this.blogToDelete = postId;
  }

   confirmDelete(): void {
    if (this.blogToDelete) {
      this.blogService.deleteBlogPost(this.blogToDelete).subscribe({
        next: () => this.applyFilters(),
        error: err => console.error('Failed to delete blog post', err)
      });
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
        this.showDeleteConfirmation = false;
    this.blogToDelete = null;
  }

}
