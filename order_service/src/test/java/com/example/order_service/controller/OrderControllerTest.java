package com.example.order_service.controller;

import com.example.order_service.config.SecurityConfig;
import com.example.order_service.dto.CreateOrderDTO;
import com.example.order_service.dto.OrderConfirmationResponse;
import com.example.order_service.dto.OrderItemResponse;
import com.example.order_service.enums.OrderStatus;
import com.example.order_service.enums.PaymentStatus;
import com.example.order_service.exception.EmptyCartException;
import com.example.order_service.exception.GlobalExceptionHandler;
import com.example.order_service.service.OrderService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    @DisplayName("POST /api/orders creates order from cart for authenticated customer")
    void createOrder_fromCart_returnsCreated() throws Exception {
        OrderConfirmationResponse response = new OrderConfirmationResponse(
                1L,
                "QM-ORDER123",
                "kc-user-123",
                10L,
                OrderStatus.PENDING,
                PaymentStatus.PENDING,
                new BigDecimal("20.00"),
                new BigDecimal("2.99"),
                new BigDecimal("22.99"),
                42L,
                List.of(new OrderItemResponse(5L, 101L, 2, new BigDecimal("10.00"), new BigDecimal("20.00"))),
                LocalDateTime.now()
        );

        when(orderService.createOrder(eq("kc-user-123"), eq("user@example.com"), any(CreateOrderDTO.class)))
                .thenReturn(response);

        String body = """
                {
                    "deliveryAddressId": 42,
                    "deliveryAddress": {
                        "label": "Home",
                        "street": "123 Main St",
                        "city": "Dhaka",
                        "state": "Dhaka",
                        "postalCode": "1200",
                        "country": "BD",
                        "recipientName": "Sefaul",
                        "recipientPhoneNumber": "01700000000",
                        "deliveryInstructions": "Leave at door"
                    }
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .with(jwt()
                                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                                .jwt(j -> j.subject("kc-user-123").claim("email", "user@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber").value("QM-ORDER123"))
                .andExpect(jsonPath("$.totalAmount").value(22.99))
                .andExpect(jsonPath("$.items[0].foodItemId").value(101));
    }

    @Test
    @DisplayName("POST /api/orders returns 400 when cart is empty")
    void createOrder_emptyCart_returns400() throws Exception {
        when(orderService.createOrder(eq("kc-user-123"), eq("user@example.com"), any(CreateOrderDTO.class)))
                .thenThrow(new EmptyCartException("Cannot create an order from an empty cart"));

        String body = """
                {
                    "deliveryAddress": {
                        "street": "123 Main St",
                        "city": "Dhaka",
                        "postalCode": "1200",
                        "recipientPhoneNumber": "01700000000"
                    }
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .with(jwt()
                                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                                .jwt(j -> j.subject("kc-user-123").claim("email", "user@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/orders returns 400 when deliveryAddress is missing")
    void createOrder_missingAddress_returns400() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .with(jwt()
                                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                                .jwt(j -> j.subject("kc-user-123").claim("email", "user@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.deliveryAddress").exists());
    }

    @Test
    @DisplayName("GET /api/orders/{orderId} returns 401 without JWT")
    void getOrder_noJwt_returns401() throws Exception {
        mockMvc.perform(get("/api/orders/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/orders/my returns authenticated user's orders and statuses")
    void getMyOrders_returnsOrdersList() throws Exception {
        OrderConfirmationResponse order = new OrderConfirmationResponse(
                1L,
                "QM-ORDER123",
                "kc-user-123",
                10L,
                OrderStatus.PREPARING,
                PaymentStatus.PENDING,
                new BigDecimal("20.00"),
                new BigDecimal("2.99"),
                new BigDecimal("22.99"),
                42L,
                List.of(new OrderItemResponse(5L, 101L, 2, new BigDecimal("10.00"), new BigDecimal("20.00"))),
                LocalDateTime.now()
        );

        when(orderService.getOrdersByUser("kc-user-123")).thenReturn(List.of(order));

        mockMvc.perform(get("/api/orders/my")
                        .with(jwt().jwt(j -> j.subject("kc-user-123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderNumber").value("QM-ORDER123"))
                .andExpect(jsonPath("$[0].status").value("PREPARING"))
                .andExpect(jsonPath("$[0].totalAmount").value(22.99));
    }

    @Test
    @DisplayName("GET /api/orders/my returns 401 without JWT")
    void getMyOrders_noJwt_returns401() throws Exception {
        mockMvc.perform(get("/api/orders/my"))
                .andExpect(status().isUnauthorized());
    }
}
