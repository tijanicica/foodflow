package com.iis.foodflow.service;

import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.restaurant.Restaurant; // Required import
import com.iis.foodflow.model.user.Driver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Driver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RealtimeNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Sends a notification to the driver about a new order offer using their email.
     * @param order The order being assigned to the driver.
     */
    public void notifyDriverOfNewOrder(Order order) {
        Driver driver = order.getDriver();
        if (driver == null) {
            log.warn("Attempted to send notification for new order #{}, but no driver is assigned.", order.getId());
            return;
        }

        String restaurantName;
        try {
            restaurantName = getRestaurantFromOrder(order).getName();
        } catch (IllegalStateException e) {
            log.error("Cannot send notification for order #{}: {}", order.getId(), e.getMessage());
            return;
        }

        // === KLJUČNA IZMENA: Kreiramo destinaciju koristeći EMAIL umesto ID-ja ===
        String destination = createDestinationFromEmail(driver.getEmail());

        Map<String, Object> payload = Map.of(
                "type", "NEW_ORDER_OFFER",
                "orderId", order.getId(),
                "restaurantName", restaurantName,
                "message", "You have a new delivery offer from the restaurant: " + restaurantName
        );

        log.info("Sending new order offer notification for order #{} to user channel: {}", order.getId(), destination);
        messagingTemplate.convertAndSend(destination, payload);
    }

    /**
     * Sends a notification to the driver that the order is ready, using their email.
     * @param order The order whose status has changed.
     */
    public void notifyDriverOrderReadyForPickup(Order order) {
        Driver driver = order.getDriver();
        if (driver == null) {
            log.warn("Attempted to send ready-for-pickup notification for order #{}, but driver is null.", order.getId());
            return;
        }

        String restaurantName;
        try {
            restaurantName = getRestaurantFromOrder(order).getName();
        } catch (IllegalStateException e) {
            log.error("Cannot send notification for order #{}: {}", order.getId(), e.getMessage());
            return;
        }

        // === KLJUČNA IZMENA: Koristimo istu logiku za kreiranje kanala ===
        String destination = createDestinationFromEmail(driver.getEmail());

        Map<String, Object> payload = Map.of(
                "type", "ORDER_READY_FOR_PICKUP",
                "orderId", order.getId(),
                "restaurantName", restaurantName,
                "message", "Order #" + order.getId() + " is ready for pickup at the restaurant: " + restaurantName
        );

        log.info("Sending 'ready for pickup' notification for order #{} to user channel: {}", order.getId(), destination);
        messagingTemplate.convertAndSend(destination, payload);
    }

    /**
     * Helper method to extract the restaurant from an order. This logic remains the same.
     * @param order The order from which to extract the restaurant.
     * @return The found Restaurant entity.
     * @throws IllegalStateException if the order has no items.
     */
    private Restaurant getRestaurantFromOrder(Order order) {
        return order.getOrderItems().stream()
                .findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                .orElseThrow(() -> new IllegalStateException("Cannot find restaurant because the order has no items."));
    }

    /**
     * Pomoćna privatna metoda koja kreira bezbednu putanju za WebSocket kanal od email adrese.
     * @param email Email korisnika.
     * @return String formatiran za WebSocket topic (npr. /topic/user/driver-at-example-dot-com).
     */
    private String createDestinationFromEmail(String email) {
        if (email == null || email.isBlank()) {
            // Vraćamo neku default vrednost ili bacamo izuzetak ako email ne sme biti prazan
            return "/topic/user/unknown";
        }
        // Menjamo '@' i '.' da bismo izbegli probleme sa rutiranjem
        String cleanedEmail = email.replace("@", "-at-").replace(".", "-dot-");
        return "/topic/user/" + cleanedEmail;
    }
}