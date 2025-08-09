// Datoteka: src/main/java/com/iis/foodflow/dto/request/UpdateVehicleRequest.java
package com.iis.foodflow.dto.request;

import com.iis.foodflow.enums.VehicleType;
import lombok.Data;

@Data
public class UpdateVehicleRequest {
    private VehicleType newVehicleType;
}