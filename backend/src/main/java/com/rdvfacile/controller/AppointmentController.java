package com.rdvfacile.controller;

import com.rdvfacile.dto.appointment.AppointmentRequest;
import com.rdvfacile.dto.appointment.AppointmentResponse;
import com.rdvfacile.model.User;
import com.rdvfacile.model.enums.AppointmentStatus;
import com.rdvfacile.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(appointmentService.getAll(user.getBusiness().getId()));
    }

    @GetMapping("/range")
    public ResponseEntity<List<AppointmentResponse>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(appointmentService.getByDateRange(user.getBusiness().getId(), start, end));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getById(@PathVariable UUID id,
                                                       @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(appointmentService.getById(id, user.getBusiness().getId()));
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> create(@Valid @RequestBody AppointmentRequest request,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.create(request, user.getBusiness().getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponse> update(@PathVariable UUID id,
                                                      @Valid @RequestBody AppointmentRequest request,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(appointmentService.update(id, request, user.getBusiness().getId()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        AppointmentStatus status = AppointmentStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(appointmentService.updateStatus(id, status, user.getBusiness().getId()));
    }

    @GetMapping("/slots")
    public ResponseEntity<List<LocalDateTime>> getAvailableSlots(
            @RequestParam UUID serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                appointmentService.getAvailableSlots(user.getBusiness().getId(), serviceId, date));
    }
}
