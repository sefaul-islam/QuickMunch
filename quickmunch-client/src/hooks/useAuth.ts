import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import type { AuthContextValue } from '../auth/AuthContext';

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
