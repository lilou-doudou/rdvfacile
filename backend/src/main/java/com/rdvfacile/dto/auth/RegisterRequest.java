package com.rdvfacile.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Le nom du business est obligatoire")
    private String businessName;

    @NotBlank(message = "Le téléphone du business est obligatoire")
    private String businessPhone;

    private String businessAddress;

    @NotBlank(message = "Le nom complet est obligatoire")
    private String fullName;

    @Email(message = "Format d'email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String password;
}
