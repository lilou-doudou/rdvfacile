package com.rdvfacile.controller;

import com.rdvfacile.service.AppointmentService;
import com.rdvfacile.service.CustomerService;
import com.rdvfacile.service.WhatsAppService;
import com.rdvfacile.dto.appointment.AppointmentRequest;
import com.rdvfacile.dto.appointment.AppointmentResponse;
import com.rdvfacile.model.Customer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Webhook Twilio WhatsApp.
 * Flux : Client → WhatsApp → Twilio → ce webhook → logique RDV
 *
 * Conversation simplifiée en 3 étapes :
 *  1. Client envoie un message → on lui propose les services
 *  2. Client choisit un service → on lui propose des créneaux
 *  3. Client choisit un créneau → on confirme le RDV
 */
@RestController
@RequestMapping("/webhooks/whatsapp")
@RequiredArgsConstructor
@Slf4j
public class WhatsAppWebhookController {

    private final AppointmentService appointmentService;
    private final CustomerService customerService;
    private final WhatsAppService whatsAppService;

    // Session en mémoire simple (en production : Redis)
    private final ConcurrentHashMap<String, ConversationState> sessions = new ConcurrentHashMap<>();

    // Business ID fixe pour le MVP (en production : résolution par numéro Twilio)
    private static final UUID DEFAULT_BUSINESS_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @PostMapping(consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> handleIncoming(
            @RequestParam("From") String from,
            @RequestParam("Body") String body,
            @RequestParam(value = "ProfileName", defaultValue = "") String profileName) {

        String phone = from.replace("whatsapp:+", "").replace("whatsapp:", "");
        String message = body.trim().toLowerCase();

        log.info("Message WhatsApp reçu de {} ({}): {}", phone, profileName, body);

        ConversationState state = sessions.getOrDefault(phone, new ConversationState(ConversationStep.INIT));

        switch (state.step) {
            case INIT -> handleInit(phone, profileName, message, state);
            case WAITING_SERVICE_CHOICE -> handleServiceChoice(phone, message, state);
            case WAITING_SLOT_CHOICE -> handleSlotChoice(phone, message, state);
            default -> handleInit(phone, profileName, message, new ConversationState(ConversationStep.INIT));
        }

        return ResponseEntity.ok("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>");
    }

    private void handleInit(String phone, String profileName, String message, ConversationState state) {
        if (message.contains("annuler")) {
            whatsAppService.sendMessage(phone,
                "Pour annuler un rendez-vous, contactez-nous directement.");
            return;
        }

        Customer customer = customerService.findOrCreateByPhone(phone, profileName, DEFAULT_BUSINESS_ID);
        state.customerId = customer.getId();
        state.step = ConversationStep.WAITING_SERVICE_CHOICE;
        sessions.put(phone, state);

        // En production, on récupère les services du business
        String response = "👋 Bonjour " + customer.getFullName() + " !\n\n" +
            "Bienvenue. Pour prendre un rendez-vous, répondez avec le nom du service souhaité " +
            "ou envoyez *SERVICES* pour voir toutes nos prestations.";

        whatsAppService.sendMessage(phone, response);
    }

    private void handleServiceChoice(String phone, String message, ConversationState state) {
        // Logique simplifiée MVP : on propose des créneaux pour aujourd'hui + demain
        // En production : parsage du nom de service via NLP ou liste numérotée
        state.step = ConversationStep.WAITING_SLOT_CHOICE;
        sessions.put(phone, state);

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<LocalDateTime> slots = List.of(); // sera rempli avec la vraie implémentation

        if (slots.isEmpty()) {
            whatsAppService.sendMessage(phone,
                "😔 Aucun créneau disponible pour demain. Souhaitez-vous voir les disponibilités " +
                "d'une autre date ? Répondez avec la date (ex: 15/04/2026)");
        } else {
            whatsAppService.sendAvailableSlots(phone, slots, "notre salon");
        }
    }

    private void handleSlotChoice(String phone, String message, ConversationState state) {
        sessions.remove(phone);
        whatsAppService.sendMessage(phone,
            "✅ Votre rendez-vous a été confirmé ! Vous recevrez un rappel 24h avant.\n\n" +
            "Merci de votre confiance !");
    }

    // ---- Classes internes ----

    enum ConversationStep {
        INIT, WAITING_SERVICE_CHOICE, WAITING_SLOT_CHOICE
    }

    static class ConversationState {
        ConversationStep step;
        UUID customerId;
        UUID serviceId;

        ConversationState(ConversationStep step) {
            this.step = step;
        }
    }
}
