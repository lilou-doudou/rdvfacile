package com.rdvfacile.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileResponse {
    private String fullName;
    private String email;
    private String businessName;
    private String businessPhone;
    private String businessAddress;
}
