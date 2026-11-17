import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../services/reports.service';
import { Report } from '../../types/interface';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit  {

  allReports: Report[] = [];
  filteredReports: Report[] = [];
  statusFilter: 'all' | 'pending' | 'reviewed' | 'resolved' = 'all';
  typeFilter: 'all' | 'pet' | 'blog' = 'all';
  reasonFilter: string = 'all';

  constructor(private reportsService: ReportsService) {}


  ngOnInit(): void {
    this.reportsService.getReports().subscribe(reports => {
      this.allReports = reports;
      this.applyFilters();
    });
  }

    applyFilters(): void {
    let filtered = [...this.allReports];

    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === this.statusFilter);
    }

    // Filter by type
    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === this.typeFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());

    this.filteredReports = filtered;
  }

  getReportCountByStatus(status: 'pending' | 'reviewed' | 'resolved'): number {
    return this.allReports.filter(report => report.status === status).length;
  }


}
