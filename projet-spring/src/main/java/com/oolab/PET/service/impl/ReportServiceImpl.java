package com.oolab.PET.service.impl;

import com.oolab.PET.enity.Report;
import com.oolab.PET.exception.ResourceNotFoundException;
import com.oolab.PET.repository.ReportRepository;
import com.oolab.PET.service.ReportService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Transactional
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;

    public ReportServiceImpl(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Override
    public List<Report> findAll() {
        return reportRepository.findAll();
    }

    @Override
    public Report create(Report report) {
        report.setId(null);
        report.setDateReported(new Date());
        report.setStatus("pending");
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
