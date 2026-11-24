import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Store, Bike, ArrowRight, LogOut, UtensilsCrossed, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { APP_ROLES, type AppRole } from '../auth/jwt';

export const RoleSelectionPage: React.FC = () => {
  const { user, appRoles, activeRole, selectRole, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destinationState = location.state as { from?: string; requiredRole?: AppRole; reason?: string } | undefined;

  // Scenario A: If user has only 1 role, automatically redirect to their dashboard
  useEffect(() => {
    if (!isLoading && appRoles.length === 1) {
      const singleRole = appRoles[0];
      selectRole(singleRole);
      navigate(APP_ROLES[singleRole].path, { replace: true });
    }
  }, [isLoading, appRoles, selectRole, navigate]);

  // If user has 0 recognized roles, route to unauthorized page
  useEffect(() => {
    if (!isLoading && appRoles.length === 0) {
      navigate('/unauthorized', { replace: true, state: { reason: 'NO_ROLES' } });
    }
  }, [isLoading, appRoles, navigate]);

  const handleRoleSelection = (role: AppRole) => {
    selectRole(role);

    // If navigated here due to a role mismatch from a target URL for this same role, restore that destination
    if (destinationState?.from && destinationState.requiredRole === role) {
      navigate(destinationState.from, { replace: true });
    } else {
      navigate(APP_ROLES[role].path, { replace: true });
    }
  };

  const handleLogout = async () => {
    await logout({ redirectUri: window.location.origin });
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'QuickMunch Member';

  const roleCardMeta = {
    CUSTOMER: {
      title: 'Customer',
      tagline: 'Dine & Order',
      description: 'Order food and manage your orders.',
      buttonText: 'Continue as Customer',
      icon: ShoppingBag,
      iconBg: 'bg-primary-surface text-primary',
      borderHover: 'hover:border-primary/40',
      activeRing: activeRole === 'CUSTOMER' ? 'ring-2 ring-primary border-primary' : '',
    },
    RESTAURANT_OWNER: {
      title: 'Restaurant Owner',
      tagline: 'Kitchen & Menus',
      description: 'Manage your restaurant, menu, and incoming orders.',
      buttonText: 'Continue as Restaurant Owner',
      icon: Store,
      iconBg: 'bg-terracotta-surface text-terracotta-dark',
      borderHover: 'hover:border-terracotta/40',
      activeRing: activeRole === 'RESTAURANT_OWNER' ? 'ring-2 ring-terracotta border-terracotta' : '',
    },
    DELIVERY_MAN: {
      title: 'Delivery Partner',
      tagline: 'Dispatch & Routes',
      description: 'Manage assigned deliveries and delivery tasks.',
      buttonText: 'Continue as Delivery Partner',
      icon: Bike,
      iconBg: 'bg-sage-light text-sage-deep',
      borderHover: 'hover:border-sage-deep/40',
      activeRing: activeRole === 'DELIVERY_MAN' ? 'ring-2 ring-sage-deep border-sage-deep' : '',
    },
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-10">
        {/* Branding & Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cream-card border border-cream-border shadow-warm-sm">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-cream">
              <UtensilsCrossed size={12} />
            </div>
            <span className="font-serif font-bold text-sm text-primary tracking-tight">QuickMunch</span>
            <span className="w-1 h-1 rounded-full bg-charcoal-faint" />
            <span className="text-xs font-semibold text-charcoal-muted">Role Selection</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal tracking-tight">
              Welcome to QuickMunch!
            </h1>
            <p className="text-sm sm:text-base text-charcoal-muted max-w-xl mx-auto">
              Choose how you want to use QuickMunch today.
            </p>
          </div>

          <div className="text-xs text-charcoal-muted">
            Authenticated as <strong className="text-charcoal font-semibold">{displayName}</strong>
          </div>

          {destinationState?.reason === 'ROLE_MISMATCH' && (
            <div className="max-w-md mx-auto p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2 text-left">
              <ShieldAlert size={16} className="text-amber-700 shrink-0" />
              <span>
                You attempted to access a section requiring <strong>{destinationState.requiredRole}</strong>.
                Please select that role below to proceed.
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Role Cards (Only assigned roles) */}
        <div
          className={`grid gap-6 ${
            appRoles.length === 1
              ? 'grid-cols-1 max-w-md mx-auto'
              : appRoles.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
          data-testid="role-options-grid"
        >
          {appRoles.map((role) => {
            const meta = roleCardMeta[role];
            const IconComponent = meta.icon;

            return (
              <div
                key={role}
                data-testid={`role-card-${role}`}
                className={`flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-7 border border-cream-border shadow-warm-sm ${meta.borderHover} ${meta.activeRing} transition-all duration-200 hover:shadow-warm hover:-translate-y-1`}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${meta.iconBg} flex items-center justify-center shadow-warm-sm`}>
                      <IconComponent size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted bg-cream-surface px-2.5 py-1 rounded-full border border-cream-border/60">
                      {meta.tagline}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                      {meta.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                      {meta.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-cream-border/60 mt-6">
                  <button
                    type="button"
                    onClick={() => handleRoleSelection(role)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-cream hover:bg-primary-hover active:bg-primary-dark text-xs sm:text-sm font-semibold shadow-warm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span>{meta.buttonText}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions / Logout */}
        <div className="flex items-center justify-center pt-4 border-t border-cream-border/60">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer py-1.5 px-3 rounded-lg"
          >
            <LogOut size={14} />
            <span>Sign out or switch account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
