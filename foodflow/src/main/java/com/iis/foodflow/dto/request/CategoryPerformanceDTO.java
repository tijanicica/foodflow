// com/iis/foodflow/dto/request/CategoryPerformanceDTO.java
package com.iis.foodflow.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryPerformanceDTO {
    private String categoryName;
    private String averageResolutionTime;
}