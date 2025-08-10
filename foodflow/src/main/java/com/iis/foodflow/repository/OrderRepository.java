// Datoteka: src/main/java/com/iis/foodflow/repository/OrderRepository.java
package com.iis.foodflow.repository;

import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * UPIT 1: Broji SAMO porudžbine koje su isporučene NA VRIJEME za određenog vozača
     * u zadatom vremenskom periodu. Na vrijeme znači da je deliveredAt <= eta.
     */

    @Query("SELECT COUNT(o.id) " +
            "FROM Order o " +
            "WHERE o.driver = :driver " +
            "AND o.status = :status " +
            "AND o.creationDate >= :since " +
            "AND o.deliveredAt <= o.eta")
    Long countOnTimeDeliveriesForDriver(@Param("driver") Driver driver,
                                        @Param("status") OrderStatus status,
                                        @Param("since") LocalDateTime since);

    /**
     * UPIT 2: Broji SVE isporučene porudžbine za određenog vozača u zadatom
     * vremenskom periodu. Ovu metodu Spring Data JPA kreira automatski.
     */
    List<Order> findByDriverAndStatusIn(Driver driver, List<OrderStatus> statuses);
    Long countByDriverAndStatusAndCreationDateAfter(Driver driver, OrderStatus status, LocalDateTime since);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.driver = :driver AND o.status IN :activeStatuses")
    int countActiveDeliveriesForDriver(@Param("driver") Driver driver, @Param("activeStatuses") List<OrderStatus> activeStatuses);

    // Broji isporuke za vozača DANAS
    @Query("SELECT COUNT(o) FROM Order o WHERE o.driver = :driver AND o.deliveredAt >= CURRENT_DATE")
    int countTodaysDeliveriesForDriver(@Param("driver") Driver driver);

}