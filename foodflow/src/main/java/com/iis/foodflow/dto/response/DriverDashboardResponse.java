// FAJL: src/main/java/com/iis/foodflow/dto/response/DriverDashboardResponse.java

package com.iis.foodflow.dto.response;

// Ne trebamo više importirati entitete
// import com.iis.foodflow.model.delivery.OrderOffer;
// import com.iis.foodflow.model.order.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverDashboardResponse {
    // === ISPRAVKA JE OVDJE ===
    // Polja sada moraju biti tipa DTO-a koje kreiramo u servisu
    private List<DashboardOfferDTO> newOffers;
    private List<DashboardOrderDTO> assignedDeliveries;

    private CoordinatesDTO driverCoordinates;
}