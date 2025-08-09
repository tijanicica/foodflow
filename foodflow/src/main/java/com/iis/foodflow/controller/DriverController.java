// Datoteka: src/main/java/com/iis/foodflow/controller/DriverController.java
package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.UpdateDriverStatusRequest;
import com.iis.foodflow.dto.request.UpdateLocationRequest;
import com.iis.foodflow.dto.request.UpdateVehicleRequest;
import com.iis.foodflow.dto.response.DriverLocationResponse; // <-- DODAT JE OVAJ IMPORT
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
    @PutMapping("/status")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Driver> updateOwnStatus(
            @RequestBody UpdateDriverStatusRequest request,
            @AuthenticationPrincipal Driver driverPrincipal) {
        Driver updatedDriver = driverService.updateStatus(driverPrincipal.getEmail(), request.getNewStatus());
        return ResponseEntity.ok(updatedDriver);
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
    public ResponseEntity<Driver> updateOwnVehicle(
            @RequestBody UpdateVehicleRequest request,
            @AuthenticationPrincipal Driver driverPrincipal) {

        String driverEmail = driverPrincipal.getEmail();
        Driver updatedDriver = driverService.updateVehicle(driverEmail, request.getNewVehicleType());

        return ResponseEntity.ok(updatedDriver);
    }
}