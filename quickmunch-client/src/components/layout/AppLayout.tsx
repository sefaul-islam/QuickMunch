import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { CartDrawer } from '../food/CartDrawer';
import { LocationModal } from '../food/LocationModal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import type { DeliveryAddress } from '../../types';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const savedAddresses = useMemo<DeliveryAddress[]>(() => {
    if (!user?.addresses?.length) return [];
    return user.addresses.map((addr) => ({
      id: String(addr.id),
      label: addr.label || 'Saved Address',
      street: addr.street,
      neighborhood: [addr.city, addr.state].filter(Boolean).join(', ') || addr.street,
    }));
  }, [user]);

  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    currentAddress,
    setCurrentAddress,
    isLocationModalOpen,
    setIsLocationModalOpen,
    toastMessage,
    showToast,
  } = useCart();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const handleCheckout = () => {
    showToast('Order confirmed for single-courier dispatch (Mock)');
    clearCart();
    setIsCartOpen(false);
  };

  const isOwnerDashboard = location.pathname.startsWith('/owner/dashboard');

  if (isOwnerDashboard) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-charcoal font-sans selection:bg-primary selection:text-cream">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal font-sans selection:bg-primary selection:text-cream">
      {/* Shared Navbar */}
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Shared Mobile Drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Route Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Global Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        onCheckout={handleCheckout}
      />

      {/* Delivery Address Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        addresses={savedAddresses}
        currentAddress={currentAddress}
        onSelectAddress={setCurrentAddress}
      />

      {/* Floating Confirmation Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-primary text-cream text-xs font-semibold rounded-xl shadow-editorial border border-primary-light/40"
          >
            <div className="w-5 h-5 rounded-full bg-cream text-primary flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={3} />
            </div>
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="ml-2 text-terracotta underline font-bold hover:text-cream cursor-pointer"
            >
              View Bag
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
