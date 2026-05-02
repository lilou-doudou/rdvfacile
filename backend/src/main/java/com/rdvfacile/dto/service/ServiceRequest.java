package com.rdvfacile.dto.service;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceRequest {

    @NotBlank(message = "Le nom du service est obligatoire")
    private String name;

    private String description;

    @NotNull(message = "La durée est obligatoire")
    @Min(value = 15, message = "La durée minimale est de 15 minutes")
    private Integer durationMinutes;

    @DecimalMin(value = "0", message = "Le prix ne peut pas être négatif")
    @DecimalMax(value = "9999999999.99", message = "Le prix est trop élevé")
    private BigDecimal price;
}
