package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.UpdateProfileRequestDTO;
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
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;
    private final SystemSettingsService systemSettingsService;
    private final OrderAssignmentService orderAssignmentService;
    private final DriverRatingRepository driverRatingRepository;
    private final OrderOfferRepository orderOfferRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Autowired
    private RoutingService routingService;

    @Autowired private DriverSimulationService simulationService;

    @Transactional(readOnly = true)
    public DriverResponseDTO getDriverInfo(String driverEmail) {
        Driver driver = driverRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with email: " + driverEmail));

        return DriverResponseDTO.builder()
                .id(driver.getId())
                .email(driver.getEmail())
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .phone(driver.getPhone())
                .vehicleType(driver.getVehicleType())
                .status(driver.getStatus())
                .latitude(driver.getLatitude())
                .longitude(driver.getLongitude())
                .build();
    }


    private Driver findDriverByEmail(String email) {
        return driverRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Driver not found with email: " + email));
    }
    @Transactional(readOnly = true)
    public DriverStatusResponse getDriverStatus(String driverEmail) {
        Driver driver = findDriverByEmail(driverEmail);
        return new DriverStatusResponse(driver.getStatus());
    }

    @Transactional
    public DriverResponseDTO updateStatus(String driverEmail, DriverStatus newStatus) {
        Driver driver = findDriverByEmail(driverEmail);
        driver.setStatus(newStatus);
        Driver savedDriver = driverRepository.save(driver);

        if (newStatus == DriverStatus.OFFLINE) {
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
    public VehicleInfoDTO getDriverVehicle(String driverEmail) {
        // 1. Pronađi vozača u bazi
        Driver driver = findDriverByEmail(driverEmail);

        // 2. Vrati novi DTO koji sadrži samo tip vozila
        return new VehicleInfoDTO(driver.getVehicleType().name());
    }
    @Transactional
    // 1. Promenjen povratni tip metode u novi DTO
    public ProfileUpdateResponseDTO updateProfile(String driverEmail, UpdateProfileRequestDTO request) {
        Driver driverToUpdate = findDriverByEmail(driverEmail);


        // Ažuriranje imena i prezimena
        if (StringUtils.hasText(request.getFirstName())) {
            driverToUpdate.setFirstName(request.getFirstName().trim());
        }
        if (StringUtils.hasText(request.getLastName())) {
            driverToUpdate.setLastName(request.getLastName().trim());
        }

        // Čuvanje izmena
        Driver savedDriver = driverRepository.save(driverToUpdate);

        // 2. MAPIRANJE NA NOVI, SPECIFIČNI DTO ZA ODGOVOR
        return ProfileUpdateResponseDTO.builder()
                .firstName(savedDriver.getFirstName()) // Vraćamo ažurirano ime
                .lastName(savedDriver.getLastName())   // Vraćamo ažurirano prezime
                .build();
    }
    @Transactional
    public VehicleInfoDTO updateVehicle(String driverEmail, String newVehicleTypeString) {
        // 1. Pronađi vozača
        Driver driver = findDriverByEmail(driverEmail);

        // 2. Pretvori String u Enum
        VehicleType newVehicleType = VehicleType.valueOf(newVehicleTypeString.toUpperCase());

        // 3. Postavi novu vrednost
        driver.setVehicleType(newVehicleType);

        // 4. Sačuvaj izmene (JPA će ovo uraditi na kraju transakcije, ali save() je eksplicitno)
        Driver savedDriver = driverRepository.save(driver);

        // 5. Kreiraj i vrati NOVI, manji DTO koji sadrži samo tip vozila
        return new VehicleInfoDTO(savedDriver.getVehicleType().name());
    }
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
    @Transactional
    public DashboardOrderDTO updateDriverLocation(String driverEmail, CoordinatesDTO newLocation) {
        Driver driver = findDriverByEmail(driverEmail);

        driver.setLatitude(newLocation.getLat());
        driver.setLongitude(newLocation.getLng());
        driverRepository.save(driver);

        List<OrderStatus> activeStatuses = List.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.PICKED_UP);

        Optional<Order> activeOrderOpt = orderRepository.findActiveOrderByDriver(driver, activeStatuses);

        if (activeOrderOpt.isEmpty()) {
            throw new RuntimeException("No active order assigned");
        }

        Order activeOrder = activeOrderOpt.get();
        return mapOrderToDto(activeOrder, driver);
    }


    @Transactional(readOnly = true)
    public DriverPerformanceResponse getDriverPerformance(String driverEmail) {
        Driver driver = findDriverByEmail(driverEmail);
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        Long totalDelivered = orderRepository.countByDriverAndStatusAndCreationDateAfter(
                driver, OrderStatus.DELIVERED, thirtyDaysAgo
        );

        Long onTimeDelivered = orderRepository.countOnTimeDeliveriesForDriver(
                driver, OrderStatus.DELIVERED, thirtyDaysAgo
        );

        double onTimeRate = (totalDelivered == null || totalDelivered == 0) ? 1.0 : (double) onTimeDelivered / totalDelivered;

        long rejections = orderOfferRepository.countByDriverAndStatusAndCreatedAtAfter(
                driver, OfferStatus.REJECTED, thirtyDaysAgo
        );

        double averageRating = driverRatingRepository.findAverageRatingByDriverId(driver.getId())
                .orElse(0.0);

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



    @Transactional(readOnly = true)
    public DriverDashboardResponse getDashboardData(String driverEmail) {
        Driver driver = findDriverByEmail(driverEmail);

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

        List<OrderStatus> activeStatuses = List.of(OrderStatus.CONFIRMED, OrderStatus.READY_FOR_PICKUP, OrderStatus.PICKED_UP);
        List<DashboardOrderDTO> assignedDeliveries = orderRepository.findByDriverAndStatusIn(driver, activeStatuses)
                .stream()
                .map(order -> mapOrderToDto(order, driver)) // Koristimo istu pomoćnu metodu
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        CoordinatesDTO driverCoordinates = new CoordinatesDTO(driver.getLatitude(), driver.getLongitude());
        return new DriverDashboardResponse(newOffers, assignedDeliveries, driverCoordinates);
    }

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

    @Transactional
    public CancelDeliveryResponse cancelAssignedDelivery(String driverEmail, Long orderId, String reason) {
        Driver driver = findDriverByEmail(driverEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Provera da li je porudžbina dodijeljena ovom vozaču
        if (order.getDriver() == null || !order.getDriver().equals(driver)) {
            throw new SecurityException("Forbidden: This order is not assigned to you.");
        }
        if (order.getStatus() == OrderStatus.CANCELED) {
            throw new IllegalStateException("This order can no longer be canceled. Current status: " + order.getStatus());
        }

        // Provera statusa koji se može otkazati
        List<OrderStatus> cancellableStatuses = List.of(
                OrderStatus.READY_FOR_PICKUP,
                OrderStatus.PICKED_UP
        );
        if (!cancellableStatuses.contains(order.getStatus())) {
            throw new IllegalStateException("This order can no longer be canceled. Current status: " + order.getStatus());
        }

        // Ažuriramo porudžbinu
        order.setStatus(OrderStatus.CANCELED);
        order.setCancellationReason(reason);

        Order savedOrder = orderRepository.save(order);
        notificationService.notifyManagerOfOrderStatusUpdate(savedOrder);

        // Vraćamo DTO, a ne entitet
        return new CancelDeliveryResponse(
                savedOrder.getId(),
                savedOrder.getStatus(),
                savedOrder.getCancellationReason()
        );
    }

    @Transactional
    public Order markOrderAsPickedUp(String driverEmail, Long orderId) {
        Driver driver = findDriverByEmail(driverEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // --- 1. SIGURNOSNE PROVERE ---
        if (order.getDriver() == null || !order.getDriver().getId().equals(driver.getId())) {
            throw new SecurityException("Forbidden: This order is not assigned to you.");
        }
        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new IllegalStateException("Cannot pick up order. It's not in the correct state.");
        }

        // --- 2. PROVERA BLIZINE RESTORANA ---
        final double MAX_ALLOWED_DISTANCE_KM = 0.3; // 300 metara
        Restaurant restaurant = order.getOrderItems().stream()
                .findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                .orElseThrow(() -> new IllegalStateException("Restaurant information is missing for this order."));

        if (restaurant.getAddress() == null) {
            throw new IllegalStateException("Restaurant location is not available for this order.");
        }

        RoutingService.RouteDetailsDTO toRestaurantRoute = routingService.getRouteDetails(
                driver.getLatitude(), driver.getLongitude(),
                restaurant.getAddress().getLatitude(), restaurant.getAddress().getLongitude()
        );
        if (toRestaurantRoute.getDistanceInMeters() < 0) {
            throw new IllegalStateException("Could not verify distance to the restaurant.");
        }
        double distanceToRestaurantKm = toRestaurantRoute.getDistanceInMeters() / 1000.0;
        if (distanceToRestaurantKm > MAX_ALLOWED_DISTANCE_KM) {
            throw new IllegalStateException(String.format("You are too far from the restaurant. Your distance: %.0f m.", distanceToRestaurantKm * 1000));
        }

        // --- 3. AŽURIRANJE PORUDŽBINE ---
        order.setStatus(OrderStatus.PICKED_UP);
        // Pozivamo pomoćnu metodu da postavi `startDeliveryTime` i izračuna PRVI ETA
        recalculateEtaAndUpdateOrder(order, driver);

        Order savedOrder = orderRepository.save(order);

        // --- 4. POKRETANJE SIMULACIJE ---
        Address customerAddress = savedOrder.getAddress();
        RoutingService.RouteDetailsDTO toCustomerRoute = routingService.getRouteDetails(
                restaurant.getAddress().getLatitude(), restaurant.getAddress().getLongitude(),
                customerAddress.getLatitude(), customerAddress.getLongitude()
        );

        if (toCustomerRoute.getDurationInSeconds() > 0) {
            double baseTravelSeconds = toCustomerRoute.getDurationInSeconds();
            double vehicleAdjustedSeconds;
            switch (driver.getVehicleType()) {
                case MOTORCYCLE: vehicleAdjustedSeconds = baseTravelSeconds * 0.80; break;
                case CAR: vehicleAdjustedSeconds = baseTravelSeconds; break;
                default: vehicleAdjustedSeconds = baseTravelSeconds * 1.30; break;
            }
            double randomnessFactor = 0.9 + (Math.random() * 0.2);
            double simulationDurationSeconds = vehicleAdjustedSeconds * randomnessFactor;

            simulationService.simulateDriving(
                    driver.getId(),
                    restaurant.getAddress().getLatitude(),
                    restaurant.getAddress().getLongitude(),
                    customerAddress.getLatitude(),
                    customerAddress.getLongitude(),
                    savedOrder.getId(),
                    simulationDurationSeconds
            );
        }
        return savedOrder;
    }

    @Transactional
    public Order reportDelay(String driverEmail, Long orderId, Integer delayMinutes) {
        Driver driver = findDriverByEmail(driverEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: ".concat(String.valueOf(orderId))));

        // --- 1. SIGURNOSNE PROVERE ---
        if (order.getDriver() == null || !order.getDriver().getId().equals(driver.getId())) {
            throw new SecurityException("This is not your order.");
        }
        // Dozvoljavamo prijavu kašnjenja dok god porudžbina nije dostavljena ili otkazana
        if (order.getStatus() != OrderStatus.PICKED_UP && order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new IllegalStateException("You can only report a delay for an active order.");
        }

        // --- 2. LOGIKA ZA OGRANIČENJE BROJA PRIJAVA ---

        // Definišemo maksimalan broj dozvoljenih prijava
        final int MAX_DELAY_REPORTS = 2;

        int currentReportCount = (order.getDelayReportCount() != null) ? order.getDelayReportCount() : 0;

        // Proveravamo da li je vozač već iskoristio sve prijave
        if (currentReportCount >= MAX_DELAY_REPORTS) {
            throw new IllegalStateException(
                    "You have already reported a delay " + MAX_DELAY_REPORTS + " times for this order."
            );
        }

        // Ako nije, povećaj brojač i nastavi
        order.setDelayReportCount(currentReportCount + 1);

        // --- 3. AŽURIRANJE KAŠNJENJA I ETA ---

        // Dodaj novo prijavljeno kašnjenje na postojeće
        int currentDelay = (order.getDriverReportedDelay() != null) ? order.getDriverReportedDelay() : 0;
        order.setDriverReportedDelay(currentDelay + delayMinutes);

        // Pozovi pomoćnu metodu da ponovo izračuna ETA sa novim, ukupnim kašnjenjem
        recalculateEtaAndUpdateOrder(order, driver);

        Order updatedOrder = orderRepository.save(order);
        notificationService.notifyManagerOfOrderStatusUpdate(updatedOrder);

        return orderRepository.save(order);
    }

    // --- NOVA POMOĆNA METODA ZA ETA ---
    /**
     * Privatna pomoćna metoda koja (ponovo) izračunava i postavlja ETA na porudžbinu.
     * Uvek koristi originalno 'startDeliveryTime' kao osnovu.
     */

    private void recalculateEtaAndUpdateOrder(Order order, Driver driver) {
        // --- 1. Provera i postavljanje vremena početka ---
        // Ako vreme početka dostave nije postavljeno, postavi ga na sada.
        // Ovo se dešava samo prvi put, kada se pozove iz 'markOrderAsPickedUp'.
        if (order.getStartDeliveryTime() == null) {
            order.setStartDeliveryTime(LocalDateTime.now());
        }

        // --- 2. Dobijanje detalja rute (od restorana do kupca) ---
        Restaurant restaurant = order.getOrderItems().stream()
                .findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                .orElseThrow(() -> new IllegalStateException("Cannot recalculate ETA: Restaurant not found for order " + order.getId()));

        Address customerAddress = order.getAddress();

        if (restaurant.getAddress() == null || customerAddress == null) {
            throw new IllegalStateException("Address information is missing for order " + order.getId());
        }

        RoutingService.RouteDetailsDTO routeDetails = routingService.getRouteDetails(
                restaurant.getAddress().getLatitude(),
                restaurant.getAddress().getLongitude(),
                customerAddress.getLatitude(),
                customerAddress.getLongitude()
        );

        if (routeDetails.getDurationInSeconds() < 0) {
            // Ako ne možemo dobiti rutu, postavi ETA na 30 min od početka dostave
            order.setEta(order.getStartDeliveryTime().plusMinutes(30));
            return; // Prekini dalje izvršavanje
        }
        double baseTravelSeconds = routeDetails.getDurationInSeconds();

        // --- 3. Prilagođavanje vremena na osnovu tipa vozila ---
        double vehicleAdjustedSeconds;
        switch (driver.getVehicleType()) {
            case MOTORCYCLE: vehicleAdjustedSeconds = baseTravelSeconds * 0.80; break;
            case CAR: vehicleAdjustedSeconds = baseTravelSeconds; break;
            default: vehicleAdjustedSeconds = baseTravelSeconds * 1.30; break;
        }

        // --- 4. Dodavanje svih kašnjenja ---
        long weatherDelaySeconds = 0;
        WeatherCondition weather = systemSettingsService.getCurrentWeather();
        if (weather == WeatherCondition.RAINY) weatherDelaySeconds = 10 * 60;
        else if (weather == WeatherCondition.SNOWY || weather == WeatherCondition.STORMY) weatherDelaySeconds = 20 * 60;

        long driverReportedDelaySeconds = (order.getDriverReportedDelay() != null) ? order.getDriverReportedDelay() * 60 : 0;
        long trafficBufferSeconds = 30; // Fiksni bafer

        long totalTravelSeconds = (long) vehicleAdjustedSeconds + weatherDelaySeconds + driverReportedDelaySeconds + trafficBufferSeconds;

        // --- 5. Finalni proračun i postavljanje ETA ---
        // Ključna logika: Novi ETA = VREME POČETKA DOSTAVE + ukupno izračunato trajanje
        order.setEta(order.getStartDeliveryTime().plusSeconds(totalTravelSeconds));
    }
    @Transactional
    public Order markOrderAsDelivered(String driverEmail, Long orderId) {
        Driver driver = findDriverByEmail(driverEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Sigurnosna provera 1: Da li je porudžbina dodeljena ovom vozaču
        if (order.getDriver() == null || !order.getDriver().getId().equals(driver.getId())) {
            throw new SecurityException("Forbidden: This order is not assigned to you.");
        }

        // Sigurnosna provera 2: Da li je status porudžbine 'PICKED_UP'
        if (order.getStatus() != OrderStatus.PICKED_UP) {
            throw new IllegalStateException("Cannot deliver order. It has not been picked up yet.");
        }

        // --- NOVA LOGIKA: PROVERA BLIZINE KUPCA ---

        // Definišemo maksimalnu dozvoljenu udaljenost u KILOMETRIMA (0.20 km = 200 metara)
        final double MAX_ALLOWED_DISTANCE_KM = 0.20;

        Address customerAddress = order.getAddress();
        if (customerAddress == null) {
            throw new IllegalStateException("Customer location is not available for this order.");
        }

        // Računamo vazdušnu udaljenost između vozača i adrese za dostavu
        double distanceInKm = calculateDistance(
                driver.getLatitude(),
                driver.getLongitude(),
                customerAddress.getLatitude(),
                customerAddress.getLongitude()
        );

        // Proveravamo da li je vozač unutar dozvoljenog radijusa
        if (distanceInKm > MAX_ALLOWED_DISTANCE_KM) {
            throw new IllegalStateException(
                    String.format("You are too far from the delivery address. Your distance: %.0f m.", distanceInKm * 1000)
            );
        }
        // --- KRAJ NOVE LOGIKE ---


        // Ako su sve provere prošle, menjamo status porudžbine
        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());

        Order updatedOrder = orderRepository.save(order);
        notificationService.notifyManagerOfOrderStatusUpdate(updatedOrder);

        // Kada je porudžbina dostavljena, vozač je ponovo slobodan
        driver.setStatus(DriverStatus.ONLINE);
        driverRepository.save(driver);

        // TODO: Logika za ocenjivanje

        return orderRepository.save(order);
    }


    private DashboardOrderDTO mapOrderToDto(Order order, Driver driver) {
        Restaurant restaurant = order.getOrderItems().stream()
                .findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                .orElse(null);

        if (restaurant == null) return null;

        // --- KLJUČNA IZMENA: POZIVAMO NOVU METODU ---
        // Umesto 'calculateDistance', sada pozivamo 'calculateDistance'
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
                .eta(order.getEta())
                .restaurantName(restaurant.getName())
                .restaurantAddress(restaurant.getAddress().toString())
                .deliveryAddress(order.getAddress().toString())
                .startDeliveryTime(order.getStartDeliveryTime())
                .customerFirstName(order.getCustomer().getFirstName())
                .customerLastName(order.getCustomer().getLastName())
                .distanceDriverToRestaurant(distDriverToRestaurant)
                .distanceDriverToCustomer(distDriverToCustomer)
                .restaurantCoordinates(new CoordinatesDTO(restaurant.getAddress().getLatitude(), restaurant.getAddress().getLongitude()))
                .deliveryCoordinates(new CoordinatesDTO(order.getAddress().getLatitude(), order.getAddress().getLongitude()))
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardOrderDTO getAssignedOrderDetails(String driverEmail, Long orderId) {
        Driver driver = findDriverByEmail(driverEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Sigurnosna provjera: Da li porudžbina zaista pripada ovom vozaču?
        if (!driver.equals(order.getDriver())) {
            throw new SecurityException("Forbidden: This order is not assigned to you.");
        }

        // Koristimo postojeću pomoćnu metodu da mapiramo podatke
        return mapOrderToDto(order, driver);
    }

    //koristimo za racunanje stvarne razdaljine , jako je sporo pa uzimam calculateDistance
    public double getRealRoadDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return -1.0; // Vraćamo -1 kao indikator greške
        }
        if (lat1.equals(lat2) && lon1.equals(lon2)) {
            return 0.0;
        }

        RoutingService.RouteDetailsDTO routeDetails = routingService.getRouteDetails(lat1, lon1, lat2, lon2);

        if (routeDetails.getDistanceInMeters() < 0) {
            return -1.0; // Propagiramo grešku
        }

        double distanceInKm = routeDetails.getDistanceInMeters() / 1000.0;

        return distanceInKm;
    }


    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 9999.0;
        }
        if (lat1.equals(lat2) && lon1.equals(lon2)) {
            return 0.0;
        }

        final int R = 6371; // Radijus Zemlje u kilometrima

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        double airDistance = R * c;

        double estimatedRoadDistance = airDistance * 1.35;

        return estimatedRoadDistance;
    }
// FAJL: src/main/java/com/iis/foodflow/service/DriverService.java

    // FAJL: DriverService.java
    private LocalDateTime calculateEta(Order order, Driver driver) {
        // Dobijamo restoran i adresu kupca iz porudžbine
        Restaurant restaurant = order.getOrderItems().stream()
                .findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                .orElseThrow(() -> new IllegalStateException("Cannot calculate ETA: Restaurant not found."));

        Address customerAddress = order.getAddress();

        if (restaurant.getAddress() == null || customerAddress == null) {
            throw new IllegalStateException("Address information is missing for order " + order.getId());
        }

        // --- KORAK 1: DOBIJANJE OSNOVNOG VREMENA PUTOVANJA OD OSRM-a ---
        // Ovo je vreme optimizovano za automobil.
        RoutingService.RouteDetailsDTO routeDetails = routingService.getRouteDetails(
                restaurant.getAddress().getLatitude(),
                restaurant.getAddress().getLongitude(),
                customerAddress.getLatitude(),
                customerAddress.getLongitude()
        );

        if (routeDetails.getDurationInSeconds() < 0) {
            return LocalDateTime.now().plusMinutes(30); // Fallback
        }

        double baseTravelSeconds = routeDetails.getDurationInSeconds();

        // --- KORAK 2: PRILAGOĐAVANJE VREMENA NA OSNOVU TIPA VOZILA ---
        double vehicleAdjustedSeconds;

        switch (driver.getVehicleType()) {
            case MOTORCYCLE:
                // Motor je brži, smanjujemo vreme za 20%
                vehicleAdjustedSeconds = baseTravelSeconds * 0.80;
                break;
            case CAR:
                // Auto je osnova, ne menjamo vreme
                vehicleAdjustedSeconds = baseTravelSeconds;
                break;
            case BICYCLE:
            default:
                // Bicikl je sporiji, povećavamo vreme za 30%
                vehicleAdjustedSeconds = baseTravelSeconds * 1.30;
                break;
        }

        // --- KORAK 3: DODAVANJE OSTALIH KAŠNJENJA (u sekundama) ---
        long weatherDelaySeconds = 0;
        WeatherCondition weather = systemSettingsService.getCurrentWeather();
        if (weather == WeatherCondition.RAINY) weatherDelaySeconds = 5 * 60;
        else if (weather == WeatherCondition.SNOWY || weather == WeatherCondition.STORMY) weatherDelaySeconds = 7 * 60;

        long driverReportedDelaySeconds = (order.getDriverReportedDelay() != null) ? order.getDriverReportedDelay() * 60 : 0;

        // --- KORAK 4: KONAČNI IZRAČUN ---
        long totalTravelSeconds = (long) vehicleAdjustedSeconds + weatherDelaySeconds + driverReportedDelaySeconds;

        // Vraćamo TRENUTNO VRIJEME + ukupno vreme putovanja u sekundama
        return LocalDateTime.now().plusSeconds(totalTravelSeconds);
    }
    @Transactional(readOnly = true)
    public void startSimulationForOrder(String driverEmail, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: ".concat(String.valueOf(orderId))));
        Driver driver = driverRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new EntityNotFoundException("Driver not found"));

        if (order.getDriver() == null || !order.getDriver().getId().equals(driver.getId())) {
            throw new SecurityException("Forbidden: Order not assigned to this driver.");
        }

        // --- 1. ODREDI POČETNU I KRAJNJU TAČKU ---
        double startLat = driver.getLatitude();
        double startLng = driver.getLongitude();
        final Address destinationAddress;

        if (order.getStatus() == OrderStatus.READY_FOR_PICKUP) {
            Restaurant restaurant = order.getOrderItems().stream()
                    .findFirst()
                    .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                    .orElseThrow(() -> new EntityNotFoundException("Restaurant not found for order: " + orderId));
            destinationAddress = restaurant.getAddress();
        } else if (order.getStatus() == OrderStatus.PICKED_UP) {
            destinationAddress = order.getAddress();
        } else {
            return;
        }

        if (destinationAddress == null) {
            throw new IllegalStateException("Cannot start simulation. Destination address is null.");
        }
        double endLat = destinationAddress.getLatitude();
        double endLng = destinationAddress.getLongitude();

        // --- 2. DOBIJANJE REALNOG VREMENA PUTOVANJA SAMO ZA SIMULACIJU ---
        RoutingService.RouteDetailsDTO routeDetails = routingService.getRouteDetails(
                startLat, startLng, endLat, endLng
        );

        // Ako OSRM ne uspe, koristi fallback trajanje od npr. 5 minuta za simulaciju
        double simulationDurationSeconds = (routeDetails.getDurationInSeconds() > 0)
                ? routeDetails.getDurationInSeconds()
                : 300.0;

        // --- 3. POZIV ISPRAVNE METODE SA 7 PARAMETARA ---
        simulationService.simulateDriving(
                driver.getId(),
                startLat,
                startLng,
                endLat,
                endLng,
                order.getId(),
                simulationDurationSeconds // <-- Sedmi parametar je sada tu
        );
    }
}