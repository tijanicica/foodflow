package com.iis.foodflow.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryTicketsDTO {
    private String categoryName;
    private Long ticketCount;
}
