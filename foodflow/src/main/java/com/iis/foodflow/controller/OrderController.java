package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.OrderRequestDTO;
import com.iis.foodflow.dto.request.RateOrderFoodRequest;
import com.iis.foodflow.dto.request.RejectOfferRequest;
import com.iis.foodflow.dto.response.*;
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

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderAssignmentService orderAssignmentService;
    private final OrderService orderService;

    /*@PostMapping("/{orderId}/accept")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> acceptOrder(@PathVariable Long orderId, @AuthenticationPrincipal Driver driverPrincipal) {
        orderAssignmentService.acceptOrderOffer(orderId, driverPrincipal.getEmail());
        return ResponseEntity.ok().build();
    }*/

    /*@PostMapping("/{orderId}/reject")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> rejectOrder(
            @PathVariable Long orderId,
            @RequestBody(required = false) RejectOfferRequest request,
            @AuthenticationPrincipal Driver driverPrincipal) {

        String reason = (request != null) ? request.getReason() : null;
        orderAssignmentService.rejectOrderOffer(orderId, driverPrincipal.getEmail(), reason);

        return ResponseEntity.ok().build();
    }*/

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

    }
    @PostMapping
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<Void> createOrder(
            @RequestBody OrderRequestDTO orderRequest,
            @AuthenticationPrincipal Customer customer // Spring Security automatski ubacuje ulogovanog korisnika
    ) {
        orderService.createOrder(orderRequest, customer);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<List<OrderSummaryDTO>> getMyOrders(
            @RequestParam("tab") String tab,
            @AuthenticationPrincipal Customer customer
    ) {
        List<OrderSummaryDTO> orders = orderService.getOrdersForTab(tab, customer);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/my-repeating-orders")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<List<RepeatingOrderTemplateDTO>> getMyRepeatingOrders(
            @AuthenticationPrincipal Customer customer
    ) {
        List<RepeatingOrderTemplateDTO> templates = orderService.getRepeatingOrderTemplates(customer);
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<OrderDetailDTO> getOrderDetails(
            @PathVariable("id") Long id, // Eksplicitno kažemo: "Uzmi 'id' iz putanje"
            @AuthenticationPrincipal Customer customer
    ) {
        OrderDetailDTO orderDetails = orderService.getOrderDetails(id, customer);
        return ResponseEntity.ok(orderDetails);
    }

    @PatchMapping("/repeating/{id}/toggle-status")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<RepeatingOrderTemplateDTO> toggleRepeatingOrderStatus(
            @PathVariable("id") Long templateId,
            @AuthenticationPrincipal Customer customer
    ) {
        RepeatingOrderTemplateDTO updatedTemplate = orderService.toggleRepeatingOrderStatus(templateId, customer);
        return ResponseEntity.ok(updatedTemplate);
    }

    @DeleteMapping("/repeating/{id}")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<Void> cancelRepeatingOrder(
            @PathVariable("id") Long templateId,
            @AuthenticationPrincipal Customer customer
    ) {
        orderService.cancelRepeatingOrder(templateId, customer);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/track")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<TrackOrderDTO> getTrackingInfo(
            @PathVariable("id") Long id, // Eksplicitno kažemo: "Uzmi 'id' iz putanje"
            @AuthenticationPrincipal Customer customer
    ) {
        return ResponseEntity.ok(orderService.getTrackingInfo(id, customer));
    }

    @PutMapping("/{orderId}/rate-food")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> rateOrderFood(
            @PathVariable Long orderId,
            @RequestBody RateOrderFoodRequest request,
            @AuthenticationPrincipal Customer customer
    ) {
        orderService.rateOrderFood(orderId, request, customer);

        return ResponseEntity.noContent().build();
    }


    @GetMapping("/my-recommendations")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<List<RecommendedItemDTO>> getMyRecommendations(@AuthenticationPrincipal Customer customer) {
        List<RecommendedItemDTO> recommendations = orderService.getRecommendedItemsForCustomer(customer);
        return ResponseEntity.ok(recommendations);
    }
}