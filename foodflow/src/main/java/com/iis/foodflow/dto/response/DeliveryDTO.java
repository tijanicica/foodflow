package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeliveryDTO {
    private Long orderId;
    private String orderNumber;
    private String driverInfo;
    private OrderStatus status;
    private boolean isRatedByManager;
}