package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.SupportAnalyticsDTO;
import com.iis.foodflow.service.SupportAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZonedDateTime;

@RestController
@RequestMapping("/api/support-analytics")
@RequiredArgsConstructor
public class SupportAnalyticsController {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);
    private final SupportAnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<SupportAnalyticsDTO> getAnalytics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        logger.info("GET /support-analytics | Primljeni stringovi -> startDate: [{}], endDate: [{}]", startDate, endDate);

        // Ručno parsiranje stringa u LocalDateTime
        LocalDateTime startDateTime = null;
        if (startDate != null && !startDate.isEmpty()) {
            // ZonedDateTime se koristi da se ispravno hendluje 'Z' (Zulu time/UTC) iz toISOString()
            startDateTime = ZonedDateTime.parse(startDate).toLocalDateTime();
        }

        LocalDateTime endDateTime = null;
        if (endDate != null && !endDate.isEmpty()) {
            endDateTime = ZonedDateTime.parse(endDate).toLocalDateTime();
        }

        // Nema više potrebe za .with(LocalTime.MAX) jer to radimo na frontendu
        return ResponseEntity.ok(analyticsService.getAnalytics(startDateTime, endDateTime));
    }

}
