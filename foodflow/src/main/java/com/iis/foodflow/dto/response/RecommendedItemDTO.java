package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedItemDTO {
    private Long menuItemVersionId;
    private String name;
    private String imageUrl;
    private BigDecimal price;
    private Long restaurantId; // Додајемо ID ресторана за лакшу навигацију
}