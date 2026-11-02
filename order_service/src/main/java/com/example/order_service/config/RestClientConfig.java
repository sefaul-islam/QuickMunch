package com.example.order_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.web.client.RestClient;

@Configuration
@RequiredArgsConstructor
public class RestClientConfig {

    private final OAuth2AuthorizedClientManager authorizedClientManager;

    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder()
                .requestInterceptor(((request, body, execution) -> {


                    OAuth2AuthorizeRequest authorizeRequest =
                            OAuth2AuthorizeRequest
                                    .withClientRegistrationId("keycloak-client")
                                    .principal("order-service")
                                    .build();

                    OAuth2AuthorizedClient client =
                            authorizedClientManager.authorize(authorizeRequest);

                    if (client == null) {
                        throw new IllegalStateException(
                                "Failed to obtain Keycloak service token"
                        );
                    }

                    request.getHeaders().setBearerAuth(
                            client.getAccessToken().getTokenValue()
                    );

                    return execution.execute(request, body);
                }));
    }
}
