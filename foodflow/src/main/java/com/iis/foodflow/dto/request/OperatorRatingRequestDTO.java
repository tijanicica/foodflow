package com.iis.foodflow.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OperatorRatingRequestDTO {
    private String comment;
    private int rating;
}
