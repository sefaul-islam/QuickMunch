import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, UtensilsCrossed, Home, ShieldCheck, ChevronRight, User, LogOut } from 'lucide-react';
import type { DeliveryAddress } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress?: DeliveryAddress;
  onOpenLocationModal?: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentAddress: controlledAddress,
  onOpenLocationModal: controlledOpenLocationModal,
  onScrollToSection,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useCart();
  const { isAuthenticated, user, login, logout } = useAuth();

  const currentAddress = controlledAddress ?? cart.currentAddress;
  const onOpenLocationModal = controlledOpenLocationModal ?? (() => cart.setIsLocationModalOpen(true));

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavClick = (path: string, sectionId?: string) => {
    onClose();
    if (sectionId && location.pathname === '/') {
      if (onScrollToSection) {
        onScrollToSection(sectionId);
      } else {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
      className="fixed inset-0 top-18 z-30 lg:hidden overflow-y-auto bg-cream-card/95 backdrop-blur-md border-b border-cream-border animate-scale-in"
    >
      <div className="p-5 space-y-5">
        {/* Mobile Location Selector */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenLocationModal();
          }}
          className="w-full flex items-center justify-between p-3.5 bg-cream rounded-xl border border-cream-border cursor-pointer shadow-warm-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Delivery address: ${currentAddress.street}, ${currentAddress.neighborhood}. Click to change.`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-surface text-primary flex items-center justify-center shrink-0">
              <MapPin size={16} />
            </div>
            <div>
              <span className="text-[10px] text-charcoal-muted uppercase font-bold tracking-wider block">
                Delivering to
              </span>
              <span className="text-sm font-semibold text-charcoal">
                {currentAddress.street}, {currentAddress.neighborhood}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-charcoal-muted shrink-0" />
        </button>

        {/* Navigation list */}
        <nav className="space-y-1" aria-label="Mobile route navigation">
          <Link
            to="/"
            onClick={() => onClose()}
            className={`w-full flex items-center justify-between p-3.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              location.pathname === '/' ? 'bg-primary-surface/40 text-primary font-semibold' : 'text-charcoal hover:bg-cream-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home size={18} className="text-primary" />
              <span>Home Discovery</span>
            </div>
            <ChevronRight size={14} className="text-charcoal-muted" />
          </Link>

          <Link
            to="/restaurants"
            onClick={() => onClose()}
            className={`w-full flex items-center justify-between p-3.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              location.pathname === '/restaurants' ? 'bg-primary-surface/40 text-primary font-semibold' : 'text-charcoal hover:bg-cream-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <UtensilsCrossed size={18} className="text-terracotta" />
              <span>All Artisan Kitchens</span>
            </div>
            <ChevronRight size={14} className="text-charcoal-muted" />
          </Link>

          <button
            type="button"
            onClick={() => handleNavClick('/', 'dispatch')}
            className="w-full flex items-center justify-between p-3.5 rounded-lg text-sm font-medium text-charcoal hover:bg-cream-surface transition-colors cursor-pointer text-left min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-primary" />
              <span>Direct Courier Dispatch</span>
            </div>
            <ChevronRight size={14} className="text-charcoal-muted" />
          </button>

          {/* Authentication Actions */}
          <div className="pt-2 border-t border-cream-border/60 space-y-1">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  login();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-lg text-sm font-semibold bg-primary text-cream shadow-warm-sm transition-colors cursor-pointer text-left min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-center gap-3">
                  <User size={18} />
                  <span>Log In to QuickMunch</span>
                </div>
                <ChevronRight size={14} className="text-cream/80" />
              </button>
            ) : (
              <>
                <Link
                  to="/account"
                  onClick={() => onClose()}
                  className={`w-full flex items-center justify-between p-3.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    location.pathname === '/account' ? 'bg-primary-surface/40 text-primary font-semibold' : 'text-charcoal hover:bg-cream-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-cream flex items-center justify-center text-xs font-bold shrink-0">
                      {(user?.firstName || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="leading-tight truncate">
                      <span className="block font-semibold">
                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'My Profile'}
                      </span>
                      <span className="text-[11px] text-charcoal-muted truncate block">{user?.email}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-charcoal-muted" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    logout({ redirectUri: window.location.origin });
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-lg text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer text-left min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </div>
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Editorial Note */}
        <div className="p-4 bg-primary-surface/30 rounded-xl border border-primary/10 text-xs text-charcoal-muted leading-relaxed">
          <p className="font-semibold text-charcoal mb-1">
            QuickMunch Direct Courier Dispatch
          </p>
          Every order travels directly from kitchen to your door in thermal-locked, plastic-free containers.
        </div>
      </div>
    </div>
  );
};
