package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.*;
import com.iis.foodflow.enums.*;
import com.iis.foodflow.model.order.Address;
import com.iis.foodflow.enums.DriverStatus;
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
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {

    // --- SVE POTREBNE ZAVISNOSTI ---
    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;
    private final SystemSettingsService systemSettingsService;
    private final OrderAssignmentService orderAssignmentService;
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

    @Transactional(readOnly = true)
    public DriverStatusResponse getDriverStatus(String driverEmail) {
        Driver driver = findDriverByEmail(driverEmail);
        return new DriverStatusResponse(driver.getStatus());
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

        LocalDateTime eta = calculateEta(order, driver);
        order.setEta(eta);


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

        // 1. Ažuriramo status ponude
        offer.setStatus(OfferStatus.REJECTED);
        offer.setReasonForRejection(reason);

        // 2. Povećavamo brojač odbijanja za vozača
        int currentRejections = (driver.getRejectionCount() == null) ? 0 : driver.getRejectionCount();
        driver.setRejectionCount(currentRejections + 1);
        driverRepository.save(driver);

        // Spremamo ažuriranu ponudu. Važno je da ovo uradimo prije vraćanja.
        OrderOffer savedOffer = orderOfferRepository.save(offer);

        // 3. === TODO JE RIJEŠEN: POKREĆEMO PONOVNU DODJELU ===
        // Uzimamo porudžbinu iz ponude koju je vozač odbio
        Order orderToReassign = offer.getOrder();
        System.out.println("Driver " + driver.getFirstName() + " REJECTED offer. Finding next driver for order " + orderToReassign.getId());

        // Pozivamo OrderAssignmentService da pronađe sljedećeg kandidata
        orderAssignmentService.findAndAssignBestDriver(orderToReassign);
        // ========================================================

        // Vraćamo originalnu, sada odbačenu ponudu, kao što je i traženo.
        return savedOffer;
    }


// FAJL: src/main/java/com/iis/foodflow/service/DriverService.java
// ZAMIJENITE CIJELU 'getDashboardData' METODU

    // FAJL: src/main/java/com/iis/foodflow/service/DriverService.java
// ZAMIJENITE CIJELU 'getDashboardData' METODU

    @Transactional(readOnly = true)
    public DriverDashboardResponse getDashboardData(String driverEmail) {
        Driver driver = findDriverByEmail(driverEmail);

        // Kreiramo jednu pomoćnu metodu da ne dupliramo kod
        // 'mapOrderToDto' će sada raditi sav posao mapiranja za nas

        // Dohvaćamo nove ponude (ako je vozač online)
        List<DashboardOfferDTO> newOffers = Collections.emptyList();
        if (driver.getStatus() == DriverStatus.ONLINE) {
            newOffers = orderOfferRepository.findByDriverAndStatus(driver, OfferStatus.SENT)
                    .stream()
                    .map(offer -> {
                        DashboardOrderDTO orderDto = mapOrderToDto(offer.getOrder(), driver);
                        return DashboardOfferDTO.builder().id(offer.getId()).order(orderDto).build();
                    })
                    .filter(offerDto -> offerDto.getOrder() != null)
                    .collect(Collectors.toList());
        }

        // Dohvaćamo aktivne porudžbine
        List<OrderStatus> activeStatuses = List.of(OrderStatus.CONFIRMED, OrderStatus.READY_FOR_PICKUP, OrderStatus.PICKED_UP);
        List<DashboardOrderDTO> assignedDeliveries = orderRepository.findByDriverAndStatusIn(driver, activeStatuses)
                .stream()
                .map(order -> mapOrderToDto(order, driver)) // Koristimo istu pomoćnu metodu
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        CoordinatesDTO driverCoordinates = new CoordinatesDTO(driver.getLatitude(), driver.getLongitude());
        return new DriverDashboardResponse(newOffers, assignedDeliveries, driverCoordinates);
    }


// === DODAJTE OVU NOVU POMOĆNU METODU U ISTU KLASU ===
    /**
     * Pomoćna metoda koja mapira jedan Order entitet u DashboardOrderDTO,
     * računajući pritom obje ključne distance.
     */
    private DashboardOrderDTO mapOrderToDto(Order order, Driver driver) {
        // Dohvaćamo restoran preko lanca veza
        Restaurant restaurant = order.getOrderItems().stream()
                .findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                .orElse(null);

        // Ako nema restorana, ne možemo ništa izračunati
        if (restaurant == null) {
            return null;
        }

        // Računamo OBJE distance
        double distDriverToRestaurant = calculateDistance(
                driver.getLatitude(), driver.getLongitude(),
                restaurant.getAddress().getLatitude(), restaurant.getAddress().getLongitude()
        );

        double distDriverToCustomer = calculateDistance(
                driver.getLatitude(), driver.getLongitude(),
                order.getAddress().getLatitude(), order.getAddress().getLongitude()
        );

        return DashboardOrderDTO.builder()
                .id(order.getId())
                .status(order.getStatus())
                .restaurantName(restaurant.getName())
                .restaurantAddress(restaurant.getAddress().toString())
                .deliveryAddress(order.getAddress().toString())
                .distanceDriverToRestaurant(distDriverToRestaurant) // Popunjavamo novo polje
                .distanceDriverToCustomer(distDriverToCustomer)   // Popunjavamo novo polje
                .restaurantCoordinates(new CoordinatesDTO(restaurant.getAddress().getLatitude(), restaurant.getAddress().getLongitude()))
                .deliveryCoordinates(new CoordinatesDTO(order.getAddress().getLatitude(), order.getAddress().getLongitude()))
                .build();
    }
    // FAJL: src/main/java/com/iis/foodflow/service/DriverService.java
// ZAMIJENITE POSTOJEĆU 'calculateEta' METODU SA OVOM

    /**
     * Računa ETA od trenutka preuzimanja na osnovu vozila, distance, vremena i prijavljenih kašnjenja.
     * @param order Porudžbina za koju se računa ETA.
     * @param driver Vozač koji vrši dostavu.
     * @return Procijenjeno vrijeme dolaska.
     */
    private LocalDateTime calculateEta(Order order, Driver driver) {

        // --- KORAK 1: DOHVAĆANJE RESTORANA ---
        Restaurant restaurant = order.getOrderItems().stream()
                .findFirst()
                .map(orderItem -> orderItem.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                .orElseThrow(() -> new IllegalStateException("Cannot calculate ETA: Order has no items or restaurant link."));

        // --- KORAK 2: OSNOVNO VRIJEME PUTOVANJA NA OSNOVU DISTANCE I VOZILA ---
        double deliveryDistance = calculateDistance(
                restaurant.getAddress().getLatitude(),
                restaurant.getAddress().getLongitude(),
                order.getAddress().getLatitude(),
                order.getAddress().getLongitude()
        );

        double minutesPerKm;
        switch (driver.getVehicleType()) {
            case MOTORCYCLE: minutesPerKm = 2.5; break;
            case CAR: minutesPerKm = 3.5; break;
            case BICYCLE: default: minutesPerKm = 5.0; break;
        }
        long travelTime = (long) (deliveryDistance * minutesPerKm);

        // --- KORAK 3: DODATNO VRIJEME ZBOG VREMENSKIH UVJETA ---
        long weatherDelay = 0;
        WeatherCondition weather = systemSettingsService.getCurrentWeather();
        if (weather == WeatherCondition.RAINY) {
            weatherDelay = 10;
        } else if (weather == WeatherCondition.SNOWY || weather == WeatherCondition.STORMY) {
            weatherDelay = 20; // Vraćeno na 20 radi veće razlike
        }

        // --- KORAK 4: DODATNO VRIJEME KOJE JE PRIJAVIO VOZAČ ---
        long driverReportedDelay = (order.getDriverReportedDelay() != null) ? order.getDriverReportedDelay() : 0;

        // --- KORAK 5: KONAČNI IZRAČUN ---
        // Zbrajamo sve komponente da dobijemo ukupno trajanje putovanja
        long totalTravelMinutes = travelTime + weatherDelay + driverReportedDelay;

        System.out.println(
                String.format("ETA calculated for order %d: TravelTime= %d min, WeatherDelay= %d min, DriverDelay= %d min. TOTAL= %d min.",
                        order.getId(), travelTime, weatherDelay, driverReportedDelay, totalTravelMinutes)
        );

        // Vraćamo TRENUTNO VRIJEME + izračunato ukupno vrijeme putovanja
        return LocalDateTime.now().plusMinutes(totalTravelMinutes);
    }

// OBAVEZNO dodajte import za Restaurant ako ga nemate
// import com.iis.foodflow.model.restaurant.Restaurant;

    // FAJL: src/main/java/com/iis/foodflow/service/DriverService.java

    @Transactional
    public Order reportDelay(String driverEmail, Long orderId, Integer delayMinutes) {
        Driver driver = findDriverByEmail(driverEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Provjere sigurnosti...
        if (!order.getDriver().equals(driver)) {
            throw new SecurityException("This is not your order.");
        }

        // 1. Zabilježi kašnjenje koje je vozač prijavio
        order.setDriverReportedDelay(delayMinutes);

        // 2. Ponovo izračunaj i AŽURIRAJ ETA sa novim informacijama
        LocalDateTime newEta = calculateEta(order, driver);
        order.setEta(newEta);

        // TODO: Poslati notifikaciju kupcu o novom, ažuriranom ETA.

        return orderRepository.save(order);
    }



    // === DODAJTE OVU POMOĆNU METODU U 'DriverService.java' AKO VEĆ NE POSTOJI ===
// FAJL: src/main/java/com/iis/foodflow/service/DriverService.java
// ZAMIJENITE POSTOJEĆU 'calculateDistance' METODU

    /**
     * Računa PROCJENJENU udaljenost putem na osnovu zračne udaljenosti.
     * Koristi Haversine formulu i dodaje faktor korekcije za gradsku vožnju.
     * @return Procijenjena udaljenost putem u kilometrima (km).
     */
    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        // Sigurnosna provjera
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 9999.0;
        }
        if (lat1.equals(lat2) && lon1.equals(lon2)) {
            return 0.0;
        }

        final int R = 6371; // Radijus Zemlje

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Prvo izračunamo zračnu udaljenost
        double airDistance = R * c;

        // === KLJUČNA ISPRAVKA: DODAJEMO FAKTOR KOREKCIJE ===
        // Množimo zračnu udaljenost sa 1.3 da bismo simulirali da je
        // stvarni put u prosjeku 30% duži zbog ulica.
        // Možete se igrati sa ovim brojem (npr. 1.25, 1.4).
        double estimatedRoadDistance = airDistance * 1.35;
        // =======================================================

        return estimatedRoadDistance;
    }

}