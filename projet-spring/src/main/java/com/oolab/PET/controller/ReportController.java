package com.oolab.PET.controller;

import com.oolab.PET.enity.Report;
import com.oolab.PET.service.ReportService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@SecurityRequirement(name = "keycloak")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // The moderation queue is for administrators only.
    @PreAuthorize("hasRole('client_admin')")
    @GetMapping
    public List<Report> getAll() {
        return reportService.findAll();
    }

    @PostMapping
    public Report create(@RequestBody Report report) {
        return reportService.create(report);
    }

    // Only administrators handle a report.
    @PreAuthorize("hasRole('client_admin')")
    @PutMapping("/{id}/status")
    public Report updateStatus(@PathVariable Long id, @RequestParam String status) {
        return reportService.updateStatus(id, status);
    }

    // Only administrators dismiss a report.
    @PreAuthorize("hasRole('client_admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reportService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
