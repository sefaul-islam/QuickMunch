import { createContext } from 'react';

export interface UserAddress {
  id: number;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserProfile {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  addresses?: UserAddress[];
  profilePictureUrl?: string;
  roles?: string[];
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  user: UserProfile | null;
  roles: string[];
  login: (options?: { redirectUri?: string }) => Promise<void>;
  logout: (options?: { redirectUri?: string }) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
