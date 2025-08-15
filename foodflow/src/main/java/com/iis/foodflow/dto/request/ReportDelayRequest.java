// FAJL: ReportDelayRequest.java
package com.iis.foodflow.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ReportDelayRequest {

    @NotNull(message = "Delay in minutes is required.")
    @Min(value = 1, message = "Delay must be at least 1 minute.")
    // Možeš dodati i gornju granicu ako želiš, npr. 60 minuta
    private Integer delayMinutes;
}