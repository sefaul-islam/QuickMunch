import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, MapPin, ChevronDown, Search, Menu, X, User } from 'lucide-react';
import { motion } from 'motion/react';
import type { DeliveryAddress, CartItem } from '../../types';

export interface NavbarProps {
  currentAddress: DeliveryAddress;
  onOpenLocationModal: () => void;
  cartItems: CartItem[];
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onAccountClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentAddress,
  onOpenLocationModal,
  cartItems,
  onOpenCart,
  searchQuery,
  onSearchChange,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onAccountClick,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Focus the visible search input
        const isDesktop = window.innerWidth >= 1024;
        const targetInput = isDesktop ? searchInputRef.current : mobileSearchInputRef.current;
        if (targetInput) {
          targetInput.focus();
          targetInput.select();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-cream/95 backdrop-blur-md border-b border-cream-border/80 shadow-warm-sm'
          : 'bg-cream border-b border-cream-border/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Location Pill */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1 -m-1"
            aria-label="QuickMunch homepage"
          >
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-cream shadow-warm-sm group-hover:bg-primary-hover transition-colors">
              <span className="font-serif font-bold text-lg leading-none">Q</span>
            </span>
            <span className="font-serif text-2xl font-bold tracking-tight text-primary">
              Quick<span className="text-terracotta">Munch</span>
            </span>
          </button>

          {/* Location Selector (Desktop) */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onOpenLocationModal}
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-cream-border transition-all duration-150 cursor-pointer text-left text-xs shadow-warm-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Delivery location: ${currentAddress.neighborhood}. Click to change address.`}
          >
            <div className="w-5 h-5 rounded-full bg-primary-surface text-primary flex items-center justify-center">
              <MapPin size={12} />
            </div>
            <div>
              <span className="text-charcoal-muted block text-[10px] uppercase font-bold tracking-wider leading-none">
                Deliver to
              </span>
              <span className="font-semibold text-charcoal flex items-center gap-1 leading-tight">
                {currentAddress.neighborhood}
                <ChevronDown size={12} className="text-charcoal-muted" />
              </span>
            </div>
          </motion.button>
        </div>

        {/* Center Search Bar with expanding focus */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full group">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted group-focus-within:text-primary transition-colors pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search wood-fired pizza, tonkotsu, pasta, matcha..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search dishes and kitchens"
              aria-keyshortcuts="Control+K Meta+K"
              className="w-full bg-white text-xs sm:text-sm text-charcoal placeholder:text-charcoal-faint border border-cream-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-full py-2 pl-9 pr-9 outline-none transition-all shadow-warm-sm"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal p-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                aria-label="Clear search query"
              >
                <X size={14} />
              </button>
            ) : (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-charcoal-faint bg-cream-border/50 px-1.5 py-0.5 rounded border border-cream-border pointer-events-none"
                aria-hidden="true"
              >
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Account Button (Desktop) */}
          <button
            type="button"
            onClick={onAccountClick}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-charcoal hover:bg-white border border-transparent hover:border-cream-border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Account profile"
          >
            <User size={15} className="text-charcoal-muted" />
            <span>Account</span>
          </button>

          {/* Interactive Dining Bag */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -1 }}
            type="button"
            onClick={onOpenCart}
            className="relative flex items-center gap-2.5 bg-primary hover:bg-primary-hover active:bg-primary-dark text-cream px-3.5 py-2 rounded-full shadow-warm-sm hover:shadow-warm transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={`Open dining bag with ${totalCartCount} items totaling $${cartSubtotal.toFixed(2)}`}
          >
            <div className="relative">
              <ShoppingBag size={18} />
              {totalCartCount > 0 && (
                <motion.span
                  key={totalCartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-terracotta text-cream text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-cream tabular-nums"
                >
                  {totalCartCount}
                </motion.span>
              )}
            </div>
            <span className="font-semibold text-xs">Bag</span>
            {cartSubtotal > 0 && (
              <span className="hidden sm:inline font-semibold text-xs border-l border-cream/20 pl-2 tabular-nums">
                ${cartSubtotal.toFixed(2)}
              </span>
            )}
          </motion.button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-charcoal hover:bg-cream-border/50 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar sub-row */}
      <div className="lg:hidden px-4 pb-3">
        <div className="relative w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none"
          />
          <input
            ref={mobileSearchInputRef}
            type="text"
            placeholder="Search kitchens, dishes, sourdough, tonkotsu..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search dishes and kitchens"
            className="w-full bg-white text-xs text-charcoal placeholder:text-charcoal-faint border border-cream-border rounded-lg py-2.5 pl-9 pr-9 outline-none shadow-warm-sm focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-muted p-2 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
              aria-label="Clear mobile search query"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
