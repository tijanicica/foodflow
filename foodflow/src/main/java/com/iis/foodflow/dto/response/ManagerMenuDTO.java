// Kreirajte novi fajl: src/main/java/com/iis/foodflow/dto/response/ManagerMenuDTO.java
package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerMenuDTO {
    private Long id;
    private String name;
    private LocalDateTime creationDate;
    private boolean active;
}