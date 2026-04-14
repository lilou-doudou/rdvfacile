package com.rdvfacile.repository;

import com.rdvfacile.model.Appointment;
import com.rdvfacile.model.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByBusinessIdOrderByStartTimeAsc(UUID businessId);

    Optional<Appointment> findByIdAndBusinessId(UUID id, UUID businessId);

    @Query("""
        SELECT a FROM Appointment a
        WHERE a.business.id = :businessId
        AND a.startTime >= :start
        AND a.startTime < :end
        AND a.status != 'CANCELLED'
        ORDER BY a.startTime ASC
    """)
    List<Appointment> findByBusinessIdAndDateRange(
        @Param("businessId") UUID businessId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    /**
     * Vérifie les chevauchements de RDV pour un business donné.
     * Exclut optionnellement un RDV existant (pour les modifications).
     */
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.business.id = :businessId
        AND a.status != 'CANCELLED'
        AND a.startTime < :endTime
        AND a.endTime > :startTime
        AND (:excludeId IS NULL OR a.id != :excludeId)
    """)
    boolean existsOverlappingAppointment(
        @Param("businessId") UUID businessId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("excludeId") UUID excludeId
    );

    @Query("""
        SELECT a FROM Appointment a
        WHERE a.status = 'BOOKED'
        AND a.reminderSent = false
        AND a.startTime BETWEEN :from AND :to
    """)
    List<Appointment> findAppointmentsForReminder(
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    List<Appointment> findByCustomerIdAndBusinessId(UUID customerId, UUID businessId);
}
