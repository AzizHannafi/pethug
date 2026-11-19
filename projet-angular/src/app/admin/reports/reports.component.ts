import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportsService } from '../../services/reports.service';
import { NotificationService } from '../../services/notification.service';
import { Report } from '../../types/interface';

type ReportStatus = 'pending' | 'reviewed' | 'resolved';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {

  allReports: Report[] = [];
  filteredReports: Report[] = [];

  statusFilter: 'all' | ReportStatus = 'all';
  typeFilter: 'all' | 'pet' | 'blog' = 'all';

  isLoading = true;
  failed = false;

  /** Report being deleted, pending confirmation. */
  pendingDismissal: Report | null = null;

  /** Ids with a request in flight, so buttons cannot be double-clicked. */
  private busy = new Set<number>();

  constructor(
    private reportsService: ReportsService,
    private router: Router,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.failed = false;
    this.reportsService.refresh().subscribe({
      next: reports => {
        this.allReports = reports;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.failed = true;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allReports];

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === this.statusFilter);
    }
    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === this.typeFilter);
    }

    filtered.sort((a, b) =>
      new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());

    this.filteredReports = filtered;
  }

  countByStatus(status: ReportStatus): number {
    return this.allReports.filter(report => report.status === status).length;
  }

  isBusy(report: Report): boolean {
    return this.busy.has(report.id);
  }

  // ----------------------------------------------------------- moderation

  /**
   * Moves a report through its lifecycle: pending -> reviewed -> resolved.
   * The API only accepts these three values.
   */
  setStatus(report: Report, status: ReportStatus): void {
    if (this.busy.has(report.id)) {
      return;
    }
    this.busy.add(report.id);

    this.reportsService.updateReportStatus(report.id, status).subscribe({
      next: updated => {
        report.status = updated.status;
        this.busy.delete(report.id);
        this.applyFilters();
        this.notifications.success(
          status === 'resolved' ? 'Report resolved'
            : status === 'reviewed' ? 'Report marked under review'
            : 'Report reopened',
          `"${report.itemTitle}"`
        );
      },
      error: () => this.busy.delete(report.id)
    });
  }

  askDismiss(report: Report): void {
    this.pendingDismissal = report;
  }

  cancelDismiss(): void {
    this.pendingDismissal = null;
  }

  /** Deletes the report itself. The reported content is left untouched. */
  confirmDismiss(): void {
    const report = this.pendingDismissal;
    if (!report) {
      return;
    }
    this.pendingDismissal = null;
    this.busy.add(report.id);

    this.reportsService.deleteReport(report.id).subscribe({
      next: () => {
        this.busy.delete(report.id);
        this.notifications.success('Report dismissed', `"${report.itemTitle}" is off the queue.`);
        this.load();
      },
      error: () => this.busy.delete(report.id)
    });
  }

  /**
   * Opens the reported content. The old links pointed at /pets/:id and
   * /blog/:id, neither of which is a route: they silently bounced to home.
   */
  viewItem(report: Report): void {
    const path = report.type === 'pet' ? '/pets/details' : '/blogs/details';
    this.router.navigate([path, report.itemId]);
  }

  // --------------------------------------------------------- presentation

  statusClass(status: string): string {
    switch (status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'resolved': return 'Resolved';
      case 'reviewed': return 'Under review';
      default: return 'Pending';
    }
  }
}
