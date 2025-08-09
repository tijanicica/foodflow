// Datoteka: src/main/java/com/iis.foodflow/service/RatingService.java
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final DriverRatingRepository ratingRepository;
    private final OrderRepository orderRepository;
    private final DriverRepository driverRepository;

    @Transactional
    public void rateByCustomer(Long orderId, Customer customer, RateDeliveryByCustomerRequest dto) {
        Order order = findOrder(orderId);
        Driver driver = order.getDriver();
        if (driver == null) throw new IllegalStateException("Order has no assigned driver.");

        DriverRating rating = ratingRepository.findById(orderId).orElse(new DriverRating());
        rating.setOrder(order);
        rating.setDriver(driver);

        rating.setRatedByCustomer(customer);
        rating.setOnTimeArrivalRating(dto.getOnTimeArrivalRating());
        rating.setHygieneRatingCustomer(dto.getHygieneRating());
        rating.setKindnessRating(dto.getKindnessRating());
        rating.setCustomerComment(dto.getComment());
        rating.setCustomerRatedAt(LocalDateTime.now());
        ratingRepository.save(rating);

        updateDriverAverageRating(driver);
    }

    @Transactional
    public void rateByRestaurant(Long orderId, Manager manager, RateDeliveryByRestaurantRequest dto) {
        Order order = findOrder(orderId);
        Driver driver = order.getDriver();
        if (driver == null) throw new IllegalStateException("Order has no assigned driver.");

        DriverRating rating = ratingRepository.findById(orderId).orElse(new DriverRating());
        rating.setOrder(order);
        rating.setDriver(driver);

        rating.setRatedByManager(manager);
        rating.setProfessionalismRating(dto.getProfessionalismRating());
        rating.setHygieneRatingRestaurant(dto.getHygieneRating());
        rating.setCommunicationRating(dto.getCommunicationRating());
        rating.setRestaurantComment(dto.getComment());
        rating.setRestaurantRatedAt(LocalDateTime.now());
        ratingRepository.save(rating);

        updateDriverAverageRating(driver);
    }

    private void updateDriverAverageRating(Driver driver) {
        Double newAverage = ratingRepository.calculateOverallAverageRatingForDriver(driver);
        if (newAverage != null) {
            // Formatiramo na jednu decimalu
            double roundedAverage = Math.round(newAverage * 10.0) / 10.0;
            driver.setAverageRating(roundedAverage);
            driverRepository.save(driver);
        }
    }

    private Order findOrder(Long orderId) {
        return orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
    }
}