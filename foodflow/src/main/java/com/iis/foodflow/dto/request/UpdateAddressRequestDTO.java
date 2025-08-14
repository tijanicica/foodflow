package com.iis.foodflow.dto.request;

import lombok.Data;
@Data
public class UpdateAddressRequestDTO {
    private String street;
    private String streetNumber;
    private String city;
    private String country;
    private String postalCode;
    private String nickname;
}