package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.MenuItemType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private MenuItemType type;
    private boolean available;
    private boolean popular;
    private LocalTime timeFrom;
    private LocalTime timeTo;

}
