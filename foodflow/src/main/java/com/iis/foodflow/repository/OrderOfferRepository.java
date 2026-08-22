// Datoteka: src/main/java/com/iis/foodflow/repository/OrderOfferRepository.java
package com.iis.foodflow.repository;

import com.iis.foodflow.enums.OfferStatus;
import com.iis.foodflow.model.delivery.OrderOffer;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface OrderOfferRepository extends JpaRepository<OrderOffer, Long> {
    // Metoda za pronalaženje vozača koji su već dobili ponudu za ovu porudžbinu
    List<OrderOffer> findByOrder(Order order);

    @Query("SELECT o.driver.id FROM OrderOffer o WHERE o.order = :order")
    Set<Long> findDriverIdsByOrder(@Param("order") Order order);

    // Metoda za pronalaženje aktivne ponude za određenog vozača i porudžbinu
    Optional<OrderOffer> findByOrderAndDriver(Order order, Driver driver);
    List<OrderOffer> findByDriverAndStatus(Driver driver, OfferStatus status);

    long countByDriverAndStatusAndCreatedAtAfter(Driver driver, OfferStatus status, LocalDateTime date);

}