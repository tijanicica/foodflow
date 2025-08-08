package com.iis.foodflow.dto.request;

import lombok.Data;


@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String password;
    private String confirmPassword; // Za validaciju
    private AddressRequest address;
}