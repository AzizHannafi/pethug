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

    /** The moderation queue: everything everyone reported. */
    @PreAuthorize("hasRole('client_admin')")
    @GetMapping
    public List<Report> getAll() {
        return reportService.findAll();
    }

    /** What the caller reported, so they can follow it up. */
    @GetMapping("/me")
    public List<Report> getMine() {
        return reportService.findMine();
    }

    /** Anyone signed in may report; the server records who did. */
    @PostMapping
    public Report create(@RequestBody Report report) {
        return reportService.create(report);
    }

    @PreAuthorize("hasRole('client_admin')")
    @PutMapping("/{id}/status")
    public Report updateStatus(@PathVariable Long id, @RequestParam String status) {
        return reportService.updateStatus(id, status);
    }

    @PreAuthorize("hasRole('client_admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reportService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
