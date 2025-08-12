// FAJL: src/main/java/com/iis/foodflow/dto/request/CancelDeliveryRequest.java

package com.iis.foodflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancelDeliveryRequest {

    @NotBlank(message = "Cancellation reason cannot be empty.")
    private String reason;
}