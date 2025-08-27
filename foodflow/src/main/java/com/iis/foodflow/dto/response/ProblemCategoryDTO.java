package com.iis.foodflow.dto.response;

import lombok.Data;

@Data
public class ProblemCategoryDTO {
    private Long id;
    private String name;
    private Long parentCategoryId;
}
