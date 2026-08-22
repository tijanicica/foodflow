// Datoteka: src/main/java/com/iis/foodflow/service/RatingService.java
package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.RateDeliveryByCustomerRequest;
import com.iis.foodflow.dto.request.RateDeliveryByRestaurantRequest;
import com.iis.foodflow.model.delivery.DriverRating;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.model.user.Manager;
import com.iis.foodflow.repository.DriverRatingRepository;
import com.iis.foodflow.repository.DriverRepository;
import com.iis.foodflow.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RatingService {

    // Dodajemo Logger za profesionalno logovanje
    private static final Logger log = LoggerFactory.getLogger(RatingService.class);

    private final DriverRatingRepository ratingRepository;
    private final OrderRepository orderRepository;
    private final DriverRepository driverRepository;

    @Transactional
    public void rateByCustomer(Long orderId, Customer customer, RateDeliveryByCustomerRequest dto) {
        log.info("Attempting to rate order {} by customer {}", orderId, customer.getId());
        Order order = findOrder(orderId);
        Driver driver = getDriverFromOrder(order);

        DriverRating rating = ratingRepository.findByOrder_Id(orderId)
                .orElse(new DriverRating(null, order, driver, null, null, null, null, null, null, null, null)); // Kreiramo novi sa osnovnim podacima

        // Provera da li je kupac već ocenio
        if (rating.getRatedByCustomer() != null) {
            log.warn("Customer {} already rated order {}", customer.getId(), orderId);
            throw new IllegalStateException("You have already rated the driver for this order.");
        }

        rating.setRatedByCustomer(customer);
        rating.setOnTimeArrivalRating(dto.getOnTimeArrivalRating());
        rating.setHygieneRatingCustomer(dto.getHygieneRating());
        rating.setKindnessRating(dto.getKindnessRating());

        ratingRepository.save(rating);
        log.info("Successfully saved customer rating for order {}", orderId);

        updateDriverAverageRating(driver);
    }

    @Transactional
    public void rateByRestaurant(Long orderId, Manager manager, RateDeliveryByRestaurantRequest dto) {
        log.info("Attempting to rate order {} by manager {}", orderId, manager.getId());
        Order order = findOrder(orderId);
        Driver driver = getDriverFromOrder(order);

        // === ISPRAVLJENO: Koristimo findByOrder_Id umesto findById ===
        DriverRating rating = ratingRepository.findByOrder_Id(orderId)
                .orElse(new DriverRating(null, order, driver, null, null, null, null, null, null, null, null));

        // Provera da li je menadžer već ocenio
        if (rating.getRatedByManager() != null) {
            log.warn("Manager {} already rated order {}", manager.getId(), orderId);
            throw new IllegalStateException("The driver for this order has already been rated by a manager.");
        }

        rating.setRatedByManager(manager);
        rating.setProfessionalismRating(dto.getProfessionalismRating());
        rating.setHygieneRatingRestaurant(dto.getHygieneRating());
        rating.setCommunicationRating(dto.getCommunicationRating());

        ratingRepository.save(rating);
        log.info("Successfully saved manager rating for order {}", orderId);

        updateDriverAverageRating(driver);
    }

    private void updateDriverAverageRating(Driver driver) {
        try {
            Double newAverage = ratingRepository.calculateOverallAverageRatingForDriver(driver);
            if (newAverage != null) {
                // Formatiramo na jednu decimalu
                double roundedAverage = Math.round(newAverage * 10.0) / 10.0;
                driver.setAverageRating(roundedAverage);
                driverRepository.save(driver);
                log.info("Updated average rating for driver {} to {}", driver.getId(), roundedAverage);
            } else {
                log.info("No ratings found for driver {}. Average rating remains default.", driver.getId());
            }
        } catch (Exception e) {
            // Logujemo grešku ako dođe do problema pri računanju proseka
            log.error("Failed to update average rating for driver " + driver.getId(), e);
        }
    }

    private Order findOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + orderId));
    }

    private Driver getDriverFromOrder(Order order) {
        Driver driver = order.getDriver();
        if (driver == null) {
            throw new IllegalStateException("Order with ID " + order.getId() + " has no assigned driver.");
        }
        return driver;
    }
}