package com.example.order_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.math.BigDecimal;


@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAddress {
    private String label;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String city;

    private String state;

    private String zipCode;

    private String country;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    private String recipientName;

    private String recipientPhoneNumber;

    @Column(length = 500)
    private String deliveryInstructions;
}
