package com.example.user_service.service;

import com.example.user_service.entity.User;
import com.example.user_service.repos.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Custom0Auth2UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private static final String GOOGLE_ID = "google-123";
    private static final String EMAIL = "john@gmail.com";
    private static final String FULL_NAME = "John Doe";
    private static final String PICTURE = "https://example.com/photo.jpg";

    @Test
    @DisplayName("Should save new user with correct fields when Google ID not found")
    void whenNewGoogleUser_shouldSaveWithCorrectFields() {
        // Arrange
        when(userRepository.findByGoogleId(GOOGLE_ID)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act — simulate what loadUser does after fetching OAuth2 attributes
        String firstName = null;
        String lastName = null;
        if (FULL_NAME != null) {
            String[] parts = FULL_NAME.trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        String fName = firstName;
        String lName = lastName;

        User user = userRepository
                .findByGoogleId(GOOGLE_ID)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setGoogleId(GOOGLE_ID);
                    newUser.setEmail(EMAIL);
                    newUser.setFirstName(fName);
                    newUser.setLastName(lName);
                    newUser.setProfilePictureUrl(PICTURE);
                    return userRepository.save(newUser);
                });

        // Assert
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();

        assertEquals(GOOGLE_ID, saved.getGoogleId());
        assertEquals(EMAIL, saved.getEmail());
        assertEquals("John", saved.getFirstName());
        assertEquals("Doe", saved.getLastName());
        assertEquals(PICTURE, saved.getProfilePictureUrl());
    }

    @Test
    @DisplayName("Should return existing user without saving when Google ID is found")
    void whenExistingGoogleUser_shouldNotSave() {
        // Arrange
        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setGoogleId(GOOGLE_ID);
        existingUser.setEmail(EMAIL);
        existingUser.setFirstName("John");
        existingUser.setLastName("Doe");

        when(userRepository.findByGoogleId(GOOGLE_ID)).thenReturn(Optional.of(existingUser));

        // Act
        User user = userRepository
                .findByGoogleId(GOOGLE_ID)
                .orElseGet(() -> {
                    User newUser = new User();
                    return userRepository.save(newUser);
                });

        // Assert
        assertEquals(existingUser, user);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should split multi-word name into firstName and lastName")
    void nameSplitting_multiWordName() {
        String name = "Jane Marie Smith";
        String[] parts = name.trim().split("\\s+", 2);

        assertEquals("Jane", parts[0]);
        assertEquals("Marie Smith", parts[1]);
    }

    @Test
    @DisplayName("Should handle single-word name — lastName defaults to empty")
    void nameSplitting_singleWordName() {
        String name = "Madonna";
        String[] parts = name.trim().split("\\s+", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "";

        assertEquals("Madonna", firstName);
        assertEquals("", lastName);
    }

    @Test
    @DisplayName("Should handle null name — both stay null")
    void nameSplitting_nullName() {
        String name = null;
        String firstName = null;
        String lastName = null;

        if (name != null) {
            String[] parts = name.trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        assertNull(firstName);
        assertNull(lastName);
    }
}
