import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { AuthContext, type AuthContextValue } from '../../auth/AuthContext';
import { ProtectedRoute } from '../../auth/ProtectedRoute';
import { RoleSelectionPage } from '../../pages/RoleSelectionPage';
import { CustomerDashboardPage } from '../../pages/CustomerDashboardPage';
import { OwnerDashboardPage } from '../../pages/OwnerDashboardPage';
import { DeliveryDashboardPage } from '../../pages/DeliveryDashboardPage';
import { UnauthorizedPage } from '../../pages/UnauthorizedPage';
import type { AppRole } from '../../auth/jwt';

const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockGetAccessToken = vi.fn();
const mockRefreshProfile = vi.fn();
const mockSelectRole = vi.fn();
const mockClearActiveRole = vi.fn();

const createMockAuth = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
  isAuthenticated: true,
  isLoading: false,
  isLoggingOut: false,
  user: {
    id: 'user-789',
    firstName: 'Jordan',
    lastName: 'Lee',
    email: 'jordan@quickmunch.com',
  },
  roles: ['CUSTOMER'],
  appRoles: ['CUSTOMER'],
  activeRole: 'CUSTOMER',
  selectRole: mockSelectRole,
  clearActiveRole: mockClearActiveRole,
  login: mockLogin,
  logout: mockLogout,
  getAccessToken: mockGetAccessToken,
  refreshProfile: mockRefreshProfile,
  error: null,
  ...overrides,
});

