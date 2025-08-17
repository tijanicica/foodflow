package com.iis.foodflow.service;

import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.model.user.Manager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RealtimeNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Sends a notification to the driver about a new order offer.
     * @param order The order being assigned.
     */
    public void notifyDriverOfNewOrder(Order order) {
        if (order.getDriver() == null) {
            log.warn("Cannot notify driver for new order #{}: Driver is not assigned.", order.getId());
            return;
        }

        try {
            Restaurant restaurant = getRestaurantFromOrder(order);
            Driver driver = order.getDriver();

            String destination = createDestinationFromEmail(driver.getEmail());
            Map<String, Object> payload = Map.of(
                    "type", "NEW_ORDER_OFFER",
                    "orderId", order.getId(),
                    "restaurantName", restaurant.getName(),
                    "message", "You have a new delivery offer from: " + restaurant.getName()
            );

            log.info("Sending NEW_ORDER_OFFER for order #{} to driver channel: {}", order.getId(), destination);
            messagingTemplate.convertAndSend(destination, payload);

        } catch (IllegalStateException e) {
            log.error("Failed to send NEW_ORDER_OFFER notification for order #{}: {}", order.getId(), e.getMessage());
        }
    }

    /**
     * Notifies a driver that an order is ready for pickup.
     * @param order The order that is ready.
     */
    public void notifyDriverOrderReadyForPickup(Order order) {
        if (order.getDriver() == null) {
            log.warn("Cannot notify driver for ready pickup on order #{}: Driver is not assigned.", order.getId());
            return;
        }

        try {
            Restaurant restaurant = getRestaurantFromOrder(order);
            Driver driver = order.getDriver();

            String destination = createDestinationFromEmail(driver.getEmail());
            Map<String, Object> payload = Map.of(
                    "type", "ORDER_READY_FOR_PICKUP",
                    "orderId", order.getId(),
                    "restaurantName", restaurant.getName(),
                    "message", "Order #" + order.getId() + " is ready for pickup at " + restaurant.getName()
            );

            log.info("Sending ORDER_READY_FOR_PICKUP for order #{} to driver channel: {}", order.getId(), destination);
            messagingTemplate.convertAndSend(destination, payload);

        } catch (IllegalStateException e) {
            log.error("Failed to send ORDER_READY_FOR_PICKUP notification for order #{}: {}", order.getId(), e.getMessage());
        }
    }

    /**
     * Notifies the manager about an order's status update (e.g., PICKED_UP, CANCELED).
     * @param order The order whose status has changed.
     */
    public void notifyManagerOfOrderStatusUpdate(Order order) {
        try {
            Restaurant restaurant = getRestaurantFromOrder(order);
            Manager manager = Optional.ofNullable(restaurant.getManager())
                    .orElseThrow(() -> new IllegalStateException("Manager is not assigned to restaurant '" + restaurant.getName() + "'."));

            String destination = createDestinationFromEmail(manager.getEmail());
            String message = createManagerMessageFromStatus(order);

            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "ORDER_STATUS_UPDATE");
            payload.put("orderId", order.getId());
            payload.put("status", order.getStatus().name());
            payload.put("message", message);
            if (order.getStatus() == OrderStatus.CANCELED && order.getCancellationReason() != null) {
                payload.put("cancellationReason", order.getCancellationReason());
            }

            log.info("Sending ORDER_STATUS_UPDATE for order #{} to manager channel: {}", order.getId(), destination);
            messagingTemplate.convertAndSend(destination, payload);

        } catch (IllegalStateException e) {
            log.error("Failed to send status update to manager for order #{}: {}", order.getId(), e.getMessage());
        }
    }

    /**
     * Notifies the manager that a driver has accepted a delivery offer.
     * @param order The order for which the offer was accepted.
     * @param driver The driver who accepted.
     */
    public void notifyManagerOfOfferAcceptance(Order order, Driver driver) {
        try {
            Restaurant restaurant = getRestaurantFromOrder(order);
            Manager manager = Optional.ofNullable(restaurant.getManager())
                    .orElseThrow(() -> new IllegalStateException("Manager is not assigned to restaurant '" + restaurant.getName() + "'."));

            String destination = createDestinationFromEmail(manager.getEmail());
            String driverName = driver.getFirstName() + " " + driver.getLastName();
            String message = "Driver " + driverName + " accepted order #" + order.getId() + ".";
            Map<String, Object> payload = Map.of(
                    "type", "OFFER_ACCEPTED",
                    "orderId", order.getId(),
                    "driverId", driver.getId(),
                    "driverName", driverName,
                    "message", message
            );

            log.info("Sending OFFER_ACCEPTED for order #{} to manager channel: {}", order.getId(), destination);
            messagingTemplate.convertAndSend(destination, payload);

        } catch (IllegalStateException e) {
            log.error("Failed to send offer acceptance notification for order #{}: {}", order.getId(), e.getMessage());
        }
    }

    /**
     * Notifies the manager that a driver has rejected a delivery offer.
     * @param order The order for which the offer was rejected.
     * @param driver The driver who rejected.
     */
    public void notifyManagerOfOfferRejection(Order order, Driver driver) {
        try {
            Restaurant restaurant = getRestaurantFromOrder(order);
            Manager manager = Optional.ofNullable(restaurant.getManager())
                    .orElseThrow(() -> new IllegalStateException("Manager is not assigned to restaurant '" + restaurant.getName() + "'."));

            String destination = createDestinationFromEmail(manager.getEmail());
            String driverName = driver.getFirstName() + " " + driver.getLastName();
            String message = "Driver " + driverName + " rejected order #" + order.getId() + ". Finding new driver.";
            Map<String, Object> payload = Map.of(
                    "type", "OFFER_REJECTED",
                    "orderId", order.getId(),
                    "driverId", driver.getId(),
                    "driverName", driverName,
                    "message", message
            );

            log.info("Sending OFFER_REJECTED for order #{} to manager channel: {}", order.getId(), destination);
            messagingTemplate.convertAndSend(destination, payload);

        } catch (IllegalStateException e) {
            log.error("Failed to send offer rejection notification for order #{}: {}", order.getId(), e.getMessage());
        }
    }

    // --- PRIVATE HELPER METHODS ---

    private Restaurant getRestaurantFromOrder(Order order) {
        return Optional.ofNullable(order.getOrderItems())
                .flatMap(items -> items.stream().findFirst())
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                .orElseThrow(() -> new IllegalStateException("Cannot find restaurant: order #" + order.getId() + " has no items or restaurant link is broken."));
    }

    private String createManagerMessageFromStatus(Order order) {
        switch (order.getStatus()) {
            case PICKED_UP:
                return "Driver has picked up order #" + order.getId() + ".";
            case DELIVERED:
                return "Order #" + order.getId() + " has been successfully delivered.";
            case CANCELED:
                return "Delivery for order #" + order.getId() + " was canceled by the driver.";
            default:
                return "Status for order #" + order.getId() + " changed to: " + order.getStatus().name();
        }
    }

    private String createDestinationFromEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("Cannot create destination channel because user email is null or empty.");
        }
        String cleanedEmail = email.replace("@", "-at-").replace(".", "-dot-");
        return "/topic/user/" + cleanedEmail;
    }
}