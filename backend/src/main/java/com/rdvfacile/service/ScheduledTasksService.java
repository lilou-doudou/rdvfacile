package com.rdvfacile.service;

import com.rdvfacile.repository.BusinessRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasksService {

    private final BusinessRepository businessRepository;

    /**
     * Réinitialise le compteur mensuel de RDV de tous les business
     * le 1er jour de chaque mois à 00:05 (UTC).
     */
    @Scheduled(cron = "0 5 0 1 * *")
    @Transactional
    public void resetMonthlyAppointmentCounts() {
        int updated = businessRepository.resetAllMonthlyAppointmentCounts();
        log.info("Compteurs mensuels réinitialisés pour {} business(es)", updated);
    }
}
