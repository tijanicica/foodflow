// Datoteka: src/main/java/com/iis/foodflow/service/OrderAssignmentService.java
package com.iis.foodflow.service;

import com.iis.foodflow.enums.DriverStatus;
import com.iis.foodflow.enums.OfferStatus;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.model.delivery.OrderOffer;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.repository.DriverRepository;
import com.iis.foodflow.repository.OrderOfferRepository;
import com.iis.foodflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderAssignmentService {

    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;
    private final OrderOfferRepository orderOfferRepository;

    @Transactional
    public void assignOrderToBestDriver(Order order) {
        // 1. Pronađi sve vozače koji su već odbili ovu porudžbinu
        List<Driver> driversWhoRejected = orderOfferRepository.findByOrder(order).stream()
                .map(OrderOffer::getDriver)
                .collect(Collectors.toList());

        // 2. Pronađi sve ONLINE vozače, ali izbaci one koji su već odbili
        List<Driver> candidates = driverRepository.findByStatus(DriverStatus.ONLINE).stream()
                .filter(driver -> !driversWhoRejected.contains(driver))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            System.out.println("Nema više dostupnih vozača za porudžbinu: " + order.getId());
            // Ovdje bi se status porudžbine promijenio u npr. AWAITING_MANUAL_ASSIGNMENT
            return;
        }

        // 3. Pronađi najboljeg kandidata (algoritam ostaje isti)
        Driver bestDriver = findBestCandidate(candidates, order);

        // 4. Kreiraj i sačuvaj ponudu
        OrderOffer newOffer = OrderOffer.builder()
                .order(order)
                .driver(bestDriver)
                .status(OfferStatus.SENT)
                .createdAt(LocalDateTime.now())
                .build();
        orderOfferRepository.save(newOffer);

        System.out.println("Porudžbina " + order.getId() + " ponuđena vozaču " + bestDriver.getFirstName());
        // TODO: Poslati notifikaciju vozaču
    }

    @Transactional
    public void acceptOrderOffer(Long orderId, String driverEmail) {
        Order order = findOrder(orderId);
        Driver driver = findDriver(driverEmail);
        OrderOffer offer = findOffer(order, driver);

        if (offer.getStatus() != OfferStatus.SENT) {
            throw new IllegalStateException("This offer is no longer active.");
        }

        // 1. Ažuriraj ponudu
        offer.setStatus(OfferStatus.ACCEPTED);
        orderOfferRepository.save(offer);

        // 2. Dodijeli vozača porudžbini i promijeni status
        order.setDriver(driver);
        order.setStatus(OrderStatus.PICKED_UP); // Ili IN_PREPARATION, zavisi od logike
        orderRepository.save(order);

        System.out.println("Driver " + driver.getFirstName() + " ACCEPTED order " + order.getId());
    }

    @Transactional
    public void rejectOrderOffer(Long orderId, String driverEmail, String reason) {
        Order order = findOrder(orderId);
        Driver driver = findDriver(driverEmail);
        OrderOffer offer = findOffer(order, driver);

        if (offer.getStatus() != OfferStatus.SENT) {
            throw new IllegalStateException("This offer is no longer active.");
        }

        // 1. Ažuriraj ponudu
        offer.setStatus(OfferStatus.REJECTED);
        offer.setReasonForRejection(reason);
        orderOfferRepository.save(offer);

        // 2. Ažuriraj brojač odbijanja kod vozača
        driver.setRejectionCount(driver.getRejectionCount() + 1);
        driverRepository.save(driver);

        // 3. Pokreni ponovo algoritam da se porudžbina dodijeli sljedećem vozaču
        System.out.println("Driver " + driver.getFirstName() + " REJECTED order " + order.getId() + ". Re-assigning...");
        assignOrderToBestDriver(order);
    }

    // --- Pomoćne metode ---
    private Driver findBestCandidate(List<Driver> candidates, Order order) { /* ... ista logika kao prije ... */ return candidates.get(0); }
    private Order findOrder(Long orderId) { return orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found")); }
    private Driver findDriver(String email) { return driverRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Driver not found")); }
    private OrderOffer findOffer(Order o, Driver d) { return orderOfferRepository.findByOrderAndDriver(o, d).orElseThrow(() -> new IllegalStateException("Offer not found")); }
}