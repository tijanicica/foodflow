// Datoteka: src/main/java/com/iis/foodflow/repository/OrderRepository.java
package com.iis.foodflow.repository;

import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.order.RepeatingOrder;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.model.user.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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
    @Query("SELECT o FROM Order o WHERE o.driver = :driver AND o.status IN :statuses")
    Optional<Order> findActiveOrderByDriver(
            @Param("driver") Driver driver,
            @Param("statuses") List<OrderStatus> statuses);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.driver = :driver AND o.status IN :activeStatuses")
    int countActiveDeliveriesForDriver(@Param("driver") Driver driver, @Param("activeStatuses") List<OrderStatus> activeStatuses);

    // Broji isporuke za vozača DANAS
    @Query("SELECT COUNT(o) FROM Order o WHERE o.driver = :driver AND o.deliveredAt >= CURRENT_DATE")
    int countTodaysDeliveriesForDriver(@Param("driver") Driver driver);
    List<Order> findByStatusAndScheduledForBefore(OrderStatus status, LocalDateTime time);

    // Proverava da li postoji porudžbina povezana sa određenim šablonom, a kreirana je danas.
    boolean existsByRepeatingOrderTemplateAndCreationDateBetween(RepeatingOrder template, LocalDateTime startOfDay, LocalDateTime endOfDay);



    // Nova, fleksibilna metoda za Active i Past tabove
    @Query("SELECT o FROM Order o WHERE o.customer = :customer AND o.status IN :statuses ORDER BY o.creationDate DESC")
    List<Order> findOrdersByCustomerAndStatusIn(@Param("customer") Customer customer, @Param("statuses") Set<OrderStatus> statuses);

    @Query("SELECT o FROM Order o WHERE o.customer = :customer AND o.status = 'SCHEDULED_PENDING' ORDER BY o.scheduledFor ASC")
    List<Order> findScheduledOrdersForCustomer(@Param("customer") Customer customer);


    // Daje prosečno vreme isporuke u sekundama
    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (o.delivered_at - o.creation_date))) FROM orders o " +
            "WHERE o.customer_id = :customerId AND o.status = 'DELIVERED' AND o.delivered_at IS NOT NULL",
            nativeQuery = true)
    Optional<Double> getAverageDeliveryTimeInSeconds(@Param("customerId") Long customerId);



    // === DODAJTE OVE DVE NOVE METODE ===
    @Query("SELECT COUNT(o) FROM Order o WHERE o.customer = :customer AND o.status = 'DELIVERED'")
    Long countDeliveredOrdersForCustomer(@Param("customer") Customer customer);

    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.customer = :customer AND o.status = 'DELIVERED'")
    Optional<BigDecimal> sumTotalPriceForCustomer(@Param("customer") Customer customer);


    // === IZMENA #2 ===
    @Query("SELECT oi.menuItemVersion.menuVersion.menu.restaurant.name FROM OrderItem oi WHERE oi.order.customer = :customer AND oi.order.status = 'DELIVERED' GROUP BY oi.menuItemVersion.menuVersion.menu.restaurant.name ORDER BY COUNT(oi) DESC LIMIT 1")
    Optional<String> findFavoriteRestaurant(@Param("customer") Customer customer);

    // Ovaj je već ispravljen (native query)
    @Query(value = "SELECT TO_CHAR(creation_date, 'YYYY-MM') as month, SUM(total_price) as amount " +
            "FROM orders WHERE customer_id = :customerId AND status = 'DELIVERED' AND creation_date >= NOW() - INTERVAL '6 months' " +
            "GROUP BY TO_CHAR(creation_date, 'YYYY-MM') ORDER BY month", nativeQuery = true)
    List<Object[]> findSpendingOverTime(@Param("customerId") Long customerId);



    @Query("SELECT oi.menuItemVersion.menuVersion.menu.restaurant.name, SUM(oi.menuItemVersion.price * oi.quantity) " +
            "FROM OrderItem oi WHERE oi.order.customer = :customer AND oi.order.status = 'DELIVERED' " +
            "GROUP BY oi.menuItemVersion.menuVersion.menu.restaurant.name " +
            "ORDER BY SUM(oi.menuItemVersion.price * oi.quantity) DESC LIMIT 5") // <-- LIMIT 5
    List<Object[]> findTop5SpendingByCategory(@Param("customer") Customer customer);

    // Nove metode za analitiku menadžera
    @Query("SELECT o FROM Order o JOIN o.orderItems oi JOIN oi.menuItemVersion miv JOIN miv.menuVersion mv JOIN mv.menu m WHERE m.restaurant.manager = :manager AND o.creationDate >= :startDate")
    List<Order> findOrdersByManagerAndDate(@Param("manager") com.iis.foodflow.model.user.Manager manager, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT oi.menuItemVersion.menuItem.name, COUNT(o.id) as orderCount " +
            "FROM Order o JOIN o.orderItems oi " +
            "JOIN oi.menuItemVersion miv JOIN miv.menuVersion mv JOIN mv.menu m " +
            "WHERE m.restaurant.manager = :manager AND o.creationDate >= :startDate " +
            "GROUP BY oi.menuItemVersion.menuItem.name " +
            "ORDER BY orderCount DESC")
    List<Object[]> findTopPerformingItems(@Param("manager") com.iis.foodflow.model.user.Manager manager, @Param("startDate") LocalDateTime startDate);
    // ===== DODAJ OVE DVE METODE =====

    // Novi upit za filtriranje porudžbina po restoranu
    @Query("SELECT o FROM Order o JOIN o.orderItems oi JOIN oi.menuItemVersion miv JOIN miv.menuVersion mv JOIN mv.menu m " +
            "WHERE m.restaurant.manager = :manager AND o.creationDate >= :startDate AND m.restaurant.id = :restaurantId")
    List<Order> findOrdersByManagerAndDateAndRestaurant(@Param("manager") Manager manager, @Param("startDate") LocalDateTime startDate, @Param("restaurantId") Long restaurantId);

    // Novi upit za filtriranje najprodavanijih stavki po restoranu
    @Query("SELECT oi.menuItemVersion.menuItem.name, COUNT(o.id) as orderCount " +
            "FROM Order o JOIN o.orderItems oi JOIN oi.menuItemVersion miv JOIN miv.menuVersion mv JOIN mv.menu m " +
            "WHERE m.restaurant.manager = :manager AND o.creationDate >= :startDate AND m.restaurant.id = :restaurantId " +
            "GROUP BY oi.menuItemVersion.menuItem.name " +
            "ORDER BY orderCount DESC")
    List<Object[]> findTopPerformingItemsByRestaurant(@Param("manager") Manager manager, @Param("startDate") LocalDateTime startDate, @Param("restaurantId") Long restaurantId);

    // ===================================

    @Query("SELECT COUNT(o) FROM Order o WHERE o.customer = :customer AND o.status = 'DELIVERED' AND o.creationDate >= :since")
    Long countDeliveredOrdersForCustomerSince(@Param("customer") Customer customer, @Param("since") LocalDateTime since);

    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.customer = :customer AND o.status = 'DELIVERED' AND o.creationDate >= :since")
    Optional<BigDecimal> sumTotalPriceForCustomerSince(@Param("customer") Customer customer, @Param("since") LocalDateTime since);

    @Query("SELECT oi.menuItemVersion.menuVersion.menu.restaurant.name FROM OrderItem oi WHERE oi.order.customer = :customer AND oi.order.status = 'DELIVERED' AND oi.order.creationDate >= :since GROUP BY oi.menuItemVersion.menuVersion.menu.restaurant.name ORDER BY COUNT(oi) DESC LIMIT 1")
    Optional<String> findFavoriteRestaurantSince(@Param("customer") Customer customer, @Param("since") LocalDateTime since);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (o.delivered_at - o.creation_date))) FROM orders o WHERE o.customer_id = :customerId AND o.status = 'DELIVERED' AND o.delivered_at IS NOT NULL AND o.creation_date >= :since", nativeQuery = true)
    Optional<Double> getAverageDeliveryTimeInSecondsSince(@Param("customerId") Long customerId, @Param("since") LocalDateTime since);

    @Query("SELECT oi.menuItemVersion.menuVersion.menu.restaurant.name, SUM(oi.menuItemVersion.price * oi.quantity) as totalValue FROM OrderItem oi WHERE oi.order.customer = :customer AND oi.order.status = 'DELIVERED' AND oi.order.creationDate >= :since GROUP BY oi.menuItemVersion.menuVersion.menu.restaurant.name ORDER BY totalValue DESC LIMIT 5")
    List<Object[]> findTop5SpendingByCategorySince(@Param("customer") Customer customer, @Param("since") LocalDateTime since);

    // Dinamički upit za grafikon potrošnje
    @Query(value = "SELECT TO_CHAR(creation_date, :dateFormat) as time_point, SUM(total_price) as amount " +
            "FROM orders WHERE customer_id = :customerId AND status = 'DELIVERED' AND creation_date >= :since " +
            "GROUP BY time_point ORDER BY MIN(creation_date)", nativeQuery = true)
    List<Object[]> findSpendingOverTimeSince(@Param("customerId") Long customerId, @Param("since") LocalDateTime since, @Param("dateFormat") String dateFormat);

}