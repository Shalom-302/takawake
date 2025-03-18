import axiosClient from './axios-client';

// Types for auth responses
export interface UserData {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  imageUrl?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

export interface AuthProvider {
  provider: string;
  is_active: boolean;
  name?: string;
}

// Auth service for interacting with the custom_auth plugin
const authService = {
  // Email login
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await axiosClient.post<LoginResponse>('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  // Email registration
  async register(username: string, password: string): Promise<LoginResponse> {
    const response = await axiosClient.post<LoginResponse>('/auth/register', {
      username,
      password,
    });
    return response.data;
  },

  // Logout (client-side only)
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<UserData | null> {
    try {
      const response = await axiosClient.get<UserData>('/auth/me');
      return response.data;
    } catch {
      // Handle error silently and return null
      return null;
    }
  },

  // Get available auth providers
  async getProviders(): Promise<AuthProvider[]> {
    const response = await axiosClient.get<AuthProvider[]>('/providers');
    return response.data;
  },

  // Get active auth providers
  async getActiveProviders(): Promise<AuthProvider[]> {
    const providers = await this.getProviders();
    return providers;
  },

  // Initiate OAuth login
  getOAuthLoginUrl(provider: string): string {
    return `${axiosClient.defaults.baseURL}/auth/oauth/init?provider=${provider}`;
  },

  // Process OAuth callback
  async processOAuthCallback(provider: string, code: string): Promise<LoginResponse> {
    const response = await axiosClient.post<LoginResponse>('/auth/oauth/callback', { 
      provider, 
      code 
    });
    return response.data;
  }
};

export default authService;
