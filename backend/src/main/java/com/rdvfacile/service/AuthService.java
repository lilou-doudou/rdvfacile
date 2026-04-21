package com.rdvfacile.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

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

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmailWithBusiness(request.getEmail())
                .orElseThrow(() -> new BusinessException("Identifiants invalides"));

        String token = jwtUtils.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getFullName(),
                user.getBusiness().getId(), user.getBusiness().getName(), user.getRole().name());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Réinitialisation de votre mot de passe RdvFacile");
            message.setText("Bonjour " + user.getFullName() + ",\n\n"
                    + "Vous avez demandé la réinitialisation de votre mot de passe.\n\n"
                    + "Cliquez sur le lien ci-dessous (valable 1 heure) :\n"
                    + resetLink + "\n\n"
                    + "Si vous n'avez pas fait cette demande, ignorez cet email.\n\n"
                    + "L'équipe RdvFacile");
            mailSender.send(message);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BusinessException("Lien de réinitialisation invalide ou expiré"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Lien de réinitialisation expiré");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}
