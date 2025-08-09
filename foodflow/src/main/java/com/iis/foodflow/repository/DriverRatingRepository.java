// Datoteka: src/main/java/com/iis/foodflow/repository/DriverRatingRepository.java
package com.iis.foodflow.repository;

import com.iis.foodflow.model.delivery.DriverRating;
import com.iis.foodflow.model.user.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DriverRatingRepository extends JpaRepository<DriverRating, Long> {

    /**
     * Izračunava ukupnu prosječnu ocjenu za vozača, uzimajući u obzir sve parametre
     * od kupca i restorana.
     */
    @Query("SELECT AVG(" +
            " (COALESCE(r.onTimeArrivalRating, 0) + COALESCE(r.hygieneRatingCustomer, 0) + COALESCE(r.kindnessRating, 0) + " +
            "  COALESCE(r.professionalismRating, 0) + COALESCE(r.hygieneRatingRestaurant, 0) + COALESCE(r.communicationRating, 0)) / " +
            " (CASE WHEN r.onTimeArrivalRating IS NOT NULL THEN 1 ELSE 0 END + " +
            "  CASE WHEN r.hygieneRatingCustomer IS NOT NULL THEN 1 ELSE 0 END + " +
            "  CASE WHEN r.kindnessRating IS NOT NULL THEN 1 ELSE 0 END + " +
            "  CASE WHEN r.professionalismRating IS NOT NULL THEN 1 ELSE 0 END + " +
            "  CASE WHEN r.hygieneRatingRestaurant IS NOT NULL THEN 1 ELSE 0 END + " +
            "  CASE WHEN r.communicationRating IS NOT NULL THEN 1 ELSE 0 END) " +
            ") " +
            "FROM DriverRating r WHERE r.driver = :driver")
    Double calculateOverallAverageRatingForDriver(@Param("driver") Driver driver);
}