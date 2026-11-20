import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { keycloak, initKeycloak, clearKeycloakSession } from './keycloak';
import { AuthContext, type UserProfile, type AuthContextValue } from './AuthContext';
import { usersApi } from '../api/users';
import { setTokenGetter, setUnauthorizedHandler } from '../api/client';
import { clearUserServerCache } from '../api/queryClient';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticatedRef = useRef<boolean>(false);
  const isLoggingOutRef = useRef<boolean>(false);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    isLoggingOutRef.current = isLoggingOut;
  }, [isLoggingOut]);

  // Helper to extract fallback profile from Keycloak token parsed claims
  const extractTokenProfile = useCallback((): UserProfile | null => {
    if (!keycloak.tokenParsed) return null;
    const p = keycloak.tokenParsed as Record<string, unknown>;
    const realmAccess = p.realm_access as { roles?: string[] } | undefined;
    const extractedRoles = realmAccess?.roles || [];

    return {
      id: (p.sub as string) || 'unknown',
      firstName: (p.given_name as string) || '',
      lastName: (p.family_name as string) || '',
      email: (p.email as string) || '',
      phoneNumber: (p.phone_number as string) || undefined,
      addresses: [],
      roles: extractedRoles,
    };
  }, []);

  // Internal helper to terminate local state and clear Keycloak/QueryClient tokens
  const handleLocalSessionTermination = useCallback(async () => {
    clearUserServerCache();
    isAuthenticatedRef.current = false;
    setIsAuthenticated(false);
    setUser(null);
    setRoles([]);
    setError(null);
    await clearKeycloakSession();
  }, []);

  // Centralized token getter with automatic refresh (30 second validity buffer)
  // Stable reference using isAuthenticatedRef to prevent triggering re-mount loops
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!isAuthenticatedRef.current || isLoggingOutRef.current || !keycloak.authenticated) {
      return null;
    }

    try {
      // updateToken(30) checks if the token expires within 30 seconds; if so, refreshes it
      await keycloak.updateToken(30);
      return keycloak.token || null;
    } catch (err) {
      console.warn('[QuickMunch Auth] Token refresh failed, session may be expired:', err);
      await handleLocalSessionTermination();
      return null;
    }
  }, [handleLocalSessionTermination]);

  // Fetch or refresh user profile from user-service GET /api/users/me
  const refreshProfile = useCallback(async () => {
    if (!keycloak.authenticated || isLoggingOutRef.current) {
      setUser(null);
      return;
    }

    try {
      const profile = await usersApi.getCurrentUser();
      setUser(profile);
      setError(null);
    } catch (err) {
      console.warn('[QuickMunch Auth] Failed to fetch profile from /api/users/me, using token claims fallback:', err);
      // Resilient fallback to Keycloak token claims when backend is unreachable or local
      const fallback = extractTokenProfile();
      if (fallback) {
        setUser(fallback);
      }
    }
  }, [extractTokenProfile]);

  // Login via Keycloak Authorization Code Flow with PKCE
  const login = useCallback(async (options?: { redirectUri?: string }) => {
    if (isLoggingOutRef.current) return;
    const redirectUri = options?.redirectUri || window.location.origin + window.location.pathname + window.location.search;
    await keycloak.login({ redirectUri });
  }, []);

  // Logout via Keycloak OIDC session termination
  const logout = useCallback(async (options?: { redirectUri?: string }) => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setIsLoggingOut(true);

    const redirectUri = options?.redirectUri || window.location.origin + '/';

    // 1. Invalidate local React state & cached server queries
    clearUserServerCache();
    isAuthenticatedRef.current = false;
    setIsAuthenticated(false);
    setUser(null);
    setRoles([]);
    setError(null);

    // 2. Delegate to Keycloak OIDC session termination BEFORE clearing in-memory idToken,
    // so keycloak-js can include the required id_token_hint parameter for zero-prompt logout.
    try {
      await keycloak.logout({ redirectUri });
    } catch (err) {
      console.warn('[QuickMunch Auth] Keycloak logout redirect encountered error, using location.replace:', err);
      window.location.replace(redirectUri);
    } finally {
      await clearKeycloakSession();
    }
  }, []);

  // Initialize Keycloak once on mount, register event listeners and wire up API client interceptors
  useEffect(() => {
    let isMounted = true;

    // Register token getter with centralized API client
    setTokenGetter(getAccessToken);
    setUnauthorizedHandler(() => {
      // 401 callback from API client
      if (isMounted) {
        console.warn('[QuickMunch Auth] Session invalidated by 401 response');
        handleLocalSessionTermination();
      }
    });

    // Register Keycloak event listeners for external/lifecycle session changes
    keycloak.onAuthLogout = () => {
      if (isMounted) {
        console.log('[QuickMunch Auth] Keycloak onAuthLogout event received');
        handleLocalSessionTermination();
      }
    };

    keycloak.onAuthRefreshError = () => {
      if (isMounted) {
        console.warn('[QuickMunch Auth] Keycloak onAuthRefreshError event received');
        handleLocalSessionTermination();
      }
    };

    keycloak.onTokenExpired = () => {
      if (isMounted && !isLoggingOutRef.current) {
        keycloak.updateToken(30).catch(() => {
          console.warn('[QuickMunch Auth] Keycloak token expired and could not be refreshed');
          handleLocalSessionTermination();
        });
      }
    };

    const initAuth = async () => {
      try {
        const authenticated = await initKeycloak();
        if (!isMounted) return;

        if (authenticated) {
          isAuthenticatedRef.current = true;
          setIsAuthenticated(true);
          const parsedRoles = (keycloak.tokenParsed?.realm_access as { roles?: string[] })?.roles || [];
          setRoles(parsedRoles);

          // Retrieve user profile
          try {
            const profile = await usersApi.getCurrentUser();
            if (isMounted) setUser(profile);
          } catch {
            if (isMounted) {
              const fallback = extractTokenProfile();
              if (fallback) setUser(fallback);
            }
          }
        } else {
          isAuthenticatedRef.current = false;
          setIsAuthenticated(false);
          setUser(null);
          setRoles([]);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[QuickMunch Auth] Initialization encountered error:', err);
          setError('Authentication initialization failed');
          isAuthenticatedRef.current = false;
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      keycloak.onAuthLogout = undefined;
      keycloak.onAuthRefreshError = undefined;
      keycloak.onTokenExpired = undefined;
    };
  }, [getAccessToken, extractTokenProfile, handleLocalSessionTermination]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      isLoggingOut,
      user,
      roles,
      login,
      logout,
      getAccessToken,
      refreshProfile,
      error,
    }),
    [isAuthenticated, isLoading, isLoggingOut, user, roles, login, logout, getAccessToken, refreshProfile, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
