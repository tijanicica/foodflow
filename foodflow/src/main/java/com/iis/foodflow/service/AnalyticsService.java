package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.CustomerAnalyticsDTO;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;

    public CustomerAnalyticsDTO getCustomerAnalytics(Customer customer) {

        // --- KORAK 1: Dohvatanje podataka za kartice sa novim, odvojenim metodama ---

        // Dohvati ukupan broj isporučenih porudžbina. Vraća 0L ako nema.
        long totalOrders = orderRepository.countDeliveredOrdersForCustomer(customer);

        // Dohvati ukupnu potrošnju. Vraća BigDecimal.ZERO ako nema.
        BigDecimal totalSpent = orderRepository.sumTotalPriceForCustomer(customer).orElse(BigDecimal.ZERO);

        // Dohvati prosečno vreme isporuke. Vraća 0.0 ako nema.
        double avgDeliverySeconds = orderRepository.getAverageDeliveryTimeInSeconds(customer.getId()).orElse(0.0);
        double averageDeliveryTimeInMinutes = Math.round(avgDeliverySeconds / 60.0); // Pretvori u minute

        // Dohvati omiljeni restoran. Vraća "N/A" ako nema.
        String favoriteRestaurant = orderRepository.findFavoriteRestaurant(customer).orElse("N/A");

        // --- KORAK 2: Dohvatanje podataka za grafikone (ostaje isto) ---

        // Mesečna potrošnja
        List<Object[]> spendingOverTimeData = orderRepository.findSpendingOverTime(customer.getId());
        List<CustomerAnalyticsDTO.SpendingOverTimeDTO> spendingOverTime = spendingOverTimeData.stream()
                .map(row -> new CustomerAnalyticsDTO.SpendingOverTimeDTO((String) row[0], new BigDecimal(row[1].toString())))
                .collect(Collectors.toList());

        // Potrošnja po restoranu
        List<Object[]> categorySpendingData = orderRepository.findTop5SpendingByCategory(customer);
        List<CustomerAnalyticsDTO.CategorySpendingDTO> categorySpending = categorySpendingData.stream()
                .map(row -> new CustomerAnalyticsDTO.CategorySpendingDTO((String) row[0], (BigDecimal) row[1]))
                .collect(Collectors.toList());

        // --- KORAK 3: Kreiranje i vraćanje DTO objekta ---
        return CustomerAnalyticsDTO.builder()
                .totalOrders(totalOrders)
                .totalSpent(totalSpent)
                .favoriteRestaurant(favoriteRestaurant)
                .averageDeliveryTime(averageDeliveryTimeInMinutes)
                .spendingOverTime(spendingOverTime)
                .categorySpending(categorySpending)
                .build();
    }
}