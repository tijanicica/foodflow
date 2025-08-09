package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuItemDTO {
    private Long id; // ID od MenuItemVersion
    private String name;
    private String description;
    private String imageUrl;
    private BigDecimal price;
    private List<String> allergens;
    private List<String> dietTypes;
}
