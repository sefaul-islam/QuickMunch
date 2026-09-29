package com.example.user_service.controller;

import com.example.user_service.dto.UpdateUserRequestDTO;
import com.example.user_service.dto.UserProfileResponseDTO;
import com.example.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getCurrentUser(
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        UserProfileResponseDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponseDTO> getUser(
            @PathVariable("userId") Long userId) {
        UserProfileResponseDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserProfileResponseDTO> updateUser(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody UpdateUserRequestDTO dto,
            Authentication authentication) {
        String authenticatedEmail = (String) authentication.getCredentials();
        UserProfileResponseDTO updated = userService.updateUser(
                userId, dto, authenticatedEmail);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable("userId") Long userId,
            Authentication authentication) {
        String authenticatedEmail = (String) authentication.getCredentials();
        userService.deleteUser(userId, authenticatedEmail);
        return ResponseEntity.noContent().build();
    }
}
