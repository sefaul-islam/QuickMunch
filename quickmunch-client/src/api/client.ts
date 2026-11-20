import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { normalizeApiError } from './apiError';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';

const parsedTimeout = import.meta.env.VITE_API_TIMEOUT_MS ? Number(import.meta.env.VITE_API_TIMEOUT_MS) : 15000;
export const API_TIMEOUT_MS = Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 15000;

/**
 * Checks whether the request target is trusted before attaching sensitive Bearer credentials.
 * Only relative endpoints or URLs matching the configured API_BASE_URL origin are trusted.
 */
export function isTrustedApiUrl(url?: string): boolean {
  if (!url) return true;
  // Relative paths are safely resolved against baseURL
  if (url.startsWith('/') || !url.includes('://')) {
    return true;
  }
  try {
    const targetOrigin = new URL(url).origin;
    const baseOrigin = new URL(API_BASE_URL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost').origin;
    return targetOrigin === baseOrigin;
  } catch {
    return false;
  }
}

// Centralized Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  },
  timeout: API_TIMEOUT_MS,
});

// Pluggable token getter and event handlers to avoid circular dependencies
let tokenGetter: (() => Promise<string | null>) | null = null;
let unauthorizedHandler: (() => void) | null = null;
let forbiddenHandler: (() => void) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
  tokenGetter = getter;
};

export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

export const setForbiddenHandler = (handler: () => void) => {
  forbiddenHandler = handler;
};

// Request Interceptor: Attach current valid Bearer token only to trusted targets
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // If sending FormData (e.g. file upload), let the browser set boundary Content-Type
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    if (tokenGetter && isTrustedApiUrl(config.url)) {
      try {
        const token = await tokenGetter();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('[QuickMunch API] Failed to attach Bearer token:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

// Response Interceptor: Differentiate 401 Unauthorized vs 403 Forbidden & Normalize Errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn('[QuickMunch API] Received 401 Unauthorized — Session may have expired');
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    } else if (status === 403) {
      console.warn('[QuickMunch API] Received 403 Forbidden — Insufficient permissions');
      if (forbiddenHandler) {
        forbiddenHandler();
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);
