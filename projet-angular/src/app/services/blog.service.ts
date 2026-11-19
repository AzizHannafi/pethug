import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { BlogPost, Comment, SortOption } from '../types/interface';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private readonly baseUrl: string;

  private blogPostsSubject = new BehaviorSubject<BlogPost[]>([]);
  blogPosts$ = this.blogPostsSubject.asObservable();

  private loadStarted = false;

  constructor(private http: HttpClient, config: AppConfigService) {
    this.baseUrl = `${config.apiUrl}/blogs`;
  }

  /** Fetches the list from the API and pushes it into the shared cache. */
  refresh(): Observable<BlogPost[]> {
    this.loadStarted = true;
    return this.http.get<BlogPost[]>(this.baseUrl).pipe(
      tap(posts => this.blogPostsSubject.next(posts)),
      catchError(error => {
        console.error('Failed to load blog posts', error);
        return of(this.blogPostsSubject.value);
      })
    );
  }

  private ensureLoaded(): void {
    if (!this.loadStarted) {
      this.refresh().subscribe();
    }
  }

  getBlogPosts(): Observable<BlogPost[]> {
    this.ensureLoaded();
    return this.blogPosts$;
  }

  /** The posts written by the signed-in user, whatever their status. */
  getMyBlogPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.baseUrl}/me`);
  }

  /** Always hits the API, so a deep link / page refresh works. */
  getBlogPostById(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.baseUrl}/${id}`);
  }

  getFilteredBlogPosts(searchTerm: string = '', sortBy: SortOption = 'newest', statusFilter = 'all'): Observable<BlogPost[]> {
    this.ensureLoaded();
    return this.blogPosts$.pipe(
      map(posts => {
        let filteredPosts = [...posts];

        if (statusFilter !== 'all') {
          filteredPosts = filteredPosts.filter(post => post.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredPosts = filteredPosts.filter(post =>
            post.title?.toLowerCase().includes(term) ||
            post.content?.toLowerCase().includes(term) ||
            post.author?.toLowerCase().includes(term)
          );
        }

        // Sort posts
        switch (sortBy) {
          case 'newest':
            filteredPosts.sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
            break;
          case 'most-liked':
            filteredPosts.sort((a, b) => b.likes - a.likes);
            break;
        }

        return filteredPosts;
      })
    );
  }

  createBlogPost(postData: BlogPost): Observable<BlogPost> {
    return this.http.post<BlogPost>(this.baseUrl, postData).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  updateBlogPost(id: number, postData: BlogPost): Observable<BlogPost> {
    return this.http.put<BlogPost>(`${this.baseUrl}/${id}`, postData).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  updateBlogPostStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Observable<BlogPost> {
    const params = new HttpParams().set('status', status);
    return this.http.put<BlogPost>(`${this.baseUrl}/${id}/status`, {}, { params }).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  deleteBlogPost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  likeBlogPost(postId: number): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.baseUrl}/${postId}/like`, {}).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  /** userId / userName are set by the server from the token, not sent. */
  addComment(postId: number, comment: Partial<Comment>): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.baseUrl}/${postId}/comments`, comment).pipe(
      tap(() => this.refresh().subscribe())
    );
  }
}
