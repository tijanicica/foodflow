package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.OrderRequestDTO;
import com.iis.foodflow.dto.request.RejectOfferRequest;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.service.OrderAssignmentService;
import com.iis.foodflow.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderAssignmentService orderAssignmentService;
    private final OrderService orderService;

    @PostMapping("/{orderId}/accept")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> acceptOrder(@PathVariable Long orderId, @AuthenticationPrincipal Driver driverPrincipal) {
        orderAssignmentService.acceptOrderOffer(orderId, driverPrincipal.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderId}/reject")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> rejectOrder(
            @PathVariable Long orderId,
            @RequestBody(required = false) RejectOfferRequest request,
            @AuthenticationPrincipal Driver driverPrincipal) {

        String reason = (request != null) ? request.getReason() : null;
        orderAssignmentService.rejectOrderOffer(orderId, driverPrincipal.getEmail(), reason);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderId}/deliver")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> markAsDelivered(@PathVariable Long orderId) {
        orderService.markOrderAsDelivered(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderId}/ready")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> markAsReady(@PathVariable Long orderId) {
        orderService.markOrderAsReadyForPickup(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderId}/confirm")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> confirmOrder(@PathVariable Long orderId) {
        orderService.confirmOrder(orderId);
        return ResponseEntity.ok().build();

    @PostMapping
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<Void> createOrder(
            @RequestBody OrderRequestDTO orderRequest,
            @AuthenticationPrincipal Customer customer // Spring Security automatski ubacuje ulogovanog korisnika
    ) {
        orderService.createOrder(orderRequest, customer);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}