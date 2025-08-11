package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.*;
import com.iis.foodflow.enums.DriverStatus;
import com.iis.foodflow.enums.OfferStatus;
import com.iis.foodflow.model.order.Address;
import com.iis.foodflow.enums.DriverStatus;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.enums.VehicleType;
import com.iis.foodflow.model.delivery.OrderOffer;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.repository.DriverRatingRepository;
import com.iis.foodflow.repository.DriverRepository;
import com.iis.foodflow.repository.OrderOfferRepository;
import com.iis.foodflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {

    // --- SVE POTREBNE ZAVISNOSTI ---
    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;
    private final DriverRatingRepository driverRatingRepository; // <-- ISPRAVKA: Dodana zavisnost
    private final OrderOfferRepository orderOfferRepository;   // <-- ISPRAVKA: Dodana zavisnost

    /**
     * Mijenja status dostupnosti vozača (ONLINE/OFFLINE).
     */
// Ispravljena verzija
    @Transactional
    public DriverResponseDTO updateStatus(String driverEmail, DriverStatus newStatus) {
        Driver driver = findDriverByEmail(driverEmail);
        driver.setStatus(newStatus);
        Driver savedDriver = driverRepository.save(driver);

        if (newStatus == DriverStatus.OFFLINE) {
            // Ne brišemo postojeće prihvaćene isporuke
            // Samo osiguravamo da nove ponude ne idu ovom vozaču (to je rešeno u algoritmu dodele)
            System.out.println("Driver " + driverEmail + " is now OFFLINE. Keeping accepted deliveries.");
        }

        return DriverResponseDTO.builder()
                .id(savedDriver.getId())
                .email(savedDriver.getEmail())
                .firstName(savedDriver.getFirstName())
                .lastName(savedDriver.getLastName())
                .phone(savedDriver.getPhone())
                .vehicleType(savedDriver.getVehicleType())
                .status(savedDriver.getStatus())
                .build();
    }

    /**
     * Ažurira geografsku lokaciju vozača.
     */
    @Transactional
    public void updateLocation(String driverEmail, Double latitude, Double longitude) {
        Driver driver = findDriverByEmail(driverEmail);
        driver.setLatitude(latitude);
        driver.setLongitude(longitude);
        driver.setTimestamp(LocalDateTime.now());
        driverRepository.save(driver);
    }

    /**
     * Mijenja tip vozila za prijavljenog vozača.
     */
// Nova, ispravljena verzija u vašem servisu
    @Transactional
    public DriverResponseDTO updateVehicle(String driverEmail, VehicleType newVehicleType) { // 1. Promijenjen povratni tip
        Driver driver = findDriverByEmail(driverEmail);
        driver.setVehicleType(newVehicleType);
        Driver savedDriver = driverRepository.save(driver);

        // 2. Kreiramo i vraćamo DTO umjesto cijelog entiteta
        return DriverResponseDTO.builder()
                .id(savedDriver.getId())
                .email(savedDriver.getEmail())
                .firstName(savedDriver.getFirstName())
                .lastName(savedDriver.getLastName())
                .phone(savedDriver.getPhone())
                .vehicleType(savedDriver.getVehicleType())
                .status(savedDriver.getStatus())
                .build();
    }

    /**
     * Pronalazi vozača po ID-u i vraća DTO sa podacima o lokaciji.
     */
    @Transactional(readOnly = true)
    public DriverLocationResponse getDriverLocation(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new UsernameNotFoundException("Driver not found with ID: " + driverId));

        return new DriverLocationResponse(
                driver.getId(),
                driver.getFirstName(),
                driver.getLastName(),
                driver.getLatitude(),
                driver.getLongitude(),
                driver.getTimestamp()
        );
    }

    /**
     * Prikuplja i izračunava statistike o performansama za prijavljenog vozača.
     */
    @Transactional(readOnly = true)
    public DriverPerformanceResponse getDriverPerformance(String driverEmail) {
        Driver driver = findDriverByEmail(driverEmail);
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // 1. Dobijamo ukupan broj isporučenih porudžbina
        Long totalDelivered = orderRepository.countByDriverAndStatusAndCreationDateAfter(
                driver, OrderStatus.DELIVERED, thirtyDaysAgo
        );

        // 2. Dobijamo broj porudžbina isporučenih na vrijeme
        Long onTimeDelivered = orderRepository.countOnTimeDeliveriesForDriver(
                driver, OrderStatus.DELIVERED, thirtyDaysAgo
        );

        double onTimeRate = (totalDelivered == null || totalDelivered == 0) ? 1.0 : (double) onTimeDelivered / totalDelivered;

        // 3. Dobijanje broja odbijanja u posljednjih 30 dana
        long rejections = orderOfferRepository.countByDriverAndStatusAndCreatedAtAfter(
                driver, OfferStatus.REJECTED, thirtyDaysAgo
        );

        // 4. Računanje prosječne ocjene iz 'driver_rating' tabele
        double averageRating = driverRatingRepository.findAverageRatingByDriverId(driver.getId())
                .orElse(0.0); // Ako nema ocjena, vrati 0.0

        return new DriverPerformanceResponse(
                driver.getFirstName(),
                driver.getLastName(),
                driver.getVehicleType(),
                totalDelivered != null ? totalDelivered.intValue() : 0, // Ukupno isporuka
                onTimeRate,                                             // Procenat na vrijeme
                (int) rejections,                                       // Broj odbijanja
                averageRating                                           // Prosječna ocjena
        );
    }

    // Pomoćna privatna metoda da se izbjegne ponavljanje koda
    private Driver findDriverByEmail(String email) {
        return driverRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Driver not found with email: " + email));
    }
    @Transactional
    public Order markOrderAsPickedUp(String driverEmail, Long orderId) {
        Driver driver = findDriverByEmail(driverEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Sigurnosne provjere
        if (order.getDriver() == null || !order.getDriver().equals(driver)) {
            throw new SecurityException("Forbidden: This order is not assigned to you.");
        }
        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new IllegalStateException("Cannot pick up order. It is not ready yet.");
        }

        order.setStatus(OrderStatus.PICKED_UP);

        // TODO: Ovdje dodati logiku za slanje notifikacije kupcu ("Vaša porudžbina je na putu!").

        return orderRepository.save(order);
    }

    /**
     * Vozač označava da je isporučio porudžbinu kupcu.
     */
    @Transactional
    public Order markOrderAsDelivered(String driverEmail, Long orderId) {
        Driver driver = findDriverByEmail(driverEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Sigurnosne provjere
        if (order.getDriver() == null || !order.getDriver().equals(driver)) {
            throw new SecurityException("Forbidden: This order is not assigned to you.");
        }
        if (order.getStatus() != OrderStatus.PICKED_UP) {
            throw new IllegalStateException("Cannot deliver order. It has not been picked up yet.");
        }

        order.setStatus(OrderStatus.DELIVERED);
        // KLJUČNO ZA PERFORMANSE: Bilježimo točno vrijeme isporuke.
        order.setDeliveredAt(LocalDateTime.now());

        // TODO: Ovdje pokrenuti logiku koja omogućava kupcu i menadžeru da ocijene vozača.

        return orderRepository.save(order);
    }


    /**
     * Vozač OTKAZUJE porudžbinu koju je VEĆ PRIHVATIO.
     * @param driverEmail Email ulogiranog vozača
     * @param orderId ID porudžbine koja se otkazuje
     * @param reason Obavezan razlog za otkazivanje
     */
    @Transactional
    public Order cancelAssignedDelivery(String driverEmail, Long orderId, String reason) {
        Driver driver = findDriverByEmail(driverEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // KLJUČNA PROVJERA: Da li je porudžbina zaista dodijeljena ovom vozaču?
        if (order.getDriver() == null || !order.getDriver().equals(driver)) {
            throw new SecurityException("Forbidden: This order is not assigned to you.");
        }

        // KLJUČNA PROVJERA: Da li se porudžbina može otkazati? Ne može ako je već isporučena ili otkazana.
        List<OrderStatus> cancellableStatuses = List.of(
                OrderStatus.CONFIRMED,
                OrderStatus.READY_FOR_PICKUP,
                OrderStatus.PICKED_UP
        );
        if (!cancellableStatuses.contains(order.getStatus())) {
            throw new IllegalStateException("This order can no longer be canceled. Current status: " + order.getStatus());
        }

        // Ažuriramo porudžbinu
        order.setStatus(OrderStatus.CANCELED);
        order.setCancellationReason(reason);

        // Opcionalno, ali preporučeno: Ovdje se porudžbina "oslobađa" od vozača.
        // Sistem bi je onda trebao ponovo dodijeliti drugom vozaču.
        order.setDriver(null);

        // TODO: Ovdje pozvati logiku koja će pokrenuti proces ponovne dodjele porudžbine.

        return orderRepository.save(order);
    }



    /**
     * Vozač prihvata ponuđenu porudžbinu.
     * Dozvoljeno samo ako je vozač ONLINE.
     */
    @Transactional
    public OrderOffer acceptOffer(String driverEmail, Long offerId) {
        Driver driver = findDriverByEmail(driverEmail);

        if (driver.getStatus() != DriverStatus.ONLINE) {
            throw new IllegalStateException("You must be ONLINE to accept offers.");
        }

        OrderOffer offer = orderOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found with ID: " + offerId));

        if (!offer.getDriver().equals(driver)) {
            throw new SecurityException("Forbidden: You cannot accept an offer that is not assigned to you.");
        }

        // Provjera: Može se prihvatiti samo ponuda sa statusom SENT
        if (offer.getStatus() != OfferStatus.SENT) {
            throw new IllegalStateException("This offer is no longer available.");
        }

        offer.setStatus(OfferStatus.ACCEPTED);

        // Ne menjaj status porudžbine, samo poveži vozača na porudžbinu
        Order order = offer.getOrder();
        order.setDriver(driver);

        // Sačuvaj porudžbinu sa vozačem, ali bez menjanja statusa
        orderRepository.save(order);

        return orderOfferRepository.save(offer);
    }

    /**
     * Vozač odbija ponuđenu porudžbinu.
     * Mijenja status ponude i pokreće logiku za pronalazak novog vozača.
     */
    @Transactional
    public OrderOffer rejectOffer(String driverEmail, Long offerId, String reason) {
        Driver driver = findDriverByEmail(driverEmail);

        if (driver.getStatus() != DriverStatus.ONLINE) {
            throw new IllegalStateException("You must be ONLINE to reject offers.");
        }

        OrderOffer offer = orderOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found with ID: " + offerId));

        if (!offer.getDriver().equals(driver)) {
            throw new SecurityException("Forbidden: You cannot reject an offer that is not assigned to you.");
        }

        if (offer.getStatus() != OfferStatus.SENT) {
            throw new IllegalStateException("This offer is no longer available.");
        }

        // Ažuriramo status ponude
        offer.setStatus(OfferStatus.REJECTED);
        offer.setReasonForRejection(reason);

        // === KLJUČNA ISPRAVKA: Povećavamo brojač odbijanja za vozača ===
        int currentRejections = (driver.getRejectionCount() == null) ? 0 : driver.getRejectionCount();
        driver.setRejectionCount(currentRejections + 1);
        driverRepository.save(driver);
        // ================================================================

        // TODO: Ovdje implementirati logiku za slanje ponude sljedećem vozaču.

        return orderOfferRepository.save(offer);
    }
    @Transactional(readOnly = true)
    public DriverDashboardResponse getDashboardData(String driverEmail) {
        Driver driver = findDriverByEmail(driverEmail);

        List<DashboardOfferDTO> newOffers = Collections.emptyList();

        // Ako je ONLINE, učitavamo nove ponude
        if (driver.getStatus() == DriverStatus.ONLINE) {
            newOffers = orderOfferRepository.findByDriverAndStatus(driver, OfferStatus.SENT)
                    .stream()
                    .map(offer -> {
                        Order order = offer.getOrder();

                        Restaurant restaurant = order.getOrderItems().stream()
                                .findFirst()
                                .map(orderItem -> orderItem.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                                .orElse(null);

                        if (restaurant == null) {
                            return DashboardOfferDTO.builder()
                                    .id(offer.getId())
                                    .order(DashboardOrderDTO.builder()
                                            .id(order.getId())
                                            .status(order.getStatus())
                                            .build())
                                    .build();
                        }

                        double distance = calculateDistance(
                                driver.getLatitude(), driver.getLongitude(),
                                restaurant.getAddress().getLatitude(),
                                restaurant.getAddress().getLongitude()
                        );

                        String restaurantAddress = String.format(
                                "%s, %s, %s",
                                restaurant.getAddress().getStreet(),
                                restaurant.getAddress().getCity(),
                                restaurant.getAddress().getPostalCode()
                        );

                        String deliveryAddress = order.getCustomer().getAddresses().stream()
                                .findFirst()
                                .map(addr -> String.format("%s, %s, %s",
                                        addr.getStreet(),
                                        addr.getCity(),
                                        addr.getPostalCode()))
                                .orElse("N/A");

                        DashboardOrderDTO orderDTO = DashboardOrderDTO.builder()
                                .id(order.getId())
                                .status(order.getStatus())
                                .restaurantName(restaurant.getName())
                                .restaurantAddress(restaurantAddress)
                                .deliveryAddress(deliveryAddress)
                                .distanceToRestaurant(distance)
                                .build();

                        return DashboardOfferDTO.builder()
                                .id(offer.getId())
                                .order(orderDTO)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        // Assigned deliveries uvek vraćamo, bez obzira na status
        List<OrderStatus> activeStatuses = List.of(OrderStatus.CONFIRMED, OrderStatus.READY_FOR_PICKUP, OrderStatus.PICKED_UP);
        List<DashboardOrderDTO> assignedDeliveries = orderRepository.findByDriverAndStatusIn(driver, activeStatuses)
                .stream()
                .map(order -> {
                    Restaurant restaurant = order.getOrderItems().stream()
                            .findFirst()
                            .map(orderItem -> orderItem.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                            .orElse(null);

                    if (restaurant == null) {
                        return DashboardOrderDTO.builder()
                                .id(order.getId())
                                .status(order.getStatus())
                                .build();
                    }

                    double distance = calculateDistance(
                            driver.getLatitude(), driver.getLongitude(),
                            restaurant.getAddress().getLatitude(),
                            restaurant.getAddress().getLongitude()
                    );

                    String restaurantAddress = String.format(
                            "%s, %s, %s",
                            restaurant.getAddress().getStreet(),
                            restaurant.getAddress().getCity(),
                            restaurant.getAddress().getPostalCode()
                    );

                    String deliveryAddress = order.getCustomer().getAddresses().stream()
                            .findFirst()
                            .map(addr -> String.format("%s, %s, %s",
                                    addr.getStreet(),
                                    addr.getCity(),
                                    addr.getPostalCode()))
                            .orElse("N/A");

                    return DashboardOrderDTO.builder()
                            .id(order.getId())
                            .status(order.getStatus())
                            .restaurantName(restaurant.getName())
                            .restaurantAddress(restaurantAddress)
                            .deliveryAddress(deliveryAddress)
                            .distanceToRestaurant(distance)
                            .build();
                })
                .collect(Collectors.toList());

        return new DriverDashboardResponse(newOffers, assignedDeliveries);
    }



    // === DODAJTE OVU POMOĆNU METODU U 'DriverService.java' AKO VEĆ NE POSTOJI ===
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        final int R = 6371; // Radius Zemlje u km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }


}