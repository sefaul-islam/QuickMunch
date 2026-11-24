import React from 'react';
import {
  Shield,
  Server,
  Cloud,
  Repeat,
  LogOut,
  ExternalLink,
  CheckCircle2,
  ChefHat,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';

export const SettingsTab: React.FC = () => {
  const { user, appRoles, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Kitchen Partner';

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-cream-border/70 pb-5">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
          Settings & Operating Profile
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
          View your authenticated operator credentials, cloud infrastructure status, and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operator Profile Card */}
        <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-cream-border/60 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-terracotta text-cream flex items-center justify-center font-bold text-lg shadow-warm-sm">
              <ChefHat size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-dark bg-terracotta-surface px-2 py-0.5 rounded-full">
                Authenticated Principal
              </span>
              <h3 className="font-serif text-lg font-bold text-charcoal">{displayName}</h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-cream-border/40">
              <span className="text-charcoal-muted">Full Name</span>
              <span className="font-semibold text-charcoal">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-cream-border/40">
              <span className="text-charcoal-muted">Email</span>
              <span className="font-semibold text-charcoal">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-cream-border/40">
              <span className="text-charcoal-muted">Keycloak User ID</span>
              <span className="font-mono text-[11px] text-charcoal truncate max-w-[180px]">
                {String(user?.id ?? 'N/A')}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-charcoal-muted">Assigned Roles</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {appRoles.map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 rounded bg-primary-surface text-primary text-[10px] font-bold"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              fullWidth
              rightIcon={<ExternalLink size={13} />}
              onClick={() => navigate('/account')}
            >
              Manage Delivery Addresses & Account
            </Button>
          </div>
        </div>

        {/* Infrastructure & Storage Status */}
        <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-cream-border/60 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-surface text-primary flex items-center justify-center shadow-warm-sm">
              <Server size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-surface px-2 py-0.5 rounded-full">
                Connected Services
              </span>
              <h3 className="font-serif text-lg font-bold text-charcoal">System Health</h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-cream-surface rounded-xl border border-cream-border/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-charcoal flex items-center gap-1.5">
                  <Server size={13} className="text-primary" />
                  <span>restaurant-service</span>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 size={12} />
                  <span>Ready (:8082)</span>
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted">
                Provides restaurant management, culinary menu CRUD, and categories.
              </p>
            </div>

            <div className="p-3 bg-cream-surface rounded-xl border border-cream-border/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-charcoal flex items-center gap-1.5">
                  <Cloud size={13} className="text-terracotta" />
                  <span>AWS S3 Asset Bucket</span>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 size={12} />
                  <span>ap-south-1</span>
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted">
                Presigned HTTP PUT direct upload pipeline (<code className="font-mono">quickmunch-assets-prod</code>).
              </p>
            </div>

            <div className="p-3 bg-cream-surface rounded-xl border border-cream-border/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-charcoal flex items-center gap-1.5">
                  <Shield size={13} className="text-sage-deep" />
                  <span>Keycloak Identity Provider</span>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 size={12} />
                  <span>quickmunch realm</span>
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted">
                OAuth2 Resource Server with JWT Bearer validation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Operations & Role Switch */}
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-serif text-base font-bold text-charcoal">Portal Session Management</h4>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Switch your active application role or safely terminate your operator session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {appRoles.length > 1 && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              leftIcon={<Repeat size={14} className="text-terracotta" />}
              onClick={() => navigate('/select-role')}
            >
              Switch Role
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="md"
            className="!border-rose-200 !text-rose-700 hover:!bg-rose-50"
            leftIcon={<LogOut size={14} />}
            onClick={() => logout({ redirectUri: window.location.origin })}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
