package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailDTO {
    private Long id;
    private String restaurantName;
    private List<OrderItemDetailDTO> items;
    private BigDecimal subtotal;
    private BigDecimal deliveryPrice;
    private BigDecimal total;
    private OrderStatus status;
    private String deliveryAddress;
    private PaymentType paymentMethod;
    private LocalDateTime creationDate;
    private String couponCode;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDetailDTO {
        private String name;
        private String imageUrl;
        private int quantity;
        private BigDecimal price; // Cena po komadu
    }
}