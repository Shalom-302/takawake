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
  role?: {
    id: string;
    name: string;
  };
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface MFAMethod {
  method_id: string;
  method_type: string;
  is_primary: boolean;
  name?: string;
  setup_data?: Record<string, unknown>;
}

export interface LoginResponse {
  user: UserData;
  token: Token;
  requires_mfa: boolean;
  mfa_methods?: MFAMethod[];
}

// Use the same interface for register response
export type RegisterResponse = LoginResponse;

export interface AuthProvider {
  provider: string;
  is_active: boolean;
  name?: string;
}

// Auth service for interacting with the custom_auth plugin
const authService = {
  // Email login
  async login(username: string, password: string): Promise<LoginResponse> {
    // Create form data object for OAuth2 password flow
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axiosClient.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Email registration
  async register(username: string, password: string): Promise<RegisterResponse> {
    const response = await axiosClient.post<RegisterResponse>('/auth/register', {
      username,
      password,
    });
    return response.data;
  },

  // Logout (client-side only)
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('refresh_token', refreshToken);
    
    const response = await axiosClient.post<LoginResponse>('/auth/refresh', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
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
