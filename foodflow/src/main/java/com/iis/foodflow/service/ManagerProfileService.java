// src/main/java/com/iis/foodflow/service/ManagerProfileService.java
package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.ChangePasswordRequestDTO;
import com.iis.foodflow.dto.request.UpdateManagerProfileRequestDTO;
import com.iis.foodflow.dto.response.ManagerProfileDTO;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.repository.ManagerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ManagerProfileService {

    private final ManagerRepository managerRepository;
    private final PasswordEncoder passwordEncoder;

    // Anotacija je tu da osigura da se sve dešava unutar sesije
    @Transactional(readOnly = true)
    public ManagerProfileDTO getManagerProfile(Manager currentManager) {

        // ===== KLJUČNA IZMENA: PONOVO UČITAVAMO MENADŽERA SA SVIM PODACIMA =====
        Manager manager = managerRepository.findByEmailWithRestaurants(currentManager.getEmail())
                .orElseThrow(() -> new IllegalStateException("Manager not found in database"));
        // ======================================================================

        String fullName = manager.getFirstName() + " " + manager.getLastName();
        String address = "No restaurant assigned";

        // Sada ovaj poziv MORA da radi
        Optional<Restaurant> firstRestaurant = manager.getManagedRestaurants().stream().findFirst();
        if (firstRestaurant.isPresent() && firstRestaurant.get().getAddress() != null) {
            address = firstRestaurant.get().getAddress().toString();
        }

        return ManagerProfileDTO.builder()
                .fullName(fullName)
                .phone(manager.getPhone())
                .address(address)
                .email(manager.getEmail())
                .build();
    }

    @Transactional
    public ManagerProfileDTO updateManagerProfile(Manager manager, UpdateManagerProfileRequestDTO request) {
        manager.setPhone(request.getPhone());
        Manager updatedManager = managerRepository.save(manager);
        // Pozivamo getManagerProfile da bismo vratili DTO sa svim podacima
        return getManagerProfile(updatedManager);
    }

    @Transactional
    public void changePassword(Manager manager, ChangePasswordRequestDTO request) {
        if (!passwordEncoder.matches(request.getOldPassword(), manager.getPassword())) {
            throw new IllegalArgumentException("Incorrect old password.");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New passwords do not match.");
        }
        manager.setPassword(passwordEncoder.encode(request.getNewPassword()));
        managerRepository.save(manager);
    }
}