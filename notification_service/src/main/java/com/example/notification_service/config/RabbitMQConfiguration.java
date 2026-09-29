package com.example.notification_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.json.JsonMapper;

@Configuration
public class RabbitMQConfiguration {

    @Value("${rabbitmq.exchange.order}")
    private String orderExchange;

    @Value("${rabbitmq.queue.order-created}")
    private String orderCreatedQueue;

    @Value("${rabbitmq.queue.order-status-updated}")
    private String orderStatusUpdatedQueue;

    @Value("${rabbitmq.queue.order-cancelled}")
    private String orderCancelledQueue;

    @Value("${rabbitmq.routing-key.order-created}")
    private String orderCreatedRoutingKey;

    @Value("${rabbitmq.routing-key.order-status-updated}")
    private String orderStatusUpdatedRoutingKey;

    @Value("${rabbitmq.routing-key.order-cancelled}")
    private String orderCancelledRoutingKey;

    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange(orderExchange);
    }

    @Bean
    public Queue orderCreatedQueue() {
        return new Queue(orderCreatedQueue);
    }

    @Bean
    public Queue orderStatusUpdatedQueue() {
        return new Queue(orderStatusUpdatedQueue);
    }

    @Bean
    public Queue orderCancelledQueue() {
        return new Queue(orderCancelledQueue);
    }

    @Bean
    public Binding orderCreatedBinding(Queue orderCreatedQueue, DirectExchange orderExchange) {
        return BindingBuilder.bind(orderCreatedQueue).to(orderExchange).with(orderCreatedRoutingKey);
    }

    @Bean
    public Binding orderStatusUpdatedBinding(Queue orderStatusUpdatedQueue, DirectExchange orderExchange) {
        return BindingBuilder.bind(orderStatusUpdatedQueue).to(orderExchange).with(orderStatusUpdatedRoutingKey);
    }

    @Bean
    public Binding orderCancelledBinding(Queue orderCancelledQueue, DirectExchange orderExchange) {
        return BindingBuilder.bind(orderCancelledQueue).to(orderExchange).with(orderCancelledRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        JsonMapper jsonMapper = JsonMapper.builder()
                .findAndAddModules()
                .build();
        return new JacksonJsonMessageConverter(jsonMapper);
    }
}
