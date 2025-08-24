// Kreiraj src/main/java/com/iis/foodflow/dto/request/UpdateMenuItemRequestDTO.java
package com.iis.foodflow.dto.request;

import com.iis.foodflow.enums.MenuItemType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Set;

@Data
public class UpdateMenuItemRequestDTO {
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private MenuItemType type;
    private Set<Long> dietTypeIds;
    private Set<Long> allergenIds;
    private boolean availableAllDay;
    private LocalTime timeFrom;
    private LocalTime timeTo;

   
}