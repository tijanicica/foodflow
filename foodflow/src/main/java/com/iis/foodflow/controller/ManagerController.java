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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.Comparator; // Dodaj import
import java.util.List;
import java.util.stream.Collectors; // Dodaj import
import java.util.Optional; // <-- Dodaj ovaj import
import java.util.Map;

@RestController
@RequestMapping("/api/manager") // Osnovna putanja je sada /api/manager
@RequiredArgsConstructor
public class ManagerController {
    private final ManagerRepository managerRepository;
    private final ManagerAnalyticsService managerAnalyticsService;
    private final ManagerProfileService managerProfileService; // Dodavanje novog servisa
    public record RestaurantOptionDTO(Long id, String name) {}


    // ===== NOVI ENDPOINT ZA DOBIJANJE LISTE RESTORANA =====
    @GetMapping("/my-restaurants")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
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

    @GetMapping("/analytics")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
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
    // --- NOVI ENDPOINTI ZA PROFIL ---

    @GetMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<ManagerProfileDTO> getManagerProfile(@AuthenticationPrincipal Manager manager) {
        return ResponseEntity.ok(managerProfileService.getManagerProfile(manager));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<ManagerProfileDTO> updateManagerProfile(
            @AuthenticationPrincipal Manager manager,
            @RequestBody UpdateManagerProfileRequestDTO request) {
        return ResponseEntity.ok(managerProfileService.updateManagerProfile(manager, request));
    }

    @PostMapping("/profile/change-password")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
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