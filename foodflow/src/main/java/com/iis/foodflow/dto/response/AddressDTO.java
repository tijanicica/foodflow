package com.iis.foodflow.dto.response;

import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddressDTO {
    private String street;
    private String streetNumber;
    private String city;
    private String country;
    private String postalCode;
}
