package com.example.order_service.client;

import lombok.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class RestaurantServiceClient {
    private final RestClient restClient;

    public RestaurantServiceClient(
            @Value("${restaurant-service.base-url}")
            String baseUrl
    ){
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public RestaurantDto getRestaurant(Long restaurantId){ //TODO need to create the restaurantdto
        return restClient.get()
                .uri("/api/restaurants/{id}",restaurantId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,((request, response) -> {
                    throw new UserNotFoundException(restaurantId);
                }))
                .toBodilessEntity();
    }
}
