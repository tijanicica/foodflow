// Datoteka: src/main/java/com/iis/foodflow/dto/response/DriverPerformanceResponse.java
package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverPerformanceResponse {

    // Podaci iz Driver modela (za sekciju "Account Details")
    private String firstName;
    private String lastName;
    private VehicleType vehicleType;

    // Izračunati podaci (za sekciju "Your Performance")
    private int totalDeliveries;     // npr. 128
    private double onTimeRate;       // npr. 0.98 (za 98%)
    private int rejections;          // npr. 4
    private double averageRating;    // npr. 4.9
}