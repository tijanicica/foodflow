// FAJL: src/main/java/com/iis/foodflow/dto/response/DriverStatusResponse.java

package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.DriverStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverStatusResponse {
    private DriverStatus status;
}