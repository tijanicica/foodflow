// Datoteka: src/main/java/com/iis/foodflow/controller/DriverController.java
package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.*;
import com.iis.foodflow.dto.response.*;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping("/status")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverStatusResponse> getOwnStatus(
            @AuthenticationPrincipal Driver driverPrincipal) {

        DriverStatusResponse statusResponse = driverService.getDriverStatus(driverPrincipal.getEmail());
        return ResponseEntity.ok(statusResponse);
    }

    @PutMapping("/status")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverResponseDTO> updateOwnStatus(
                                                              @RequestBody UpdateDriverStatusRequest request,
                                                              @AuthenticationPrincipal Driver driverPrincipal) {
        DriverResponseDTO updatedDriverDTO = driverService.updateStatus(driverPrincipal.getEmail(), request.getNewStatus());
        return ResponseEntity.ok(updatedDriverDTO);
    }

    @GetMapping("/{driverId}/location")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('MANAGER') or hasRole('CUSTOMER')")
    public ResponseEntity<DriverLocationResponse> getDriverLocationById(@PathVariable Long driverId) {
        DriverLocationResponse locationData = driverService.getDriverLocation(driverId);
        return ResponseEntity.ok(locationData);
    }

    // U klasi DriverController.java

    @PostMapping("/orders/{orderId}/notify-arrival")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> notifyCustomerOfArrival(
            @PathVariable Long orderId,
            @AuthenticationPrincipal Driver driverPrincipal) {

        // DODAJTE OVAJ LOG
        System.out.println("!!!!!!!!!! DOSTIGAO ENDPOINT: notifyCustomerOfArrival za order #" + orderId + " !!!!!!!!!!");

        driverService.notifyCustomerOfArrival(driverPrincipal.getEmail(), orderId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/location")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> updateOwnLocation(
            @RequestBody UpdateLocationRequest request,
            @AuthenticationPrincipal Driver driverPrincipal) {

        CoordinatesDTO newLocation = new CoordinatesDTO(request.getLatitude(), request.getLongitude());
        driverService.updateDriverLocation(driverPrincipal.getEmail(), newLocation);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/info")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverResponseDTO> getInfo(@AuthenticationPrincipal Driver driverPrincipal) {
        String driverEmail = driverPrincipal.getEmail();
        DriverResponseDTO driverInfo = driverService.getDriverInfo(driverEmail);
        return ResponseEntity.ok(driverInfo);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('DRIVER')")
    // 1. Povratni tip je ResponseEntity<?> da bi mogao da vrati i uspeh i grešku
    public ResponseEntity<?> updateOwnProfile(
            @AuthenticationPrincipal Driver driverPrincipal,
            @RequestBody UpdateProfileRequestDTO request) {

        try {
            // 2. Servis sada vraća naš novi DTO
            ProfileUpdateResponseDTO updatedProfile = driverService.updateProfile(driverPrincipal.getEmail(), request);

            // 3. Vraćamo uspešan odgovor sa novim DTO-om
            return ResponseEntity.ok(updatedProfile);

        } catch (IllegalArgumentException e) {
            // Rukovanje greškom ostaje isto
            Map<String, String> errorResponse = Map.of("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    @GetMapping("/vehicle")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<VehicleInfoDTO> getOwnVehicle(@AuthenticationPrincipal Driver driverPrincipal) {
        String driverEmail = driverPrincipal.getEmail();

        VehicleInfoDTO vehicleInfo = driverService.getDriverVehicle(driverEmail);

        return ResponseEntity.ok(vehicleInfo);
    }

    @PutMapping("/vehicle")
    @PreAuthorize("hasRole('DRIVER')")
    // 1. Promenjen povratni tip u ResponseEntity<VehicleInfoDTO>
    public ResponseEntity<VehicleInfoDTO> updateOwnVehicle(
            @RequestBody UpdateVehicleRequest request,
            @AuthenticationPrincipal Driver driverPrincipal) {

        String driverEmail = driverPrincipal.getEmail();

        // 2. Servis sada vraća VehicleInfoDTO, pa ga smeštamo u odgovarajuću promenljivu
        VehicleInfoDTO updatedVehicle = driverService.updateVehicle(driverEmail, request.getNewVehicleType());

        // 3. Vraćamo uspešan odgovor sa novim, manjim DTO-om
        return ResponseEntity.ok(updatedVehicle);
    }
    @GetMapping("/performance")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverPerformanceResponse> getMyPerformance(
            @AuthenticationPrincipal Driver driverPrincipal) {
        String driverEmail = driverPrincipal.getEmail();

        DriverPerformanceResponse performanceData = driverService.getDriverPerformance(driverEmail);

        return ResponseEntity.ok(performanceData);
    }


    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverDashboardResponse> getDashboard(
            @AuthenticationPrincipal Driver driverPrincipal) {
        DriverDashboardResponse dashboardData = driverService.getDashboardData(driverPrincipal.getEmail());
        return ResponseEntity.ok(dashboardData);
    }
    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DashboardOrderDTO> getSingleOrderDetails(
            @PathVariable Long orderId,
            @AuthenticationPrincipal Driver driverPrincipal) {

        DashboardOrderDTO orderDetails = driverService.getAssignedOrderDetails(driverPrincipal.getEmail(), orderId);
        return ResponseEntity.ok(orderDetails);
    }

    @PostMapping("/orders/{orderId}/start-simulation")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> startDrivingSimulation(
            @PathVariable Long orderId,
            @AuthenticationPrincipal Driver driverPrincipal) {

        driverService.startSimulationForOrder(driverPrincipal.getEmail(), orderId);

        return ResponseEntity.ok().build();
    }


    @PostMapping("/offers/{offerId}/accept")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> acceptOrderOffer(
            @PathVariable Long offerId,
            @AuthenticationPrincipal Driver driverPrincipal) {
        driverService.acceptOffer(driverPrincipal.getEmail(), offerId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/offers/{offerId}/reject")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> rejectOrderOffer(
            @PathVariable Long offerId,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal Driver driverPrincipal) {
        String reason = (payload != null) ? payload.get("reason") : null;
        driverService.rejectOffer(driverPrincipal.getEmail(), offerId, reason);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/orders/{orderId}/pickup")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> pickUpOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal Driver driverPrincipal) {

        // On radi tačno ono što treba: prosleđuje email vozača i ID porudžbine servisu.
        driverService.markOrderAsPickedUp(driverPrincipal.getEmail(), orderId);

        // I vraća uspešan odgovor.
        return ResponseEntity.ok().build();
    }

    @PostMapping("/orders/{orderId}/deliver")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> deliverOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal Driver driverPrincipal) {
        driverService.markOrderAsDelivered(driverPrincipal.getEmail(), orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/orders/{orderId}/report-delay")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> reportDelay(
            @PathVariable Long orderId,
            @Valid @RequestBody ReportDelayRequest request, // Koristimo novi DTO
            @AuthenticationPrincipal Driver driverPrincipal) {

        driverService.reportDelay(
                driverPrincipal.getEmail(),
                orderId,
                request.getDelayMinutes()
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/orders/{orderId}/cancel")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> cancelAssignedDelivery(
            @PathVariable Long orderId,
            @Valid @RequestBody CancelDeliveryRequest request,
            @AuthenticationPrincipal Driver driverPrincipal) {

        System.out.println("Logged in driver: " + driverPrincipal);
        System.out.println("Roles: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());

        driverService.cancelAssignedDelivery(driverPrincipal.getEmail(), orderId, request.getReason());
        return ResponseEntity.ok().build();
    }

}
