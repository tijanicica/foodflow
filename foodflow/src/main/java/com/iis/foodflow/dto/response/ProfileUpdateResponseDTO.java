package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder // Dodajemo Builder da bi kod u servisu bio lepši
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateResponseDTO {
    private String firstName;
    private String lastName;
}