// Datoteka: src/main/java/com/iis/foodflow/repository/DriverRatingRepository.java
package com.iis.foodflow.repository;

import com.iis.foodflow.model.delivery.DriverRating;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DriverRatingRepository extends JpaRepository<DriverRating, Long> {
    Optional<DriverRating> findByOrder_Id(Long orderId);

    Optional<DriverRating> findByOrderAndRatedByCustomer(Order order, Customer customer);

    /**
     * ISPRAVAN UPIT: Izračunava ukupnu prosječnu ocjenu za vozača, uzimajući u obzir sve parametre
     * od kupca i restorana i ispravno rukuje NULL vrijednostima.
     */
    @Query("SELECT CASE WHEN " +
            " (COUNT(r.onTimeArrivalRating) + COUNT(r.hygieneRatingCustomer) + COUNT(r.kindnessRating) + " +
            "  COUNT(r.professionalismRating) + COUNT(r.hygieneRatingRestaurant) + COUNT(r.communicationRating)) > 0 " +
            "THEN " +
            " (SUM(COALESCE(r.onTimeArrivalRating, 0)) + SUM(COALESCE(r.hygieneRatingCustomer, 0)) + SUM(COALESCE(r.kindnessRating, 0)) + " +
            "  SUM(COALESCE(r.professionalismRating, 0)) + SUM(COALESCE(r.hygieneRatingRestaurant, 0)) + SUM(COALESCE(r.communicationRating, 0))) * 1.0 / " + // Množenje sa 1.0 osigurava deljenje sa pokretnim zarezom
            " (COUNT(r.onTimeArrivalRating) + COUNT(r.hygieneRatingCustomer) + COUNT(r.kindnessRating) + " +
            "  COUNT(r.professionalismRating) + COUNT(r.hygieneRatingRestaurant) + COUNT(r.communicationRating)) " +
            "ELSE 0.0 END " +
            "FROM DriverRating r WHERE r.driver = :driver")
    Double calculateOverallAverageRatingForDriver(@Param("driver") Driver driver);


// === NETAČAN QUERY JE OBRISAN ===
// @Query("SELECT AVG( (dr.onTimeArrivalRating + ... ) / 6.0 ) ...")
// Optional<Double> findAverageRatingByDriverId(...);


    boolean existsByOrder_IdAndRatedByCustomerIsNotNull(Long orderId);

    boolean existsByOrder_IdAndRatedByManagerIsNotNull(Long orderId);

}