// Kreirajte novi fajl: src/main/java/com/iis/foodflow/dto/response/RestaurantMenusDTO.java
package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantMenusDTO {
    private Long restaurantId;
    private String restaurantName;
    private String restaurantImageUrl;
    private List<ManagerMenuDTO> menus;
}