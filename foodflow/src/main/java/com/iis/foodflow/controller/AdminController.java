package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.RegisterDriverRequestDTO;
import com.iis.foodflow.dto.request.RegisterManagerRequestDTO;
import com.iis.foodflow.dto.request.UpdateManagerRequestDTO;
import com.iis.foodflow.dto.response.*;
import com.iis.foodflow.model.user.Administrator;
import com.iis.foodflow.service.AdminService;
import com.iis.foodflow.service.DriverService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final DriverService driverService;


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

    @GetMapping("/drivers/live-locations")
    public ResponseEntity<List<DriverLiveLocationDTO>> getLiveDriverLocations() {
        // Pozivamo novu metodu iz AdminService
        List<DriverLiveLocationDTO> liveLocations = adminService.getLiveDriverLocations();
        // Vraćamo podatke sa HTTP statusom 200 OK
        return ResponseEntity.ok(liveLocations);
    }
    @PostMapping("/drivers")
    public ResponseEntity<?> registerDriver(@RequestBody RegisterDriverRequestDTO request, @AuthenticationPrincipal Administrator admin) {
        try {
            DriverResponseDTO newDriver = adminService.registerDriver(request, admin);
            return new ResponseEntity<>(newDriver, HttpStatus.CREATED);
        } catch (IllegalStateException | IllegalArgumentException e) {
            // Vraća grešku ako email postoji ili lokacija nije validna
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }


    @DeleteMapping("/drivers/{driverId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')") // Dodaj autorizaciju za svaki slučaj
    public ResponseEntity<?> deleteDriver(@PathVariable Long driverId) {
        try {
            driverService.deleteDriver(driverId);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Pokušaj da izvučeš konkretnu poruku iz baze
            // Ponekad je prava poruka "sakrivena" unutar izuzetka
            String rootCauseMessage = e.getMostSpecificCause().getMessage();
            if (rootCauseMessage != null && rootCauseMessage.contains("Cannot delete driver")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Ne možete obrisati vozača jer ima aktivne dostave.");
            }
            // Generalna poruka ako ne možemo da pročitamo specifičnu
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Brisanje nije moguće zbog postojećih veza u bazi.");

        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());

        } catch (Exception e) {
            // Opšti catch-all blok da vidimo da li se dešava neka druga greška
            // Ovo je dobro za debagovanje
            System.err.println("Neočekivana greška pri brisanju vozača: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Došlo je do neočekivane greške na serveru.");
        }
    }
}