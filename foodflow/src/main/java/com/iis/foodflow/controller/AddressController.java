package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.AddressRequest;
import com.iis.foodflow.dto.request.AddressRequestDTO;
import com.iis.foodflow.dto.request.UpdateAddressRequestDTO;
import com.iis.foodflow.dto.response.AddressDTO;
import com.iis.foodflow.dto.response.UserProfileDTO;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.service.AddressService;
import com.iis.foodflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping("/my")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<List<AddressDTO>> getMyAddresses(@AuthenticationPrincipal Customer customer) {
        List<AddressDTO> addresses = addressService.getAddressesForCustomer(customer);
        return ResponseEntity.ok(addresses);
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<AddressDTO> addNewAddress(
            @RequestBody AddressRequest addressRequest,
            @AuthenticationPrincipal Customer customer
    ) {
        AddressDTO newAddress = addressService.addNewAddress(addressRequest, customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(newAddress);
    }

    private final UserService userService; // Može biti i u AddressService

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<?> updateAddress(
            @PathVariable("id") Long id,
            @RequestBody UpdateAddressRequestDTO addressData,
            @AuthenticationPrincipal Customer customer) {

        try {
            // Овај позив остаје исти. Он ће бацити изузетак ако тригер реагује.
            UserProfileDTO.AddressDTO updatedAddress = userService.updateAddress(id, addressData, customer);
            return ResponseEntity.ok(updatedAddress);

        } catch (DataAccessException e) {
            // DataAccessException је Spring-ов омотач око SQL грешака.
            // Проверавамо да ли је узрок грешке она коју баца наш тригер.
            if (e.getMostSpecificCause().getMessage().contains("Cannot edit address details")) {
                // Враћамо HTTP 409 Conflict статус са јасном поруком.
                // Фронтенд ће ову поруку моћи да прочита.
                Map<String, String> errorResponse = Map.of("message", e.getMostSpecificCause().getMessage());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
            }
            // Ако је нека друга грешка у бази, врати општију грешку.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Database error occurred."));
        }
    }

}
