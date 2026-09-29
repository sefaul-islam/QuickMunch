package com.example.order_service.client;

import com.example.order_service.exception.UserNotFoundException;
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

    public void verifyUserExists(Long userId){
        restClient.get()
                .uri("/api/users/{userId}", userId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                    throw new UserNotFoundException(userId);
                })
                .toBodilessEntity();
    }
}
