package com.example.order_service.config;

import lombok.Value;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.ObjectMapper;

@Configuration
public class RabbitMQConfiguration {

    @Value("${rabbitmq.exchange.order}")
    private String orderExchange;

    @Value("${rabbitmq.queue.order-created}")
    private String orderCreatedQueue;

    @Value("${rabbitmq.routing-key.order-created}")
    private String orderCreatedRoutingKey;

    @Bean
    public DirectExchange orderExchange(){
        return new DirectExchange(orderExchange);
    }

    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper obj){
        return new Jackson2JsonMessageConverter(obj);
    }
}
