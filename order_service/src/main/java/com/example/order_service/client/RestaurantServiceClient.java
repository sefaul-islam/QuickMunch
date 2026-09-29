package com.example.order_service.client;

import com.example.order_service.dto.FoodItemDTO;
import com.example.order_service.exception.FoodItemNotFoundException;
import com.example.order_service.exception.RestaurantNotFoundException;
import org.springframework.beans.factory.annotation.Value;
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
