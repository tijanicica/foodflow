package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.CreateMenuItemRequestDTO;
import com.iis.foodflow.dto.request.CreateMenuRequestDTO;
import com.iis.foodflow.dto.request.UpdateMenuRequestDTO;
import com.iis.foodflow.dto.response.ManagerMenuDTO;
import com.iis.foodflow.dto.response.MenuVersionDetailDTO;
import com.iis.foodflow.dto.response.RestaurantMenusDTO;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.service.MenuManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/manager/menus")
@RequiredArgsConstructor
public class MenuManagementController {

    private final MenuManagementService menuManagementService;
    @PostMapping("/{menuVersionId}/items")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Void> addItemToMenu(
            @PathVariable Long menuVersionId,
            @RequestBody CreateMenuItemRequestDTO request,
            @AuthenticationPrincipal Manager manager) {
        try {
            menuManagementService.addItemToMenu(menuVersionId, request, manager);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (SecurityException e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            // Loguj grešku za debagovanje
            // e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<MenuVersionDetailDTO> getMenuVersionDetails(@PathVariable Long id, @AuthenticationPrincipal Manager manager) {
        try {
            return ResponseEntity.ok(menuManagementService.getMenuVersionDetails(id, manager));
        } catch (SecurityException e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        } catch (RuntimeException e) {
            // Bolje je vratiti NOT_FOUND ako meni ne postoji
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<List<RestaurantMenusDTO>> getMenus(@AuthenticationPrincipal Manager manager) {
        return ResponseEntity.ok(menuManagementService.getMenusGroupedByRestaurant(manager));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<ManagerMenuDTO> createMenu(@RequestBody CreateMenuRequestDTO request, @AuthenticationPrincipal Manager manager) {
        return new ResponseEntity<>(menuManagementService.createMenu(request, manager), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Void> deactivateMenuVersion(@PathVariable Long id, @AuthenticationPrincipal Manager manager) {
        try {
            menuManagementService.deactivateMenuVersion(id, manager);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<ManagerMenuDTO> updateMenu(
            @PathVariable Long id,
            @RequestBody UpdateMenuRequestDTO request,
            @AuthenticationPrincipal Manager manager) {
        return ResponseEntity.ok(menuManagementService.updateMenu(id, request, manager));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Void> activateMenu(@PathVariable Long id, @AuthenticationPrincipal Manager manager) {
        menuManagementService.activateMenuVersion(id, manager);
        return ResponseEntity.ok().build();
    }
}