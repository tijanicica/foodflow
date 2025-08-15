package com.iis.foodflow.dto.response;

import com.iis.foodflow.model.order.Address;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import com.iis.foodflow.model.order.Address;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private String fullName;
    private String email;
    private String phone;
    private List<AddressDTO> savedAddresses; // Ovo ćemo koristiti i za prikaz i za edit
    private List<CardDTO> paymentMethods;

    // Polje allAddresses nam više ne treba, jer će savedAddresses sadržati sve
    // private List<Address> allAddresses;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor // Dodaj prazan konstruktor
    public static class AddressDTO {
        private Long id;
        private String street;
        private String streetNumber;
        private String city;
        private String postalCode;
        private String country;
        private String nickname;
        private String fullAddress; // Možemo ga zadržati za lakši prikaz
    }

    @Data
    @AllArgsConstructor
    public static class CardDTO {
        private Long id;
        private String maskedNumber;
        private boolean active;
    }
}