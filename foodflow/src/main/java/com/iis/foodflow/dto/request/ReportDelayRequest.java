// FAJL: src/main/java/com/iis/foodflow/dto/request/ReportDelayRequest.java

package com.iis.foodflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReportDelayRequest {

    @NotNull(message = "Delay minutes must be provided.")
    @Min(value = 0, message = "Delay minutes cannot be negative.")
    private Integer delayMinutes;
}