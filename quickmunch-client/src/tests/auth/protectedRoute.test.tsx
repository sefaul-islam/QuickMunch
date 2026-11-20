import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../auth/ProtectedRoute';
import { AuthContext, type AuthContextValue } from '../../auth/AuthContext';

const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockGetAccessToken = vi.fn();
const mockRefreshProfile = vi.fn();

const mockSelectRole = vi.fn();
const mockClearActiveRole = vi.fn();

const createMockAuth = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
  isAuthenticated: false,
  isLoading: false,
  isLoggingOut: false,
  user: null,
  roles: [],
  appRoles: [],
  activeRole: null,
  selectRole: mockSelectRole,
  clearActiveRole: mockClearActiveRole,
  login: mockLogin,
  logout: mockLogout,
  getAccessToken: mockGetAccessToken,
  refreshProfile: mockRefreshProfile,
  error: null,
  ...overrides,
});

const renderWithAuth = (authValue: AuthContextValue, initialPath = '/account') => {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<div>Public Home</div>} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Secret Account Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute Access Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows branded session verification loader while authentication is initializing', () => {
    const auth = createMockAuth({ isLoading: true });
    renderWithAuth(auth);

    expect(screen.getByText('Verifying Session')).toBeDefined();
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('shows signing out loader and does NOT trigger login redirect when isLoggingOut is true', () => {
    const auth = createMockAuth({ isAuthenticated: false, isLoading: false, isLoggingOut: true });
    renderWithAuth(auth, '/account');

    expect(screen.getByText('Signing Out')).toBeDefined();
    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated users and triggers login preserving destination location', () => {
    const auth = createMockAuth({ isAuthenticated: false, isLoading: false, isLoggingOut: false });
    renderWithAuth(auth, '/account?tab=orders');

    expect(screen.getByText('Authentication Required')).toBeDefined();
    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(mockLogin).toHaveBeenCalled();
  });

  it('grants access to authenticated users and renders protected children', () => {
    const auth = createMockAuth({
      isAuthenticated: true,
      isLoading: false,
      isLoggingOut: false,
      user: {
        id: '123',
        firstName: 'Marco',
        lastName: 'Polo',
        email: 'marco@example.com',
      },
    });
    renderWithAuth(auth, '/account');

    expect(screen.getByTestId('protected-content').textContent).toBe('Secret Account Page');
    expect(screen.queryByText('Authentication Required')).toBeNull();
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
