package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerOrderDTO {
    private Long id;
    private String orderNumber; // Npr. #1204
    private String customerName;
    private List<String> items; // Lista stavki kao stringovi, npr. "1x Pasta Carbonara"
    private OrderStatus status;
    private String driverName; // Opciono, za "Ready for Pickup"
}