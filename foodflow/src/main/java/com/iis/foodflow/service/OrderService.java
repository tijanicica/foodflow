// Datoteka: src/main/java/com/iis/foodflow/service/OrderService.java
package com.iis.foodflow.service;

import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    // ... eventualno drugi servisi i repozitorijumi ...

    /**
     * Mijenja status porudžbine na DELIVERED i bilježi tačno vrijeme isporuke.
     * @param orderId ID porudžbine koja se označava kao isporučena.
     */
    @Transactional
    public void markOrderAsDelivered(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Postavljamo status na DELIVERED (ili koji god je vaš finalni status)
        order.setStatus(OrderStatus.DELIVERED);

        // Bilježimo tačan trenutak isporuke
        order.setDeliveredAt(LocalDateTime.now());

        orderRepository.save(order);
    }
}