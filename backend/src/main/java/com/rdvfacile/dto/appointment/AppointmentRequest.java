package com.rdvfacile.dto.appointment;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentRequest {

    @NotNull(message = "Le client est obligatoire")
    private UUID customerId;

    @NotNull(message = "Le service est obligatoire")
    private UUID serviceId;

    @NotNull(message = "La date/heure de début est obligatoire")
    @Future(message = "Le rendez-vous doit être dans le futur")
    private LocalDateTime startTime;

    private String notes;
}
