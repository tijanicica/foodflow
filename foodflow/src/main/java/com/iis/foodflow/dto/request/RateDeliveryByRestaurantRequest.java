package com.iis.foodflow.dto.request;
import lombok.Data;
@Data
public class RateDeliveryByRestaurantRequest {
    private int professionalismRating;
    private int hygieneRating;
    private int communicationRating;
    private String comment;
}