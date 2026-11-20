import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Navigation, MapPin, Repeat, Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const DeliveryDashboardPage: React.FC = () => {
  const { user, appRoles } = useAuth();
  const navigate = useNavigate();

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Courier Partner';

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-border/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sage-deep text-cream flex items-center justify-center font-serif text-2xl font-bold shadow-warm">
            <Bike size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-sage-light text-sage-deep text-[11px] font-bold tracking-wide uppercase">
                Delivery Partner
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Delivery Dispatch Hub
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted">
              Active courier account: <strong className="text-charcoal">{displayName}</strong>
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

      {/* Dispatch Service Notice */}
      <div className="p-4 bg-cream-card rounded-2xl border border-cream-border flex items-start gap-3 text-xs text-charcoal-muted">
        <Info size={16} className="text-sage-deep mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <p className="font-semibold text-charcoal">Courier & Dispatch Integration</p>
          <p className="leading-relaxed">
            This module supports assigned parcel handoffs, real-time routing navigation from kitchen to customer, and live delivery fulfillment events.
          </p>
        </div>
      </div>

      {/* Operational Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module: Assigned Dispatches Placeholder */}
        <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between border-b border-cream-border/60 pb-3">
            <h2 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
              <Navigation size={18} className="text-sage-deep" />
              <span>Active Dispatches</span>
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted bg-cream-surface px-2 py-0.5 rounded">
              Route Active
            </span>
          </div>

          <p className="text-xs text-charcoal-muted leading-relaxed">
            Incoming delivery assignments, kitchen pickup locations, and customer delivery dropoff addresses.
          </p>

          <div className="p-6 text-center bg-cream-surface/40 rounded-xl border border-dashed border-cream-border space-y-2">
            <MapPin size={20} className="mx-auto text-charcoal-faint" />
            <p className="text-xs font-semibold text-charcoal">No Dispatches Currently Queued</p>
            <p className="text-[11px] text-charcoal-muted max-w-xs mx-auto">
              Ready to receive delivery routes upon assignment by restaurant kitchens.
            </p>
          </div>
        </div>

        {/* Module: Fulfillment History Placeholder */}
        <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between border-b border-cream-border/60 pb-3">
            <h2 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-700" />
              <span>Fulfillment & Duty</span>
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted bg-cream-surface px-2 py-0.5 rounded">
              Shift Status
            </span>
          </div>

          <p className="text-xs text-charcoal-muted leading-relaxed">
            Track daily completed deliveries, transit performance, and courier active shift verification.
          </p>

          <div className="p-6 text-center bg-cream-surface/40 rounded-xl border border-dashed border-cream-border space-y-2">
            <Bike size={20} className="mx-auto text-charcoal-faint" />
            <p className="text-xs font-semibold text-charcoal">Courier Partner Ready</p>
            <p className="text-[11px] text-charcoal-muted max-w-xs mx-auto">
              Fulfillment logging connected to your Keycloak authenticated profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
