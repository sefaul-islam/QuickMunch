package com.example.user_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

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
}

