// src/main/java/com/iis/foodflow/dto/request/CreateMenuItemRequestDTO.java
package com.iis.foodflow.dto.request;

import com.iis.foodflow.enums.MenuItemType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Set;
import java.util.HashSet;


@Data
public class CreateMenuItemRequestDTO {
    private String name;
    private String description;
    private BigDecimal price;
    // Kalorije ćemo preskočiti za sada, nije u bazi
    // private Integer calories; 
    private MenuItemType type;
    private Set<Long> dietTypeIds = new HashSet<>();
    private Set<Long> allergenIds = new HashSet<>();
    private boolean availableAllDay;
    private LocalTime timeFrom;
    private LocalTime timeTo;
}