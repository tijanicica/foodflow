package com.iis.foodflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddCardRequestDTO {
    @NotBlank(message = "Card number is required.")
    @Pattern(regexp = "^[0-9]{16}$", message = "Card number must be 16 digits.")
    private String cardNumber;

    @NotBlank(message = "Expiry date is required.")
    @Pattern(regexp = "^(0[1-9]|1[0-2])\\/([0-9]{2})$", message = "Expiry date must be in MM/YY format.")
    private String expiryDate;

    @NotBlank(message = "CVC is required.")
    @Size(min = 3, max = 4, message = "CVC must be 3 or 4 digits.")
    private String cvc;
}
