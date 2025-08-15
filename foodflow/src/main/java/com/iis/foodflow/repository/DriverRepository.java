package com.iis.foodflow.repository;

import com.iis.foodflow.enums.DriverStatus;
import com.iis.foodflow.model.user.Driver;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByEmail(String email);
    List<Driver> findByStatus(DriverStatus status);
    @Transactional
    @Modifying
    @Query("UPDATE Driver d SET d.latitude = :latitude, d.longitude = :longitude WHERE d.id = :driverId")
    void updateDriverLocation(@Param("driverId") Long driverId, @Param("latitude") double latitude, @Param("longitude") double longitude);

    @Query("SELECT d FROM Driver d WHERE d.status = 'ONLINE' AND d.id NOT IN " +
            "(SELECT o.driver.id FROM OrderOffer o WHERE o.order.id = :orderId)")
    List<Driver> findAvailableDrivers(@Param("orderId") Long orderId);
}
