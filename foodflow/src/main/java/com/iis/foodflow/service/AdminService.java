package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.RegisterManagerRequestDTO;
import com.iis.foodflow.dto.request.UpdateManagerRequestDTO;
import com.iis.foodflow.dto.response.ManagerDetailDTO;
import com.iis.foodflow.dto.response.ManagerInfoDTO;
import com.iis.foodflow.enums.Role;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Administrator;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.repository.ManagerRepository;
import com.iis.foodflow.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ManagerRepository managerRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestaurantRepository restaurantRepository;

    public List<ManagerInfoDTO> getAllManagers() {
        return managerRepository.findAll().stream()
                .map(this::mapToManagerInfoDTO)
                .collect(Collectors.toList());
    }

    private ManagerInfoDTO mapToManagerInfoDTO(Manager manager) {
        return ManagerInfoDTO.builder()
                .id(manager.getId())
                .fullName(manager.getFirstName() + " " + manager.getLastName())
                .email(manager.getEmail())
                .build();
    }

    @Transactional
    public ManagerInfoDTO registerManager(RegisterManagerRequestDTO request, Administrator admin) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }
        if (managerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalStateException("Email is already in use.");
        }

        Manager newManager = new Manager();
        newManager.setFirstName(request.getFirstName());
        newManager.setLastName(request.getLastName());
        newManager.setEmail(request.getEmail());
        newManager.setPhone(request.getPhone());
        newManager.setPassword(passwordEncoder.encode(request.getPassword()));
        newManager.setRole(Role.MANAGER);
        newManager.setCreatedByAdmin(admin);

        Manager savedManager = managerRepository.save(newManager);
        return mapToManagerInfoDTO(savedManager);
    }

    @Transactional(readOnly = true)
    public ManagerDetailDTO getManagerById(Long managerId) {
        // ===== KORISTIMO UPIT SA JOIN FETCH =====
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        List<Long> restaurantIds = manager.getManagedRestaurants().stream()
                .map(Restaurant::getId)
                .collect(Collectors.toList());

        return ManagerDetailDTO.builder()
                .id(manager.getId())
                .firstName(manager.getFirstName())
                .lastName(manager.getLastName())
                .email(manager.getEmail())
                .phone(manager.getPhone())
                .managedRestaurantIds(restaurantIds)
                .build();
    }

    @Transactional
    public ManagerDetailDTO updateManager(Long managerId, UpdateManagerRequestDTO request) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        manager.setFirstName(request.getFirstName());
        manager.setLastName(request.getLastName());
        manager.setEmail(request.getEmail());
        manager.setPhone(request.getPhone());

        // Uklanjamo menadžera sa svih restorana kojima je TRENUTNO dodeljen
        manager.getManagedRestaurants().forEach(r -> r.setManager(null));

        // Pronalazimo nove restorane i dodeljujemo im ovog menadžera
        if (request.getRestaurantIds() != null && !request.getRestaurantIds().isEmpty()) {
            Set<Restaurant> assignedRestaurants = new HashSet<>(restaurantRepository.findAllById(request.getRestaurantIds()));
            assignedRestaurants.forEach(r -> r.setManager(manager));
        }

        Manager updatedManager = managerRepository.save(manager);
        return getManagerById(updatedManager.getId());
    }
}