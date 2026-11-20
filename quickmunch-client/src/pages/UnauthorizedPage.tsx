import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Repeat, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { APP_ROLES, type AppRole } from '../auth/jwt';

export const UnauthorizedPage: React.FC = () => {
  const { appRoles, activeRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { reason?: string; requiredRole?: AppRole | AppRole[]; from?: string } | undefined;

  const handleLogout = async () => {
    await logout({ redirectUri: window.location.origin });
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-cream-border p-8 shadow-warm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto shadow-warm-sm">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1 rounded-full">
            HTTP 403 · Access Denied
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            Access Restricted
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            {state?.reason === 'NO_ROLES'
              ? 'Your account does not have any assigned QuickMunch application roles in Keycloak. Please reach out to your administrator to request access.'
              : state?.requiredRole
                ? `You do not have the required role (${Array.isArray(state.requiredRole) ? state.requiredRole.join(', ') : state.requiredRole}) in your Keycloak token to access this section.`
                : 'You do not have sufficient permissions to access this requested destination.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2.5">
          {appRoles.length > 1 && (
            <button
              type="button"
              onClick={() => navigate('/select-role')}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-cream hover:bg-primary-hover text-xs font-semibold shadow-warm transition-all cursor-pointer"
            >
              <Repeat size={14} />
              <span>Choose Another Active Role</span>
            </button>
          )}

          {activeRole && (
            <Link
              to={APP_ROLES[activeRole].path}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cream-surface hover:bg-cream-dark/30 border border-cream-border text-xs font-semibold text-charcoal transition-colors"
            >
              <LayoutDashboard size={14} />
              <span>Return to {APP_ROLES[activeRole].name} Dashboard</span>
            </Link>
          )}

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-cream-border/80 text-xs font-medium text-charcoal-muted hover:text-charcoal hover:bg-cream-surface transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to QuickMunch Home</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 pt-2 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
