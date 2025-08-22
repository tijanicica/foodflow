package com.iis.foodflow.dto.response;

import lombok.Data;

@Data
public class OperatorProfileDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
}
