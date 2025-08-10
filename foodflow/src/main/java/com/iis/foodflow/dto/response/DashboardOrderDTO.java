package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardOrderDTO {
    private Long id;
    private OrderStatus status;
    private String restaurantName;
    private String deliveryAddress;
}
