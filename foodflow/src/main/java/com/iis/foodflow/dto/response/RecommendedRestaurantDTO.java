package com.iis.foodflow.dto.response;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecommendedRestaurantDTO {
    private Long id;
    private String name;
    private String address;
}