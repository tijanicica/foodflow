package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.ManagerLiveTrackingDTO;
import com.iis.foodflow.dto.response.ManagerOrderDTO;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class ManagerOrderService {

    private final OrderRepository orderRepository;
    private final OrderAssignmentService orderAssignmentService; // Za dodelu vozača
    private final RealtimeNotificationService notificationService;

    @Transactional(readOnly = true)
    public List<ManagerOrderDTO> getActiveOrders(Manager manager) {
        List<OrderStatus> statuses = List.of(OrderStatus.CREATED, OrderStatus.CONFIRMED, OrderStatus.READY_FOR_PICKUP);
        List<Order> orders = orderRepository.findOrdersByManagerAndStatuses(manager, statuses);

        return orders.stream().map(this::mapToManagerOrderDTO).collect(Collectors.toList());
    }

    private ManagerOrderDTO mapToManagerOrderDTO(Order order) {
        String customerName = order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName();
        List<String> items = order.getOrderItems().stream()
                .map(item -> item.getQuantity() + "x " + item.getMenuItemVersion().getMenuItem().getName())
                .collect(Collectors.toList());
        String driverName = order.getDriver() != null ?
                order.getDriver().getFirstName() + " " + order.getDriver().getLastName().charAt(0) + "." :
                "Waiting for driver pickup...";

        return ManagerOrderDTO.builder()
                .id(order.getId())
                .orderNumber("#" + order.getId())
                .customerName(customerName)
                .items(items)
                .status(order.getStatus())
                .driverName(driverName)
                .build();
    }

    /*@Transactional
    public void confirmOrder(Long orderId, Manager manager) {
        Order order = findAndValidateOrder(orderId, manager);
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new IllegalStateException("Order can only be confirmed if its status is CREATED.");
        }
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Pokreni algoritam za dodelu vozača
        orderAssignmentService.findAndAssignBestDriver(order);


    }*/
    @Transactional
    public void confirmOrder(Long orderId, Manager manager) {
        Order order = findAndValidateOrder(orderId, manager);
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new IllegalStateException("Order can only be confirmed if its status is CREATED.");
        }

        // 1. Promenimo status
        order.setStatus(OrderStatus.CONFIRMED);

        // 2. Sačuvamo promenu statusa odmah
        orderRepository.save(order);
        log.info("Order #{} status changed to CONFIRMED.", order.getId());

        // 3. Pozivamo servis za dodelu koji će sada odraditi SVE:
        // pronaći vozača, dodeliti ga, kreirati ponudu I POSLATI NOTIFIKACIJU.
        orderAssignmentService.findAndAssignBestDriver(order);

        // Nema više potrebe za 'if (savedOrder.getDriver() != null)' blokom
        // jer se slanje notifikacije sada dešava unutar orderAssignmentService.
    }


    // ... tvoja 'markAsReady' metoda ...
    @Transactional
    public void markAsReady(Long orderId, Manager manager) {
        Order order = findAndValidateOrder(orderId, manager);
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Order can only be marked as ready if it's confirmed.");
        }

        order.setStatus(OrderStatus.READY_FOR_PICKUP);
        Order savedOrder = orderRepository.save(order);

        log.info("Order #{} marked as ready. Preparing to send notification.", savedOrder.getId());

        try {
            // Inicijalizacija pre slanja
            Hibernate.initialize(savedOrder.getOrderItems());

            // Poziv servisa
            notificationService.notifyDriverOrderReadyForPickup(savedOrder);

            log.info("Notification for order #{} successfully dispatched.", savedOrder.getId());
        } catch (Exception e) {
            // === HVATAMO BILO KOJU GREŠKU KOJA SE DESI TOKOM SLANJA ===
            log.error("!!!!!!!!!! FAILED TO SEND 'READY FOR PICKUP' NOTIFICATION for order #{} !!!!!!!!!!", savedOrder.getId(), e);
            // ==========================================================
        }
    }

    @Transactional
    public void rejectOrder(Long orderId, Manager manager, String reason) {
        Order order = findAndValidateOrder(orderId, manager);
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new IllegalStateException("Order can only be rejected if its status is CREATED.");
        }
        order.setStatus(OrderStatus.REJECTED);
        order.setCancellationReason(reason);
        orderRepository.save(order);
    }

    /*@Transactional
    public void markAsReady(Long orderId, Manager manager) {
        Order order = findAndValidateOrder(orderId, manager);
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Order can only be marked as ready if it's confirmed.");
        }
        order.setStatus(OrderStatus.READY_FOR_PICKUP);
        orderRepository.save(order);

        // TODO: Poslati notifikaciju vozaču da je porudžbina spremna
    }*/

    /*@Transactional
    public void markAsReady(Long orderId, Manager manager) {
        Order order = findAndValidateOrder(orderId, manager);
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Order can only be marked as ready if it's confirmed.");
        }

        order.setStatus(OrderStatus.READY_FOR_PICKUP);
        Order savedOrder = orderRepository.save(order);

        // <-- NOTIFIKACIJA SE ŠALJE OVDE
        // Rešen TODO: Poslati notifikaciju vozaču da je porudžbina spremna
        notificationService.notifyDriverOrderReadyForPickup(savedOrder);
    }
*/
    private Order findAndValidateOrder(Long orderId, Manager manager) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean isManagerOfOrder = order.getOrderItems().stream()
                .anyMatch(item -> item.getMenuItemVersion().getMenuVersion().getMenu()
                        .getRestaurant().getManager().getId().equals(manager.getId()));

        if (!isManagerOfOrder) {
            throw new SecurityException("Manager is not authorized for this order.");
        }
        return order;
    }

    @Transactional(readOnly = true)
    public List<ManagerLiveTrackingDTO> getLiveTrackingForManager(Long managerId) {
        // 1. Pronađi sve porudžbine sa statusom PICKED_UP za datog menadžera
        List<Order> activeOrders = orderRepository.findActiveOrdersForManagerByStatus(managerId, OrderStatus.PICKED_UP);

        // 2. Mapiraj te porudžbine u DTO za praćenje
        return activeOrders.stream()
                .map(this::mapOrderToTrackingDTO)
                .filter(Objects::nonNull) // Ukloni rezultate gde vozač ili lokacija ne postoje
                .collect(Collectors.toList());
    }

    private ManagerLiveTrackingDTO mapOrderToTrackingDTO(Order order) {
        Driver driver = order.getDriver();
        if (driver == null || driver.getLatitude() == null || driver.getLongitude() == null || order.getAddress() == null) {
            return null;
        }

        // === KLJUČNA IZMENA: DOBIJANJE PODATAKA O RESTORANU ===
        // Pretpostavka je da svaka porudžbina ima bar jedan 'orderItem'
        Restaurant restaurant = order.getOrderItems().stream()
                .findFirst() // Uzimamo prvi artikal da bismo pronašli restoran
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                .orElse(null);

        // Ako ne možemo da nađemo restoran ili njegovu adresu, preskačemo ovu dostavu
        if (restaurant == null || restaurant.getAddress() == null) {
            return null;
        }
        // =======================================================

        return ManagerLiveTrackingDTO.builder()
                .driverId(driver.getId())
                .driverFirstName(driver.getFirstName())
                .driverLastName(driver.getLastName())
                .driverLatitude(driver.getLatitude())
                .driverLongitude(driver.getLongitude())
                .vehicleType(driver.getVehicleType())
                .orderId(order.getId())
                .deliveryAddressLat(order.getAddress().getLatitude())
                .deliveryAddressLng(order.getAddress().getLongitude())
                // --- DODAJEMO NOVE PODATKE U ODGOVOR ---
                .restaurantLat(restaurant.getAddress().getLatitude())
                .restaurantLng(restaurant.getAddress().getLongitude())
                .build();
    }
}