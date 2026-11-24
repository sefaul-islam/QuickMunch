import React from 'react';
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  Settings,
  Repeat,
  ExternalLink,
  ChevronRight,
  X,
  ChefHat,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

export type OwnerTabType = 'overview' | 'restaurants' | 'menu' | 'settings';

export interface OwnerSidebarProps {
  activeTab: OwnerTabType;
  onTabChange: (tab: OwnerTabType) => void;
  restaurantCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  activeTab,
  onTabChange,
  restaurantCount = 0,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { appRoles, user } = useAuth();

  const navItems = [
    {
      id: 'overview' as OwnerTabType,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'restaurants' as OwnerTabType,
      label: 'My Restaurants',
      icon: Store,
      badge: restaurantCount > 0 ? String(restaurantCount) : null,
    },
    {
      id: 'menu' as OwnerTabType,
      label: 'Menu Management',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      id: 'settings' as OwnerTabType,
      label: 'Settings & Profile',
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelectTab = (tab: OwnerTabType) => {
    onTabChange(tab);
    onCloseMobile();
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Kitchen Partner';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-cream-card border-r border-cream-border flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-editorial' : '-translate-x-full'
        }`}
        aria-label="Restaurant Owner Navigation"
      >
        {/* Brand / Kitchen Center Header */}
        <div className="p-5 border-b border-cream-border/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta text-cream flex items-center justify-center shadow-warm-sm">
              <ChefHat size={22} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-terracotta-dark bg-terracotta-surface px-2 py-0.5 rounded-full">
                Partner Portal
              </span>
              <h2 className="font-serif text-lg font-bold text-charcoal leading-tight mt-0.5">
                QuickMunch
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-cream-border/50 cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
            Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-cream shadow-warm-sm'
                    : 'text-charcoal hover:bg-cream-surface hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={isActive ? 'text-cream' : 'text-charcoal-muted'}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-cream/20 text-cream'
                        : 'bg-primary-surface text-primary border border-primary/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Utility Actions */}
        <div className="p-4 border-t border-cream-border/70 space-y-2">
          {/* View Public Storefront */}
          <button
            type="button"
            onClick={() => navigate('/restaurants')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-charcoal-muted hover:text-charcoal hover:bg-cream-surface transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} className="text-terracotta" />
              <span>Customer Storefront</span>
            </span>
            <ChevronRight size={13} />
          </button>

          {/* Switch Role (if multi-role) */}
          {appRoles.length > 1 && (
            <button
              type="button"
              onClick={() => navigate('/select-role')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-charcoal hover:bg-cream-surface transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Repeat size={14} className="text-primary" />
                <span>Switch Portal Role</span>
              </span>
              <ChevronRight size={13} />
            </button>
          )}

          {/* User Profile Mini Footer */}
          <div className="pt-2 border-t border-cream-border/50 flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-surface text-primary font-bold text-xs flex items-center justify-center shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-charcoal truncate">{displayName}</p>
              <p className="text-[10px] text-charcoal-muted truncate">Kitchen Operator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
