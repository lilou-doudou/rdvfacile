package com.rdvfacile.repository;

import com.rdvfacile.model.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessRepository extends JpaRepository<Business, UUID> {
    Optional<Business> findByPhone(String phone);
    boolean existsByPhone(String phone);

    @Modifying
    @Query("UPDATE Business b SET b.monthlyAppointmentCount = 0")
    int resetAllMonthlyAppointmentCounts();
}
