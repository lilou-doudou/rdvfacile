package com.rdvfacile.dto.appointment;

import com.rdvfacile.model.enums.AppointmentStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentResponse {
    private UUID id;
    private UUID customerId;
    private String customerName;
    private String customerPhone;
    private UUID serviceId;
    private String serviceName;
    private Integer serviceDurationMinutes;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AppointmentStatus status;
    private String notes;
    private Boolean reminderSent;
    private LocalDateTime createdAt;
}
