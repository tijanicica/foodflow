package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.CombinedRatingRequest;
import com.iis.foodflow.dto.request.RateDeliveryByCustomerRequest;
import com.iis.foodflow.dto.request.RateOrderFoodRequest;
import com.iis.foodflow.model.user.Customer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CombinedRatingService {

    private final OrderService orderService;
    private final RatingService ratingService;

    @Transactional
    public void processCombinedRating(Long orderId, CombinedRatingRequest combinedRequest, Customer customer) {

        // --- DEO ZA OCENJIVANJE HRANE ---
        // Proveravamo da li su stigle ocene za hranu
        if (combinedRequest.getQuality() != null || combinedRequest.getTaste() != null || combinedRequest.getPortionSize() != null) {
            // Kreiramo DTO koji OrderService očekuje
            RateOrderFoodRequest foodRequest = new RateOrderFoodRequest();
            foodRequest.setQuality(combinedRequest.getQuality());
            foodRequest.setTaste(combinedRequest.getTaste());
            foodRequest.setPortionSize(combinedRequest.getPortionSize());

            // Pozivamo postojeću metodu za ocenjivanje hrane
            orderService.rateOrderFood(orderId, foodRequest, customer);
        }

        // --- DEO ZA OCENJIVANJE VOZAČA ---
        // Proveravamo da li su stigle ocene za vozača
        if (combinedRequest.getOnTimeArrivalRating() != null || combinedRequest.getHygieneRating() != null || combinedRequest.getKindnessRating() != null) {
            // Kreiramo DTO koji RatingService očekuje
            RateDeliveryByCustomerRequest driverRequest = new RateDeliveryByCustomerRequest();
            driverRequest.setOnTimeArrivalRating(combinedRequest.getOnTimeArrivalRating());
            driverRequest.setHygieneRating(combinedRequest.getHygieneRating());
            driverRequest.setKindnessRating(combinedRequest.getKindnessRating());

            // Pozivamo postojeću metodu za ocenjivanje vozača
            ratingService.rateByCustomer(orderId, customer, driverRequest);
        }
    }
}