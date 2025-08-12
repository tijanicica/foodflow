package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder // Koristimo Builder za lakše kreiranje objekata u servisu
public class DashboardOrderDTO {
    private Long id;
    private OrderStatus status;

    // === NOVA POLJA KOJA DODAJEMO ===
    private String restaurantName;
    private String restaurantAddress;
    private String deliveryAddress;
    private Double distanceDriverToRestaurant; // Udaljenost od vozača do restorana
    private Double distanceDriverToCustomer;   // Udaljenost od vozača do kupca

    private CoordinatesDTO restaurantCoordinates;
    private CoordinatesDTO deliveryCoordinates;
}