package com.example.order_service.service;

import com.example.order_service.client.RestaurantServiceClient;
import com.example.order_service.client.UserServiceClient;
import com.example.order_service.dto.*;
import com.example.order_service.entity.Cart;
import com.example.order_service.entity.CartItem;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.enums.OrderStatus;
import com.example.order_service.enums.PaymentStatus;
import com.example.order_service.exception.EmptyCartException;
import com.example.order_service.exception.FoodItemNotFoundException;
import com.example.order_service.exception.FoodItemUnavailableException;
import com.example.order_service.message.OrderEventPublisher;
import com.example.order_service.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private RestaurantServiceClient restaurantServiceClient;

    @Mock
    private OrderEventPublisher orderEventPublisher;

    @Mock
    private OrderPersistenceService orderPersistenceService;

    @Mock
    private CartPersistenceService cartPersistenceService;

    @InjectMocks
    private OrderService orderService;

    @Captor
    private ArgumentCaptor<List<OrderItem>> orderItemsCaptor;

    private CreateOrderDTO sampleCreateOrderDto() {
        return new CreateOrderDTO(
                new DeliveryAddressDTO(
                        "Home", "123 Main St", "Dhaka", "Dhaka", "1200",
                        "BD", "Sefaul", "01700000000", "Ring bell"
                ),
                99L
        );
    }

    @Test
    void createOrder_fromCart_calculatesTotalsClearsCartAndPublishesEventWithoutNPlusOne() {
        CreateOrderDTO dto = sampleCreateOrderDto();

        Cart cart = Cart.builder().id(7L).userId("kc-user-1").restaurantId(10L).build();
        cart.getItems().add(CartItem.builder().id(1L).cart(cart).foodItemId(101L).quantity(2).build());
        cart.getItems().add(CartItem.builder().id(2L).cart(cart).foodItemId(102L).quantity(3).build());

        when(userServiceClient.getUserByKeycloakId("kc-user-1"))
                .thenReturn(new UserResponseDTO(1L, "kc-user-1", "user@example.com"));
        when(cartPersistenceService.findCartWithItems("kc-user-1")).thenReturn(Optional.of(cart));
        when(restaurantServiceClient.getRestaurant(10L))
                .thenReturn(new RestaurantDTO(10L, "Bistro", true, true));
        when(restaurantServiceClient.getFoodItemsMap(10L)).thenReturn(Map.of(
                101L, new FoodItemDTO(101L, 10L, 1L, "Burger", "Desc", new BigDecimal("10.00"), null, true),
                102L, new FoodItemDTO(102L, 10L, 1L, "Soda", "Desc", new BigDecimal("2.50"), null, true)
        ));

        Order savedOrder = Order.builder()
                .id(55L)
                .orderNumber("QM-12345")
                .userId("kc-user-1")
                .restaurantId(10L)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .subtotal(new BigDecimal("27.50"))
                .deliveryFee(new BigDecimal("2.99"))
                .totalAmount(new BigDecimal("30.49"))
                .deliveryAddressId(99L)
                .createdAt(LocalDateTime.now())
                .build();
        savedOrder.getItems().add(OrderItem.builder().id(1L).foodItemId(101L).quantity(2)
                .unitPrice(new BigDecimal("10.00")).subtotal(new BigDecimal("20.00")).build());
        savedOrder.getItems().add(OrderItem.builder().id(2L).foodItemId(102L).quantity(3)
                .unitPrice(new BigDecimal("2.50")).subtotal(new BigDecimal("7.50")).build());

        when(orderPersistenceService.saveOrderAndClearCart(
                eq("kc-user-1"), eq(10L), eq(7L), eq(dto), eq(new BigDecimal("27.50")), anyList()
        )).thenReturn(savedOrder);

        OrderConfirmationResponse response = orderService.createOrder("kc-user-1", "user@example.com", dto);

        assertEquals(55L, response.id());
        assertEquals("QM-12345", response.orderNumber());
        assertEquals(new BigDecimal("27.50"), response.subtotal());
        assertEquals(2, response.items().size());

        verify(orderPersistenceService).saveOrderAndClearCart(
                eq("kc-user-1"), eq(10L), eq(7L), eq(dto), eq(new BigDecimal("27.50")), orderItemsCaptor.capture()
        );
        assertEquals(2, orderItemsCaptor.getValue().size());

        verify(restaurantServiceClient, times(1)).getFoodItemsMap(10L);
        verify(restaurantServiceClient, never()).getFoodItem(anyLong(), anyLong());
        verify(orderEventPublisher).publishOrderCreated(savedOrder, "user@example.com");
    }

    @Test
    void createOrder_emptyCart_throwsEmptyCartException() {
        when(userServiceClient.getUserByKeycloakId("kc-user-1"))
                .thenReturn(new UserResponseDTO(1L, "kc-user-1", "user@example.com"));
        when(cartPersistenceService.findCartWithItems("kc-user-1")).thenReturn(Optional.empty());

        assertThrows(EmptyCartException.class,
                () -> orderService.createOrder("kc-user-1", "user@example.com", sampleCreateOrderDto()));

        verifyNoInteractions(restaurantServiceClient, orderPersistenceService, orderEventPublisher);
    }

    @Test
    void createOrder_unavailableCartItem_throwsFoodItemUnavailableException() {
        Cart cart = Cart.builder().id(7L).userId("kc-user-1").restaurantId(10L).build();
        cart.getItems().add(CartItem.builder().id(1L).cart(cart).foodItemId(101L).quantity(1).build());

        when(userServiceClient.getUserByKeycloakId("kc-user-1"))
                .thenReturn(new UserResponseDTO(1L, "kc-user-1", "user@example.com"));
        when(cartPersistenceService.findCartWithItems("kc-user-1")).thenReturn(Optional.of(cart));
        when(restaurantServiceClient.getRestaurant(10L))
                .thenReturn(new RestaurantDTO(10L, "Bistro", true, true));
        when(restaurantServiceClient.getFoodItemsMap(10L)).thenReturn(Map.of(
                101L, new FoodItemDTO(101L, 10L, 1L, "Burger", "Desc", new BigDecimal("10.00"), null, false)
        ));

        assertThrows(FoodItemUnavailableException.class,
                () -> orderService.createOrder("kc-user-1", "user@example.com", sampleCreateOrderDto()));

        verifyNoInteractions(orderPersistenceService, orderEventPublisher);
    }

    @Test
    void createOrder_missingMenuItem_throwsFoodItemNotFoundException() {
        Cart cart = Cart.builder().id(7L).userId("kc-user-1").restaurantId(10L).build();
        cart.getItems().add(CartItem.builder().id(1L).cart(cart).foodItemId(999L).quantity(1).build());

        when(userServiceClient.getUserByKeycloakId("kc-user-1"))
                .thenReturn(new UserResponseDTO(1L, "kc-user-1", "user@example.com"));
        when(cartPersistenceService.findCartWithItems("kc-user-1")).thenReturn(Optional.of(cart));
        when(restaurantServiceClient.getRestaurant(10L))
                .thenReturn(new RestaurantDTO(10L, "Bistro", true, true));
        when(restaurantServiceClient.getFoodItemsMap(10L)).thenReturn(Map.of());

        assertThrows(FoodItemNotFoundException.class,
                () -> orderService.createOrder("kc-user-1", "user@example.com", sampleCreateOrderDto()));

        verifyNoInteractions(orderPersistenceService, orderEventPublisher);
    }
}
