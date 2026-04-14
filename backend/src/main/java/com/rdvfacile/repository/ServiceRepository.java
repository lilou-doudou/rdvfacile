package com.rdvfacile.repository;

import com.rdvfacile.model.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, UUID> {
    List<ServiceEntity> findByBusinessIdAndActiveTrue(UUID businessId);
    Optional<ServiceEntity> findByIdAndBusinessId(UUID id, UUID businessId);
    boolean existsByNameAndBusinessId(String name, UUID businessId);
}
