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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    @GetMapping("/status")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverStatusResponse> getOwnStatus(
            @AuthenticationPrincipal Driver driverPrincipal) {

        DriverStatusResponse statusResponse = driverService.getDriverStatus(driverPrincipal.getEmail());
        return ResponseEntity.ok(statusResponse);
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


    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverDashboardResponse> getDashboard(
            @AuthenticationPrincipal Driver driverPrincipal) {
        DriverDashboardResponse dashboardData = driverService.getDashboardData(driverPrincipal.getEmail());
        return ResponseEntity.ok(dashboardData);
    }


    @PostMapping("/offers/{offerId}/accept")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> acceptOrderOffer(
            @PathVariable Long offerId,
            @AuthenticationPrincipal Driver driverPrincipal) {
        driverService.acceptOffer(driverPrincipal.getEmail(), offerId);
        return ResponseEntity.ok().build();
    }

    /** POST endpoint kojim vozač odbija ponudu za dostavu. */
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

    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DashboardOrderDTO> getSingleOrderDetails(
            @PathVariable Long orderId,
            @AuthenticationPrincipal Driver driverPrincipal) {

        DashboardOrderDTO orderDetails = driverService.getAssignedOrderDetails(driverPrincipal.getEmail(), orderId);
        return ResponseEntity.ok(orderDetails);
    }



    /** POST endpoint kojim vozač označava da je preuzeo porudžbinu. */
    @PostMapping("/orders/{orderId}/pickup")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> pickUpOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal Driver driverPrincipal) {
        driverService.markOrderAsPickedUp(driverPrincipal.getEmail(), orderId);
        return ResponseEntity.ok().build();
    }

    /** POST endpoint kojim vozač označava da je isporučio porudžbinu. */
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
    public ResponseEntity<Void> reportDeliveryDelay(
            @PathVariable Long orderId,
            @Valid @RequestBody ReportDelayRequest request, // <-- KORISTIMO DTO I @Valid
            @AuthenticationPrincipal Driver driverPrincipal) {

        // Nema više potrebe za 'if' provjerom!
        // Ako validacija padne, Spring će automatski vratiti 400 Bad Request sa porukom.

        driverService.reportDelay(driverPrincipal.getEmail(), orderId, request.getDelayMinutes());
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
