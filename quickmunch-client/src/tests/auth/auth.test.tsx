import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider } from '../../auth/AuthProvider';
import { useAuth } from '../../hooks/useAuth';
import { keycloak, initKeycloak, clearKeycloakSession } from '../../auth/keycloak';
import { usersApi } from '../../api/users';

vi.mock('../../auth/keycloak', () => {
  const mockKeycloak = {
    authenticated: false,
    token: 'mock-access-token' as string | undefined,
    tokenParsed: {
      sub: 'kc-user-123',
      given_name: 'Elena',
      family_name: 'Rostova',
      email: 'elena@example.com',
      realm_access: { roles: ['ROLE_CUSTOMER'] },
    },
    init: vi.fn(),
    login: vi.fn(),
    logout: vi.fn().mockImplementation(async () => {
      mockKeycloak.authenticated = false;
      mockKeycloak.token = undefined;
    }),
    clearToken: vi.fn().mockImplementation(async () => {
      mockKeycloak.authenticated = false;
      mockKeycloak.token = undefined;
    }),
    updateToken: vi.fn().mockResolvedValue(true),
    onAuthLogout: undefined as (() => void) | undefined,
    onAuthRefreshError: undefined as (() => void) | undefined,
    onTokenExpired: undefined as (() => void) | undefined,
  };

  return {
    keycloak: mockKeycloak,
    initKeycloak: vi.fn(),
    clearKeycloakSession: vi.fn().mockImplementation(async () => {
      mockKeycloak.authenticated = false;
      mockKeycloak.token = undefined;
    }),
    resetKeycloakInit: vi.fn(),
  };
});

vi.mock('../../api/users', () => ({
  usersApi: {
    getCurrentUser: vi.fn(),
  },
}));

const TestConsumer: React.FC = () => {
  const { isAuthenticated, isLoading, isLoggingOut, user, login, logout, getAccessToken } = useAuth();

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="logging-out">{String(isLoggingOut)}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="user">{user ? `${user.firstName} (${user.email})` : 'none'}</div>
      <button onClick={() => login({ redirectUri: 'http://localhost:5173/account' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={async () => {
        const token = await getAccessToken();
        const el = document.getElementById('token-result');
        if (el) el.textContent = token || 'none';
      }}>Get Token</button>
      <span id="token-result"></span>
    </div>
  );
};

describe('Authentication Lifecycle & AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides unauthenticated state when Keycloak returns unauthenticated', async () => {
    vi.mocked(initKeycloak).mockResolvedValue(false);
    keycloak.authenticated = false;

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Initial load finishes
    expect(await screen.findByText('false', { selector: '[data-testid="loading"]' })).toBeDefined();
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('initiates PKCE login with preserved redirect URI when login is called', async () => {
    vi.mocked(initKeycloak).mockResolvedValue(false);
    keycloak.authenticated = false;

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await screen.findByText('false', { selector: '[data-testid="loading"]' });

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(keycloak.login).toHaveBeenCalledWith({
      redirectUri: 'http://localhost:5173/account',
    });
  });

  it('establishes authenticated state and loads user profile on successful authentication', async () => {
    vi.mocked(initKeycloak).mockResolvedValue(true);
    keycloak.authenticated = true;
    vi.mocked(usersApi.getCurrentUser).mockResolvedValue({
      id: 1,
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena@example.com',
      addresses: [],
      roles: ['ROLE_CUSTOMER'],
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(await screen.findByText('true', { selector: '[data-testid="authenticated"]' })).toBeDefined();
    expect(screen.getByTestId('user').textContent).toBe('Elena (elena@example.com)');
  });

  it('clears authenticated state, user profile, and Keycloak session on logout', async () => {
    vi.mocked(initKeycloak).mockResolvedValue(true);
    keycloak.authenticated = true;
    vi.mocked(usersApi.getCurrentUser).mockResolvedValue({
      id: 1,
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena@example.com',
      addresses: [],
      roles: ['ROLE_CUSTOMER'],
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await screen.findByText('true', { selector: '[data-testid="authenticated"]' });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(clearKeycloakSession).toHaveBeenCalled();
    expect(keycloak.logout).toHaveBeenCalled();
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('immediately returns null for getAccessToken once unauthenticated or during logout', async () => {
    vi.mocked(initKeycloak).mockResolvedValue(true);
    keycloak.authenticated = true;
    keycloak.token = 'live-valid-token';

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await screen.findByText('true', { selector: '[data-testid="authenticated"]' });

    // Verify token exists before logout
    await act(async () => {
      screen.getByText('Get Token').click();
    });
    expect(document.getElementById('token-result')?.textContent).toBe('live-valid-token');

    // Trigger logout
    await act(async () => {
      screen.getByText('Logout').click();
    });

    // Token must immediately return null/none
    await act(async () => {
      screen.getByText('Get Token').click();
    });
    expect(document.getElementById('token-result')?.textContent).toBe('none');
  });

  it('handles Keycloak onAuthLogout event by clearing React authentication state', async () => {
    vi.mocked(initKeycloak).mockResolvedValue(true);
    keycloak.authenticated = true;
    vi.mocked(usersApi.getCurrentUser).mockResolvedValue({
      id: 1,
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena@example.com',
      addresses: [],
      roles: ['ROLE_CUSTOMER'],
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await screen.findByText('true', { selector: '[data-testid="authenticated"]' });

    // Simulate keycloak firing onAuthLogout callback (e.g. from session status iframe or token expiry)
    await act(async () => {
      keycloak.onAuthLogout?.();
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('handles initialization failure gracefully without crashing', async () => {
    vi.mocked(initKeycloak).mockRejectedValue(new Error('Keycloak network unreachable'));
    keycloak.authenticated = false;

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(await screen.findByText('false', { selector: '[data-testid="loading"]' })).toBeDefined();
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });
});
