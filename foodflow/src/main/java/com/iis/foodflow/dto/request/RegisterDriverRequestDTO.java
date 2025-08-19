package com.iis.foodflow.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDriverRequestDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String password;
    private Double latitude;
    private Double longitude;
}