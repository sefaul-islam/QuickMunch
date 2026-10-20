package com.example.user_service.controller;

import com.example.user_service.dto.UserProfileResponseDTO;
import com.example.user_service.entity.User;
import com.example.user_service.exception.ResourceNotFoundException;
import com.example.user_service.service.UserService;
import com.example.user_service.service.UserSyncService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserSyncService userSyncService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    private User mockUser() {
        User user = new User();
        user.setId(1L);
        user.setEmail("john@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setKeycloakId("kc-user-123");
        return user;
    }

    @Test
    @DisplayName("GET /api/users/me - should return current user profile")
    void getCurrentUser_returnsProfile() throws Exception {
        User user = mockUser();
        when(userSyncService.syncUser(any())).thenReturn(user);

        UserProfileResponseDTO mockDto = new UserProfileResponseDTO(
                1L, "John", "Doe", "john@example.com", "12345", Collections.emptyList(), null, Collections.emptySet()
        );
        when(userService.getUserById(1L)).thenReturn(mockDto);

        mockMvc.perform(get("/api/users/me")
                        .with(jwt().jwt(j -> j
                                .subject("kc-user-123")
                                .claim("email", "john@example.com")
                                .claim("given_name", "John")
                                .claim("family_name", "Doe")
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    @DisplayName("GET /api/users/{userId} - should return 404 when not found")
    void getUserById_notFound_returns404() throws Exception {
        when(userService.getPublicUserProfile(99L)).thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/api/users/99")
                        .with(jwt().jwt(j -> j
                                .subject("kc-user-123")
                                .claim("email", "john@example.com")
                        )))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/users/{userId} - should update user profile")
    void updateUser_validRequest_returnsUpdatedUser() throws Exception {
        UserProfileResponseDTO mockDto = new UserProfileResponseDTO(
                1L, "Jane", "Doe", "john@example.com", "54321", Collections.emptyList(), null, Collections.emptySet()
        );

        when(userService.updateUser(eq(1L), any(), eq("john@example.com"))).thenReturn(mockDto);

        String requestBody = """
                {
                    "firstName": "Jane",
                    "lastName": "Doe",
                    "phoneNumber": "54321"
                }
                """;

        mockMvc.perform(put("/api/users/1")
                        .with(jwt().jwt(j -> j
                                .subject("kc-user-123")
                                .claim("email", "john@example.com")
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.phoneNumber").value("54321"));
    }

    @Test
    @DisplayName("DELETE /api/users/{userId} - should delete user")
    void deleteUser_success_returnsNoContent() throws Exception {
        doNothing().when(userService).deleteUser(eq(1L), eq("john@example.com"));

        mockMvc.perform(delete("/api/users/1")
                        .with(jwt().jwt(j -> j
                                .subject("kc-user-123")
                                .claim("email", "john@example.com")
                        )))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/users/me - should return 401 without JWT")
    void getCurrentUser_noJwt_returns401() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }
}
