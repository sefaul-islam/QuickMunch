import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  LogOut,
  MapPin,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';

export const AccountPage: React.FC = () => {
  const { user, logout, roles } = useAuth();
  const { currentAddress, showToast } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    showToast('Logged out of QuickMunch');
    await logout({ redirectUri: window.location.origin });
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Valued Customer';

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-charcoal-muted">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="text-charcoal-faint" />
        <span className="font-semibold text-charcoal">Account & Profile</span>
      </nav>

      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-border/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-cream flex items-center justify-center font-serif text-2xl font-bold shadow-warm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold tracking-wider uppercase text-terracotta">
                Verified Customer
              </span>
              {roles.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary-surface text-primary text-[10px] font-bold">
                  {roles.includes('ROLE_ADMIN') ? 'Administrator' : 'Customer'}
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal tracking-tight">
              {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted">{user?.email}</p>
          </div>
        </div>

        {/* Quick Logout Button */}
        <div className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut size={14} />}
            className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Account Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Personal Info & Delivery Locations */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between border-b border-cream-border/60 pb-3">
              <h2 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                <User size={18} className="text-primary" />
                <span>Personal Information</span>
              </h2>
              <span className="text-[11px] text-charcoal-muted font-mono">
                ID: {user?.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-cream-surface/60 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block">
                  First Name
                </span>
                <span className="text-sm font-semibold text-charcoal">
                  {user?.firstName || '—'}
                </span>
              </div>

              <div className="p-3 bg-cream-surface/60 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block">
                  Last Name
                </span>
                <span className="text-sm font-semibold text-charcoal">
                  {user?.lastName || '—'}
                </span>
              </div>

              <div className="p-3 bg-cream-surface/60 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted flex items-center gap-1">
                  <Mail size={12} />
                  <span>Email Address</span>
                </span>
                <span className="text-sm font-semibold text-charcoal truncate block">
                  {user?.email || '—'}
                </span>
              </div>

              <div className="p-3 bg-cream-surface/60 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted flex items-center gap-1">
                  <Phone size={12} />
                  <span>Phone Number</span>
                </span>
                <span className="text-sm font-semibold text-charcoal">
                  {user?.phoneNumber || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Locations Card */}
          <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between border-b border-cream-border/60 pb-3">
              <h2 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                <MapPin size={18} className="text-terracotta" />
                <span>Primary Delivery Address</span>
              </h2>
              <span className="text-[11px] text-primary font-semibold">Active Selection</span>
            </div>

            {currentAddress ? (
              <div className="p-4 bg-primary-surface/40 rounded-xl border border-primary/10 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {currentAddress.label}
                    </span>
                    {currentAddress.isDefault && (
                      <span className="text-[10px] font-semibold bg-primary text-cream px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-charcoal">{currentAddress.street}</p>
                  <p className="text-xs text-charcoal-muted">{currentAddress.neighborhood}</p>
                </div>

                <span className="text-xs text-charcoal-muted italic">
                  Managed via header selector
                </span>
              </div>
            ) : (
              <div className="p-4 bg-cream-surface/60 rounded-xl border border-dashed border-cream-border text-xs text-charcoal-muted">
                No delivery address selected yet. Use the location selector in the header to set your delivery address.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Keycloak Session & Order Shortcuts */}
        <div className="space-y-6">
          {/* Security & Authentication Info */}
          <div className="bg-white rounded-2xl border border-cream-border p-5 shadow-warm-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-cream-border/60 pb-3 text-primary">
              <ShieldCheck size={18} />
              <h3 className="font-serif text-base font-bold text-charcoal">Session Security</h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-charcoal-muted">
              <div className="flex items-center justify-between">
                <span>Protocol</span>
                <span className="font-semibold text-charcoal">OAuth 2.0 + PKCE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Code Challenge</span>
                <span className="font-mono text-primary font-semibold">S256</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Keycloak Realm</span>
                <span className="font-semibold text-charcoal">quickmunch</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Token Storage</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Memory Only (Zero Disk)
                </span>
              </div>
            </div>
          </div>

          {/* Direct Kitchen Discovery Promo Card */}
          <div className="p-5 bg-primary text-cream rounded-2xl shadow-editorial space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cream/10 flex items-center justify-center text-terracotta">
              <Sparkles size={16} />
            </div>
            <h3 className="font-serif text-lg font-bold">Ready to dine?</h3>
            <p className="text-xs text-cream/80 leading-relaxed">
              Explore partner artisan kitchens preparing small-batch menus for direct dispatch.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/restaurants')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-cream text-primary hover:bg-cream-surface text-xs font-semibold shadow-warm transition-colors cursor-pointer"
              >
                <span>Explore Artisan Kitchens</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
