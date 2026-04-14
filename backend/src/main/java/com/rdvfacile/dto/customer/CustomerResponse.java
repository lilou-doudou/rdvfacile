package com.rdvfacile.dto.customer;

import lombok.Data;

import java.util.UUID;

@Data
public class CustomerResponse {
    private UUID id;
    private String fullName;
    private String phone;
    private String email;
    private String notes;
}
