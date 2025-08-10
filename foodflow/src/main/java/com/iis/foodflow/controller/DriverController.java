// Datoteka: src/main/java/com/iis/foodflow/controller/DriverController.java
package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.UpdateDriverStatusRequest;
import com.iis.foodflow.dto.request.UpdateLocationRequest;
import com.iis.foodflow.dto.request.UpdateVehicleRequest;
import com.iis.foodflow.dto.response.DriverLocationResponse; // <-- DODAT JE OVAJ IMPORT
import com.iis.foodflow.dto.response.DriverPerformanceResponse;
import com.iis.foodflow.dto.response.DriverResponseDTO;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    /** Vozač mijenja svoj status dostupnosti (ONLINE/OFFLINE). */
// Ispravljena verzija
    @PutMapping("/status")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverResponseDTO> updateOwnStatus( // <-- 1. Promijenjen povratni tip
                                                              @RequestBody UpdateDriverStatusRequest request,
                                                              @AuthenticationPrincipal Driver driverPrincipal) {
        // 2. Sada će servis vratiti DTO, a ne Driver entitet
        DriverResponseDTO updatedDriverDTO = driverService.updateStatus(driverPrincipal.getEmail(), request.getNewStatus());
        return ResponseEntity.ok(updatedDriverDTO);
    }
    /** Vozač periodično šalje svoju lokaciju. */
    @PutMapping("/location")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> updateOwnLocation(
            @RequestBody UpdateLocationRequest request,
            @AuthenticationPrincipal Driver driverPrincipal) {
        driverService.updateLocation(driverPrincipal.getEmail(), request.getLatitude(), request.getLongitude());
        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint za dobijanje lokacije vozača.
     * Dostupan administratorima, menadžerima i kupcima.
     */
    @GetMapping("/{driverId}/location")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('MANAGER') or hasRole('CUSTOMER')")
    public ResponseEntity<DriverLocationResponse> getDriverLocationById(@PathVariable Long driverId) {
        DriverLocationResponse locationData = driverService.getDriverLocation(driverId);
        return ResponseEntity.ok(locationData);
    }
    @PutMapping("/vehicle")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverResponseDTO> updateOwnVehicle( // <-- 1. Promijenjen povratni tip
                                                               @RequestBody UpdateVehicleRequest request,
                                                               @AuthenticationPrincipal Driver driverPrincipal) {

        String driverEmail = driverPrincipal.getEmail();
        // 2. Sada će servis vratiti DTO, a ne Driver entitet
        DriverResponseDTO updatedDriverDTO = driverService.updateVehicle(driverEmail, request.getNewVehicleType());

        return ResponseEntity.ok(updatedDriverDTO);
    }
    @GetMapping("/performance")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverPerformanceResponse> getMyPerformance(
            @AuthenticationPrincipal Driver driverPrincipal) {

        // Uzimamo email prijavljenog vozača iz tokena
        String driverEmail = driverPrincipal.getEmail();

        // Pozivamo servisnu metodu koja sve izračunava
        DriverPerformanceResponse performanceData = driverService.getDriverPerformance(driverEmail);

        // Vraćamo DTO kao JSON odgovor
        return ResponseEntity.ok(performanceData);
    }
}