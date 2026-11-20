import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, UtensilsCrossed, Clock, Repeat, ChefHat, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const OwnerDashboardPage: React.FC = () => {
  const { user, appRoles } = useAuth();
  const navigate = useNavigate();

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Kitchen Partner';

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-border/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-terracotta text-cream flex items-center justify-center font-serif text-2xl font-bold shadow-warm">
            <Store size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-terracotta-surface text-terracotta-dark text-[11px] font-bold tracking-wide uppercase">
                Restaurant Owner
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Kitchen Command Center
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted">
              Logged in as <strong className="text-charcoal">{displayName}</strong>
            </p>
          </div>
        </div>

        {/* Switch Role Button */}
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

      {/* Backend Integration Notice */}
      <div className="p-4 bg-cream-card rounded-2xl border border-cream-border flex items-start gap-3 text-xs text-charcoal-muted">
        <Info size={16} className="text-primary mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <p className="font-semibold text-charcoal">Restaurant Service Integration</p>
          <p className="leading-relaxed">
            This dashboard connects to <code className="text-primary font-mono text-[11px]">restaurant-service</code> (:8082). Manage culinary menus, configure kitchen operating hours, and process incoming meal prep queues.
          </p>
        </div>
      </div>

      {/* Operational Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module: Menu Management Placeholder */}
        <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between border-b border-cream-border/60 pb-3">
            <h2 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
              <ChefHat size={18} className="text-terracotta" />
              <span>Culinary Menu Offerings</span>
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted bg-cream-surface px-2 py-0.5 rounded">
              Management
            </span>
          </div>

          <p className="text-xs text-charcoal-muted leading-relaxed">
            Configure dish categories, ingredients, allergens, pricing, and live inventory availability for your kitchen.
          </p>

          <div className="p-6 text-center bg-cream-surface/40 rounded-xl border border-dashed border-cream-border space-y-2">
            <UtensilsCrossed size={20} className="mx-auto text-charcoal-faint" />
            <p className="text-xs font-semibold text-charcoal">Menu Editor Ready</p>
            <p className="text-[11px] text-charcoal-muted max-w-xs mx-auto">
              Ready for linkage to <code className="font-mono">/api/food-items</code> and category management APIs.
            </p>
          </div>
        </div>

        {/* Module: Live Order Queue Placeholder */}
        <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between border-b border-cream-border/60 pb-3">
            <h2 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              <span>Kitchen Prep Queue</span>
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted bg-cream-surface px-2 py-0.5 rounded">
              Live Orders
            </span>
          </div>

          <p className="text-xs text-charcoal-muted leading-relaxed">
            Monitor orders in real time as customers place them. Update prep status from Received to Cooking and Ready for Pickup.
          </p>

          <div className="p-6 text-center bg-cream-surface/40 rounded-xl border border-dashed border-cream-border space-y-2">
            <Store size={20} className="mx-auto text-charcoal-faint" />
            <p className="text-xs font-semibold text-charcoal">Order Pipeline Ready</p>
            <p className="text-[11px] text-charcoal-muted max-w-xs mx-auto">
              Ready for linkage to <code className="font-mono">/api/orders</code> and RabbitMQ dispatch event streams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
