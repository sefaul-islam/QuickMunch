package com.example.order_service.service;

import com.example.order_service.dto.CreateOrderDTO;
import com.example.order_service.dto.DeliveryAddressDTO;
import com.example.order_service.entity.DeliveryAddress;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.enums.OrderStatus;
import com.example.order_service.enums.PaymentStatus;
import com.example.order_service.exception.EmptyCartException;
import com.example.order_service.repository.CartItemRepository;
import com.example.order_service.repository.CartRepository;
import com.example.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderPersistenceService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Value("${order.delivery-fee:2.99}")
    private BigDecimal defaultDeliveryFee;

    @Transactional
    public Order saveOrderAndClearCart(
            String userId,
            Long restaurantId,
            Long cartId,
            CreateOrderDTO dto,
            BigDecimal subtotal,
            List<OrderItem> orderItems
    ) {
        cartItemRepository.deleteAllByCartId(cartId);
        int deletedCarts = cartRepository.deleteCartById(cartId);
        if (deletedCarts == 0) {
            throw new EmptyCartException("Cart is empty or has already been checked out");
        }

        Order order = Order.builder()
                .orderNumber("QM-" + UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 20)
                )
                .userId(userId)
                .restaurantId(restaurantId)
                .deliveryAddressId(dto.deliveryAddressId())
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .deliveryFee(defaultDeliveryFee)
                .totalAmount(subtotal.add(defaultDeliveryFee))
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryAddress(mapToDeliveryAddress(dto.deliveryAddress()))
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        return orderRepository.saveAndFlush(order);
    }

    public DeliveryAddress mapToDeliveryAddress(DeliveryAddressDTO deliveryAddressDTO) {
        return DeliveryAddress.builder()
                .label(deliveryAddressDTO.label())
                .street(deliveryAddressDTO.street())
                .city(deliveryAddressDTO.city())
                .state(deliveryAddressDTO.state())
                .postalCode(deliveryAddressDTO.postalCode())
                .country(deliveryAddressDTO.country())
                .recipientName(deliveryAddressDTO.recipientName())
                .recipientPhoneNumber(deliveryAddressDTO.recipientPhoneNumber())
                .deliveryInstructions(deliveryAddressDTO.deliveryInstructions())
                .build();
    }
}
