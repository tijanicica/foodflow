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
public class TrackOrderManagerDTO {
    private Long orderId;
    private String orderNumber;
    private String driverName;
    private String customerName;
    private String customerAddress;
    private LocalDateTime eta;
    private Point restaurantLocation;
    private Point driverLocation;
    private Point customerLocation;

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class Point {
        private Double latitude;
        private Double longitude;
    }
}