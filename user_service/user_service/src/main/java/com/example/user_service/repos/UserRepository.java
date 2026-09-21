package com.example.user_service.repos;

import com.example.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByIdAndIsActiveTrue(Long id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.addresses WHERE u.id = :id AND u.isActive = true")
    Optional<User> findByIdWithAddresses(@Param("id") Long id);
}
