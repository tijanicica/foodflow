package com.iis.foodflow.dto.response;
import com.iis.foodflow.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CancelDeliveryResponse {
    private Long orderId;
    private OrderStatus status;
    private String cancellationReason;
}
