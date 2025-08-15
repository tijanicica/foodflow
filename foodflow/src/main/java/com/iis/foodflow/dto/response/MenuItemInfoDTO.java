package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.MenuItemType;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Set;

@Data
@AllArgsConstructor
public class MenuItemInfoDTO {
    private String name;
    private MenuItemType type; // NOVO POLJE
    private BigDecimal price;
    private Set<String> dietTypes;
    private Set<String> allergens;
}