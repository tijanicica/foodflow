package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerLiveTrackingDTO {
    // Podaci o vozaču
    private Long driverId;
    private String driverFirstName;
    private String driverLastName;
    private Double driverLatitude;
    private Double driverLongitude;
    private VehicleType vehicleType;

    // Podaci o porudžbini
    private Long orderId;
    private Double deliveryAddressLat;
    private Double deliveryAddressLng;

    private Double restaurantLat;
    private Double restaurantLng;
}