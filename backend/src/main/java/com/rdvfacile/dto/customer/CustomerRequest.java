package com.rdvfacile.dto.customer;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequest {

    @NotBlank(message = "Le nom complet est obligatoire")
    private String fullName;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    private String phone;

    private String email;

    private String notes;
}
