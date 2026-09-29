package com.example.user_service.controller;

import com.example.user_service.dto.UserProfileResponseDTO;
import com.example.user_service.exception.ResourceNotFoundException;
import com.example.user_service.security.JwtService;
import com.example.user_service.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    private UsernamePasswordAuthenticationToken mockAuth() {
        return new UsernamePasswordAuthenticationToken(
                1L,
                "john@example.com",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );
    }

    @Test
    @DisplayName("GET /api/users/{userId} - should return user profile")
    void getUserById_existingUser_returnsUser() throws Exception {
        UserProfileResponseDTO mockDto = new UserProfileResponseDTO(
                1L, "John", "Doe", "john@example.com", "12345", Collections.emptyList(), null, Collections.emptySet()
        );
        when(userService.getUserById(1L)).thenReturn(mockDto);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    @DisplayName("GET /api/users/{userId} - should return 404 when not found")
    void getUserById_notFound_returns404() throws Exception {
        when(userService.getUserById(99L)).thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/api/users/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/users/{userId} - should update user profile")
    void updateUser_validRequest_returnsUpdatedUser() throws Exception {
        UserProfileResponseDTO mockDto = new UserProfileResponseDTO(
                1L, "Jane", "Doe", "jane@example.com", "54321", Collections.emptyList(), null, Collections.emptySet()
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
                        .with(authentication(mockAuth()))
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
                        .with(authentication(mockAuth())))
                .andExpect(status().isNoContent());
    }
}
