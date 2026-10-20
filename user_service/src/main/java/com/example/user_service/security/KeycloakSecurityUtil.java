package com.example.user_service.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Utility class to extract Keycloak-specific claims from the current
 * {@link Authentication} (expected to be a {@link JwtAuthenticationToken}).
 */
public final class KeycloakSecurityUtil {

    private KeycloakSecurityUtil() {
        // utility class
    }

    /**
     * Extracts the Keycloak subject identifier ({@code sub} claim) from the JWT.
     */
    public static String getKeycloakId(Authentication authentication) {
        return getJwt(authentication).getSubject();
    }

    /**
     * Extracts the user's email from the {@code email} claim.
     */
    public static String getEmail(Authentication authentication) {
        return getJwt(authentication).getClaimAsString("email");
    }

    /**
     * Extracts the user's preferred username from the {@code preferred_username} claim.
     */
    public static String getPreferredUsername(Authentication authentication) {
        return getJwt(authentication).getClaimAsString("preferred_username");
    }

    /**
     * Extracts the user's first name from the {@code given_name} claim.
     */
    public static String getGivenName(Authentication authentication) {
        return getJwt(authentication).getClaimAsString("given_name");
    }

    /**
     * Extracts the user's last name from the {@code family_name} claim.
     */
    public static String getFamilyName(Authentication authentication) {
        return getJwt(authentication).getClaimAsString("family_name");
    }

    /**
     * Extracts the full name from the {@code name} claim.
     */
    public static String getFullName(Authentication authentication) {
        return getJwt(authentication).getClaimAsString("name");
    }

    /**
     * Returns the set of granted authority names (e.g., {@code ROLE_CUSTOMER}).
     */
    public static Set<String> getRoles(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
    }

    /**
     * Extracts realm-level roles directly from the JWT {@code realm_access.roles} claim.
     */
    @SuppressWarnings("unchecked")
    public static Set<String> getRealmRoles(Authentication authentication) {
        Jwt jwt = getJwt(authentication);
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess == null) {
            return Collections.emptySet();
        }
        Object rolesObj = realmAccess.get("roles");
        if (!(rolesObj instanceof List<?> roles)) {
            return Collections.emptySet();
        }
        return roles.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .collect(Collectors.toSet());
    }

    private static Jwt getJwt(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken();
        }
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt;
        }
        throw new IllegalArgumentException(
                "Expected JwtAuthenticationToken but got: " + authentication.getClass().getName());
    }
}
