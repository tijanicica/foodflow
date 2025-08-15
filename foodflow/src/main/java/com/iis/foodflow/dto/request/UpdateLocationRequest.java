// Datoteka: src/main/java/com/iis/foodflow/dto/request/UpdateLocationRequest.java
package com.iis.foodflow.dto.request;

import lombok.Data;

@Data
public class UpdateLocationRequest {
    private Double latitude;
    private Double longitude;
}