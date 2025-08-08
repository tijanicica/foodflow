package com.iis.foodflow.dto.request;


import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class AddressRequest {
    private String nickname; // Address Nickname
    private String country;
    private String city;
    private String street;
    private String streetNumber;
    private String postalCode;
}