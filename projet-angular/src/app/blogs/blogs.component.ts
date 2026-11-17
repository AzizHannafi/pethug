import { Component } from '@angular/core';
import { BlogService } from '../services/blog.service';
import { BlogPost, SortOption } from '../types/interface';

@Component({
  selector: 'app-blogs',
  standalone: false,
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent {
  
  blogPosts: BlogPost[] = [];
  searchTerm = '';
  sortBy: SortOption = 'newest';

  constructor(
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
      this.applyFilters();
  }

  applyFilters(): void {
    this.blogService.getFilteredBlogPosts(this.searchTerm, this.sortBy).subscribe(posts => {
      this.blogPosts = posts;
    });
  }

}
