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

    private final OrderAssignmentService orderAssignmentService; // <-- DODAJTE ZAVISNOST

    @Transactional
    public Order confirmOrder(Long orderId) {
        // === ISPRAVKA JE U OVOJ LINIJI ===
        // Pružamo konkretan izuzetak (exception) koji će se baciti ako porudžbina nije pronađena.
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        // ================================

        // Postavljamo status porudžbine na CONFIRMED.
        // Ovo je signal da restoran treba da počne sa pripremom.
        order.setStatus(OrderStatus.CONFIRMED);

        // Nakon potvrde, odmah pokrećemo algoritam za pronalaženje najboljeg vozača.
        orderAssignmentService.findAndAssignBestDriver(order);

        // Vraćamo ažuriranu porudžbinu.
        return orderRepository.save(order);
    }

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

    @Transactional
    public Order markOrderAsReadyForPickup(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Provjera: Možemo označiti kao spremno samo ako se porudžbina trenutno priprema (ili je potvrđena)
        if (order.getStatus() != OrderStatus.CONFIRMED ) {
            throw new IllegalStateException("Order cannot be marked as ready. Current status: " + order.getStatus());
        }

        // Postavljamo novi status
        order.setStatus(OrderStatus.READY_FOR_PICKUP);

        // TODO: Ovdje dodati logku za slanje notifikacije vozaču.

        return orderRepository.save(order);
    }
}