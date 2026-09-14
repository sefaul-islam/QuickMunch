package com.example.user_service.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/users/login - should return user info when authenticated")
    void login_authenticatedUser_returnsUserInfo() throws Exception {
        OAuth2User oAuth2User = new DefaultOAuth2User(
                Collections.emptyList(),
                Map.of(
                        "sub", "google-123",
                        "name", "John Doe",
                        "email", "john@gmail.com",
                        "picture", "https://example.com/photo.jpg"
                ),
                "sub"
        );

        mockMvc.perform(get("/api/users/login")
                        .with(oauth2Login().oauth2User(oAuth2User)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@gmail.com"))
                .andExpect(jsonPath("$.picture").value("https://example.com/photo.jpg"));
    }

    @Test
    @DisplayName("GET /api/users/login - should return 401 when not authenticated")
    void login_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/users/login"))
                .andExpect(status().isUnauthorized());
    }
}
