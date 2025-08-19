package com.iis.foodflow.dto.request;

import lombok.Data;

@Data
public class CombinedRatingRequest {
    // Polja za ocenu vozača
    private Integer onTimeArrivalRating;
    private Integer hygieneRating;
    private Integer kindnessRating;

    // Polja za ocenu hrane
    private Integer quality;
    private Integer taste;
    private Integer portionSize;
}