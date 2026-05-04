package com.rdvfacile.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rdvfacile.dto.appointment.AppointmentRequest;
import com.rdvfacile.model.Appointment;
import com.rdvfacile.model.Business;
import com.rdvfacile.model.Customer;
import com.rdvfacile.model.ServiceEntity;
import com.rdvfacile.model.enums.AppointmentStatus;
import com.rdvfacile.repository.AppointmentRepository;
import com.rdvfacile.repository.BusinessRepository;
import com.rdvfacile.repository.CustomerRepository;
import com.rdvfacile.repository.ServiceRepository;
import com.rdvfacile.service.AppointmentService;
import com.rdvfacile.service.CustomerService;
import com.rdvfacile.service.WhatsAppService;
import com.twilio.security.RequestValidator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Webhook Twilio WhatsApp.
 * Flux : Client → WhatsApp → Twilio → ce webhook → logique RDV
 *
 * Conversation en 3 étapes :
 *  1. INIT              → accueil + liste numérotée des services
 *  2. WAITING_SERVICE   → client choisit un service → créneaux proposés
 *  3. WAITING_SLOT      → client choisit un créneau → RDV créé
 */
@RestController
@RequestMapping("/webhooks/whatsapp")
@RequiredArgsConstructor
@Slf4j
public class WhatsAppWebhookController {

    private final AppointmentService appointmentService;
    private final CustomerService customerService;
    private final WhatsAppService whatsAppService;
    private final BusinessRepository businessRepository;
    private final ServiceRepository serviceRepository;
    private final CustomerRepository customerRepository;
    private final AppointmentRepository appointmentRepository;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    private static final DateTimeFormatter SLOT_FORMAT = DateTimeFormatter.ofPattern("EEE dd/MM à HH:mm");

    /** Sessions en mémoire (MVP — remplacer par Redis en production). */
    private final ConcurrentHashMap<String, ConversationState> sessions = new ConcurrentHashMap<>();

