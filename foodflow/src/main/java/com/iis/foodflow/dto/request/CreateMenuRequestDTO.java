// Kreirajte novi fajl: src/main/java/com/iis/foodflow/dto/request/CreateMenuRequestDTO.java
package com.iis.foodflow.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateMenuRequestDTO {
    private String menuName;
    private LocalDate activationDate; // Opciono
    private Long restaurantId; // <-- NOVO POLJE
}