package com.iis.foodflow.controller;

import com.iis.foodflow.dto.response.CustomerAnalyticsDTO;
import com.iis.foodflow.dto.response.CustomerFinancialReportDTO;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/my-analytics")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<CustomerAnalyticsDTO> getMyAnalytics(
            @RequestParam("period") String period,
            @AuthenticationPrincipal Customer customer
    ) {
        return ResponseEntity.ok(analyticsService.getCustomerAnalytics(customer, period));
    }

    @GetMapping("/customer-report")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<CustomerFinancialReportDTO> getCustomerReport(
            @AuthenticationPrincipal Customer customer,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate )
    {

        CustomerFinancialReportDTO report = analyticsService.getCustomerFinancialReport(customer.getId(), startDate, endDate);
        return ResponseEntity.ok(report);
    }
}