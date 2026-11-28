package com.example.order_service.service;

import com.example.order_service.client.RestaurantServiceClient;
import com.example.order_service.dto.AddToCartRequest;
import com.example.order_service.dto.CartDTO;
import com.example.order_service.dto.CartItemResponse;
import com.example.order_service.dto.FoodItemDTO;
import com.example.order_service.dto.RestaurantDTO;
import com.example.order_service.dto.UpdateCartItemRequest;
import com.example.order_service.entity.Cart;
import com.example.order_service.entity.CartItem;
import com.example.order_service.exception.FoodItemNotFoundException;
import com.example.order_service.exception.FoodItemUnavailableException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartPersistenceService cartPersistenceService;
    private final RestaurantServiceClient restaurantServiceClient;

    public CartDTO getCart(String userId) {
        Optional<Cart> cartOpt = cartPersistenceService.findCartWithItems(userId);
        if (cartOpt.isEmpty() || cartOpt.get().getItems().isEmpty()) {
            return CartDTO.empty(userId);
        }

        Cart cart = cartOpt.get();
        Map<Long, FoodItemDTO> foodItemsMap = restaurantServiceClient.getFoodItemsMap(cart.getRestaurantId());
        return mapToDto(cart, foodItemsMap);
    }

    public CartDTO addItem(String userId, AddToCartRequest request) {
        RestaurantDTO restaurant = restaurantServiceClient.getRestaurant(request.restaurantId());
        if (restaurant != null && Boolean.FALSE.equals(restaurant.isActive())) {
            throw new IllegalStateException("Restaurant is currently inactive");
        }

        Map<Long, FoodItemDTO> foodItemsMap = restaurantServiceClient.getFoodItemsMap(request.restaurantId());
        FoodItemDTO foodItem = foodItemsMap.get(request.foodItemId());
        if (foodItem == null) {
            throw new FoodItemNotFoundException(request.foodItemId());
        }
        if (Boolean.FALSE.equals(foodItem.isAvailable())) {
            throw new FoodItemUnavailableException(foodItem.id(), foodItem.name());
        }
        if (foodItem.price() == null || foodItem.price().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Invalid food item price for food item ID: " + request.foodItemId());
        }

        Cart savedCart = cartPersistenceService.addOrIncrementItem(
                userId,
                request.restaurantId(),
                request.foodItemId(),
                request.quantity()
        );
        return mapToDto(savedCart, foodItemsMap);
    }

    public CartDTO updateItemQuantity(String userId, Long foodItemId, UpdateCartItemRequest request) {
        Cart updatedCart = cartPersistenceService.updateItemQuantity(userId, foodItemId, request.quantity());
        Map<Long, FoodItemDTO> foodItemsMap = restaurantServiceClient.getFoodItemsMap(updatedCart.getRestaurantId());
        return mapToDto(updatedCart, foodItemsMap);
    }

    public CartDTO removeItem(String userId, Long foodItemId) {
        Optional<Cart> remainingCart = cartPersistenceService.removeItem(userId, foodItemId);
        if (remainingCart.isEmpty() || remainingCart.get().getItems().isEmpty()) {
            return CartDTO.empty(userId);
        }

        Cart cart = remainingCart.get();
        Map<Long, FoodItemDTO> foodItemsMap = restaurantServiceClient.getFoodItemsMap(cart.getRestaurantId());
        return mapToDto(cart, foodItemsMap);
    }

    public void clearCart(String userId) {
        cartPersistenceService.clearCart(userId);
    }

    private CartDTO mapToDto(Cart cart, Map<Long, FoodItemDTO> foodItemsMap) {
        List<CartItemResponse> itemResponses = new ArrayList<>(cart.getItems().size());
        int totalItems = 0;
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            FoodItemDTO foodItem = foodItemsMap.get(item.getFoodItemId());
            String name = foodItem != null ? foodItem.name() : "Unavailable item";
            String imageUrl = foodItem != null ? foodItem.imageUrl() : null;
            BigDecimal unitPrice = (foodItem != null && foodItem.price() != null)
                    ? foodItem.price()
                    : BigDecimal.ZERO;
            boolean available = foodItem != null && !Boolean.FALSE.equals(foodItem.isAvailable());

            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            totalItems += item.getQuantity();
            subtotal = subtotal.add(itemSubtotal);

            itemResponses.add(new CartItemResponse(
                    item.getId(),
                    item.getFoodItemId(),
                    name,
                    imageUrl,
                    unitPrice,
                    item.getQuantity(),
                    itemSubtotal,
                    available
            ));
        }

        return new CartDTO(
                cart.getId(),
                cart.getUserId(),
                cart.getRestaurantId(),
                itemResponses,
                totalItems,
                subtotal,
                cart.getUpdatedAt()
        );
    }
}
