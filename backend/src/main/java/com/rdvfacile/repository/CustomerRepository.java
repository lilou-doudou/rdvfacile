package com.rdvfacile.repository;

import com.rdvfacile.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    List<Customer> findByBusinessId(UUID businessId);
    Optional<Customer> findByIdAndBusinessId(UUID id, UUID businessId);
    Optional<Customer> findByPhoneAndBusinessId(String phone, UUID businessId);
    boolean existsByPhoneAndBusinessId(String phone, UUID businessId);
}
