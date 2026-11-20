import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isLoggingOut, login } = useAuth();
  const location = useLocation();
  const loginTriggeredRef = useRef(false);

  useEffect(() => {
    // Only trigger login redirect if accessed cold/unauthenticated and NOT during active logout
    if (!isLoading && !isAuthenticated && !isLoggingOut && !loginTriggeredRef.current) {
      loginTriggeredRef.current = true;
      const redirectUri = window.location.origin + location.pathname + location.search;
      login({ redirectUri });
    }
  }, [isLoading, isAuthenticated, isLoggingOut, location, login]);

  // State during active logout transition
  if (isLoggingOut) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <div className="space-y-1">
          <h2 className="font-serif text-xl font-bold text-charcoal">Signing Out</h2>
          <p className="text-xs text-charcoal-muted">Clearing session and redirecting securely...</p>
        </div>
      </div>
    );
  }

  // Loading state during Keycloak token / session verification
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <div className="space-y-1">
          <h2 className="font-serif text-xl font-bold text-charcoal">Verifying Session</h2>
          <p className="text-xs text-charcoal-muted">Checking your QuickMunch credentials securely...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, display informative redirecting state while browser transitions to Keycloak
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-primary-surface text-primary flex items-center justify-center">
          <ShieldCheck size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-charcoal">Authentication Required</h2>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            Redirecting to Keycloak identity provider... Return destination will be preserved upon sign in.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const redirectUri = window.location.origin + location.pathname + location.search;
            login({ redirectUri });
          }}
          className="mt-2 px-6 py-2.5 rounded-full bg-primary text-cream text-xs font-semibold shadow-warm hover:bg-primary-hover transition-colors cursor-pointer"
        >
          Sign in now
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
