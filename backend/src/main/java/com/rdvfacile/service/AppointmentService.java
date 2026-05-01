package com.rdvfacile.service;

import com.rdvfacile.dto.appointment.AppointmentRequest;
import com.rdvfacile.dto.appointment.AppointmentResponse;
import com.rdvfacile.exception.BusinessException;
import com.rdvfacile.exception.ResourceNotFoundException;
import com.rdvfacile.model.Appointment;
import com.rdvfacile.model.Business;
import com.rdvfacile.model.Customer;
import com.rdvfacile.model.ServiceEntity;
import com.rdvfacile.model.enums.AppointmentStatus;
import com.rdvfacile.model.enums.PlanType;
import com.rdvfacile.repository.AppointmentRepository;
import com.rdvfacile.repository.BusinessRepository;
import com.rdvfacile.repository.CustomerRepository;
import com.rdvfacile.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final int FREE_PLAN_MONTHLY_LIMIT = 30;

    private final AppointmentRepository appointmentRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final ServiceRepository serviceRepository;

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAll(UUID businessId) {
        return appointmentRepository.findByBusinessIdOrderByStartTimeAsc(businessId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getByDateRange(UUID businessId, LocalDate start, LocalDate end) {
        return appointmentRepository.findByBusinessIdAndDateRange(
                        businessId,
                        start.atStartOfDay(),
                        end.plusDays(1).atStartOfDay()
                ).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(UUID id, UUID businessId) {
        return appointmentRepository.findByIdAndBusinessId(id, businessId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable"));
    }

    @Transactional
    public AppointmentResponse create(AppointmentRequest request, UUID businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business introuvable"));

        checkPlanLimit(business);

        Customer customer = customerRepository.findByIdAndBusinessId(request.getCustomerId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));

        ServiceEntity service = serviceRepository.findByIdAndBusinessId(request.getServiceId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Service introuvable"));

        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        validateWorkingHours(business, startTime, endTime);
        checkNoOverlap(businessId, startTime, endTime, null);

        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setService(service);
        appointment.setBusiness(business);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setNotes(request.getNotes());

        // Incrémenter le compteur mensuel pour le plan FREE
        if (business.getPlanType() == PlanType.FREE) {
            business.setMonthlyAppointmentCount(business.getMonthlyAppointmentCount() + 1);
            businessRepository.save(business);
        }

        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse update(UUID id, AppointmentRequest request, UUID businessId) {
        Appointment appointment = appointmentRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable"));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BusinessException("Impossible de modifier un rendez-vous annulé");
        }

        Business business = appointment.getBusiness();

        Customer customer = customerRepository.findByIdAndBusinessId(request.getCustomerId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));

        ServiceEntity service = serviceRepository.findByIdAndBusinessId(request.getServiceId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Service introuvable"));

        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        validateWorkingHours(business, startTime, endTime);
        checkNoOverlap(businessId, startTime, endTime, id);

        appointment.setCustomer(customer);
        appointment.setService(service);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setNotes(request.getNotes());

        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse updateStatus(UUID id, AppointmentStatus status, UUID businessId) {
        Appointment appointment = appointmentRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable"));

        appointment.setStatus(status);
        return toResponse(appointmentRepository.save(appointment));
    }

    /**
     * Calcule les créneaux disponibles pour une date et un service donnés.
     */
    public List<LocalDateTime> getAvailableSlots(UUID businessId, UUID serviceId, LocalDate date) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business introuvable"));

        ServiceEntity service = serviceRepository.findByIdAndBusinessId(serviceId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Service introuvable"));

        List<Appointment> existingAppointments = appointmentRepository.findByBusinessIdAndDateRange(
                businessId,
                date.atStartOfDay(),
                date.plusDays(1).atStartOfDay()
        );

        List<LocalDateTime> slots = new ArrayList<>();
        LocalDateTime current = LocalDateTime.of(date, business.getOpeningTime());
        LocalDateTime dayEnd = LocalDateTime.of(date, business.getClosingTime());
        int slotLength = service.getDurationMinutes();

        while (!current.plusMinutes(slotLength).isAfter(dayEnd)) {
            final LocalDateTime slotStart = current;
            final LocalDateTime slotEnd = current.plusMinutes(slotLength);

            boolean occupied = existingAppointments.stream().anyMatch(a ->
                    a.getStartTime().isBefore(slotEnd) && a.getEndTime().isAfter(slotStart)
            );

            if (!occupied && !slotStart.isBefore(LocalDateTime.now())) {
                slots.add(slotStart);
            }
            current = current.plusMinutes(business.getSlotDurationMinutes());
        }

        return slots;
    }

    // ---- Règles métier ----

    private void checkPlanLimit(Business business) {
        if (business.getPlanType() == PlanType.FREE &&
            business.getMonthlyAppointmentCount() >= FREE_PLAN_MONTHLY_LIMIT) {
            throw new BusinessException(
                "Limite mensuelle de " + FREE_PLAN_MONTHLY_LIMIT +
                " rendez-vous atteinte. Passez en plan Pro pour continuer."
            );
        }
    }

    private void validateWorkingHours(Business business, LocalDateTime start, LocalDateTime end) {
        LocalTime startTime = start.toLocalTime();
        LocalTime endTime = end.toLocalTime();
        if (startTime.isBefore(business.getOpeningTime()) ||
            endTime.isAfter(business.getClosingTime())) {
            throw new BusinessException("Le rendez-vous est en dehors des horaires d'ouverture");
        }
    }

    private void checkNoOverlap(UUID businessId, LocalDateTime start, LocalDateTime end, UUID excludeId) {
        boolean overlaps = appointmentRepository.existsOverlappingAppointment(
                businessId, start, end, excludeId);
        if (overlaps) {
            throw new BusinessException("Ce créneau est déjà occupé. Veuillez choisir un autre horaire.");
        }
    }

    private AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse r = new AppointmentResponse();
        r.setId(a.getId());
        r.setCustomerId(a.getCustomer().getId());
        r.setCustomerName(a.getCustomer().getFullName());
        r.setCustomerPhone(a.getCustomer().getPhone());
        r.setServiceId(a.getService().getId());
        r.setServiceName(a.getService().getName());
        r.setServiceDurationMinutes(a.getService().getDurationMinutes());
        r.setStartTime(a.getStartTime());
        r.setEndTime(a.getEndTime());
        r.setStatus(a.getStatus());
        r.setNotes(a.getNotes());
        r.setReminderSent(a.getReminderSent());
        r.setCreatedAt(a.getCreatedAt());
        return r;
    }
}
