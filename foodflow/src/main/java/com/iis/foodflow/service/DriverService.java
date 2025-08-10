package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.DriverLocationResponse;
import com.iis.foodflow.dto.response.DriverPerformanceResponse;
import com.iis.foodflow.dto.response.DriverResponseDTO;
import com.iis.foodflow.enums.DriverStatus;
import com.iis.foodflow.enums.OfferStatus;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.enums.VehicleType;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.repository.DriverRatingRepository;
import com.iis.foodflow.repository.DriverRepository;
import com.iis.foodflow.repository.OrderOfferRepository;
import com.iis.foodflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DriverService {

    // --- SVE POTREBNE ZAVISNOSTI ---
    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;
    private final DriverRatingRepository driverRatingRepository; // <-- ISPRAVKA: Dodana zavisnost
    private final OrderOfferRepository orderOfferRepository;   // <-- ISPRAVKA: Dodana zavisnost

    /**
     * Mijenja status dostupnosti vozača (ONLINE/OFFLINE).
     */
// Ispravljena verzija
    @Transactional
    public DriverResponseDTO updateStatus(String driverEmail, DriverStatus newStatus) { // 1. Promijenjen povratni tip
        Driver driver = findDriverByEmail(driverEmail);
        driver.setStatus(newStatus);
        Driver savedDriver = driverRepository.save(driver);

        // 2. Kreiramo i vraćamo DTO umjesto cijelog entiteta
        return DriverResponseDTO.builder()
                .id(savedDriver.getId())
                .email(savedDriver.getEmail())
                .firstName(savedDriver.getFirstName())
                .lastName(savedDriver.getLastName())
                .phone(savedDriver.getPhone())
                .vehicleType(savedDriver.getVehicleType())
                .status(savedDriver.getStatus())
                .build();
    }

    /**
     * Ažurira geografsku lokaciju vozača.
     */
    @Transactional
    public void updateLocation(String driverEmail, Double latitude, Double longitude) {
        Driver driver = findDriverByEmail(driverEmail);
        driver.setLatitude(latitude);
        driver.setLongitude(longitude);
        driver.setTimestamp(LocalDateTime.now());
        driverRepository.save(driver);
    }

    /**
     * Mijenja tip vozila za prijavljenog vozača.
     */
// Nova, ispravljena verzija u vašem servisu
    @Transactional
    public DriverResponseDTO updateVehicle(String driverEmail, VehicleType newVehicleType) { // 1. Promijenjen povratni tip
        Driver driver = findDriverByEmail(driverEmail);
        driver.setVehicleType(newVehicleType);
        Driver savedDriver = driverRepository.save(driver);

        // 2. Kreiramo i vraćamo DTO umjesto cijelog entiteta
        return DriverResponseDTO.builder()
                .id(savedDriver.getId())
                .email(savedDriver.getEmail())
                .firstName(savedDriver.getFirstName())
                .lastName(savedDriver.getLastName())
                .phone(savedDriver.getPhone())
                .vehicleType(savedDriver.getVehicleType())
                .status(savedDriver.getStatus())
                .build();
    }

    /**
     * Pronalazi vozača po ID-u i vraća DTO sa podacima o lokaciji.
     */
    @Transactional(readOnly = true)
    public DriverLocationResponse getDriverLocation(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new UsernameNotFoundException("Driver not found with ID: " + driverId));

        return new DriverLocationResponse(
                driver.getId(),
                driver.getFirstName(),
                driver.getLastName(),
                driver.getLatitude(),
                driver.getLongitude(),
                driver.getTimestamp()
        );
    }

    /**
     * Prikuplja i izračunava statistike o performansama za prijavljenog vozača.
     */
    @Transactional(readOnly = true)
    public DriverPerformanceResponse getDriverPerformance(String driverEmail) {
        Driver driver = findDriverByEmail(driverEmail);
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // 1. Dobijamo ukupan broj isporučenih porudžbina
        Long totalDelivered = orderRepository.countByDriverAndStatusAndCreationDateAfter(
                driver, OrderStatus.DELIVERED, thirtyDaysAgo
        );

        // 2. Dobijamo broj porudžbina isporučenih na vrijeme
        Long onTimeDelivered = orderRepository.countOnTimeDeliveriesForDriver(
                driver, OrderStatus.DELIVERED, thirtyDaysAgo
        );

        double onTimeRate = (totalDelivered == null || totalDelivered == 0) ? 1.0 : (double) onTimeDelivered / totalDelivered;

        // 3. Dobijanje broja odbijanja u posljednjih 30 dana
        long rejections = orderOfferRepository.countByDriverAndStatusAndCreatedAtAfter(
                driver, OfferStatus.REJECTED, thirtyDaysAgo
        );

        // 4. Računanje prosječne ocjene iz 'driver_rating' tabele
        double averageRating = driverRatingRepository.findAverageRatingByDriverId(driver.getId())
                .orElse(0.0); // Ako nema ocjena, vrati 0.0

        return new DriverPerformanceResponse(
                driver.getFirstName(),
                driver.getLastName(),
                driver.getVehicleType(),
                totalDelivered != null ? totalDelivered.intValue() : 0, // Ukupno isporuka
                onTimeRate,                                             // Procenat na vrijeme
                (int) rejections,                                       // Broj odbijanja
                averageRating                                           // Prosječna ocjena
        );
    }

    // Pomoćna privatna metoda da se izbjegne ponavljanje koda
    private Driver findDriverByEmail(String email) {
        return driverRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Driver not found with email: " + email));
    }
}