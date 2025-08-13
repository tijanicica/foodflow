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
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
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
    public Order reportDelay(String driverEmail, Long orderId, Integer delayMinutes) {
        Driver driver = findDriverByEmail(driverEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getDriver().equals(driver)) {
            throw new SecurityException("This is not your order.");
        }

        order.setDriverReportedDelay(delayMinutes);

        LocalDateTime newEta = calculateEta(order, driver);
        order.setEta(newEta);

        // TODO: Poslati notifikaciju kupcu o novom, ažuriranom ETA.

        return orderRepository.save(order);
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
                .orElseThrow(() -> new RuntimeException("Order not found with ID: ".concat(String.valueOf(orderId))));

        // Sigurnosne provjere (tvoje postojeće)
        if (order.getDriver() == null || !order.getDriver().equals(driver)) {
            throw new SecurityException("Forbidden: This order is not assigned to you.");
        }
        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new IllegalStateException("Cannot pick up order. It is not ready yet or already picked up.");
        }

        final double MAX_ALLOWED_DISTANCE_KM = 0.15;

        Restaurant restaurant = order.getOrderItems().stream()
                .findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                .orElseThrow(() -> new IllegalStateException("Restaurant information is missing for this order."));
        // ------------------------------------------

        if (restaurant.getAddress() == null) {
            throw new IllegalStateException("Restaurant location is not available for this order.");
        }


        double distanceInKm = calculateDistance(
                driver.getLatitude(),
                driver.getLongitude(),
                restaurant.getAddress().getLatitude(),
                restaurant.getAddress().getLongitude()
        );

        if (distanceInKm > MAX_ALLOWED_DISTANCE_KM) {
            throw new IllegalStateException(
                    String.format("You are too far from the restaurant to pick up the order. Required distance: %.0f m, your distance: %.0f m.",
                            MAX_ALLOWED_DISTANCE_KM * 1000,
                            distanceInKm * 1000
                    )
            );
        }
        LocalDateTime eta = calculateEta(order, driver);
        order.setEta(eta);
        order.setStatus(OrderStatus.PICKED_UP);

        return orderRepository.save(order);
    }
    @Transactional
    public Order markOrderAsDelivered(String driverEmail, Long orderId) {
        Driver driver = findDriverByEmail(driverEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        if (order.getDriver() == null || !order.getDriver().equals(driver)) {
            throw new SecurityException("Forbidden: This order is not assigned to you.");
        }
        if (order.getStatus() != OrderStatus.PICKED_UP) {
            throw new IllegalStateException("Cannot deliver order. It has not been picked up yet.");
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());

        // TODO: Ovdje pokrenuti logiku koja omogućava kupcu i menadžeru da ocijene vozača.

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

    @Transactional(readOnly = true)
    public void startSimulationForOrder(String driverEmail, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        Driver driver = driverRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new EntityNotFoundException("Driver not found"));
        if (order.getDriver() == null || !order.getDriver().getId().equals(driver.getId())) {
            throw new SecurityException("Forbidden: Order not assigned to this driver.");
        }

        double endLat;
        double endLng;
        if (order.getStatus() == OrderStatus.READY_FOR_PICKUP) {
            Restaurant restaurant = order.getOrderItems().stream()
                    .findFirst()
                    .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant())
                    .orElseThrow(() -> new EntityNotFoundException("Restaurant not found for order: " + orderId));

            endLat = restaurant.getAddress().getLatitude();
            endLng = restaurant.getAddress().getLongitude();

        } else if (order.getStatus() == OrderStatus.PICKED_UP) {
            Address customerAddress = order.getAddress();
            endLat = customerAddress.getLatitude();
            endLng = customerAddress.getLongitude();

        } else {
            return;
        }
        simulationService.simulateDriving(
                driver.getId(),
                driver.getLatitude(),
                driver.getLongitude(),
                endLat,
                endLng,
                order.getId()
        );
    }


}