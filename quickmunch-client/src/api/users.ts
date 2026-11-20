import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { UserProfile } from '../auth/AuthContext';

export const usersApi = {
  /**
   * Fetches the current authenticated user's profile from user-service
   * Endpoint: GET /api/users/me
   */
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(API_ENDPOINTS.USERS.ME);
    return response.data;
  },
};
