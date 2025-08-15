package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.PriceRange;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class RestaurantInfoDTO {
    private String name;
    private PriceRange priceRange;
    private Double averageRating;
    private String address;
    private Double latitude;  // NOVO
    private Double longitude; // NOVO
    private List<MenuItemInfoDTO> menuItems; // NOVO: Lista stavki
}