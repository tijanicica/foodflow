package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.CustomerAnalyticsDTO;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;

    public CustomerAnalyticsDTO getCustomerAnalytics(Customer customer, String period) {
        // --- KORAK 1: Određivanje vremenskih perioda ---
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentPeriodStart;
        LocalDateTime previousPeriodStart;
        String dateFormat;

        switch (period) {
            case "7d":
                currentPeriodStart = now.minusDays(7);
                previousPeriodStart = now.minusDays(14);
                dateFormat = "Dy"; // Format za dane u nedelji (Mon, Tue, ...)
                break;
            case "6m":
                currentPeriodStart = now.minusMonths(6);
                previousPeriodStart = now.minusMonths(12);
                dateFormat = "Mon"; // Format za mesece (Jan, Feb, ...)
                break;
            case "30d":
            default:
                currentPeriodStart = now.minusDays(30);
                previousPeriodStart = now.minusDays(60);
                dateFormat = "DD"; // Format za dane u mesecu (01, 02, ...)
                break;
        }

        // --- KORAK 2: Dohvatanje podataka za TRENUTNI period ---
        long totalOrders = orderRepository.countDeliveredOrdersForCustomerSince(customer, currentPeriodStart);
        BigDecimal totalSpent = orderRepository.sumTotalPriceForCustomerSince(customer, currentPeriodStart).orElse(BigDecimal.ZERO);
        double avgDeliverySeconds = orderRepository.getAverageDeliveryTimeInSecondsSince(customer.getId(), currentPeriodStart).orElse(0.0);
        double averageDeliveryTimeInMinutes = Math.round(avgDeliverySeconds / 60.0);
        String favoriteRestaurant = orderRepository.findFavoriteRestaurantSince(customer, currentPeriodStart).orElse("N/A");

        // --- KORAK 3: Dohvatanje podataka za PRETHODNI period (za poređenje) ---
        long previousTotalOrders = orderRepository.countDeliveredOrdersForCustomerSince(customer, previousPeriodStart);
        BigDecimal previousTotalSpent = orderRepository.sumTotalPriceForCustomerSince(customer, previousPeriodStart).orElse(BigDecimal.ZERO);

        // --- KORAK 4: Računanje procentualnih promena ---
        int totalOrdersChange = calculatePercentageChange(previousTotalOrders, totalOrders);
        int totalSpentChange = calculatePercentageChange(previousTotalSpent, totalSpent);

        // --- KORAK 5: Dohvatanje podataka za grafikone ---
        List<Object[]> spendingData = orderRepository.findSpendingOverTimeSince(customer.getId(), currentPeriodStart, dateFormat);
        List<CustomerAnalyticsDTO.TimePointDTO> spendingOverTime = spendingData.stream()
                .map(row -> new CustomerAnalyticsDTO.TimePointDTO((String) row[0], new BigDecimal(row[1].toString())))
                .collect(Collectors.toList());

        List<Object[]> topRestaurantsData = orderRepository.findTop5SpendingByCategorySince(customer, currentPeriodStart);
        List<CustomerAnalyticsDTO.CategorySpendingDTO> topRestaurants = topRestaurantsData.stream()
                .map(row -> new CustomerAnalyticsDTO.CategorySpendingDTO((String) row[0], (BigDecimal) row[1]))
                .collect(Collectors.toList());

        // --- KORAK 6: Kreiranje i vraćanje DTO objekta ---
        return CustomerAnalyticsDTO.builder()
                .totalOrders(totalOrders)
                .totalOrdersChange(totalOrdersChange)
                .totalSpent(totalSpent)
                .totalSpentChange(totalSpentChange)
                .favoriteRestaurant(favoriteRestaurant)
                .averageDeliveryTime(averageDeliveryTimeInMinutes)
                .spendingOverTime(spendingOverTime)
                .topRestaurants(topRestaurants)
                .insightText("You've saved an average of 150 RSD on delivery fees this month!") // Primer
                .build();
    }

    // Pomoćna metoda za računanje procentualne promene
    private int calculatePercentageChange(long previous, long current) {
        if (previous == 0) {
            return (current > 0) ? 100 : 0;
        }
        double change = ((double) (current - previous) / previous) * 100;
        return (int) Math.round(change);
    }

    private int calculatePercentageChange(BigDecimal previous, BigDecimal current) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return (current.compareTo(BigDecimal.ZERO) > 0) ? 100 : 0;
        }
        BigDecimal change = current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        return change.intValue();
    }
}