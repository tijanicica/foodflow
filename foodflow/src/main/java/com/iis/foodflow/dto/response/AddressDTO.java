package com.iis.foodflow.dto.response;

import com.iis.foodflow.model.order.Address;
import lombok.*;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {
    private Long id;
    private String street;
    private String streetNumber;
    private String city;
    private String country;

    private String nickname;
    private String postalCode;

    // Statička metoda za laku konverziju iz entiteta u DTO
    public static AddressDTO fromEntity(Address address) {
        return new AddressDTO(
                address.getId(),
                address.getStreet(),
                address.getStreetNumber(),
                address.getCity(),
                address.getCountry(),
                address.getNickname(),
                address.getPostalCode()
        );
    }
}
