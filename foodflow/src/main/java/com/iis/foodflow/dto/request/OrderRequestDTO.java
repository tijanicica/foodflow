package com.iis.foodflow.dto.request;

import com.iis.foodflow.enums.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;


@Data
@NoArgsConstructor
public class OrderRequestDTO {
    private Long restaurantId;
    private Long addressId;
    private List<OrderItemDTO> items;
    private String noteForRestaurant;
    private String noteForDriver;
    private PaymentType paymentType;
    private BigDecimal cardAmount; // Koristi se samo za COMBINED
    private String couponCode;     // Šaljemo kod, ne ID
    private OrderType orderType;
    private ScheduleDTO scheduleInfo;
    private RepeatDTO repeatInfo;

    @Data
    @NoArgsConstructor
    public static class OrderItemDTO {
        private Long menuItemVersionId;
        private int quantity;
    }

    @Data
    @NoArgsConstructor
    public static class ScheduleDTO {
        private LocalDate scheduledDate;
        private LocalTime scheduledTime;
    }

    @Data
    @NoArgsConstructor
    public static class RepeatDTO {
        private RepeatType repeatType; // WEEKLY ili MONTHLY
        private DayOfWeek dayOfWeek;   // Za WEEKLY
        private DayOfMonth dayOfMonth; // Za MONTHLY
        private LocalTime deliveryTime;
        private LocalDate repeatUntil; // Null ako je 'never'
    }
}