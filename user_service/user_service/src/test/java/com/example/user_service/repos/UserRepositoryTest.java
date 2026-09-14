package com.example.user_service.repos;

import com.example.user_service.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setGoogleId("google-abc-123");
        testUser.setProfilePictureUrl("https://example.com/pic.jpg");
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("Should find user by email")
    void findByEmail_existingEmail_returnsUser() {
        Optional<User> found = userRepository.findByEmail("test@example.com");

        assertTrue(found.isPresent());
        assertEquals("Test", found.get().getFirstName());
        assertEquals("User", found.get().getLastName());
    }

    @Test
    @DisplayName("Should return empty for non-existing email")
    void findByEmail_nonExistingEmail_returnsEmpty() {
        Optional<User> found = userRepository.findByEmail("nobody@example.com");

        assertFalse(found.isPresent());
    }

    @Test
    @DisplayName("Should find user by Google ID")
    void findByGoogleId_existingId_returnsUser() {
        Optional<User> found = userRepository.findByGoogleId("google-abc-123");

        assertTrue(found.isPresent());
        assertEquals("test@example.com", found.get().getEmail());
        assertEquals("google-abc-123", found.get().getGoogleId());
    }

    @Test
    @DisplayName("Should return empty for non-existing Google ID")
    void findByGoogleId_nonExistingId_returnsEmpty() {
        Optional<User> found = userRepository.findByGoogleId("google-xyz-999");

        assertFalse(found.isPresent());
    }

    @Test
    @DisplayName("Should persist profilePictureUrl")
    void save_withProfilePictureUrl_persistsCorrectly() {
        User user = new User();
        user.setEmail("photo@example.com");
        user.setProfilePictureUrl("https://example.com/avatar.png");

        User saved = userRepository.save(user);
        User retrieved = userRepository.findById(saved.getId()).orElseThrow();

        assertEquals("https://example.com/avatar.png", retrieved.getProfilePictureUrl());
    }

    @Test
    @DisplayName("Should enforce unique email constraint")
    void save_duplicateEmail_throwsException() {
        User duplicate = new User();
        duplicate.setEmail("test@example.com"); // same as testUser

        assertThrows(Exception.class, () -> {
            userRepository.save(duplicate);
            userRepository.flush();
        });
    }

    @Test
    @DisplayName("Should enforce unique googleId constraint")
    void save_duplicateGoogleId_throwsException() {
        User duplicate = new User();
        duplicate.setEmail("other@example.com");
        duplicate.setGoogleId("google-abc-123"); // same as testUser

        assertThrows(Exception.class, () -> {
            userRepository.save(duplicate);
            userRepository.flush();
        });
    }

    @Test
    @DisplayName("Should set isActive to true by default")
    void save_newUser_isActiveByDefault() {
        User user = new User();
        user.setEmail("active@example.com");

        User saved = userRepository.save(user);

        assertTrue(saved.getIsActive());
    }

    @Test
    @DisplayName("Should auto-generate createdAt timestamp")
    void save_newUser_hasCreatedAt() {
        User user = new User();
        user.setEmail("timestamp@example.com");

        User saved = userRepository.save(user);
        userRepository.flush();

        assertNotNull(saved.getCreatedAt());
    }
}
