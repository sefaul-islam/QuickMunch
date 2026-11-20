import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, MapPin, Clock, Repeat, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const CustomerDashboardPage: React.FC = () => {
  const { user, appRoles } = useAuth();
  const navigate = useNavigate();

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Valued Customer';

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-border/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-cream flex items-center justify-center font-serif text-2xl font-bold shadow-warm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-surface text-primary text-[11px] font-bold tracking-wide uppercase">
                Customer View
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Welcome back, {user?.firstName || 'Customer'}!
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted">
              Explore menus, track active dining orders, and discover new kitchens.
            </p>
          </div>
        </div>

        {/* Switch Role Button (Only if user has multiple roles) */}
        {appRoles.length > 1 && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => navigate('/select-role')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-cream-surface text-charcoal border border-cream-border transition-all cursor-pointer shadow-warm-sm"
            >
              <Repeat size={13} className="text-terracotta" />
              <span>Switch Role</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Discovery & Actions */}
        <div className="md:col-span-2 space-y-6">
          {/* Direct Kitchen Discovery Promo Card */}
          <div className="p-6 sm:p-8 bg-primary text-cream rounded-2xl shadow-editorial space-y-4">
            <div className="w-10 h-10 rounded-xl bg-cream/10 flex items-center justify-center text-terracotta">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-bold">Ready to order something special?</h2>
              <p className="text-xs sm:text-sm text-cream/80 leading-relaxed max-w-lg">
                Explore hand-crafted small batch menus from our partner artisan kitchens with direct delivery.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/restaurants"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cream text-primary hover:bg-cream-surface text-xs font-semibold shadow-warm transition-colors"
              >
                <span>Browse Artisan Kitchens</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Recent Orders Overview Placeholder */}
          <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between border-b border-cream-border/60 pb-3">
              <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                <Clock size={18} className="text-terracotta" />
                <span>Recent Dining Orders</span>
              </h3>
              <span className="text-[11px] text-charcoal-muted">Order Tracking</span>
            </div>

            <div className="p-8 text-center bg-cream-surface/50 rounded-xl border border-dashed border-cream-border space-y-2">
              <ShoppingBag size={24} className="mx-auto text-charcoal-faint" />
              <p className="text-xs font-semibold text-charcoal">No active orders placed</p>
              <p className="text-[11px] text-charcoal-muted max-w-sm mx-auto">
                When you place dining orders from our artisan kitchens, your live dispatch and delivery tracking will appear here.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Shortcuts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-cream-border p-5 shadow-warm-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-cream-border/60 pb-3 text-primary">
              <MapPin size={18} />
              <h3 className="font-serif text-base font-bold text-charcoal">Delivery Preferences</h3>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Manage your delivery addresses and account profile settings.
            </p>
            <Link
              to="/account"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-cream-surface hover:bg-cream-dark/30 border border-cream-border/70 text-xs font-semibold text-charcoal transition-colors"
            >
              <span>Manage Addresses</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
