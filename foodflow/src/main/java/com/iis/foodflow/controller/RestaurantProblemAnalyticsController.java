// RestaurantProblemAnalyticsController.java

package com.iis.foodflow.controller;

import com.iis.foodflow.dto.response.RestaurantProblemAnalyticsDTO;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.repository.RestaurantRepository;
import com.iis.foodflow.service.EmailService;
import com.iis.foodflow.service.RestaurantProblemAnalyticsService;
import com.iis.foodflow.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/restaurant-analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
public class RestaurantProblemAnalyticsController {
    private final RestaurantProblemAnalyticsService analyticsService;
    private final EmailService emailService;
    private final RestaurantRepository restaurantRepository;

    @GetMapping
    public ResponseEntity<List<RestaurantProblemAnalyticsDTO>> getAllAnalytics() {
        return ResponseEntity.ok(analyticsService.getAllRestaurantsAnalytics());
    }

    @GetMapping("/{restaurantId}")
    public ResponseEntity<RestaurantProblemAnalyticsDTO> getAnalyticsForRestaurant(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        RestaurantProblemAnalyticsDTO analytics = analyticsService.getAnalyticsForRestaurant(
                restaurant,
                startDate,
                endDate
        );

        return ResponseEntity.ok(analytics);
    }

    @PostMapping("/send-report/{restaurantId}")
    public ResponseEntity<Void> sendReportToManager(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            emailService.sendAnalyticsReport(restaurantId, startDate, endDate);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}