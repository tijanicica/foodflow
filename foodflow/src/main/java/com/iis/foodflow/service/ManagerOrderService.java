package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.ManagerOrderDTO;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManagerOrderService {

    private final OrderRepository orderRepository;
    private final OrderAssignmentService orderAssignmentService; // Za dodelu vozača

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

    @Transactional
    public void confirmOrder(Long orderId, Manager manager) {
        Order order = findAndValidateOrder(orderId, manager);
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new IllegalStateException("Order can only be confirmed if its status is CREATED.");
        }
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Pokreni algoritam za dodelu vozača
        orderAssignmentService.findAndAssignBestDriver(order);
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

    @Transactional
    public void markAsReady(Long orderId, Manager manager) {
        Order order = findAndValidateOrder(orderId, manager);
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Order can only be marked as ready if it's confirmed.");
        }
        order.setStatus(OrderStatus.READY_FOR_PICKUP);
        orderRepository.save(order);

        // TODO: Poslati notifikaciju vozaču da je porudžbina spremna
    }

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
}