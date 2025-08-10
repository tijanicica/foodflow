package com.iis.foodflow.dto.response;

import com.iis.foodflow.model.delivery.OrderOffer;
import com.iis.foodflow.model.order.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverDashboardResponse {
    // Lista novih ponuda koje vozač treba prihvatiti ili odbiti
    private List<OrderOffer> newOffers;

    // Lista porudžbina koje je vozač već prihvatio i koje su u toku
    private List<Order> assignedDeliveries;
}