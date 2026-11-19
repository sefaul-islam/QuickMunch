import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AppLayout } from './components/layout/AppLayout';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const RestaurantListingPage = lazy(() =>
  import('./pages/RestaurantListingPage').then((m) => ({ default: m.RestaurantListingPage }))
);
const RestaurantDetailPage = lazy(() =>
  import('./pages/RestaurantDetailPage').then((m) => ({ default: m.RestaurantDetailPage }))
);

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="restaurants" element={<RestaurantListingPage />} />
              <Route path="restaurants/:restaurantId" element={<RestaurantDetailPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
