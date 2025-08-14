package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.AddressRequestDTO;
import com.iis.foodflow.dto.request.UpdateAddressRequestDTO;
import com.iis.foodflow.dto.response.AddressDTO;
import com.iis.foodflow.dto.response.UserProfileDTO;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.service.AddressService;
import com.iis.foodflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            @RequestBody AddressRequestDTO addressRequest,
            @AuthenticationPrincipal Customer customer
    ) {
        AddressDTO newAddress = addressService.addNewAddress(addressRequest, customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(newAddress);
    }

    private final UserService userService; // Može biti i u AddressService

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<UserProfileDTO.AddressDTO> updateAddress(
            @PathVariable("id") Long id,
            @RequestBody UpdateAddressRequestDTO addressData,
            @AuthenticationPrincipal Customer customer) {
        UserProfileDTO.AddressDTO updatedAddress = userService.updateAddress(id, addressData, customer);
        return ResponseEntity.ok(updatedAddress);
    }
}