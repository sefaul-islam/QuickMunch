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
