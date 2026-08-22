package com.iis.foodflow.controller;

import com.iis.foodflow.dto.response.DeliveryDTO;
import com.iis.foodflow.dto.response.TrackOrderManagerDTO;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.service.DeliveryManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/manager/deliveries")
@RequiredArgsConstructor
public class DeliveryManagementController {

    private final DeliveryManagementService deliveryService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<List<DeliveryDTO>> getDeliveries(@AuthenticationPrincipal Manager manager) {
        return ResponseEntity.ok(deliveryService.getDeliveriesForManager(manager));
    }

    @GetMapping("/{orderId}/track")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<TrackOrderManagerDTO> getTrackingInfo(@PathVariable Long orderId, @AuthenticationPrincipal Manager manager) {
        return ResponseEntity.ok(deliveryService.getTrackingInfo(orderId, manager));
    }
}