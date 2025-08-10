// Datoteka: src/main/java/com/iis/foodflow/dto/response/DriverResponseDTO.java
package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.DriverStatus;
import com.iis.foodflow.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponseDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private VehicleType vehicleType;
    private DriverStatus status;
}