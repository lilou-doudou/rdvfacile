package com.rdvfacile.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rdvfacile.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    @Query("SELECT u FROM User u JOIN FETCH u.business WHERE u.email = :email")
    Optional<User> findByEmailWithBusiness(@Param("email") String email);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
