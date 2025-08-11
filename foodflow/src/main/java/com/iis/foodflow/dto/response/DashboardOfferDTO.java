package com.iis.foodflow.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardOfferDTO {
    private Long id;
    private DashboardOrderDTO order;
}