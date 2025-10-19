package com.iis.foodflow.dto.request;

import com.iis.foodflow.model.support.ProblemCategory;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
public class OperatorRegistrationDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotNull(message = "Specializations are required")
    @NotEmpty(message = "At least one specialization must be selected")
    private Set<ProblemCategory> specializations = new HashSet<>();
}
