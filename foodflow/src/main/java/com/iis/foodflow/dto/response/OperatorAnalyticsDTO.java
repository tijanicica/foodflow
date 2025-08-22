package com.iis.foodflow.dto.response;

import com.iis.foodflow.dto.request.CategoryTicketsDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatorAnalyticsDTO {
    private Long totalTicketsToday;
    private Long totalTicketsAllTime;
    private Double averageRating;
    private String averageResolutionTime;
    private List<CategoryTicketsDTO> ticketsPerCategory;
}
