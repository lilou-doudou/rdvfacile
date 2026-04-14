package com.rdvfacile.controller;

import com.rdvfacile.dto.service.ServiceRequest;
import com.rdvfacile.dto.service.ServiceResponse;
import com.rdvfacile.model.User;
import com.rdvfacile.service.ServiceEntityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceEntityService serviceEntityService;

    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(serviceEntityService.getAll(user.getBusiness().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getById(@PathVariable UUID id,
                                                   @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(serviceEntityService.getById(id, user.getBusiness().getId()));
    }

    @PostMapping
    public ResponseEntity<ServiceResponse> create(@Valid @RequestBody ServiceRequest request,
                                                  @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceEntityService.create(request, user.getBusiness().getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponse> update(@PathVariable UUID id,
                                                  @Valid @RequestBody ServiceRequest request,
                                                  @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(serviceEntityService.update(id, request, user.getBusiness().getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        serviceEntityService.delete(id, user.getBusiness().getId());
        return ResponseEntity.noContent().build();
    }
}
