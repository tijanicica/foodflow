// src/main/java/com/iis/foodflow/service/ManagerAnalyticsService.java
package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.ManagerAnalyticsDTO;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.repository.ManagerRepository; // <-- 1. DODAJ IMPORT
import com.iis.foodflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManagerAnalyticsService {

    private final OrderRepository orderRepository;
    private final ManagerRepository managerRepository; // <-- 2. DODAJ REPOZITORIJUM

    @Transactional(readOnly = true)
    public ManagerAnalyticsDTO getManagerAnalytics(Manager currentManager, int days, Long restaurantId) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);

        // ===== 3. KLJUČNA IZMENA: PONOVO UČITAVAMO MENADŽERA SA SVIM PODACIMA =====
        Manager manager = managerRepository.findByEmailWithRestaurants(currentManager.getEmail())
                .orElseThrow(() -> new IllegalStateException("Manager not found in database"));

        List<Order> orders;
        List<Object[]> topItems;

        if (restaurantId != null) {
            // Sigurnosna provera
            manager.getManagedRestaurants().stream()
                    .filter(r -> r.getId().equals(restaurantId))
                    .findFirst()
                    .orElseThrow(() -> new SecurityException("Manager does not manage this restaurant."));

            orders = orderRepository.findOrdersByManagerAndDateAndRestaurant(manager, startDate, restaurantId);
            topItems = orderRepository.findTopPerformingItemsByRestaurant(manager, startDate, restaurantId);
        } else {
            orders = orderRepository.findOrdersByManagerAndDate(manager, startDate);
            topItems = orderRepository.findTopPerformingItems(manager, startDate);
        }

        BigDecimal totalRevenue = orders.stream()
                .filter(order -> order.getStatus() == com.iis.foodflow.enums.OrderStatus.DELIVERED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orders.size();
        long confirmedOrders = orders.stream().filter(o -> o.getStatus() == com.iis.foodflow.enums.OrderStatus.DELIVERED).count();
        long canceledOrders = orders.stream().filter(o -> o.getStatus() == com.iis.foodflow.enums.OrderStatus.CANCELED).count();

        double avgResponseTimeMinutes = 4.0;

        List<ManagerAnalyticsDTO.ItemPerformanceDTO> itemPerformance = topItems.stream()
                .map(row -> ManagerAnalyticsDTO.ItemPerformanceDTO.builder()
                        .itemName((String) row[0])
                        .orderCount((long) row[1])
                        .build())
                .limit(5)
                .collect(Collectors.toList());

        return ManagerAnalyticsDTO.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .confirmedOrders(confirmedOrders)
                .canceledOrders(canceledOrders)
                .avgResponseTimeMinutes(avgResponseTimeMinutes)
                .itemPerformance(itemPerformance)
                .build();
    }
}