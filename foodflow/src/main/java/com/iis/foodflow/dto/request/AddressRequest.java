package com.iis.foodflow.dto.request;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class AddressRequest {
    private String nickname; // Address Nickname
    @NotBlank(message = "Country is required.")
    private String country;

    @NotBlank(message = "City is required.")
    private String city;

    @NotBlank(message = "Street is required.")
    private String street;

    @NotBlank(message = "Street number is required.")
    private String streetNumber;

    @NotBlank(message = "Postal code is required.")
    private String postalCode;

    private Double latitude;
    private Double longitude;
}