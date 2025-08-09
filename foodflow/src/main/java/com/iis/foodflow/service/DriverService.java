package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.DriverLocationResponse;
import com.iis.foodflow.dto.response.DriverPerformanceResponse;
import com.iis.foodflow.enums.DriverStatus;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.enums.VehicleType;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.repository.DriverRepository;
import com.iis.foodflow.repository.OrderRepository; // <-- POTREBAN IMPORT
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository; // <-- POTREBNA ZAVISNOST

    /** Mijenja status dostupnosti vozača (ONLINE/OFFLINE). */
    @Transactional
    public Driver updateStatus(String driverEmail, DriverStatus newStatus) {
        Driver driver = findDriverByEmail(driverEmail);
        driver.setStatus(newStatus);
        return driverRepository.save(driver);
    }

    /** Ažurira geografsku lokaciju vozača. */
    @Transactional
    public void updateLocation(String driverEmail, Double latitude, Double longitude) {
        Driver driver = findDriverByEmail(driverEmail);
        driver.setLatitude(latitude);
        driver.setLongitude(longitude);
        driver.setTimestamp(LocalDateTime.now());
        driverRepository.save(driver);
    }

    /** Mijenja tip vozila za prijavljenog vozača. */
    @Transactional
    public Driver updateVehicle(String driverEmail, VehicleType newVehicleType) {
        Driver driver = findDriverByEmail(driverEmail);
        driver.setVehicleType(newVehicleType);
        return driverRepository.save(driver);
    }

    /** Pronalazi vozača po ID-u i vraća DTO sa podacima o lokaciji. */
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

    /** Prikuplja i izračunava statistike o performansama za prijavljenog vozača. */
    public DriverPerformanceResponse getDriverPerformance(String driverEmail) {
        Driver driver = findDriverByEmail(driverEmail);

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // Dobijamo ukupan broj isporučenih porudžbina u periodu
        Long totalDelivered = orderRepository.countByDriverAndStatusAndCreationDateAfter(
                driver, OrderStatus.DELIVERED, thirtyDaysAgo
        );

        // Dobijamo broj porudžbina isporučenih na vrijeme u periodu
        Long onTimeDelivered = orderRepository.countOnTimeDeliveriesForDriver(
                driver, OrderStatus.DELIVERED, thirtyDaysAgo
        );

        // Računamo procenat u Javi
        double onTimeRate;
        if (totalDelivered == null || totalDelivered == 0) {
            onTimeRate = 1.0; // 100% ako nije bilo isporuka
        } else {
            onTimeRate = (double) onTimeDelivered / totalDelivered;
        }

        // TODO: Dodati logiku za dobijanje broja odbijanja u posljednjih 30 dana

        return new DriverPerformanceResponse(
                driver.getFirstName(),
                driver.getLastName(),
                driver.getVehicleType(),
                totalDelivered.intValue(),
                onTimeRate,
                0, // TODO: Zamijeniti sa pravim brojem odbijanja
                driver.getAverageRating()
        );
    }

    // Pomoćna privatna metoda da se izbjegne ponavljanje koda
    private Driver findDriverByEmail(String email) {
        return driverRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Driver not found with email: " + email));
    }
}