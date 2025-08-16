package com.iis.foodflow.controller;

import com.iis.foodflow.dto.response.ManagerOrderDTO;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.service.ManagerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/orders")
@RequiredArgsConstructor
public class ManagerOrderController {

    private final ManagerOrderService managerOrderService;

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<List<ManagerOrderDTO>> getActiveOrders(@AuthenticationPrincipal Manager manager) {
        return ResponseEntity.ok(managerOrderService.getActiveOrders(manager));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Void> confirmOrder(@PathVariable("id") Long id, @AuthenticationPrincipal Manager manager) {
        managerOrderService.confirmOrder(id, manager);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Void> rejectOrder(@PathVariable("id") Long id, @RequestBody Map<String, String> payload, @AuthenticationPrincipal Manager manager) {        managerOrderService.rejectOrder(id, manager, payload.get("reason"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/ready")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Void> markAsReady(@PathVariable("id") Long id, @AuthenticationPrincipal Manager manager) {
        managerOrderService.markAsReady(id, manager);
        return ResponseEntity.ok().build();
    }
}