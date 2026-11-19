import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { Comment, Pet, SortOption } from '../types/interface';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class PetService {

  private readonly baseUrl: string;

  private petsSubject = new BehaviorSubject<Pet[]>([]);
  pets$ = this.petsSubject.asObservable();

  private loadStarted = false;

  constructor(private http: HttpClient, config: AppConfigService) {
    this.baseUrl = `${config.apiUrl}/pets`;
  }

  /** Fetches the list from the API and pushes it into the shared cache. */
  refresh(): Observable<Pet[]> {
    this.loadStarted = true;
    return this.http.get<Pet[]>(this.baseUrl).pipe(
      tap(pets => this.petsSubject.next(pets)),
      catchError(error => {
        console.error('Failed to load pets', error);
        return of(this.petsSubject.value);
      })
    );
  }

  private ensureLoaded(): void {
    if (!this.loadStarted) {
      this.refresh().subscribe();
    }
  }

  getPets(): Observable<Pet[]> {
    this.ensureLoaded();
    return this.pets$;
  }

  /** The listings published by the signed-in user. */
  getMyPets(): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.baseUrl}/me`);
  }

  /** Always hits the API, so a deep link / page refresh works. */
  getPetById(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.baseUrl}/${id}`);
  }

  getFilteredPets(searchTerm: string = '', sortBy: SortOption = 'newest'): Observable<Pet[]> {
    this.ensureLoaded();
    return this.pets$.pipe(
      map(pets => {
        let filteredPets = [...pets];

        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredPets = filteredPets.filter(pet =>
            pet.name?.toLowerCase().includes(term) ||
            pet.breed?.toLowerCase().includes(term) ||
            pet.type?.toLowerCase().includes(term) ||
            pet.location?.toLowerCase().includes(term) ||
            pet.description?.toLowerCase().includes(term)
          );
        }

        // Sort pets
        switch (sortBy) {
          case 'newest':
            filteredPets.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
            break;
          case 'most-liked':
            filteredPets.sort((a, b) => b.likes - a.likes);
            break;
        }

        return filteredPets;
      })
    );
  }

  createPet(petData: Pet): Observable<Pet> {
    return this.http.post<Pet>(this.baseUrl, petData).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  updatePet(id: number, petData: Pet): Observable<Pet> {
    return this.http.put<Pet>(`${this.baseUrl}/${id}`, petData).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  deletePet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  likePet(petId: number): Observable<Pet> {
    return this.http.post<Pet>(`${this.baseUrl}/${petId}/like`, {}).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  /** userId / userName are set by the server from the token, not sent. */
  addComment(petId: number, comment: Partial<Comment>): Observable<Pet> {
    return this.http.post<Pet>(`${this.baseUrl}/${petId}/comments`, comment).pipe(
      tap(() => this.refresh().subscribe())
    );
  }
}
