import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AppLayout } from './components/layout/AppLayout';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const RestaurantListingPage = lazy(() =>
  import('./pages/RestaurantListingPage').then((m) => ({ default: m.RestaurantListingPage }))
);
const RestaurantDetailPage = lazy(() =>
  import('./pages/RestaurantDetailPage').then((m) => ({ default: m.RestaurantDetailPage }))
);
const AccountPage = lazy(() =>
  import('./pages/AccountPage').then((m) => ({ default: m.AccountPage }))
);

// Role-based Dashboards & Authentication Pages
const RoleSelectionPage = lazy(() =>
  import('./pages/RoleSelectionPage').then((m) => ({ default: m.RoleSelectionPage }))
);
const CustomerDashboardPage = lazy(() =>
  import('./pages/CustomerDashboardPage').then((m) => ({ default: m.CustomerDashboardPage }))
);
const OwnerDashboardPage = lazy(() =>
  import('./pages/OwnerDashboardPage').then((m) => ({ default: m.OwnerDashboardPage }))
);
const DeliveryDashboardPage = lazy(() =>
  import('./pages/DeliveryDashboardPage').then((m) => ({ default: m.DeliveryDashboardPage }))
);
const UnauthorizedPage = lazy(() =>
  import('./pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage }))
);

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    <span className="text-xs text-charcoal-muted font-medium">Loading QuickMunch...</span>
  </div>
);

export function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="restaurants" element={<RestaurantListingPage />} />
                  <Route path="restaurants/:restaurantId" element={<RestaurantDetailPage />} />
                  <Route
                    path="account"
                    element={
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Multi-Role Selection & Role-Specific Dashboards */}
                  <Route
                    path="select-role"
                    element={
                      <ProtectedRoute>
                        <RoleSelectionPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="customer/dashboard"
                    element={
                      <ProtectedRoute requiredRole="CUSTOMER">
                        <CustomerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="owner/dashboard"
                    element={
                      <ProtectedRoute requiredRole="RESTAURANT_OWNER">
                        <OwnerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="delivery/dashboard"
                    element={
                      <ProtectedRoute requiredRole="DELIVERY_MAN">
                        <DeliveryDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Access Restricted */}
                  <Route path="unauthorized" element={<UnauthorizedPage />} />

                  {/* Catch-all fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
