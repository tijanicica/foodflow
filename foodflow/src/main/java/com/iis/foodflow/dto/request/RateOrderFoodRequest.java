package com.iis.foodflow.dto.request;

import lombok.Data;

@Data // Uključuje @Getter, @Setter, @ToString, itd.
public class RateOrderFoodRequest {
    private Integer quality;
    private Integer taste;
    private Integer portionSize;
}