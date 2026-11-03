package com.example.order_service.client;

import com.example.order_service.dto.FoodItemDTO;
import com.example.order_service.exception.FoodItemNotFoundException;
import com.example.order_service.exception.RestaurantNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframew
import org.springframework.web.client.RestClient;

@RequiredArgsConstructorweb.client.RestClient;

@Component
@RequiredArgsConstructor
public class RestaurantServiceClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${restaurant-service.base-url}")
    private String baseUrl;

    private RestClient restClient;

    @PostConstruct
    public void init() {
        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .build();
    }

    public void getRestaurant(Long restaurantId){
         restClient.get()
                .uri("/api/restaurants/{id}", restaurantId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                    throw new RestaurantNotFoundException(restaurantId);
                })
                .toBodilessEntity();
    }

    public FoodItemDTO getFoodItem(Long restaurantId, Long foodItemId) {
        return restClient.get()
                .uri("/api/restaurants/{restaurantId}/foods/{foodId}", restaurantId, foodItemId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                    throw new FoodItemNotFoundException(foodItemId);
                })
                .body(FoodItemDTO.class);
    }
}
