// Datoteka: src/main/java/com/iis/foodflow/repository/OrderOfferRepository.java
package com.iis.foodflow.repository;

import com.iis.foodflow.enums.OfferStatus;
import com.iis.foodflow.model.delivery.OrderOffer;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderOfferRepository extends JpaRepository<OrderOffer, Long> {
    // Metoda za pronalaženje vozača koji su već dobili ponudu za ovu porudžbinu
    List<OrderOffer> findByOrder(Order order);

    // Metoda za pronalaženje aktivne ponude za određenog vozača i porudžbinu
    Optional<OrderOffer> findByOrderAndDriver(Order order, Driver driver);
    long countByDriverAndStatusAndCreatedAtAfter(Driver driver, OfferStatus status, LocalDateTime date);

}