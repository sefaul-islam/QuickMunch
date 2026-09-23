package com.example.restaurant_service.client;

import com.example.restaurant_service.exception.UserNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class UserServiceClient {

    private final RestClient restClient;

    public UserServiceClient(
            @Value("${user-service.base-url}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    /**
     * Verifies that a user with the given ID exists in the User Service.
     * Calls GET /api/users/{userId}.
     *
     * @param userId the user ID to verify
     * @throws UserNotFoundException if the User Service returns 404
     */
    public void verifyUserExists(Long userId) {
        restClient.get()
                .uri("/api/users/{userId}", userId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                    throw new UserNotFoundException(userId);
                })
                .toBodilessEntity();
    }
}

