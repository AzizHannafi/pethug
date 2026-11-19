package com.oolab.PET.service.impl;

import com.oolab.PET.enity.Report;
import com.oolab.PET.exception.ResourceNotFoundException;
import com.oolab.PET.repository.ReportRepository;
import com.oolab.PET.security.CurrentUser;
import com.oolab.PET.service.ReportService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Transactional
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final CurrentUser currentUser;

    public ReportServiceImpl(ReportRepository reportRepository, CurrentUser currentUser) {
        this.reportRepository = reportRepository;
        this.currentUser = currentUser;
    }

    @Override
    public List<Report> findAll() {
        return reportRepository.findAll();
    }

    @Override
    public List<Report> findMine() {
        return reportRepository.findByReporterIdOrderByDateReportedDesc(currentUser.id());
    }

    @Override
    public Report create(Report report) {
        report.setId(null);
        report.setDateReported(new Date());
        report.setStatus("pending");
        // The reporter is whoever is signed in, not whatever the client sent.
        report.setReporterId(currentUser.id());
        report.setReporterName(currentUser.displayName());
        return reportRepository.save(report);
    }

    @Override
    public Report updateStatus(Long id, String status) {
        Report existing = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id " + id));
        existing.setStatus(status);
        return reportRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        Report existing = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id " + id));
        reportRepository.delete(existing);
    }
}
