// src/main/java/com/iis/foodflow/controller/ManagerController.java
package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.ChangePasswordRequestDTO;
import com.iis.foodflow.dto.request.UpdateManagerProfileRequestDTO;
import com.iis.foodflow.dto.response.ManagerAnalyticsDTO;
import com.iis.foodflow.dto.response.ManagerProfileDTO;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.repository.ManagerRepository;
import com.iis.foodflow.service.ManagerAnalyticsService;
import com.iis.foodflow.service.ManagerProfileService; // Uvoz novog servisa
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.Comparator; // Dodaj import
import java.util.List;
import java.util.stream.Collectors; // Dodaj import
import java.util.Optional; // <-- Dodaj ovaj import
import java.util.Map;
import org.slf4j.Logger; // Dodaj import

@RestController
@RequestMapping("/api/manager") // Osnovna putanja je sada /api/manager
@RequiredArgsConstructor
public class ManagerController {
    private final ManagerRepository managerRepository;
    private final ManagerAnalyticsService managerAnalyticsService;
    private final ManagerProfileService managerProfileService; // Dodavanje novog servisa
    public record RestaurantOptionDTO(Long id, String name) {}
    private static final Logger log = LoggerFactory.getLogger(ManagerController.class);


    // ===== NOVI ENDPOINT ZA DOBIJANJE LISTE RESTORANA =====
    @GetMapping("/my-restaurants")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    @Transactional(readOnly = true) // <-- DODAJ @Transactional
    public ResponseEntity<List<RestaurantOptionDTO>> getMyRestaurants(@AuthenticationPrincipal Manager currentManager) {

        // Ponovo učitavamo menadžera sa JOIN FETCH da bismo dobili i restorane
        Manager managerWithRestaurants = managerRepository.findByEmailWithRestaurants(currentManager.getEmail())
                .orElseThrow(() -> new IllegalStateException("Manager not found"));

        List<RestaurantOptionDTO> restaurants = managerWithRestaurants.getManagedRestaurants().stream()
                .map(r -> new RestaurantOptionDTO(r.getId(), r.getName()))
                .sorted(Comparator.comparing(RestaurantOptionDTO::name))
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurants);
    }

    /*
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<ManagerAnalyticsDTO> getManagerAnalytics(
            @AuthenticationPrincipal Manager manager,
            @RequestParam(defaultValue = "30") int days,
            // ===== PROMENA TIPA U OPTIONAL<LONG> =====
            @RequestParam(required = false) Optional<Long> restaurantId) {
        try {
            // Prosleđujemo vrednost iz Optional-a, ili null ako je prazan
            return ResponseEntity.ok(managerAnalyticsService.getManagerAnalytics(manager, days, restaurantId.orElse(null)));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    // --- NOVI ENDPOINTI ZA PROFIL ---*/
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ManagerAnalyticsDTO> getManagerAnalytics(
            @AuthenticationPrincipal Manager manager,
            @RequestParam(name = "days", defaultValue = "30") int days,
            @RequestParam(name = "restaurantId", required = false) Optional<Long> restaurantId) {

        // === DODAJEMO LOGOVANJE PRE POZIVA SERVISA ===
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Accessing /api/manager/analytics endpoint.");
        log.info("Principal object type: {}", (authentication.getPrincipal() != null ? authentication.getPrincipal().getClass().getName() : "null"));
        log.info("Principal (User): {}", authentication.getName());
        log.info("Authorities: {}", authentication.getAuthorities());
        log.info("Manager object received via @AuthenticationPrincipal: ID={}, Email={}", manager.getId(), manager.getEmail());
        log.info("Request parameters: days={}, restaurantId={}", days, restaurantId.orElse(null));

        try {
            ManagerAnalyticsDTO analytics = managerAnalyticsService.getManagerAnalytics(manager, days, restaurantId.orElse(null));
            log.info("Analytics service finished successfully. Returning data.");
            return ResponseEntity.ok(analytics);
        } catch (SecurityException e) {
            log.error("SecurityException caught in analytics endpoint!", e);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            log.error("An unexpected error occurred in analytics endpoint!", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<ManagerProfileDTO> getManagerProfile(@AuthenticationPrincipal Manager manager) {
        return ResponseEntity.ok(managerProfileService.getManagerProfile(manager));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<ManagerProfileDTO> updateManagerProfile(
            @AuthenticationPrincipal Manager manager,
            @RequestBody UpdateManagerProfileRequestDTO request) {
        return ResponseEntity.ok(managerProfileService.updateManagerProfile(manager, request));
    }

    @PostMapping("/profile/change-password")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal Manager manager,
            @RequestBody ChangePasswordRequestDTO request) {
        try {
            managerProfileService.changePassword(manager, request);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}