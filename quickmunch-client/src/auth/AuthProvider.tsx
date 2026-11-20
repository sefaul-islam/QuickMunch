import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { keycloak, initKeycloak, clearKeycloakSession } from './keycloak';
import { AuthContext, type UserProfile, type AuthContextValue } from './AuthContext';
import {
  decodeJwt,
  extractRealmRoles,
  extractAppRoles,
  normalizeRole,
  type AppRole,
} from './jwt';
import { usersApi } from '../api/users';
import { setTokenGetter, setUnauthorizedHandler } from '../api/client';
import { clearUserServerCache } from '../api/queryClient';

const ACTIVE_ROLE_STORAGE_KEY = 'quickmunch_active_role';

// Helper to safely read non-sensitive active role preference from sessionStorage
const getStoredActiveRolePreference = (): AppRole | null => {
  try {
    const raw = sessionStorage.getItem(ACTIVE_ROLE_STORAGE_KEY);
    return raw ? normalizeRole(raw) : null;
  } catch {
    return null;
  }
};

const storeActiveRolePreference = (role: AppRole | null) => {
  try {
    if (role) {
      sessionStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, role);
    } else {
      sessionStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
    }
  } catch {
    // Ignore environments where sessionStorage is unavailable
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [appRoles, setAppRoles] = useState<AppRole[]>([]);
  const [activeRole, setActiveRole] = useState<AppRole | null>(() => getStoredActiveRolePreference());
  const [error, setError] = useState<string | null>(null);

  const isAuthenticatedRef = useRef<boolean>(false);
  const isLoggingOutRef = useRef<boolean>(false);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    isLoggingOutRef.current = isLoggingOut;
  }, [isLoggingOut]);

  // Derives current roles directly from the authenticated Keycloak access token
  const syncRolesFromToken = useCallback((): { rawRoles: string[]; parsedAppRoles: AppRole[] } => {
    const decoded = decodeJwt(keycloak.token);
    const rawRoles = decoded
      ? extractRealmRoles(decoded)
      : (keycloak.tokenParsed?.realm_access?.roles as string[]) || [];

    const parsedAppRoles = extractAppRoles(rawRoles);
    return { rawRoles, parsedAppRoles };
  }, []);

  // Helper to extract fallback profile from Keycloak token parsed claims
  const extractTokenProfile = useCallback((): UserProfile | null => {
    const decoded = decodeJwt(keycloak.token);
    const p = (decoded || keycloak.tokenParsed || {}) as Record<string, unknown>;
    const realmAccess = p.realm_access as { roles?: string[] } | undefined;
    const extractedRoles = realmAccess?.roles || [];

    if (!p.sub && !keycloak.authenticated) return null;

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
    storeActiveRolePreference(null);
    isAuthenticatedRef.current = false;
    setIsAuthenticated(false);
    setUser(null);
    setRoles([]);
    setAppRoles([]);
    setActiveRole(null);
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

  // ONLY intentional way to change activeRole
  const selectRole = useCallback((role: AppRole) => {
    const { parsedAppRoles } = syncRolesFromToken();
    if (parsedAppRoles.includes(role)) {
      setActiveRole(role);
      storeActiveRolePreference(role);
    } else {
      console.warn(`[QuickMunch Auth] Cannot select role ${role}: user does not possess this role in Keycloak token`);
    }
  }, [syncRolesFromToken]);

  const clearActiveRole = useCallback(() => {
    setActiveRole(null);
    storeActiveRolePreference(null);
  }, []);

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

    // 1. Invalidate local React state & cached server queries & stored activeRole
    clearUserServerCache();
    storeActiveRolePreference(null);
    isAuthenticatedRef.current = false;
    setIsAuthenticated(false);
    setUser(null);
    setRoles([]);
    setAppRoles([]);
    setActiveRole(null);
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
        keycloak.updateToken(30)
          .then(() => {
            if (isMounted) {
              // Resynchronize roles on token refresh (handles role revocation or updates)
              const { rawRoles, parsedAppRoles } = syncRolesFromToken();
              setRoles(rawRoles);
              setAppRoles(parsedAppRoles);

              // Validate currently active role against updated claims
              setActiveRole((currentActive) => {
                if (currentActive && parsedAppRoles.includes(currentActive)) {
                  return currentActive;
                }
                if (parsedAppRoles.length === 1) {
                  const single = parsedAppRoles[0];
                  storeActiveRolePreference(single);
                  return single;
                }
                storeActiveRolePreference(null);
                return null;
              });
            }
          })
          .catch(() => {
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

          // Extract roles from authenticated access token
          const { rawRoles, parsedAppRoles } = syncRolesFromToken();
          setRoles(rawRoles);
          setAppRoles(parsedAppRoles);

          // Evaluate active role based on user roles and stored preference
          const storedPreference = getStoredActiveRolePreference();
          if (storedPreference && parsedAppRoles.includes(storedPreference)) {
            // Restore valid stored preference
            setActiveRole(storedPreference);
          } else if (parsedAppRoles.length === 1) {
            // Scenario A: Single role -> Automatically assign active role
            const singleRole = parsedAppRoles[0];
            setActiveRole(singleRole);
            storeActiveRolePreference(singleRole);
          } else {
            // Scenario B (multiple roles) or no recognized roles:
            // Must explicitly select role -> do not auto-select first role
            setActiveRole(null);
            storeActiveRolePreference(null);
          }

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
          setAppRoles([]);
          setActiveRole(null);
          storeActiveRolePreference(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[QuickMunch Auth] Initialization encountered error:', err);
          setError('Authentication initialization failed');
          isAuthenticatedRef.current = false;
          setIsAuthenticated(false);
          setUser(null);
          setRoles([]);
          setAppRoles([]);
          setActiveRole(null);
          storeActiveRolePreference(null);
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
  }, [getAccessToken, extractTokenProfile, handleLocalSessionTermination, syncRolesFromToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      isLoggingOut,
      user,
      roles,
      appRoles,
      activeRole,
      selectRole,
      clearActiveRole,
      login,
      logout,
      getAccessToken,
      refreshProfile,
      error,
    }),
    [
      isAuthenticated,
      isLoading,
      isLoggingOut,
      user,
      roles,
      appRoles,
      activeRole,
      selectRole,
      clearActiveRole,
      login,
      logout,
      getAccessToken,
      refreshProfile,
      error,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
