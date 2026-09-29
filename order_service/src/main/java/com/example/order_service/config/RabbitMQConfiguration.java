package com.example.order_service.config;


import org.springframework.amqp.core.DirectExchange;

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



    @Bean
    public DirectExchange orderExchange(){
        return new DirectExchange(orderExchange);
    }

    @Bean
    public MessageConverter jsonMessageConverter(){
        JsonMapper jsonMappeer = JsonMapper.builder()
                .findAndAddModules()
                .build();
        return new JacksonJsonMessageConverter(jsonMappeer);
    }
}
