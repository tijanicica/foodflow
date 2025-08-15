// Datoteka: src/main/java/com/iis/foodflow/dto/response/DriverLocationResponse.java
package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverLocationResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private Double latitude;
    private Double longitude;
    private LocalDateTime lastLocationUpdate; // Usklađeno sa modelom
}