package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.RegisterManagerRequestDTO;
import com.iis.foodflow.dto.request.UpdateManagerRequestDTO;
import com.iis.foodflow.dto.response.AdminDriverPerformanceResponse;
import com.iis.foodflow.dto.response.ManagerDetailDTO;
import com.iis.foodflow.dto.response.ManagerInfoDTO;
import com.iis.foodflow.model.user.Administrator;
import com.iis.foodflow.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/managers")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR')")
    public ResponseEntity<List<ManagerInfoDTO>> getAllManagers() {
        return ResponseEntity.ok(adminService.getAllManagers());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR')")
    public ResponseEntity<?> registerManager(@RequestBody RegisterManagerRequestDTO request, @AuthenticationPrincipal Administrator admin) {
        try {
            ManagerInfoDTO newManager = adminService.registerManager(request, admin);
            return new ResponseEntity<>(newManager, HttpStatus.CREATED);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR')")
    public ResponseEntity<ManagerDetailDTO> getManagerDetails(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getManagerById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR')")
    public ResponseEntity<ManagerDetailDTO> updateManager(@PathVariable Long id, @RequestBody UpdateManagerRequestDTO request) {
        return ResponseEntity.ok(adminService.updateManager(id, request));
    }

    @GetMapping("/drivers-performance")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<List<AdminDriverPerformanceResponse>> getAllDriverPerformances() {
        List<AdminDriverPerformanceResponse> performances = adminService.getAllDriverPerformances();
        return ResponseEntity.ok(performances);
    }
}