import Keycloak from 'keycloak-js';

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

export const keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'quickmunch',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'quickmunch-client',
};

// Singleton Keycloak instance
export const keycloak = new Keycloak(keycloakConfig);

// Module-level initialization promise to guarantee single execution (React 19 / StrictMode safe)
let initPromise: Promise<boolean> | null = null;

export const initKeycloak = (): Promise<boolean> => {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        flow: 'standard',
        checkLoginIframe: false,
        enableLogging: Boolean(import.meta.env.DEV),
      });

      return Boolean(authenticated);
    } catch (err) {
      // Gracefully handle Keycloak connection or initialization failures
      // The application continues in unauthenticated browsing mode
      console.warn(
        '[QuickMunch Auth] Keycloak initialization failed or server is unreachable. Continuing in guest mode.',
        err
      );
      return false;
    }
  })();

  return initPromise;
};

/**
 * Resets the initialization promise so subsequent authentications or check-sso operations
 * re-query Keycloak rather than returning stale resolved state.
 */
export const resetKeycloakInit = (): void => {
  initPromise = null;
};

/**
 * Completely purges in-memory token state from the Keycloak singleton instance.
 * Clears access token, refresh token, idToken, and sets authenticated = false.
 */
export const clearKeycloakSession = async (): Promise<void> => {
  resetKeycloakInit();
  try {
    if (typeof keycloak.clearToken === 'function') {
      await keycloak.clearToken();
    }
  } catch (err) {
    console.warn('[QuickMunch Auth] Error clearing Keycloak token state:', err);
  }
};
