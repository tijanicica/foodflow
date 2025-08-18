package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.DeliveryDTO;
import com.iis.foodflow.dto.response.TrackOrderManagerDTO;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.repository.DriverRatingRepository;
import com.iis.foodflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryManagementService {

    private final OrderRepository orderRepository;
    private final DriverRatingRepository driverRatingRepository;
    private final LocationSimulator locationSimulator; // <-- 1. DODAJTE SIMULATOR


    @Transactional(readOnly = true)
    public List<DeliveryDTO> getDeliveriesForManager(Manager manager) {
        List<OrderStatus> statuses = List.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.PICKED_UP, OrderStatus.DELIVERED);
        List<Order> orders = orderRepository.findOrdersByManagerAndStatuses(manager, statuses);

        return orders.stream().map(this::mapToDeliveryDTO).collect(Collectors.toList());
    }

    private DeliveryDTO mapToDeliveryDTO(Order order) {
        String driverInfo = "Waiting for driver: " + (order.getDriver() != null ? order.getDriver().getFirstName() + " " + order.getDriver().getLastName().charAt(0) + "." : "N/A");
        if (order.getStatus() == OrderStatus.PICKED_UP) {
            driverInfo = "Driver: " + order.getDriver().getFirstName() + " " + order.getDriver().getLastName().charAt(0) + ". - On the way to customer";
        } else if (order.getStatus() == OrderStatus.DELIVERED) {
            driverInfo = "Driver: " + order.getDriver().getFirstName() + " " + order.getDriver().getLastName().charAt(0) + ".";
        }

        boolean isRated = driverRatingRepository.existsByOrder_IdAndRatedByManagerIsNotNull(order.getId());

        return DeliveryDTO.builder()
                .orderId(order.getId())
                .orderNumber("Order #" + order.getId())
                .driverInfo(driverInfo)
                .status(order.getStatus())
                .isRatedByManager(isRated)
                .build();
    }

    @Transactional(readOnly = true)
    public TrackOrderManagerDTO getTrackingInfo(Long orderId, Manager manager) {
        Order order = findAndValidateOrder(orderId, manager);
        if (order.getStatus() != OrderStatus.PICKED_UP) {
            throw new IllegalStateException("Order can only be tracked when status is PICKED_UP.");
        }

        var driver = order.getDriver();
        var customerAddress = order.getAddress();
        var restaurantAddress = order.getOrderItems().stream().findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant().getAddress())
                .orElseThrow(() -> new IllegalStateException("Restaurant address not found."));

        var startPoint = new TrackOrderManagerDTO.Point(restaurantAddress.getLatitude(), restaurantAddress.getLongitude());
        var endPoint = new TrackOrderManagerDTO.Point(customerAddress.getLatitude(), customerAddress.getLongitude());

        var simulatedDriverLocation = locationSimulator.simulateDriverLocation(
                startPoint,
                endPoint,
                order.getCreationDate().toInstant(ZoneOffset.UTC),
                order.getEta().toInstant(ZoneOffset.UTC)
        );

        // === OVDE JE ISPRAVKA ===
        return TrackOrderManagerDTO.builder()
                .orderId(order.getId())
                .orderNumber("Tracking Order #" + order.getId())
                .driverName(driver.getFirstName() + " " + driver.getLastName().charAt(0) + ".")
                .customerName(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName())
                .customerAddress(customerAddress.toString())
                .eta(order.getEta())
                .restaurantLocation(startPoint) // Koristimo već kreirani startPoint

                // ---> SADA KORISTIMO REZULTAT SIMULACIJE! <---
                .driverLocation(simulatedDriverLocation)

                .customerLocation(endPoint) // Koristimo već kreirani endPoint
                .build();
    }

    private Order findAndValidateOrder(Long orderId, Manager manager) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        boolean isManagerOfOrder = order.getOrderItems().stream().anyMatch(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant().getManager().getId().equals(manager.getId()));
        if (!isManagerOfOrder) throw new SecurityException("Manager is not authorized for this order.");
        return order;
    }
}