package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.ManagerAnalyticsDTO;
import com.iis.foodflow.dto.response.RestaurantPerformanceDTO;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.repository.ManagerRepository;
import com.iis.foodflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManagerAnalyticsService {

    private final OrderRepository orderRepository;
    private final ManagerRepository managerRepository;

    @Transactional(readOnly = true)
    public ManagerAnalyticsDTO getManagerAnalytics(Manager currentManager, int days, Long restaurantId) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentPeriodStart = now.minusDays(days);
        LocalDateTime previousPeriodStart = now.minusDays(days * 2);
        LocalDateTime previousPeriodEnd = currentPeriodStart;

        Manager manager = managerRepository.findByEmailWithRestaurants(currentManager.getEmail())
                .orElseThrow(() -> new IllegalStateException("Manager not found in database"));

        List<Order> currentPeriodOrders;
        List<Order> previousPeriodOrders;
        List<Object[]> topItems;

        if (restaurantId != null) {
            manager.getManagedRestaurants().stream()
                    .filter(r -> r.getId().equals(restaurantId))
                    .findFirst()
                    .orElseThrow(() -> new SecurityException("Manager does not manage this restaurant."));

            currentPeriodOrders = orderRepository.findOrdersByManagerAndDateRangeAndRestaurant(manager, currentPeriodStart, now, restaurantId);
            previousPeriodOrders = orderRepository.findOrdersByManagerAndDateRangeAndRestaurant(manager, previousPeriodStart, previousPeriodEnd, restaurantId);
            topItems = orderRepository.findTopPerformingItemsByRestaurantSince(manager, currentPeriodStart, restaurantId);
        } else {
            currentPeriodOrders = orderRepository.findOrdersByManagerAndDateRange(manager, currentPeriodStart, now);
            previousPeriodOrders = orderRepository.findOrdersByManagerAndDateRange(manager, previousPeriodStart, previousPeriodEnd);
            topItems = orderRepository.findTopPerformingItemsSince(manager, currentPeriodStart);
        }

        BigDecimal totalRevenue = calculateDeliveredRevenue(currentPeriodOrders);
        long totalOrders = currentPeriodOrders.size();
        long confirmedOrders = countByStatus(currentPeriodOrders, com.iis.foodflow.enums.OrderStatus.DELIVERED);
        long canceledOrders = countByStatus(currentPeriodOrders, com.iis.foodflow.enums.OrderStatus.CANCELED);
        // --- НОВО: Израчунавање просечног времена извршења/испоруке поруџбине ---
        Double avgFulfillmentTime = orderRepository.calculateAverageFulfillmentTimeMinutesUsingFunction(
                manager.getId(),
                currentPeriodStart,
                now,
                restaurantId
        ).orElse(0.0);
        double avgResponseTimeMinutes = avgFulfillmentTime;

        BigDecimal previousTotalRevenue = calculateDeliveredRevenue(previousPeriodOrders);
        long previousTotalOrders = previousPeriodOrders.size();

        Double revenueChange = calculatePercentageChange(totalRevenue, previousTotalRevenue);
        Double ordersChange = calculatePercentageChange(BigDecimal.valueOf(totalOrders), BigDecimal.valueOf(previousTotalOrders));

        List<RestaurantPerformanceDTO> restaurantPerformance = new ArrayList<>();
        if (restaurantId == null) {
            restaurantPerformance = calculateRevenueByRestaurant(currentPeriodOrders);
        }

        List<ManagerAnalyticsDTO.ItemPerformanceDTO> itemPerformance = topItems.stream()
                .map(row -> new ManagerAnalyticsDTO.ItemPerformanceDTO((String) row[0], (long) row[1]))
                .limit(10)
                .collect(Collectors.toList());

        return new ManagerAnalyticsDTO(
                totalRevenue, totalOrders, confirmedOrders, canceledOrders,
                avgResponseTimeMinutes, itemPerformance, revenueChange,
                ordersChange, restaurantPerformance
        );
    }

    private BigDecimal calculateDeliveredRevenue(List<Order> orders) {
        return orders.stream()
                .filter(order -> order.getStatus() == com.iis.foodflow.enums.OrderStatus.DELIVERED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private long countByStatus(List<Order> orders, com.iis.foodflow.enums.OrderStatus status) {
        return orders.stream().filter(o -> o.getStatus() == status).count();
    }

    private List<RestaurantPerformanceDTO> calculateRevenueByRestaurant(List<Order> orders) {
        Map<Long, RestaurantPerformanceDTO> performanceMap = new HashMap<>();
        for (Order order : orders) {
            if (order.getStatus() == com.iis.foodflow.enums.OrderStatus.DELIVERED) {
                order.getOrderItems().stream()
                        .findFirst()
                        .ifPresent(orderItem -> {
                            // V V V  KLJUČNA ISPRAVKA  V V V
                            // Prolazimo kroz celu putanju: OrderItem -> MenuItemVersion -> MenuVersion -> Menu -> Restaurant
                            Restaurant restaurant = orderItem.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant();

                            performanceMap.compute(restaurant.getId(), (id, dto) -> {
                                if (dto == null) {
                                    return new RestaurantPerformanceDTO(restaurant.getName(), order.getTotalPrice());
                                } else {
                                    dto.setValue(dto.getValue().add(order.getTotalPrice()));
                                    return dto;
                                }
                            });
                        });
            }
        }
        List<RestaurantPerformanceDTO> result = new ArrayList<>(performanceMap.values());
        result.sort(Comparator.comparing(RestaurantPerformanceDTO::getValue).reversed());
        return result;
    }

    private Double calculatePercentageChange(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) return null;
        if (current == null) current = BigDecimal.ZERO;
        BigDecimal change = current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        return change.setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}