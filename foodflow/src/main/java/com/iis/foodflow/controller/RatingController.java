// Datoteka: src/main/java/com/iis/foodflow/controller/RatingController.java
package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.RateDeliveryByCustomerRequest;
import com.iis.foodflow.dto.request.RateDeliveryByRestaurantRequest;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ratings/driver") // Promijenjen URL da bude jasniji
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/{orderId}/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> rateByCustomer(
            @PathVariable Long orderId,
            @RequestBody RateDeliveryByCustomerRequest request,
            @AuthenticationPrincipal Customer customerPrincipal) {

        ratingService.rateByCustomer(orderId, customerPrincipal, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderId}/restaurant")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> rateByRestaurant(
            @PathVariable Long orderId,
            @RequestBody RateDeliveryByRestaurantRequest request,
            @AuthenticationPrincipal Manager managerPrincipal) {

        ratingService.rateByRestaurant(orderId, managerPrincipal, request);
        return ResponseEntity.ok().build();
    }
}