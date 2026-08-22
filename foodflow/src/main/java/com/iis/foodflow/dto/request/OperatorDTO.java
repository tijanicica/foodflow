package com.iis.foodflow.dto.request;
import lombok.Data;

@Data
public class OperatorDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
}
