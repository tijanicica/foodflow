package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuDTO {
    private String restaurantName;
    private double restaurantRating;
    private String restaurantImageUrl;
    private List<MenuItemDTO> items;
}