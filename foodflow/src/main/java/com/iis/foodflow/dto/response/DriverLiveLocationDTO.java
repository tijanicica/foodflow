package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.DriverStatus;
import com.iis.foodflow.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Vremenska oznaka je uklonjena iz DTO-a
// import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverLiveLocationDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private Double latitude;
    private Double longitude;
    private DriverStatus status;
    private VehicleType vehicleType;
    private Long activeOrderId;
}