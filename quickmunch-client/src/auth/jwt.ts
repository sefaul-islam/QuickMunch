/**
 * QuickMunch JWT Token Decoding & Role Utilities
 *
 * Handles client-side JWT access token payload extraction, safe Base64Url
 * decoding, expiration checks, and explicit Keycloak realm role normalization.
 *
 * NOTE: Client-side decoding is strictly for UI routing and presentation.
 * Cryptographic validation remains enforced by Keycloak and backend microservices.
 */

export interface KeycloakTokenPayload {
  sub?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string | string[];
  [key: string]: unknown;
}

export type AppRole = 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DELIVERY_MAN';

export interface AppRoleConfig {
  id: AppRole;
  name: string;
  path: string;
  description: string;
  badge: string;
}

export const APP_ROLES: Record<AppRole, AppRoleConfig> = {
  CUSTOMER: {
    id: 'CUSTOMER',
    name: 'Customer',
    path: '/customer/dashboard',
    description: 'Order food and manage your orders.',
    badge: 'Customer',
  },
  RESTAURANT_OWNER: {
    id: 'RESTAURANT_OWNER',
    name: 'Restaurant Owner',
    path: '/owner/dashboard',
    description: 'Manage your restaurant, menu, and incoming orders.',
    badge: 'Restaurant Owner',
  },
  DELIVERY_MAN: {
    id: 'DELIVERY_MAN',
    name: 'Delivery Partner',
    path: '/delivery/dashboard',
    description: 'Manage assigned deliveries and delivery tasks.',
    badge: 'Delivery Partner',
  },
};

/**
 * Safely decodes a standard Base64Url JWT payload.
 * Returns null if the token is null, malformed, non-string, or has invalid JSON.
 */
export function decodeJwt(token: string | null | undefined): KeycloakTokenPayload | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3 || !parts[1]) {
    return null;
  }

  try {
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const binary = atob(base64);

    let jsonStr: string;
    if (typeof TextDecoder !== 'undefined') {
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      jsonStr = new TextDecoder('utf-8').decode(bytes);
    } else {
      jsonStr = decodeURIComponent(
        Array.prototype.map
          .call(binary, (ch: string) => '%' + ('00' + ch.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    }

    const payload = JSON.parse(jsonStr);
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    return payload as KeycloakTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Checks if a decoded JWT payload is expired based on the 'exp' claim.
 */
export function isTokenExpired(
  payload: KeycloakTokenPayload | null | undefined,
  clockToleranceSeconds = 0
): boolean {
  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds + clockToleranceSeconds;
}

/**
 * Normalizes a role string to an official AppRole.
 * Explicitly supports CUSTOMER, RESTAURANT_OWNER, and DELIVERY_MAN,
 * including their ROLE_ prefixed equivalents. Unsupported roles return null.
 */
export function normalizeRole(role: unknown): AppRole | null {
  if (typeof role !== 'string') return null;
  const clean = role.trim().toUpperCase();

  switch (clean) {
    case 'CUSTOMER':
    case 'ROLE_CUSTOMER':
      return 'CUSTOMER';
    case 'RESTAURANT_OWNER':
    case 'ROLE_RESTAURANT_OWNER':
      return 'RESTAURANT_OWNER';
    case 'DELIVERY_MAN':
    case 'ROLE_DELIVERY_MAN':
      return 'DELIVERY_MAN';
    default:
      return null;
  }
}

/**
 * Extracts raw realm-level roles from the decoded token payload.
 */
export function extractRealmRoles(payload: KeycloakTokenPayload | null | undefined): string[] {
  if (!payload?.realm_access?.roles || !Array.isArray(payload.realm_access.roles)) {
    return [];
  }
  return payload.realm_access.roles.filter(
    (r): r is string => typeof r === 'string' && r.trim().length > 0
  );
}

/**
 * Filters and normalizes raw realm roles to recognized AppRole values.
 * Returns unique roles in canonical order: CUSTOMER, RESTAURANT_OWNER, DELIVERY_MAN.
 */
export function extractAppRoles(rawRoles: string[]): AppRole[] {
  if (!Array.isArray(rawRoles)) return [];

  const matched = new Set<AppRole>();
  for (const raw of rawRoles) {
    const role = normalizeRole(raw);
    if (role) {
      matched.add(role);
    }
  }

  const canonicalOrder: AppRole[] = ['CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_MAN'];
  return canonicalOrder.filter((r) => matched.has(r));
}
