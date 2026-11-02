package com.example.order_service.client;

import com.example.order_service.dto.UserResponseDTO;
import com.example.order_service.exception.UserNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class UserServiceClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${user-service.base-url}")
    private String baseUrl;

    private RestClient restClient;

    @PostConstruct
    public void init() {
        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .build();
    }

    public UserResponseDTO getUserByKeycloakId(String keycloakId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/users/validate")
                        .queryParam("keycloakId", keycloakId)
                        .build()
                )
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                    throw new UserNotFoundException(keycloakId);
                })
                .body(UserResponseDTO.class);
    }
}
