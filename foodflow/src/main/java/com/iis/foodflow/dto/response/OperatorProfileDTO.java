package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.OperatorStatus;
import lombok.Data;

@Data
public class OperatorProfileDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private OperatorStatus status;
}
