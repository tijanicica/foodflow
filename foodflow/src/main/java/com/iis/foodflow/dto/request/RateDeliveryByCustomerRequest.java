package com.iis.foodflow.dto.request;
import lombok.Data;
@Data
public class RateDeliveryByCustomerRequest {
    private int onTimeArrivalRating;
    private int hygieneRating;
    private int kindnessRating;
    private String comment;
}