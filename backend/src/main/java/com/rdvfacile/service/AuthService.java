package com.rdvfacile.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rdvfacile.dto.auth.AuthResponse;
import com.rdvfacile.dto.auth.ForgotPasswordRequest;
import com.rdvfacile.dto.auth.LoginRequest;
import com.rdvfacile.dto.auth.RegisterRequest;
import com.rdvfacile.dto.auth.ResetPasswordRequest;
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

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

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
    public void register(RegisterRequest request) {
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

        String verificationToken = UUID.randomUUID().toString();

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(UserRole.OWNER);
        user.setBusiness(business);
        user.setEmailVerified(false);
        user.setVerificationToken(verificationToken);
        userRepository.save(user);

        sendVerificationEmail(user.getEmail(), user.getFullName(), verificationToken);
    }

    private void sendVerificationEmail(String email, String fullName, String token) {
        String verifyLink = frontendUrl + "/verify-email?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("Confirmez votre compte RdvFacile");
        message.setText("Bonjour " + fullName + ",\n\n"
                + "Merci de vous être inscrit sur RdvFacile !\n\n"
                + "Cliquez sur le lien ci-dessous pour confirmer votre adresse email :\n"
                + verifyLink + "\n\n"
                + "Ce lien est valable 24 heures.\n\n"
                + "L'équipe RdvFacile");
        try {
            mailSender.send(message);
        } catch (MailException e) {
            log.error("Échec envoi email de vérification à {}: {}", email, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmailWithBusiness(request.getEmail())
                .orElseThrow(() -> new BusinessException("Identifiants invalides"));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BusinessException("Veuillez confirmer votre adresse email avant de vous connecter.");
        }

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
            try {
                mailSender.send(message);
            } catch (MailException e) {
                log.error("Échec envoi email réinitialisation à {}: {}", user.getEmail(), e.getMessage());
            }
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

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BusinessException("Lien de vérification invalide ou déjà utilisé"));
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerification(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (Boolean.TRUE.equals(user.getEmailVerified())) {
                throw new BusinessException("Ce compte est déjà vérifié");
            }
            String token = UUID.randomUUID().toString();
            user.setVerificationToken(token);
            userRepository.save(user);
            sendVerificationEmail(user.getEmail(), user.getFullName(), token);
        });
    }
}
