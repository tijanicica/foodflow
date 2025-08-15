package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.PriceRange;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDTO {
    private Long id;
    private String name;
    private String imageUrl;
    private Double averageRating;
    private PriceRange priceRange;
}