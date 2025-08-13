package com.iis.foodflow.dto.request;


import lombok.Data;

@Data
public class UpdateProfileRequestDTO {
    // Polja za ime i prezime, koja su opciona
    private String firstName;
    private String lastName;
    
}