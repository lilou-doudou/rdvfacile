package com.rdvfacile.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileUpdateRequest {

    @NotBlank(message = "Le nom complet est obligatoire")
    private String fullName;

    @NotBlank(message = "Le nom du commerce est obligatoire")
    private String businessName;

    @NotBlank(message = "Le numéro WhatsApp est obligatoire")
    private String businessPhone;

    private String businessAddress;
}
