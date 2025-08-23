package com.iis.foodflow.dto.request;

// u paketu com.iis.foodflow.dto
import lombok.Data;

@Data
public class CreateTicketRequestDTO {
    private Long orderId;
    private Long preselectedCategoryId; // ID kategorije ako je korisnik izabrao iz liste
    private String description; // Tekstualni opis (za "Other" ili dodatni info)
}