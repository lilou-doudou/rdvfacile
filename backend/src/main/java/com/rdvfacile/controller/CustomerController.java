package com.rdvfacile.controller;

import com.rdvfacile.dto.customer.CustomerRequest;
import com.rdvfacile.dto.customer.CustomerResponse;
import com.rdvfacile.model.User;
import com.rdvfacile.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(customerService.getAll(user.getBusiness().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getById(@PathVariable UUID id,
                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(customerService.getById(id, user.getBusiness().getId()));
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request,
                                                   @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerService.create(request, user.getBusiness().getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> update(@PathVariable UUID id,
                                                   @Valid @RequestBody CustomerRequest request,
                                                   @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(customerService.update(id, request, user.getBusiness().getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        customerService.delete(id, user.getBusiness().getId());
        return ResponseEntity.noContent().build();
    }
}
