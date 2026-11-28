package com.example.order_service.service;

import com.example.order_service.client.RestaurantServiceClient;
import com.example.order_service.dto.AddToCartRequest;
import com.example.order_service.dto.CartDTO;
import com.example.order_service.dto.FoodItemDTO;
import com.example.order_service.dto.RestaurantDTO;
import com.example.order_service.dto.UpdateCartItemRequest;
import com.example.order_service.entity.Cart;
import com.example.order_service.entity.CartItem;
import com.example.order_service.exception.CartRestaurantMismatchException;
import com.example.order_service.exception.FoodItemNotFoundException;
import com.example.order_service.exception.FoodItemUnavailableException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartPersistenceService cartPersistenceService;

    @Mock
    private RestaurantServiceClient restaurantServiceClient;

    @InjectMocks
    private CartService cartService;

    @Test
    void getCart_empty_returnsEmptyDtoWithoutRemoteCalls() {
        when(cartPersistenceService.findCartWithItems("kc-1")).thenReturn(Optional.empty());

        CartDTO result = cartService.getCart("kc-1");

        assertNull(result.id());
        assertEquals("kc-1", result.userId());
        assertTrue(result.items().isEmpty());
        assertEquals(0, result.totalItems());
        assertEquals(BigDecimal.ZERO, result.subtotal());
        verifyNoInteractions(restaurantServiceClient);
    }

    @Test
    void getCart_populated_fetchesRestaurantMenuOnceAndCalculatesSubtotal() {
        Cart cart = Cart.builder()
                .id(1L)
                .userId("kc-1")
                .restaurantId(10L)
                .updatedAt(LocalDateTime.now())
                .build();
        cart.getItems().add(CartItem.builder().id(11L).cart(cart).foodItemId(101L).quantity(2).build());
        cart.getItems().add(CartItem.builder().id(12L).cart(cart).foodItemId(102L).quantity(1).build());

        when(cartPersistenceService.findCartWithItems("kc-1")).thenReturn(Optional.of(cart));
        when(restaurantServiceClient.getFoodItemsMap(10L)).thenReturn(Map.of(
                101L, new FoodItemDTO(101L, 10L, 1L, "Burger", "Juicy", new BigDecimal("8.50"), "img1", true),
                102L, new FoodItemDTO(102L, 10L, 1L, "Fries", "Crispy", new BigDecimal("3.00"), "img2", true)
        ));

        CartDTO result = cartService.getCart("kc-1");

        assertEquals(10L, result.restaurantId());
        assertEquals(3, result.totalItems());
        assertEquals(new BigDecimal("20.00"), result.subtotal());
        assertEquals(2, result.items().size());
        verify(restaurantServiceClient, times(1)).getFoodItemsMap(10L);
        verify(restaurantServiceClient, never()).getFoodItem(anyLong(), anyLong());
    }

    @Test
    void addItem_validItem_persistsAndEnrichesInSingleMenuFetch() {
        AddToCartRequest request = new AddToCartRequest(10L, 101L, 2);
        RestaurantDTO restaurant = new RestaurantDTO(10L, "Bistro", true, true);
        FoodItemDTO burger = new FoodItemDTO(101L, 10L, 1L, "Burger", "Juicy", new BigDecimal("9.00"), "img", true);

        Cart savedCart = Cart.builder().id(5L).userId("kc-1").restaurantId(10L).build();
        savedCart.getItems().add(CartItem.builder().id(15L).cart(savedCart).foodItemId(101L).quantity(2).build());

        when(restaurantServiceClient.getRestaurant(10L)).thenReturn(restaurant);
        when(restaurantServiceClient.getFoodItemsMap(10L)).thenReturn(Map.of(101L, burger));
        when(cartPersistenceService.addOrIncrementItem("kc-1", 10L, 101L, 2)).thenReturn(savedCart);

        CartDTO result = cartService.addItem("kc-1", request);

        assertEquals(5L, result.id());
        assertEquals(2, result.totalItems());
        assertEquals(new BigDecimal("18.00"), result.subtotal());
        assertEquals("Burger", result.items().get(0).name());
        verify(restaurantServiceClient, times(1)).getFoodItemsMap(10L);
    }

    @Test
    void addItem_unavailableFoodItem_throwsConflictWithoutPersisting() {
        AddToCartRequest request = new AddToCartRequest(10L, 101L, 1);
        when(restaurantServiceClient.getRestaurant(10L))
                .thenReturn(new RestaurantDTO(10L, "Bistro", true, true));
        when(restaurantServiceClient.getFoodItemsMap(10L)).thenReturn(Map.of(
                101L, new FoodItemDTO(101L, 10L, 1L, "Burger", "Sold out", new BigDecimal("9.00"), "img", false)
        ));

        assertThrows(FoodItemUnavailableException.class, () -> cartService.addItem("kc-1", request));
        verifyNoInteractions(cartPersistenceService);
    }

    @Test
    void addItem_missingFoodItem_throwsNotFound() {
        AddToCartRequest request = new AddToCartRequest(10L, 999L, 1);
        when(restaurantServiceClient.getRestaurant(10L))
                .thenReturn(new RestaurantDTO(10L, "Bistro", true, true));
        when(restaurantServiceClient.getFoodItemsMap(10L)).thenReturn(Map.of());

        assertThrows(FoodItemNotFoundException.class, () -> cartService.addItem("kc-1", request));
        verifyNoInteractions(cartPersistenceService);
    }

    @Test
    void addItem_differentRestaurant_propagatesMismatchException() {
        AddToCartRequest request = new AddToCartRequest(20L, 201L, 1);
        when(restaurantServiceClient.getRestaurant(20L))
                .thenReturn(new RestaurantDTO(20L, "Pizza Place", true, true));
        when(restaurantServiceClient.getFoodItemsMap(20L)).thenReturn(Map.of(
                201L, new FoodItemDTO(201L, 20L, 1L, "Pizza", "Cheese", new BigDecimal("12.00"), "img", true)
        ));
        when(cartPersistenceService.addOrIncrementItem("kc-1", 20L, 201L, 1))
                .thenThrow(new CartRestaurantMismatchException(10L, 20L));

        assertThrows(CartRestaurantMismatchException.class, () -> cartService.addItem("kc-1", request));
    }

    @Test
    void updateItemQuantity_updatesAndEnriches() {
        Cart updated = Cart.builder().id(5L).userId("kc-1").restaurantId(10L).build();
        updated.getItems().add(CartItem.builder().id(15L).cart(updated).foodItemId(101L).quantity(4).build());

        when(cartPersistenceService.updateItemQuantity("kc-1", 101L, 4)).thenReturn(updated);
        when(restaurantServiceClient.getFoodItemsMap(10L)).thenReturn(Map.of(
                101L, new FoodItemDTO(101L, 10L, 1L, "Burger", "Juicy", new BigDecimal("5.00"), "img", true)
        ));

        CartDTO result = cartService.updateItemQuantity("kc-1", 101L, new UpdateCartItemRequest(4));

        assertEquals(4, result.totalItems());
        assertEquals(new BigDecimal("20.00"), result.subtotal());
    }

    @Test
    void removeItem_lastItem_returnsEmptyWithoutRemoteCalls() {
        when(cartPersistenceService.removeItem("kc-1", 101L)).thenReturn(Optional.empty());

        CartDTO result = cartService.removeItem("kc-1", 101L);

        assertTrue(result.items().isEmpty());
        assertEquals(0, result.totalItems());
        verifyNoInteractions(restaurantServiceClient);
    }

    @Test
    void clearCart_delegatesToPersistenceService() {
        cartService.clearCart("kc-1");
        verify(cartPersistenceService).clearCart("kc-1");
    }
}
