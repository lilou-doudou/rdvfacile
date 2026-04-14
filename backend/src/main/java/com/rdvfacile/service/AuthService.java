package com.rdvfacile.service;

import com.rdvfacile.dto.auth.AuthResponse;
import com.rdvfacile.dto.auth.LoginRequest;
import com.rdvfacile.dto.auth.RegisterRequest;
import com.rdvfacile.exception.BusinessException;
import com.rdvfacile.model.Business;
import com.rdvfacile.model.User;
import com.rdvfacile.model.enums.UserRole;
import com.rdvfacile.repository.BusinessRepository;
import com.rdvfacile.repository.UserRepository;
import com.rdvfacile.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Cet email est déjà utilisé");
        }
        if (businessRepository.existsByPhone(request.getBusinessPhone())) {
            throw new BusinessException("Ce numéro de téléphone est déjà enregistré");
        }

        Business business = new Business();
        business.setName(request.getBusinessName());
        business.setPhone(request.getBusinessPhone());
        business.setAddress(request.getBusinessAddress());
        business = businessRepository.save(business);

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(UserRole.OWNER);
        user.setBusiness(business);
        user = userRepository.save(user);

        String token = jwtUtils.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getFullName(),
                business.getId(), business.getName(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Identifiants invalides"));

        String token = jwtUtils.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getFullName(),
                user.getBusiness().getId(), user.getBusiness().getName(), user.getRole().name());
    }
}
