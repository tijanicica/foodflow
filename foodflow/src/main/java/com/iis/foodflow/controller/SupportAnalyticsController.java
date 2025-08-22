package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.SupportAnalyticsDTO;
import com.iis.foodflow.service.SupportAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support-analytics")
@RequiredArgsConstructor
public class SupportAnalyticsController {

    private final SupportAnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<SupportAnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getAnalytics());
    }
}
