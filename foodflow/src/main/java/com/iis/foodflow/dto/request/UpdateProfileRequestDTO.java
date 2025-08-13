package com.iis.foodflow.dto.request;


import lombok.Data;

@Data
public class UpdateProfileRequestDTO {
    // Polja za ime i prezime, koja su opciona
    private String firstName;
    private String lastName;

    // Polja za promenu lozinke
    private String oldPassword;    // Stara lozinka, za verifikaciju
    private String newPassword;    // Nova lozinka koju korisnik želi da postavi
}