package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackOrderDTO {
    private Long orderId;
    private Point restaurantLocation;
    private Point driverLocation;
    private Point customerLocation;
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
}