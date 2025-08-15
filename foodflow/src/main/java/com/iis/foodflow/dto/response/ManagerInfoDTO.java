package com.iis.foodflow.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ManagerInfoDTO {
    private Long id;
    private String fullName;
    private String email;
}