package com.iis.foodflow.controller;

import com.iis.foodflow.dto.response.RestaurantProblemAnalyticsDTO;
import com.iis.foodflow.service.EmailService;
import com.iis.foodflow.service.RestaurantProblemAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant-analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
public class RestaurantProblemAnalyticsController {
    private final RestaurantProblemAnalyticsService analyticsService;
    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<List<RestaurantProblemAnalyticsDTO>> getAllAnalytics() {
        return ResponseEntity.ok(analyticsService.getAllRestaurantsAnalytics());
    }

    @PostMapping("/send-report/{restaurantId}")
    public ResponseEntity<Void> sendReportToManager(@PathVariable Long restaurantId) {
        try {
            emailService.sendAnalyticsReport(restaurantId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            // Bolje je imati specifičan exception handling, ali ovo je za primer
            return ResponseEntity.internalServerError().build();
        }
    }
}
