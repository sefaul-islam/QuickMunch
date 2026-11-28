package com.example.order_service.client;

import com.example.order_service.dto.FoodItemDTO;
import com.example.order_service.dto.RestaurantDTO;
import com.example.order_service.exception.FoodItemNotFoundException;
import com.example.order_service.exception.RestaurantNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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

    public RestaurantDTO getRestaurant(Long restaurantId) {
        return restClient.get()
                .uri("/api/restaurants/{id}", restaurantId)
                .retrieve()
                .onStatus(status -> status.value() == 404, (request, response) -> {
                    throw new RestaurantNotFoundException(restaurantId);
                })
                .body(RestaurantDTO.class);
    }

    public FoodItemDTO getFoodItem(Long restaurantId, Long foodItemId) {
        return restClient.get()
                .uri("/api/restaurants/{restaurantId}/foods/{foodId}", restaurantId, foodItemId)
                .retrieve()
                .onStatus(status -> status.value() == 404, (request, response) -> {
                    throw new FoodItemNotFoundException(foodItemId);
                })
                .body(FoodItemDTO.class);
    }

    /**
     * Fetches all menu items for a restaurant in a single HTTP request to avoid N+1 remote calls.
     */
    public List<FoodItemDTO> getFoodItems(Long restaurantId) {
        List<FoodItemDTO> items = restClient.get()
                .uri("/api/restaurants/{restaurantId}/foods", restaurantId)
                .retrieve()
                .onStatus(status -> status.value() == 404, (request, response) -> {
                    throw new RestaurantNotFoundException(restaurantId);
                })
                .body(new ParameterizedTypeReference<>() {});
        return items != null ? items : Collections.emptyList();
    }

    public Map<Long, FoodItemDTO> getFoodItemsMap(Long restaurantId) {
        return getFoodItems(restaurantId).stream()
                .collect(Collectors.toMap(FoodItemDTO::id, Function.identity(), (first, second) -> first));
    }
}
