package com.oolab.PET.service;

import com.oolab.PET.enity.Report;

import java.util.List;

public interface ReportService {
    List<Report> findAll();
    List<Report> findMine();
    Report create(Report report);
    Report updateStatus(Long id, String status);
    void delete(Long id);
}
