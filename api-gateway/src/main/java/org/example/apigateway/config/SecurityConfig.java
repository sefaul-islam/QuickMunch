package org.example.apigateway.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {



    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http
    , UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors-> cors
                        .configurationSource(urlBasedCorsConfigurationSource))
                .sessionManagement(session->
                        session.sessionCreationPolicy((
                                SessionCreationPolicy
                                .STATELESS))
                )
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/actuator/health").permitAll()
                        .anyRequest().permitAll()
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->{}));
        return http.build();
    }
}