    @PostMapping(consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> handleIncoming(
            HttpServletRequest request,
            @RequestParam Map<String, String> allParams,
            @RequestParam("From") String from,
            @RequestParam("Body") String body,
            @RequestParam(value = "To", defaultValue = "") String to,
            @RequestParam(value = "ProfileName", defaultValue = "") String profileName) {

        if (!validateTwilioSignature(request, allParams)) {
            log.warn("Requête webhook rejetée : signature Twilio invalide (IP: {})", request.getRemoteAddr());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String phone = from.replace("whatsapp:+", "").replace("whatsapp:", "");
        String toPhone = to.replace("whatsapp:+", "").replace("whatsapp:", "");
        String message = body.trim();

        log.info("Message WhatsApp reçu de {} → {} : {}", phone, toPhone, message);

        // Résolution du business par son numéro WhatsApp (champ "To")
        Optional<Business> businessOpt = businessRepository.findByPhone(toPhone);
        if (businessOpt.isEmpty()) {
            log.warn("Aucun business trouvé pour le numéro Twilio {}", toPhone);
            whatsAppService.sendMessage(phone, "Ce service n'est pas encore configuré. Veuillez contacter l'établissement directement.");
            return twimlOk();
        }
        Business business = businessOpt.get();

        ConversationState state = sessions.getOrDefault(phone, new ConversationState(ConversationStep.INIT, business.getId()));

        // Mot-clé de réinitialisation
        if (message.equalsIgnoreCase("STOP") || message.equalsIgnoreCase("MENU")) {
            sessions.remove(phone);
            whatsAppService.sendMessage(phone, "Conversation réinitialisée. Envoyez n'importe quel message pour reprendre.");
            return twimlOk();
        }

        // Annulation d'un rendez-vous existant
        if (message.equalsIgnoreCase("ANNULER")) {
            sessions.remove(phone);
            handleCancellation(phone, business.getId());
            return twimlOk();
        }

        switch (state.step) {
            case INIT              -> handleInit(phone, profileName, state);
            case WAITING_SERVICE   -> handleServiceChoice(phone, message, state);
            case WAITING_SLOT      -> handleSlotChoice(phone, message, state);
        }

        return twimlOk();
    }

    // ---- Étape 1 : accueil ----

    private void handleInit(String phone, String profileName, ConversationState state) {
        Customer customer = customerService.findOrCreateByPhone(phone, profileName, state.businessId);
        state.customerId = customer.getId();

        List<ServiceEntity> services = serviceRepository.findByBusinessIdAndActiveTrue(state.businessId);
        if (services.isEmpty()) {
            whatsAppService.sendMessage(phone, "😔 Aucun service disponible pour le moment. Revenez plus tard !");
            sessions.remove(phone);
            return;
        }

        state.availableServices = services.stream().map(ServiceEntity::getId).toList();
        state.step = ConversationStep.WAITING_SERVICE;
        sessions.put(phone, state);

        StringBuilder sb = new StringBuilder();
        sb.append("👋 Bonjour ").append(customer.getFullName()).append(" !\n\n");
        sb.append("Voici nos services disponibles :\n\n");
        for (int i = 0; i < services.size(); i++) {
            ServiceEntity s = services.get(i);
            sb.append(i + 1).append(". *").append(s.getName()).append("*");
            sb.append(" — ").append(s.getDurationMinutes()).append(" min");
            if (s.getPrice() != null && s.getPrice().compareTo(java.math.BigDecimal.ZERO) > 0) {
                sb.append(" — ").append(s.getPrice().stripTrailingZeros().toPlainString()).append(" €");
            }
            sb.append("\n");
        }
        sb.append("\nRépondez avec le *numéro* du service souhaité.");

        whatsAppService.sendMessage(phone, sb.toString());
    }

    // ---- Étape 2 : choix du service → proposition de créneaux ----

    private void handleServiceChoice(String phone, String message, ConversationState state) {
        int choice;
        try {
            choice = Integer.parseInt(message.trim());
        } catch (NumberFormatException e) {
            whatsAppService.sendMessage(phone, "❓ Veuillez répondre avec le *numéro* du service (ex: 1).");
            return;
        }

        if (choice < 1 || choice > state.availableServices.size()) {
            whatsAppService.sendMessage(phone,
                "❓ Numéro invalide. Veuillez choisir entre 1 et " + state.availableServices.size() + ".");
            return;
        }

        state.serviceId = state.availableServices.get(choice - 1);

        // Chercher les créneaux sur les 7 prochains jours (max 8 créneaux)
        List<LocalDateTime> slots = findNextSlots(state.businessId, state.serviceId, 7, 8);
        if (slots.isEmpty()) {
            whatsAppService.sendMessage(phone,
                "😔 Aucun créneau disponible dans les 7 prochains jours. Réessayez plus tard !");
            sessions.remove(phone);
            return;
        }

        state.availableSlots = slots;
        state.step = ConversationStep.WAITING_SLOT;
        sessions.put(phone, state);

        StringBuilder sb = new StringBuilder();
        sb.append("📅 *Créneaux disponibles* :\n\n");
        for (int i = 0; i < slots.size(); i++) {
            sb.append(i + 1).append(". ").append(slots.get(i).format(SLOT_FORMAT)).append("\n");
        }
        sb.append("\nRépondez avec le *numéro* du créneau souhaité.");

        whatsAppService.sendMessage(phone, sb.toString());
    }

    // ---- Étape 3 : choix du créneau → création du RDV ----

    private void handleSlotChoice(String phone, String message, ConversationState state) {
        int choice;
        try {
            choice = Integer.parseInt(message.trim());
        } catch (NumberFormatException e) {
            whatsAppService.sendMessage(phone, "❓ Veuillez répondre avec le *numéro* du créneau (ex: 1).");
            return;
        }

        if (choice < 1 || choice > state.availableSlots.size()) {
            whatsAppService.sendMessage(phone,
                "❓ Numéro invalide. Veuillez choisir entre 1 et " + state.availableSlots.size() + ".");
            return;
        }

        LocalDateTime chosenSlot = state.availableSlots.get(choice - 1);

        try {
            AppointmentRequest request = new AppointmentRequest();
            request.setCustomerId(state.customerId);
            request.setServiceId(state.serviceId);
            request.setStartTime(chosenSlot);

            var appointment = appointmentService.create(request, state.businessId);
            sessions.remove(phone);

            whatsAppService.sendMessage(phone,
                "✅ *Rendez-vous confirmé !*\n\n" +
                "📋 *Service* : " + appointment.getServiceName() + "\n" +
                "📅 *Date* : " + chosenSlot.format(SLOT_FORMAT) + "\n\n" +
                "Vous recevrez un rappel 24h avant.\n" +
                "Pour annuler, envoyez *ANNULER*.");

        } catch (Exception e) {
            log.error("Erreur création RDV WhatsApp pour {}: {}", phone, e.getMessage());
            whatsAppService.sendMessage(phone,
                "⚠️ Ce créneau n'est plus disponible. Envoyez un message pour voir de nouveaux créneaux.");
            sessions.remove(phone);
        }
    }

    // ---- Annulation ----

    private void handleCancellation(String phone, UUID businessId) {
        Optional<Customer> customerOpt = customerRepository.findByPhoneAndBusinessId(phone, businessId);
        if (customerOpt.isEmpty()) {
            whatsAppService.sendMessage(phone,
                "Aucun compte trouvé pour votre numéro. Envoyez un message pour prendre un rendez-vous.");
            return;
        }

        List<Appointment> upcoming = appointmentRepository.findNextBookedForCustomer(
            customerOpt.get().getId(), businessId, LocalDateTime.now());

        if (upcoming.isEmpty()) {
            whatsAppService.sendMessage(phone,
                "Vous n'avez aucun rendez-vous à venir à annuler.\n\nEnvoyez un message pour prendre un RDV.");
            return;
        }

        Appointment appointment = upcoming.get(0);
        appointmentService.updateStatus(appointment.getId(), AppointmentStatus.CANCELLED, businessId);
        log.info("RDV {} annulé via WhatsApp par {}", appointment.getId(), phone);

        whatsAppService.sendMessage(phone,
            "❌ *Rendez-vous annulé*\n\n" +
            "Votre rendez-vous du *" + appointment.getStartTime().format(SLOT_FORMAT) + "* a bien été annulé.\n\n" +
            "Pour prendre un nouveau rendez-vous, envoyez-nous un message 😊");
    }

    // ---- Utilitaires ----

    private List<LocalDateTime> findNextSlots(UUID businessId, UUID serviceId, int daysAhead, int maxSlots) {
        List<LocalDateTime> result = new ArrayList<>();
        LocalDate day = LocalDate.now();
        for (int i = 0; i <= daysAhead && result.size() < maxSlots; i++) {
            List<LocalDateTime> daySlots = appointmentService.getAvailableSlots(businessId, serviceId, day.plusDays(i));
            for (LocalDateTime slot : daySlots) {
                if (result.size() >= maxSlots) break;
                result.add(slot);
            }
        }
        return result;
    }

    private boolean validateTwilioSignature(HttpServletRequest request, Map<String, String> params) {
        if (!StringUtils.hasText(twilioAuthToken)) {
            log.warn("TWILIO_AUTH_TOKEN non configuré — validation de signature ignorée (dev uniquement)");
            return true;
        }
        String signature = request.getHeader("X-Twilio-Signature");
        if (!StringUtils.hasText(signature)) {
            log.warn("En-tête X-Twilio-Signature absent");
            return false;
        }
        String url = reconstructUrl(request);
        return new RequestValidator(twilioAuthToken).validate(url, params, signature);
    }

    private String reconstructUrl(HttpServletRequest request) {
        String proto = Optional.ofNullable(request.getHeader("X-Forwarded-Proto"))
                .orElse(request.getScheme());
        String host = Optional.ofNullable(request.getHeader("X-Forwarded-Host"))
                .orElseGet(() -> request.getHeader("Host"));
        return proto + "://" + host + request.getRequestURI();
    }

    private static ResponseEntity<String> twimlOk() {
        return ResponseEntity.ok("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>");
    }

    // ---- Classes internes ----

    enum ConversationStep {
        INIT, WAITING_SERVICE, WAITING_SLOT
    }

    static class ConversationState {
        ConversationStep step;
        UUID businessId;
        UUID customerId;
        UUID serviceId;
        List<UUID> availableServices = new ArrayList<>();
        List<LocalDateTime> availableSlots = new ArrayList<>();

        ConversationState(ConversationStep step, UUID businessId) {
            this.step = step;
            this.businessId = businessId;
        }
    }
}

