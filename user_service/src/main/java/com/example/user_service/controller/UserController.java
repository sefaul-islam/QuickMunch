package com.example.user_service.controller;

import com.example.user_service.dto.UpdateUserRequestDTO;
import com.example.user_service.dto.UserProfileResponseDTO;
import com.example.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @AuthenticationPrincipal OAuth2User oAuth2User) {

        if (oAuth2User == null) {
            return ResponseEntity.status(401).build();
        }

        Map<String, Object> userInfo = Map.of(
                "name", oAuth2User.getAttribute("name"),
                "email", oAuth2User.getAttribute("email"),
                "picture", oAuth2User.getAttribute("picture")
        );

        return ResponseEntity.ok(userInfo);
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
            @AuthenticationPrincipal OidcUser oidcUser) {

        String authenticatedEmail = oidcUser.getEmail();
        UserProfileResponseDTO updated = userService.updateUser(
                userId, dto, authenticatedEmail);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal OidcUser oidcUser) {

        String authenticatedEmail = oidcUser.getEmail();
        userService.deleteUser(userId, authenticatedEmail);
        return ResponseEntity.noContent().build();
    }
}
