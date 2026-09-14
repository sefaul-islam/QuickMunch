package com.example.user_service.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    @DisplayName("Should create user with builder")
    void builder_createsUserCorrectly() {
        User user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password("secret123")
                .phoneNumber("01712345678")
                .address("Dhaka")
                .googleId("google-123")
                .profilePictureUrl("https://example.com/pic.jpg")
                .build();

        assertEquals("John", user.getFirstName());
        assertEquals("Doe", user.getLastName());
        assertEquals("john@example.com", user.getEmail());
        assertEquals("secret123", user.getPassword());
        assertEquals("01712345678", user.getPhoneNumber());
        assertEquals("Dhaka", user.getAddress());
        assertEquals("google-123", user.getGoogleId());
        assertEquals("https://example.com/pic.jpg", user.getProfilePictureUrl());
        assertTrue(user.getIsActive()); // default
        assertNotNull(user.getRoles()); // default empty set
        assertTrue(user.getRoles().isEmpty());
    }

    @Test
    @DisplayName("Should create user with no-arg constructor and setters")
    void noArgConstructor_withSetters_setsFieldsCorrectly() {
        User user = new User();
        user.setFirstName("Jane");
        user.setLastName("Smith");
        user.setEmail("jane@example.com");
        user.setGoogleId("google-456");
        user.setProfilePictureUrl("https://example.com/jane.jpg");

        assertEquals("Jane", user.getFirstName());
        assertEquals("Smith", user.getLastName());
        assertEquals("jane@example.com", user.getEmail());
        assertEquals("google-456", user.getGoogleId());
        assertEquals("https://example.com/jane.jpg", user.getProfilePictureUrl());
    }

    @Test
    @DisplayName("Should allow null values for optional fields")
    void builder_nullOptionalFields_allowed() {
        User user = User.builder()
                .email("minimal@example.com")
                .build();

        assertEquals("minimal@example.com", user.getEmail());
        assertNull(user.getFirstName());
        assertNull(user.getLastName());
        assertNull(user.getPassword());
        assertNull(user.getPhoneNumber());
        assertNull(user.getAddress());
        assertNull(user.getGoogleId());
        assertNull(user.getProfilePictureUrl());
        assertTrue(user.getIsActive());
    }

    @Test
    @DisplayName("isActive should default to true")
    void isActive_defaultsToTrue() {
        User user = new User();
        assertTrue(user.getIsActive());
    }

    @Test
    @DisplayName("roles should default to empty set")
    void roles_defaultsToEmptySet() {
        User user = User.builder().email("roles@example.com").build();
        assertNotNull(user.getRoles());
        assertTrue(user.getRoles().isEmpty());
    }
}
