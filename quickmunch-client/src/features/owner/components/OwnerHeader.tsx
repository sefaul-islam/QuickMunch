import React, { useState } from 'react';
import {
  Menu,
  Store,
  ChevronDown,
  Plus,
  UtensilsCrossed,
  Power,
  Repeat,
  LogOut,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import type { RestaurantResponse } from '../../../api/types/restaurant';

export interface OwnerHeaderProps {
  onOpenMobileSidebar: () => void;
  restaurants: RestaurantResponse[];
  selectedRestaurant: RestaurantResponse | null;
  onSelectRestaurant: (restaurant: RestaurantResponse) => void;
  onToggleStatus: (restaurantId: number, isOpen: boolean) => void;
  isUpdatingStatus: boolean;
  onOpenCreateRestaurant: () => void;
  onOpenCreateFoodItem: () => void;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  onOpenMobileSidebar,
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onToggleStatus,
  isUpdatingStatus,
  onOpenCreateRestaurant,
  onOpenCreateFoodItem,
}) => {
  const { user, appRoles, logout } = useAuth();
  const navigate = useNavigate();

  const [isRestaurantDropdownOpen, setIsRestaurantDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Kitchen Partner';

  return (
    <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-cream-border px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Button & Restaurant Selector */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-charcoal hover:bg-cream-surface border border-cream-border cursor-pointer shadow-warm-sm"
            aria-label="Open sidebar navigation"
          >
            <Menu size={18} />
          </button>

          {/* Active Restaurant Selector Dropdown */}
          {restaurants.length > 0 ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRestaurantDropdownOpen(!isRestaurantDropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white border border-cream-border hover:border-primary/40 text-charcoal text-xs sm:text-sm font-semibold transition-all shadow-warm-sm cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-primary-surface text-primary flex items-center justify-center shrink-0">
                  <Store size={14} />
                </div>
                <div className="text-left">
                  <span className="block truncate max-w-[140px] sm:max-w-[200px]">
                    {selectedRestaurant ? selectedRestaurant.name : 'Select Restaurant'}
                  </span>
                </div>
                <ChevronDown size={14} className="text-charcoal-muted ml-1" />
              </button>

              {/* Selector Dropdown Menu */}
              {isRestaurantDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRestaurantDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-cream-border shadow-warm-lg z-50 p-2 space-y-1 animate-scale-in">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted border-b border-cream-border/50">
                      Select Active Kitchen
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                      {restaurants.map((res) => {
                        const isSelected = selectedRestaurant?.id === res.id;
                        return (
                          <button
                            key={res.id}
                            type="button"
                            onClick={() => {
                              onSelectRestaurant(res);
                              setIsRestaurantDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary-surface text-primary font-semibold'
                                : 'text-charcoal hover:bg-cream-surface'
                            }`}
                          >
                            <div className="truncate mr-2">
                              <p className="truncate font-medium">{res.name}</p>
                              <p className="text-[10px] text-charcoal-muted truncate">{res.address}</p>
                            </div>
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                res.isOpen ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-charcoal-faint'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1.5 border-t border-cream-border/60">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRestaurantDropdownOpen(false);
                          onOpenCreateRestaurant();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary-surface transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Another Restaurant</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs text-charcoal-muted">
              <Store size={15} className="text-terracotta" />
              <span>No restaurants registered yet</span>
            </div>
          )}
        </div>

        {/* Right Section: Status Toggle, Quick Actions, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Open/Closed Status Switch (for Selected Restaurant) */}
          {selectedRestaurant && (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => onToggleStatus(selectedRestaurant.id, !selectedRestaurant.isOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-warm-sm ${
                selectedRestaurant.isOpen
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-cream-surface text-charcoal-muted border-cream-border hover:bg-cream-border/60'
              }`}
              title={selectedRestaurant.isOpen ? 'Click to close kitchen' : 'Click to open kitchen'}
            >
              <Power
                size={13}
                className={selectedRestaurant.isOpen ? 'text-emerald-600' : 'text-charcoal-faint'}
              />
              <span className="hidden sm:inline">
                {selectedRestaurant.isOpen ? 'Open for Orders' : 'Kitchen Closed'}
              </span>
              <span className="sm:hidden">{selectedRestaurant.isOpen ? 'Open' : 'Closed'}</span>
            </button>
          )}

          {/* Quick Action: Add Dish (only if restaurant exists) */}
          {selectedRestaurant && (
            <button
              type="button"
              onClick={onOpenCreateFoodItem}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-terracotta hover:bg-terracotta-hover text-cream shadow-warm-sm transition-all cursor-pointer"
            >
              <UtensilsCrossed size={13} />
              <span>Add Dish</span>
            </button>
          )}

          {/* Quick Action: New Restaurant */}
          <button
            type="button"
            onClick={onOpenCreateRestaurant}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary hover:bg-primary-hover text-cream shadow-warm-sm transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Restaurant</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* Owner Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-cream-surface transition-colors cursor-pointer"
              aria-label="Owner profile options"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-cream font-bold text-xs flex items-center justify-center shadow-warm-sm ring-2 ring-cream-border">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </button>

            {isProfileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-cream-border shadow-warm-lg z-50 p-2 space-y-1 animate-scale-in">
                  <div className="p-3 border-b border-cream-border/60">
                    <p className="text-xs font-bold text-charcoal truncate">{displayName}</p>
                    <p className="text-[11px] text-charcoal-muted truncate">{user?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-terracotta-surface text-terracotta-dark text-[10px] font-bold uppercase tracking-wider">
                      Restaurant Owner
                    </span>
                  </div>

                  {appRoles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate('/select-role');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-charcoal hover:bg-cream-surface transition-colors cursor-pointer"
                    >
                      <Repeat size={14} className="text-terracotta" />
                      <span>Switch Active Role</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      navigate('/account');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-charcoal hover:bg-cream-surface transition-colors cursor-pointer"
                  >
                    <User size={14} className="text-primary" />
                    <span>User Account Settings</span>
                  </button>

                  <div className="pt-1 border-t border-cream-border/60">
                    <button
                      type="button"
                      onClick={() => logout({ redirectUri: window.location.origin })}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
