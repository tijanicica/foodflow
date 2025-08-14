package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.AddCardRequestDTO;
import com.iis.foodflow.dto.request.ChangePasswordRequestDTO;
import com.iis.foodflow.dto.request.UpdatePhoneRequestDTO;
import com.iis.foodflow.dto.response.UserProfileDTO;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<UserProfileDTO> getMyProfile(@AuthenticationPrincipal Customer customer) {
        return ResponseEntity.ok(userService.getUserProfile(customer));
    }

    @PostMapping("/cards")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<UserProfileDTO.CardDTO> addNewCard(
            @Valid @RequestBody AddCardRequestDTO cardRequest, // <-- DODAJ @Valid
            @AuthenticationPrincipal Customer customer) {
        UserProfileDTO.CardDTO newCard = userService.addNewCard(cardRequest, customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(newCard);
    }

    @DeleteMapping("/cards/{id}")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<Void> deleteCard(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Customer customer) {
        userService.deleteCard(id, customer);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/profile/phone")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<Void> updatePhone(
            @RequestBody UpdatePhoneRequestDTO request,
            @AuthenticationPrincipal Customer customer) {
        userService.updatePhoneNumber(customer, request.getPhone());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/cards/{id}/set-active")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<Void> setActiveCard(
            @PathVariable("id") Long id, // <-- DODAJTE OVU ANOTACIJU
            @AuthenticationPrincipal Customer customer
    ) {
        userService.setActiveCard(id, customer);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/profile/change-password")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<?> changePassword( // Promenjen povratni tip u ResponseEntity<?>
                                             @RequestBody ChangePasswordRequestDTO request,
                                             @AuthenticationPrincipal Customer customer) {

        try {
            userService.changePassword(customer, request);
            // Ako je sve prošlo kako treba, vrati 200 OK bez tela
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            // Ako je uhvaćena greška (npr. pogrešna lozinka),
            // kreiraj mapu sa porukom i vrati 400 Bad Request.
            Map<String, String> errorResponse = Map.of("message", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse);
        }
    }
}
