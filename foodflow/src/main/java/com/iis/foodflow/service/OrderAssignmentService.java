// FAJL: src/main/java/com/iis/foodflow/service/OrderAssignmentService.java

package com.iis.foodflow.service;
import org.springframework.stereotype.Service;
import com.iis.foodflow.enums.DriverStatus;
import com.iis.foodflow.enums.OfferStatus;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.enums.WeatherCondition;
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
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderAssignmentService {

    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;
    private final OrderOfferRepository orderOfferRepository;
    private final SystemSettingsService systemSettingsService;

    /**
     * Glavna metoda koja pronalazi najboljeg vozača za porudžbinu i šalje mu ponudu.
     * Ova metoda se poziva kada menadžer potvrdi porudžbinu.
     */
    @Transactional
    public void findAndAssignBestDriver(Order order) {
        // 1. Dohvati ID-jeve svih vozača koji su već dobili ponudu za ovu porudžbinu
        List<Long> driversWithOffer = orderOfferRepository.findByOrder(order).stream()
                .map(offer -> offer.getDriver().getId())
                .collect(Collectors.toList());

        // 2. Pronađi sve ONLINE vozače, ali izbaci one koji su već dobili ponudu
        List<Driver> candidates = driverRepository.findByStatus(DriverStatus.ONLINE).stream()
                .filter(driver -> !driversWithOffer.contains(driver.getId()))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            System.out.println("Nema više dostupnih vozača za porudžbinu: " + order.getId());
            // TODO: Logika za slučaj kada nema vozača (npr. status AWAITING_DRIVER)
            return;
        }

        // 3. Pronađi najboljeg kandidata koristeći algoritam za bodovanje
        Optional<Driver> bestDriver = candidates.stream()
                .max(Comparator.comparingDouble(driver -> calculateDriverScore(driver, order)));

        // 4. Ako je najbolji vozač pronađen, kreiraj i pošalji mu ponudu
        bestDriver.ifPresent(driver -> createOffer(order, driver));
    }

    /**
     * Računa skor za vozača na osnovu definiranih kriterija.
     */


    private double calculateDriverScore(Driver driver, Order order) {
        double score = 0.0;

        // AŽURIRANE TEŽINE: Dodali smo W_REJECTIONS i malo preraspodijelili ostale
        final double W_WEATHER_VEHICLE = 25;
        final double W_DISTANCE = 20;
        final double W_BUSYNESS = 20;
        final double W_DAILY_DELIVERIES = 10;
        final double W_RATING = 10;
        final double W_REJECTIONS = 15; // <-- Novi kriterij, prilično je važan

        // --- KRITERIJ #1: Vremenski uslovi i Vozilo ---
        // (Ovaj dio ostaje isti kao u prethodnom odgovoru)
        WeatherCondition weather = systemSettingsService.getCurrentWeather();
        switch (driver.getVehicleType()) {
            case CAR:
                if (weather == WeatherCondition.SNOWY || weather == WeatherCondition.STORMY) score += 1.0 * W_WEATHER_VEHICLE;
                else if (weather == WeatherCondition.RAINY) score += 0.9 * W_WEATHER_VEHICLE;
                else if (weather == WeatherCondition.NORMAL) score += 0.7 * W_WEATHER_VEHICLE;
                else if (weather == WeatherCondition.VERY_SUNNY) score += 0.8 * W_WEATHER_VEHICLE;
                break;
            case MOTORCYCLE:
                if (weather == WeatherCondition.SNOWY || weather == WeatherCondition.STORMY) score += 0.1 * W_WEATHER_VEHICLE;
                else if (weather == WeatherCondition.RAINY) score += 0.5 * W_WEATHER_VEHICLE;
                else if (weather == WeatherCondition.NORMAL) score += 0.9 * W_WEATHER_VEHICLE;
                else if (weather == WeatherCondition.VERY_SUNNY) score += 1.0 * W_WEATHER_VEHICLE;
                break;
            case BICYCLE:
                if (weather == WeatherCondition.SNOWY || weather == WeatherCondition.STORMY) score += 0.0 * W_WEATHER_VEHICLE;
                else if (weather == WeatherCondition.RAINY) score += 0.3 * W_WEATHER_VEHICLE;
                else if (weather == WeatherCondition.NORMAL) score += 0.8 * W_WEATHER_VEHICLE;
                else if (weather == WeatherCondition.VERY_SUNNY) score += 0.7 * W_WEATHER_VEHICLE;
                break;
        }

        // --- KRITERIJ #2: Lokacija (što bliži) ---
        double distance = calculateDistance(driver.getLatitude(), driver.getLongitude(), 44.8125, 20.4612); // TODO: Prave koordinate restorana
        score += (1.0 - Math.min(distance / 20.0, 1.0)) * W_DISTANCE;

        // --- KRITERIJ #3: Zauzetost (što manje aktivnih porudžbina) ---
        List<OrderStatus> activeStatuses = List.of(OrderStatus.CONFIRMED, OrderStatus.READY_FOR_PICKUP, OrderStatus.PICKED_UP);
        int activeDeliveries = orderRepository.countActiveDeliveriesForDriver(driver, activeStatuses);
        score += (1.0 / (1.0 + activeDeliveries)) * W_BUSYNESS;

        // --- KRITERIJ #4: Broj dostava danas (što manje) ---
        int todaysDeliveries = orderRepository.countTodaysDeliveriesForDriver(driver);
        score += (1.0 / (1.0 + todaysDeliveries)) * W_DAILY_DELIVERIES;

        // --- KRITERIJ #5: Ocjena (što veća) ---
        double rating = (driver.getAverageRating() == null || driver.getAverageRating() == 0) ? 3.0 : driver.getAverageRating();
        score += (rating / 5.0) * W_RATING;

        // --- KRITERIJ #6: Broj odbijanja (što manje, to bolje) - NOVO ---
        int rejections = (driver.getRejectionCount() == null) ? 0 : driver.getRejectionCount();
        // Koristimo istu logiku kao za zauzetost - što je veći broj, manji je multiplikator.
        // Ako ima 0 odbijanja, dobiva 100% poena. Ako ima 1, dobiva 50%, itd.
        score += (1.0 / (1.0 + rejections)) * W_REJECTIONS;
        // ===================================================================

        return score;
    }
    /**
     * Kreira i sprema novu ponudu za vozača.
     */
    private void createOffer(Order order, Driver driver) {
        OrderOffer newOffer = OrderOffer.builder()
                .order(order)
                .driver(driver)
                .status(OfferStatus.SENT)
                .createdAt(LocalDateTime.now())
                .build();
        orderOfferRepository.save(newOffer);
        System.out.println("Porudžbina " + order.getId() + " ponuđena vozaču " + driver.getFirstName());
        // TODO: Poslati notifikaciju vozaču
    }

    // Pomoćna metoda za računanje distance (Haversine formula)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        double theta = lon1 - lon2;
        double dist = Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2)) + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(theta));
        dist = Math.acos(dist);
        dist = Math.toDegrees(dist);
        dist = dist * 60 * 1.1515 * 1.609344;
        return dist;
    }

    /*@Transactional
    public void rejectOrderOffer(Long offerId, String driverEmail, String reason) {
        OrderOffer offer = orderOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found with ID: " + offerId));

        // Sigurnosna provjera
        if (!offer.getDriver().getEmail().equals(driverEmail)) {
            throw new SecurityException("Forbidden: You cannot reject an offer that is not assigned to you.");
        }

        // Provjera statusa
        if (offer.getStatus() != OfferStatus.SENT) {
            throw new IllegalStateException("This offer is no longer active or has already been actioned.");
        }

        // 1. Ažuriraj ponudu
        offer.setStatus(OfferStatus.REJECTED);
        offer.setReasonForRejection(reason);
        orderOfferRepository.save(offer);

        // 2. Ažuriraj brojač odbijanja kod vozača
        Driver driver = offer.getDriver();
        int currentRejections = (driver.getRejectionCount() == null) ? 0 : driver.getRejectionCount();
        driver.setRejectionCount(currentRejections + 1);
        driverRepository.save(driver);

        // 3. Pokreni ponovo algoritam da se porudžbina dodijeli sljedećem vozaču
        Order order = offer.getOrder();
        System.out.println("Driver " + driver.getFirstName() + " REJECTED offer for order " + order.getId() + ". Re-assigning...");
        findAndAssignBestDriver(order); // Pozivamo re-dodjelu
    }

    @Transactional
    public void acceptOrderOffer(Long offerId, String driverEmail) {
        OrderOffer offer = orderOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found with ID: " + offerId));

        // Sigurnosna provjera: Da li ulogirani vozač zaista posjeduje ovu ponudu?
        if (!offer.getDriver().getEmail().equals(driverEmail)) {
            throw new SecurityException("Forbidden: You cannot accept an offer that is not assigned to you.");
        }

        // Provjera statusa: Može se prihvatiti samo ponuda koja je SENT
        if (offer.getStatus() != OfferStatus.SENT) {
            throw new IllegalStateException("This offer is no longer active or has already been actioned.");
        }

        // 1. Ažuriraj status ponude
        offer.setStatus(OfferStatus.ACCEPTED);
        orderOfferRepository.save(offer);

        // 2. Dodijeli vozača porudžbini i promijeni status
        Order order = offer.getOrder();
        order.setDriver(offer.getDriver());
        order.setStatus(OrderStatus.CONFIRMED); // Postavljamo status da vozač čeka na restoran
        orderRepository.save(order);

        System.out.println("Driver " + offer.getDriver().getFirstName() + " ACCEPTED offer for order " + order.getId());
    }*/
}