const renderWithTestRoutes = (authValue: AuthContextValue, initialPath = '/select-role') => {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<div>Public Home</div>} />
          <Route
            path="/select-role"
            element={
              <ProtectedRoute>
                <RoleSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute requiredRole="RESTAURANT_OWNER">
                <OwnerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/dashboard"
            element={
              <ProtectedRoute requiredRole="DELIVERY_MAN">
                <DeliveryDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Multi-Role Authentication & Role-Based Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('Scenario A: Single-Role Users (Automatic Redirection)', () => {
    it('automatically selects and redirects a CUSTOMER-only user to customer dashboard', async () => {
      const auth = createMockAuth({
        appRoles: ['CUSTOMER'],
        activeRole: null,
      });

      renderWithTestRoutes(auth, '/select-role');

      expect(mockSelectRole).toHaveBeenCalledWith('CUSTOMER');
      expect(await screen.findByText('Welcome back, Jordan!')).toBeDefined();
    });

    it('automatically selects and redirects a RESTAURANT_OWNER-only user to owner dashboard', async () => {
      const auth = createMockAuth({
        appRoles: ['RESTAURANT_OWNER'],
        activeRole: 'RESTAURANT_OWNER',
      });

      renderWithTestRoutes(auth, '/owner/dashboard');

      expect(screen.getByText('Kitchen Command Center')).toBeDefined();
      expect(screen.queryByText('Switch Role')).toBeNull(); // Single-role users don't see switch button
    });

    it('automatically selects and redirects a DELIVERY_MAN-only user to delivery dashboard', async () => {
      const auth = createMockAuth({
        appRoles: ['DELIVERY_MAN'],
        activeRole: 'DELIVERY_MAN',
      });

      renderWithTestRoutes(auth, '/delivery/dashboard');

      expect(screen.getByText('Delivery Dispatch Hub')).toBeDefined();
      expect(screen.queryByText('Switch Role')).toBeNull();
    });
  });

  describe('Scenario B: Multi-Role Users (Role Selection Page)', () => {
    it('displays exactly two role cards for a user with CUSTOMER and RESTAURANT_OWNER', () => {
      const auth = createMockAuth({
        appRoles: ['CUSTOMER', 'RESTAURANT_OWNER'],
        activeRole: null,
      });

      renderWithTestRoutes(auth, '/select-role');

      expect(screen.getByText('Choose how you want to use QuickMunch today.')).toBeDefined();
      expect(screen.getByTestId('role-card-CUSTOMER')).toBeDefined();
      expect(screen.getByTestId('role-card-RESTAURANT_OWNER')).toBeDefined();
      expect(screen.queryByTestId('role-card-DELIVERY_MAN')).toBeNull();
      expect(mockSelectRole).not.toHaveBeenCalled(); // Must NOT auto-select
    });

    it('displays all three role cards for a user with CUSTOMER, RESTAURANT_OWNER, and DELIVERY_MAN', () => {
      const auth = createMockAuth({
        appRoles: ['CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_MAN'],
        activeRole: null,
      });

      renderWithTestRoutes(auth, '/select-role');

      expect(screen.getByTestId('role-card-CUSTOMER')).toBeDefined();
      expect(screen.getByTestId('role-card-RESTAURANT_OWNER')).toBeDefined();
      expect(screen.getByTestId('role-card-DELIVERY_MAN')).toBeDefined();
      expect(mockSelectRole).not.toHaveBeenCalled();
    });

    it('invokes selectRole when user clicks a role card on the selection page', async () => {
      const auth = createMockAuth({
        appRoles: ['CUSTOMER', 'RESTAURANT_OWNER'],
        activeRole: null,
      });

      renderWithTestRoutes(auth, '/select-role');

      const ownerBtn = screen.getByText('Continue as Restaurant Owner');
      await act(async () => {
        ownerBtn.click();
      });

      expect(mockSelectRole).toHaveBeenCalledWith('RESTAURANT_OWNER');
    });
  });

  describe('Role-Based Route Protection & Guard Invariants', () => {
    it('blocks access and redirects to /unauthorized when user lacks the required role', async () => {
      // User only has CUSTOMER role, but manually tries to access /owner/dashboard
      const auth = createMockAuth({
        appRoles: ['CUSTOMER'],
        activeRole: 'CUSTOMER',
      });

      renderWithTestRoutes(auth, '/owner/dashboard');

      expect(await screen.findByText('Access Restricted')).toBeDefined();
      expect(screen.getByText(/You do not have the required role/)).toBeDefined();
      expect(screen.queryByText('Kitchen Command Center')).toBeNull();
    });

    it('NEVER automatically changes activeRole when accessing another dashboard: redirects to /select-role', async () => {
      // User HAS both CUSTOMER and RESTAURANT_OWNER permissions.
      // But activeRole is currently set to CUSTOMER.
      // User manually visits /owner/dashboard.
      const auth = createMockAuth({
        appRoles: ['CUSTOMER', 'RESTAURANT_OWNER'],
        activeRole: 'CUSTOMER',
      });

      renderWithTestRoutes(auth, '/owner/dashboard');

      // Crucial requirement: ProtectedRoute must NEVER automatically change activeRole!
      expect(mockSelectRole).not.toHaveBeenCalled();

      // Instead, redirects user to /select-role to explicitly switch their active role
      expect(await screen.findByText('Choose how you want to use QuickMunch today.')).toBeDefined();
      expect(screen.queryByText('Kitchen Command Center')).toBeNull();
    });

    it('redirects user with 0 recognized application roles to /unauthorized', async () => {
      const auth = createMockAuth({
        appRoles: [],
        activeRole: null,
      });

      renderWithTestRoutes(auth, '/customer/dashboard');

      expect(await screen.findByText('Access Restricted')).toBeDefined();
    });
  });

  describe('Session Storage Persistence & Invalidation', () => {
    it('restores stored activeRole only if it still exists in user token roles', () => {
      sessionStorage.setItem('quickmunch_active_role', 'RESTAURANT_OWNER');

      // Authenticated user possesses RESTAURANT_OWNER -> valid restoration
      const auth = createMockAuth({
        appRoles: ['CUSTOMER', 'RESTAURANT_OWNER'],
        activeRole: 'RESTAURANT_OWNER',
      });

      renderWithTestRoutes(auth, '/owner/dashboard');
      expect(screen.getByText('Kitchen Command Center')).toBeDefined();
    });

    it('renders Switch Role button on dashboards when user has multiple roles', () => {
      const auth = createMockAuth({
        appRoles: ['CUSTOMER', 'RESTAURANT_OWNER'],
        activeRole: 'CUSTOMER',
      });

      renderWithTestRoutes(auth, '/customer/dashboard');

      const switchBtn = screen.getByText('Switch Role');
      expect(switchBtn).toBeDefined();
    });
  });
});
