package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class OrderSummaryDTO {
    private Long id;
    private String restaurantName;
    private String restaurantImageUrl; // <-- DODAJEMO NOVO POLJE

    private LocalDateTime creationDate;
    private LocalDateTime scheduledFor; // Dodajemo i ovo za scheduled tab
    private BigDecimal totalPrice;
    private OrderStatus status;
    private boolean isRated;
}