package com.rdvfacile.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.rdvfacile.model.Appointment;
import com.rdvfacile.repository.AppointmentRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.whatsapp-from}")
    private String fromNumber;

    private final AppointmentRepository appointmentRepository;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isBlank()) {
            Twilio.init(accountSid, authToken);
            log.info("Twilio initialisé");
        } else {
            log.warn("Twilio non configuré - les messages WhatsApp ne seront pas envoyés");
        }
    }

    public void sendConfirmation(Appointment appointment) {
        String message = String.format(
            "✅ *RdvFacile* - Votre rendez-vous est confirmé !\n\n" +
            "📋 *Service* : %s\n" +
            "📅 *Date* : %s\n" +
            "📍 *Chez* : %s\n\n" +
            "Pour annuler, répondez ANNULER.",
            appointment.getService().getName(),
            appointment.getStartTime().format(FORMATTER),
            appointment.getBusiness().getName()
        );

        sendRaw("whatsapp:+" + appointment.getCustomer().getPhone(), message);
    }

    public void sendReminder(Appointment appointment) {
        String message = String.format(
            "⏰ *RdvFacile* - Rappel de rendez-vous !\n\n" +
            "Vous avez un rendez-vous demain :\n" +
            "📋 *Service* : %s\n" +
            "📅 *Heure* : %s\n" +
            "📍 *Chez* : %s\n\n" +
            "À demain !",
            appointment.getService().getName(),
            appointment.getStartTime().format(FORMATTER),
            appointment.getBusiness().getName()
        );

        sendRaw("whatsapp:+" + appointment.getCustomer().getPhone(), message);
    }

    public void sendAvailableSlots(String toPhone, List<LocalDateTime> slots, String businessName) {
        StringBuilder sb = new StringBuilder();
        sb.append("📅 *Créneaux disponibles chez ").append(businessName).append("* :\n\n");
        for (int i = 0; i < Math.min(slots.size(), 5); i++) {
            sb.append(i + 1).append(". ").append(slots.get(i).format(FORMATTER)).append("\n");
        }
        sb.append("\nRépondez avec le numéro de votre choix (ex: 1)");

        sendRaw("whatsapp:+" + toPhone, sb.toString());
    }

    public void sendCancellationConfirmation(Appointment appointment) {
        String message = String.format(
            "❌ *RdvFacile* - Rendez-vous annulé\n\n" +
            "Votre rendez-vous du %s a été annulé.\n" +
            "Pour reprendre un rendez-vous, contactez-nous.",
            appointment.getStartTime().format(FORMATTER)
        );

        sendRaw("whatsapp:+" + appointment.getCustomer().getPhone(), message);
    }

    /**
     * Tâche planifiée : envoie les rappels 24h avant chaque RDV.
     * S'exécute toutes les heures.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void sendScheduledReminders() {
        LocalDateTime from = LocalDateTime.now().plusHours(23);
        LocalDateTime to = LocalDateTime.now().plusHours(25);

        List<Appointment> appointments = appointmentRepository.findAppointmentsForReminder(from, to);
        for (Appointment appointment : appointments) {
            try {
                sendReminder(appointment);
                appointment.setReminderSent(true);
                appointmentRepository.save(appointment);
                log.info("Rappel envoyé pour RDV {}", appointment.getId());
            } catch (Exception e) {
                log.error("Erreur lors de l'envoi du rappel pour RDV {}: {}", appointment.getId(), e.getMessage());
            }
        }
    }

    public void sendMessage(String toPhone, String body) {
        String to = toPhone.startsWith("whatsapp:") ? toPhone : "whatsapp:+" + toPhone;
        sendRaw(to, body);
    }

    private void sendRaw(String to, String body) {
        if (accountSid == null || accountSid.isBlank()) {
            log.info("[MOCK WhatsApp] To: {} | Message: {}", to, body);
            return;
        }
        try {
            Message.creator(new PhoneNumber(to), new PhoneNumber(fromNumber), body).create();
            log.info("Message WhatsApp envoyé à {}", to);
        } catch (Exception e) {
            log.error("Erreur envoi WhatsApp à {}: {}", to, e.getMessage());
        }
    }
}
