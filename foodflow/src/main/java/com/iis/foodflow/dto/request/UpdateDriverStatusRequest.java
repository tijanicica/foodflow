// Datoteka: src/main/java/com/iis/foodflow/dto/request/UpdateDriverStatusRequest.java
package com.iis.foodflow.dto.request;

import com.iis.foodflow.enums.DriverStatus;
import lombok.Data;

@Data
public class UpdateDriverStatusRequest {
    // Frontend će poslati JSON koji sadrži samo ovo jedno polje
    private DriverStatus newStatus;
}