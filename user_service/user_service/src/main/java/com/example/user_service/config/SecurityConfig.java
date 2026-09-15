package com.example.user_service.config;

import com.example.user_service.service.Custom0Auth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final Custom0Auth2UserService custom0Auth2UserService;

    public SecurityConfig(
            Custom0Auth2UserService custom0Auth2UserService) {
        this.custom0Auth2UserService = custom0Auth2UserService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/login/**").permitAll()
                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo
                                .oidcUserService(custom0Auth2UserService)
                        )
                        .defaultSuccessUrl("/api/users/login", true)
                );

        return http.build();
    }
}
