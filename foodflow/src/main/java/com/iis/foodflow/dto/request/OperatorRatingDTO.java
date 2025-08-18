package com.iis.foodflow.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperatorRatingDTO {

    private Long operatorId;
    private String firstName;
    private String lastName;
    private Double averageRating;
    private Long resolvedTicketsCount;

}
