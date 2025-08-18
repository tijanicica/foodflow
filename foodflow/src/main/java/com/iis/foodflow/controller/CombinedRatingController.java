package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.CombinedRatingRequest;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.service.CombinedRatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders/{orderId}/rate") // Jedan, jasan URL
@RequiredArgsConstructor
public class CombinedRatingController {

    private final CombinedRatingService combinedRatingService;

    @PostMapping // Koristimo POST jer kreiramo ocene
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> rateOrderAndDelivery(
            @PathVariable Long orderId,
            @RequestBody CombinedRatingRequest request,
            @AuthenticationPrincipal Customer customer) {

        combinedRatingService.processCombinedRating(orderId, request, customer);

        return ResponseEntity.ok().build();
    }
}