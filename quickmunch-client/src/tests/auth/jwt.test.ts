import { describe, it, expect } from 'vitest';
import {
  decodeJwt,
  isTokenExpired,
  normalizeRole,
  extractRealmRoles,
  extractAppRoles,
  type KeycloakTokenPayload,
} from '../../auth/jwt';

// Helper to construct mock JWT strings
function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payloadStr = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const signature = 'mock-signature';
  return `${header}.${payloadStr}.${signature}`;
}

describe('JWT Token Decoder & Role Normalization', () => {
  describe('decodeJwt', () => {
    it('returns null for null, undefined, empty, or non-string tokens', () => {
      expect(decodeJwt(null)).toBeNull();
      expect(decodeJwt(undefined)).toBeNull();
      expect(decodeJwt('')).toBeNull();
      expect(decodeJwt('   ')).toBeNull();
      // @ts-expect-error test invalid types
      expect(decodeJwt(12345)).toBeNull();
    });

    it('returns null for malformed tokens that do not have 3 parts', () => {
      expect(decodeJwt('only-one-part')).toBeNull();
      expect(decodeJwt('two.parts')).toBeNull();
      expect(decodeJwt('one.two.three.four')).toBeNull();
    });

    it('returns null for tokens with invalid base64 or invalid JSON payload', () => {
      expect(decodeJwt('header.!!!invalid-base64!!!.sig')).toBeNull();
      expect(decodeJwt(`header.${btoa('not-json')}.sig`)).toBeNull();
    });

    it('successfully decodes valid JWT payload', () => {
      const mockPayload: KeycloakTokenPayload = {
        sub: 'usr-456',
        email: 'alex@example.com',
        given_name: 'Alex',
        family_name: 'Smith',
        realm_access: {
          roles: ['CUSTOMER', 'default-roles-quickmunch'],
        },
        exp: Math.floor(Date.now() / 1000) + 300,
      };

      const token = createMockJwt(mockPayload);
      const decoded = decodeJwt(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe('usr-456');
      expect(decoded?.email).toBe('alex@example.com');
      expect(decoded?.given_name).toBe('Alex');
      expect(decoded?.realm_access?.roles).toEqual(['CUSTOMER', 'default-roles-quickmunch']);
    });

    it('handles unicode characters in payload correctly', () => {
      const mockPayload = {
        name: 'Hélène Müller',
        email: 'helene@example.com',
      };
      // Encode as UTF-8 base64
      const json = JSON.stringify(mockPayload);
      const utf8Bytes = new TextEncoder().encode(json);
      let binary = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const b64 = btoa(binary);
      const token = `header.${b64}.sig`;

      const decoded = decodeJwt(token);
      expect(decoded?.name).toBe('Hélène Müller');
    });
  });

  describe('isTokenExpired', () => {
    it('returns true if payload is null or exp claim is missing', () => {
      expect(isTokenExpired(null)).toBe(true);
      expect(isTokenExpired({})).toBe(true);
    });

    it('returns true if token expiration is in the past', () => {
      const expiredPayload: KeycloakTokenPayload = {
        exp: Math.floor(Date.now() / 1000) - 60, // 60 seconds ago
      };
      expect(isTokenExpired(expiredPayload)).toBe(true);
    });

    it('returns false if token expiration is in the future', () => {
      const validPayload: KeycloakTokenPayload = {
        exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes in future
      };
      expect(isTokenExpired(validPayload)).toBe(false);
    });

    it('respects clockToleranceSeconds buffer', () => {
      const almostExpired: KeycloakTokenPayload = {
        exp: Math.floor(Date.now() / 1000) + 10, // 10 seconds in future
      };
      // With 15 seconds clock tolerance, it should be considered expired
      expect(isTokenExpired(almostExpired, 15)).toBe(true);
      // With 5 seconds clock tolerance, it is still valid
      expect(isTokenExpired(almostExpired, 5)).toBe(false);
    });
  });

  describe('normalizeRole', () => {
    it('normalizes CUSTOMER and ROLE_CUSTOMER to CUSTOMER', () => {
      expect(normalizeRole('CUSTOMER')).toBe('CUSTOMER');
      expect(normalizeRole('customer')).toBe('CUSTOMER');
      expect(normalizeRole('ROLE_CUSTOMER')).toBe('CUSTOMER');
      expect(normalizeRole('role_customer')).toBe('CUSTOMER');
    });

    it('normalizes RESTAURANT_OWNER and ROLE_RESTAURANT_OWNER to RESTAURANT_OWNER', () => {
      expect(normalizeRole('RESTAURANT_OWNER')).toBe('RESTAURANT_OWNER');
      expect(normalizeRole('restaurant_owner')).toBe('RESTAURANT_OWNER');
      expect(normalizeRole('ROLE_RESTAURANT_OWNER')).toBe('RESTAURANT_OWNER');
    });

    it('normalizes DELIVERY_MAN and ROLE_DELIVERY_MAN to DELIVERY_MAN', () => {
      expect(normalizeRole('DELIVERY_MAN')).toBe('DELIVERY_MAN');
      expect(normalizeRole('delivery_man')).toBe('DELIVERY_MAN');
      expect(normalizeRole('ROLE_DELIVERY_MAN')).toBe('DELIVERY_MAN');
    });

    it('rejects unsupported roles and aliases', () => {
      expect(normalizeRole('ADMIN')).toBeNull();
      expect(normalizeRole('ROLE_ADMIN')).toBeNull();
      expect(normalizeRole('DELIVERY_RIDER')).toBeNull();
      expect(normalizeRole('ROLE_DELIVERY_RIDER')).toBeNull();
      expect(normalizeRole('UNKNOWN')).toBeNull();
      expect(normalizeRole('')).toBeNull();
      expect(normalizeRole(null)).toBeNull();
      expect(normalizeRole(undefined)).toBeNull();
    });
  });

  describe('extractRealmRoles and extractAppRoles', () => {
    it('extracts raw roles from realm_access.roles', () => {
      const payload: KeycloakTokenPayload = {
        realm_access: {
          roles: ['CUSTOMER', 'offline_access', 'uma_authorization'],
        },
      };
      expect(extractRealmRoles(payload)).toEqual(['CUSTOMER', 'offline_access', 'uma_authorization']);
      expect(extractRealmRoles(null)).toEqual([]);
      expect(extractRealmRoles({})).toEqual([]);
    });

    it('filters and returns only recognized AppRoles in canonical order', () => {
      const raw = ['offline_access', 'ROLE_DELIVERY_MAN', 'CUSTOMER', 'admin-role'];
      const appRoles = extractAppRoles(raw);
      expect(appRoles).toEqual(['CUSTOMER', 'DELIVERY_MAN']);
    });

    it('deduplicates equivalent roles (e.g. CUSTOMER and ROLE_CUSTOMER)', () => {
      const raw = ['CUSTOMER', 'ROLE_CUSTOMER', 'RESTAURANT_OWNER'];
      const appRoles = extractAppRoles(raw);
      expect(appRoles).toEqual(['CUSTOMER', 'RESTAURANT_OWNER']);
    });

    it('returns empty array when user has no recognized roles', () => {
      const raw = ['default-roles-quickmunch', 'offline_access'];
      expect(extractAppRoles(raw)).toEqual([]);
    });
  });
});
