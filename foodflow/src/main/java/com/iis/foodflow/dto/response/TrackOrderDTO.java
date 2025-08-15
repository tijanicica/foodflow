package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List; // <-- DODAJ OVAJ IMPORT

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackOrderDTO {
    private Long orderId;
    private Point restaurantLocation;
    private Point driverLocation;
    private Point customerLocation;

    // === POČETAK IZMENA ===
    private String restaurantName; // <-- NOVO POLJE
    private List<OrderItemSummaryDTO> orderItems; // <-- NOVO POLJE
    // === KRAJ IZMENA ===

    private String driverName;
    private String customerName;
    private String customerAddress;
    private LocalDateTime eta;

    @Data
    @AllArgsConstructor
    public static class Point {
        private double lat;
        private double lng;
    }

    // === DODAJEMO NOVU UNUTRAŠNJU KLASU ZA STAVKE ===
    @Data
    @AllArgsConstructor
    public static class OrderItemSummaryDTO {
        private String name;
        private int quantity;
    }
}