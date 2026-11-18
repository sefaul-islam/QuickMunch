import React, { useEffect } from 'react';
import { MapPin, Sparkles, BookOpen, ShieldCheck, Leaf, ChevronRight } from 'lucide-react';
import type { DeliveryAddress } from '../../types';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: DeliveryAddress;
  onOpenLocationModal: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onOpenLocationModal,
  onScrollToSection,
}) => {
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

  const links = [
    { label: 'Artisan Kitchens', icon: <Sparkles size={18} className="text-terracotta" />, sectionId: 'kitchens' },
    { label: 'Featured Spotlight', icon: <BookOpen size={18} className="text-primary" />, sectionId: 'spotlight' },
    { label: 'Signature Dishes', icon: <Leaf size={18} className="text-primary" />, sectionId: 'dishes' },
    { label: 'Courier Dispatch', icon: <ShieldCheck size={18} className="text-terracotta" />, sectionId: 'dispatch' },
  ];

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
        <nav className="space-y-1" aria-label="Mobile section navigation">
          {links.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => {
                onClose();
                onScrollToSection(link.sectionId);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-lg text-sm font-medium text-charcoal hover:bg-cream-surface transition-colors cursor-pointer text-left min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center gap-3">
                {link.icon}
                <span>{link.label}</span>
              </div>
              <ChevronRight size={14} className="text-charcoal-muted" />
            </button>
          ))}
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
