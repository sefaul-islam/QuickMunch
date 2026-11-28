package com.example.order_service.controller;

import com.example.order_service.config.SecurityConfig;
import com.example.order_service.dto.AddToCartRequest;
import com.example.order_service.dto.CartDTO;
import com.example.order_service.dto.CartItemResponse;
import com.example.order_service.dto.UpdateCartItemRequest;
import com.example.order_service.exception.CartRestaurantMismatchException;
import com.example.order_service.exception.GlobalExceptionHandler;
import com.example.order_service.service.CartService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CartController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CartService cartService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    private CartDTO sampleCart() {
        return new CartDTO(
                1L,
                "kc-user-123",
                10L,
                List.of(new CartItemResponse(
                        11L, 101L, "Burger", "https://img", new BigDecimal("10.00"),
                        2, new BigDecimal("20.00"), true
                )),
                2,
                new BigDecimal("20.00"),
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("GET /api/orders/cart returns 401 without JWT")
    void getCart_noJwt_returns401() throws Exception {
        mockMvc.perform(get("/api/orders/cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/orders/cart returns persisted cart for authenticated user")
    void getCart_withJwt_returnsCart() throws Exception {
        when(cartService.getCart("kc-user-123")).thenReturn(sampleCart());

        mockMvc.perform(get("/api/orders/cart")
                        .with(jwt().jwt(j -> j.subject("kc-user-123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("kc-user-123"))
                .andExpect(jsonPath("$.restaurantId").value(10))
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.subtotal").value(20.00))
                .andExpect(jsonPath("$.items[0].name").value("Burger"));
    }

    @Test
    @DisplayName("POST /api/orders/cart/items adds item and returns updated cart")
    void addItem_validRequest_returnsUpdatedCart() throws Exception {
        when(cartService.addItem(eq("kc-user-123"), any(AddToCartRequest.class)))
                .thenReturn(sampleCart());

        String body = """
                {
                    "restaurantId": 10,
                    "foodItemId": 101,
                    "quantity": 2
                }
                """;

        mockMvc.perform(post("/api/orders/cart/items")
                        .with(jwt().jwt(j -> j.subject("kc-user-123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].foodItemId").value(101));
    }

    @Test
    @DisplayName("POST /api/orders/cart/items returns 400 when quantity < 1")
    void addItem_invalidQuantity_returns400() throws Exception {
        String body = """
                {
                    "restaurantId": 10,
                    "foodItemId": 101,
                    "quantity": 0
                }
                """;

        mockMvc.perform(post("/api/orders/cart/items")
                        .with(jwt().jwt(j -> j.subject("kc-user-123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.quantity").exists());
    }

    @Test
    @DisplayName("POST /api/orders/cart/items returns 409 when switching restaurants without clearing")
    void addItem_differentRestaurant_returns409() throws Exception {
        when(cartService.addItem(eq("kc-user-123"), any(AddToCartRequest.class)))
                .thenThrow(new CartRestaurantMismatchException(10L, 20L));

        String body = """
                {
                    "restaurantId": 20,
                    "foodItemId": 201,
                    "quantity": 1
                }
                """;

        mockMvc.perform(post("/api/orders/cart/items")
                        .with(jwt().jwt(j -> j.subject("kc-user-123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("PUT /api/orders/cart/items/{foodItemId} updates quantity")
    void updateItemQuantity_validRequest_returnsUpdatedCart() throws Exception {
        when(cartService.updateItemQuantity(eq("kc-user-123"), eq(101L), any(UpdateCartItemRequest.class)))
                .thenReturn(sampleCart());

        mockMvc.perform(put("/api/orders/cart/items/101")
                        .with(jwt().jwt(j -> j.subject("kc-user-123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\": 2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(2));
    }

    @Test
    @DisplayName("DELETE /api/orders/cart/items/{foodItemId} removes item")
    void removeItem_returnsUpdatedCart() throws Exception {
        when(cartService.removeItem("kc-user-123", 101L)).thenReturn(CartDTO.empty("kc-user-123"));

        mockMvc.perform(delete("/api/orders/cart/items/101")
                        .with(jwt().jwt(j -> j.subject("kc-user-123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
    }

    @Test
    @DisplayName("DELETE /api/orders/cart clears cart and returns 204")
    void clearCart_returns204() throws Exception {
        doNothing().when(cartService).clearCart("kc-user-123");

        mockMvc.perform(delete("/api/orders/cart")
                        .with(jwt().jwt(j -> j.subject("kc-user-123"))))
                .andExpect(status().isNoContent());
    }
}
