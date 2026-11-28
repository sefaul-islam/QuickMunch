package com.example.order_service.service;

import com.example.order_service.entity.Cart;
import com.example.order_service.entity.CartItem;
import com.example.order_service.exception.CartItemNotFoundException;
import com.example.order_service.exception.CartRestaurantMismatchException;
import com.example.order_service.repository.CartItemRepository;
import com.example.order_service.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartPersistenceService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional(readOnly = true)
    public Optional<Cart> findCartWithItems(String userId) {
        return cartRepository.findWithItemsByUserId(userId);
    }

    @Transactional
    public Cart addOrIncrementItem(String userId, Long restaurantId, Long foodItemId, Integer quantity) {
        Cart cart = cartRepository.findWithItemsByUserId(userId)
                .orElseGet(() -> Cart.builder()
                        .userId(userId)
                        .restaurantId(restaurantId)
                        .build());

        if (!cart.getRestaurantId().equals(restaurantId)) {
            if (cart.getItems().isEmpty()) {
                cart.setRestaurantId(restaurantId);
            } else {
                throw new CartRestaurantMismatchException(cart.getRestaurantId(), restaurantId);
            }
        }

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getFoodItemId().equals(foodItemId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .foodItemId(foodItemId)
                    .quantity(quantity)
                    .build();
            cart.getItems().add(newItem);
        }

        return cartRepository.saveAndFlush(cart);
    }

    @Transactional
    public Cart updateItemQuantity(String userId, Long foodItemId, Integer quantity) {
        Cart cart = cartRepository.findWithItemsByUserId(userId)
                .orElseThrow(() -> new CartItemNotFoundException(foodItemId));

        CartItem item = cart.getItems().stream()
                .filter(ci -> ci.getFoodItemId().equals(foodItemId))
                .findFirst()
                .orElseThrow(() -> new CartItemNotFoundException(foodItemId));

        item.setQuantity(quantity);
        return cartRepository.saveAndFlush(cart);
    }

    @Transactional
    public Optional<Cart> removeItem(String userId, Long foodItemId) {
        Cart cart = cartRepository.findWithItemsByUserId(userId)
                .orElseThrow(() -> new CartItemNotFoundException(foodItemId));

        boolean removed = cart.getItems().removeIf(ci -> ci.getFoodItemId().equals(foodItemId));
        if (!removed) {
            throw new CartItemNotFoundException(foodItemId);
        }

        if (cart.getItems().isEmpty()) {
            cartItemRepository.deleteAllByCartId(cart.getId());
            cartRepository.deleteCartById(cart.getId());
            return Optional.empty();
        }

        return Optional.of(cartRepository.saveAndFlush(cart));
    }

    @Transactional
    public void clearCart(String userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cartItemRepository.deleteAllByCartId(cart.getId());
            cartRepository.deleteCartById(cart.getId());
        });
    }
}
