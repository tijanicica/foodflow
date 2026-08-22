package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.RegisterDriverRequestDTO;
import com.iis.foodflow.dto.request.RegisterManagerRequestDTO;
import com.iis.foodflow.dto.request.UpdateManagerRequestDTO;
import com.iis.foodflow.dto.response.*;
import com.iis.foodflow.enums.DriverStatus;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.enums.Role;
import com.iis.foodflow.enums.VehicleType;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Administrator;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.repository.DriverRepository;
import com.iis.foodflow.repository.ManagerRepository;
import com.iis.foodflow.repository.OrderRepository;
import com.iis.foodflow.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ManagerRepository managerRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestaurantRepository restaurantRepository;
    private final DriverService driverService;
    private final OrderRepository orderRepository;

    private final DriverRepository driverRepository;

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

    @Transactional(readOnly = true) // Transakcija je samo za čitanje, radi optimizacije
    public List<AdminDriverPerformanceResponse> getAllDriverPerformances() {
        // 1. Dobavi sve entitete vozača iz baze podataka
        List<Driver> allDrivers = driverRepository.findAll();

        // 2. Koristeći stream, prođi kroz listu svih vozača
        return allDrivers.stream()
                .map(driver -> {
                    // 3. Za svakog vozača, pozovi već postojeću metodu koju koristi i sam vozač
                    DriverPerformanceResponse performance = driverService.getDriverPerformance(driver.getEmail());

                    // 4. Mapiraj dobijene podatke u novi DTO (AdminDriverPerformanceResponse)
                    return new AdminDriverPerformanceResponse(
                            driver.getId(), // Dodajemo ID koji nam treba
                            performance.getFirstName(),
                            performance.getLastName(),
                            performance.getVehicleType(),
                            performance.getTotalDeliveries(),
                            performance.getOnTimeRate(),
                            performance.getRejections(),
                            performance.getAverageRating()
                    );
                })
                // 5. Sakupi sve kreirane DTO objekte u jednu listu
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DriverLiveLocationDTO> getLiveDriverLocations() {
        List<OrderStatus> activeOrderStatuses = Arrays.asList(
                OrderStatus.READY_FOR_PICKUP,
                OrderStatus.PICKED_UP
        );

        return driverRepository.findAll().stream()
                .map(driver -> {
                    Optional<Order> activeOrderOpt = orderRepository
                            .findTopByDriverAndStatusInOrderByCreationDateDesc(driver, activeOrderStatuses);

                    return DriverLiveLocationDTO.builder()
                            .id(driver.getId())
                            .firstName(driver.getFirstName())
                            .lastName(driver.getLastName())
                            .latitude(driver.getLatitude())
                            .longitude(driver.getLongitude())
                            .status(driver.getStatus())
                            .vehicleType(driver.getVehicleType())
                            // .timestamp(driver.getTimestamp()) // <- UKLONJENA LINIJA
                            .activeOrderId(activeOrderOpt.map(Order::getId).orElse(null))
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public DriverResponseDTO registerDriver(RegisterDriverRequestDTO request, Administrator admin) {
        if (driverRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalStateException("Email is already in use.");
        }

        // --- PROMENA: Provera da li su koordinate poslate ---
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new IllegalArgumentException("Location (latitude and longitude) must be provided.");
        }

        Driver newDriver = new Driver();
        newDriver.setFirstName(request.getFirstName());
        newDriver.setLastName(request.getLastName());
        newDriver.setEmail(request.getEmail());
        newDriver.setPhone(request.getPhone());
        newDriver.setPassword(passwordEncoder.encode(request.getPassword()));
        newDriver.setCreatedByAdmin(admin);

        newDriver.setRole(Role.DRIVER);
        newDriver.setStatus(DriverStatus.OFFLINE);
        newDriver.setVehicleType(VehicleType.CAR);

        // --- PROMENA: Direktno postavljanje koordinata ---
        newDriver.setLatitude(request.getLatitude());
        newDriver.setLongitude(request.getLongitude());
        newDriver.setTimestamp(LocalDateTime.now());

        Driver savedDriver = driverRepository.save(newDriver);
        return mapToDriverResponseDTO(savedDriver);
    }
    private DriverResponseDTO mapToDriverResponseDTO(Driver driver) {
        return DriverResponseDTO.builder()
                .id(driver.getId())
                .email(driver.getEmail())
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .phone(driver.getPhone())
                .vehicleType(driver.getVehicleType())
                .status(driver.getStatus())
                .latitude(driver.getLatitude())
                .longitude(driver.getLongitude())
                .build();
    }

}