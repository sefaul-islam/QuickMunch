package com.example.user_service.controller;

import com.example.user_service.dto.PublicUserProfileDTO;
import com.example.user_service.dto.UpdateUserRequestDTO;
import com.example.user_service.dto.UserProfileResponseDTO;
import com.example.user_service.security.KeycloakSecurityUtil;
import com.example.user_service.service.UserService;
import com.example.user_service.service.UserSyncService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserSyncService userSyncService;

    public UserController(UserService userService, UserSyncService userSyncService) {
        this.userService = userService;
        this.userSyncService = userSyncService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ROLE_CUSTOMER') ")
    public ResponseEntity<UserProfileResponseDTO> getCurrentUser(
            Authentication authentication) {
        // Ensure local user record exists (just-in-time provisioning)
        var user = userSyncService.syncUser(authentication);
        UserProfileResponseDTO profile = userService.getUserById(user.getId());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<PublicUserProfileDTO> getUser(
            @PathVariable("userId") Long userId) {
        PublicUserProfileDTO user = userService.getPublicUserProfile(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserProfileResponseDTO> updateUser(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody UpdateUserRequestDTO dto,
            Authentication authentication) {
        String authenticatedEmail = KeycloakSecurityUtil.getEmail(authentication);
        UserProfileResponseDTO updated = userService.updateUser(
                userId, dto, authenticatedEmail);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable("userId") Long userId,
            Authentication authentication) {
        String authenticatedEmail = KeycloakSecurityUtil.getEmail(authentication);
        userService.deleteUser(userId, authenticatedEmail);
        return ResponseEntity.noContent().build();
    }
}
