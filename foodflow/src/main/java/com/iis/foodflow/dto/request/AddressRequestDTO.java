package com.iis.foodflow.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AddressRequestDTO {
    private String street;
    private String streetNumber;
    private String city;
    private String country;
    private String nickname;
    private String postalCode;
}