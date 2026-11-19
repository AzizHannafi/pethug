import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { Report } from '../types/interface';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private readonly baseUrl: string;

  private reportsSubject = new BehaviorSubject<Report[]>([]);
  reports$ = this.reportsSubject.asObservable();

  private loadStarted = false;

  constructor(private http: HttpClient, config: AppConfigService) {
    this.baseUrl = `${config.apiUrl}/reports`;
  }

  /** Fetches the list from the API and pushes it into the shared cache. */
  refresh(): Observable<Report[]> {
    this.loadStarted = true;
    return this.http.get<Report[]>(this.baseUrl).pipe(
      tap(reports => this.reportsSubject.next(reports)),
      catchError(error => {
        console.error('Failed to load reports', error);
        return of(this.reportsSubject.value);
      })
    );
  }

  private ensureLoaded(): void {
    if (!this.loadStarted) {
      this.refresh().subscribe();
    }
  }

  getReports(): Observable<Report[]> {
    this.ensureLoaded();
    return this.reports$;
  }

  /** What the signed-in user reported. Allowed for everyone, unlike getReports(). */
  getMyReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}/me`);
  }

  /** reporterId / reporterName are set by the server from the token, not sent. */
  createReport(reportData: Omit<Report, 'id' | 'dateReported' | 'status' | 'reporterId' | 'reporterName'>): Observable<Report> {
    return this.http.post<Report>(this.baseUrl, reportData).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  updateReportStatus(id: number, status: 'pending' | 'reviewed' | 'resolved'): Observable<Report> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Report>(`${this.baseUrl}/${id}/status`, {}, { params }).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.refresh().subscribe())
    );
  }

  getReportsByStatus(status: 'pending' | 'reviewed' | 'resolved' | 'all'): Observable<Report[]> {
    return this.getReports().pipe(
      map(reports => status === 'all' ? reports : reports.filter(report => report.status === status))
    );
  }
}
