package com.iis.foodflow.controller;

import com.iis.foodflow.dto.response.CouponDTO;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/my")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<List<CouponDTO>> getMyCoupons(@AuthenticationPrincipal Customer customer) {
        return ResponseEntity.ok(couponService.getMyCoupons(customer));
    }
}