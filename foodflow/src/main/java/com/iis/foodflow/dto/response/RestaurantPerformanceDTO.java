// src/main/java/com/iis/foodflow/dto/response/RestaurantPerformanceDTO.java
package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantPerformanceDTO {
    private String name;
    private BigDecimal value;
}