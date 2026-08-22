// FAJL: src/main/java/com/iis/foodflow/dto/response/DashboardOrderDTO.java

package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime; // <-- Dodajte import

@Data
@Builder
public class DashboardOrderDTO {
    private Long id;
    private OrderStatus status;
    private LocalDateTime eta; // <-- Dodajemo i ETA

    private String restaurantName;
    private String restaurantAddress;

    // === DODAJEMO POLJA ZA KUPCA ===
    private String customerFirstName;
    private String customerLastName;
    private String deliveryAddress;

    private Double distanceDriverToRestaurant;
    private Double distanceDriverToCustomer;

    private CoordinatesDTO restaurantCoordinates;
    private CoordinatesDTO deliveryCoordinates;
    private LocalDateTime startDeliveryTime;
}