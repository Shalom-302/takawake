"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService, { UserData, AuthProvider as AuthProviderType } from '../api/auth-service';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  providers: AuthProviderType[];
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  getOAuthLoginUrl: (provider: string) => string;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  isLoading: true,
  providers: [],
  login: async () => false,
  register: async () => false,
  logout: () => {},
  refreshToken: async () => false,
  getOAuthLoginUrl: () => '',
});

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [providers, setProviders] = useState<AuthProviderType[]>([]);
  const [tokenExpiryTime, setTokenExpiryTime] = useState<number | null>(null);
  const router = useRouter();

  // Function to parse JWT token
  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  };

  // Refresh token handler with useCallback
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await authService.refreshToken(refreshToken);
      if (response.token?.access_token) {
        localStorage.setItem('auth_token', response.token.access_token);
        const tokenData = parseJwt(response.token.access_token);
        if (tokenData && tokenData.exp) {
          setTokenExpiryTime(tokenData.exp * 1000); // Convert to milliseconds
        }
        return true;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (err) {
      console.error('Refresh token error:', err);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      return false;
    }
  }, []);

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        // Check if token exists in localStorage
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          try {
            // Get current user data using the token
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            
            // Set token expiry for refresh timing
            const tokenData = parseJwt(token);
            if (tokenData && tokenData.exp) {
              setTokenExpiryTime(tokenData.exp * 1000); // Convert to milliseconds
            }
          } catch (err) {
            console.error('Invalid token, clearing auth state');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            setIsAuthenticated(false);
          }
        }

        // Get available auth providers
        const authProviders = await authService.getActiveProviders();
        setProviders(authProviders);
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!isAuthenticated || !tokenExpiryTime) return;

    const refreshTimeBeforeExpiry = 5 * 60 * 1000; // 5 minutes before expiry
    const currentTime = Date.now();
    const timeUntilRefresh = Math.max(0, tokenExpiryTime - currentTime - refreshTimeBeforeExpiry);

    const refreshInterval = setInterval(() => {
      refreshToken();
    }, timeUntilRefresh);

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, tokenExpiryTime, refreshToken]);

  // Login handler
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.login(username, password);
      // Store the token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token.access_token);
        localStorage.setItem('refresh_token', response.token.refresh_token);
      }
      
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('Logged in successfully');
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Failed to login';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.register(username, password);
      
      // Store the token if registration automatically logs in the user
      if (response.token?.access_token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token.access_token);
        localStorage.setItem('refresh_token', response.token.refresh_token);
      }
      
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('Registration successful');
      return true;
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    router.push('/');
    toast.success('Logged out successfully');
  };

  // Get OAuth login URL
  const getOAuthLoginUrl = (provider: string): string => {
    return authService.getOAuthLoginUrl(provider);
  };

  // Context values
  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    isLoading,
    providers,
    login,
    register,
    logout,
    refreshToken,
    getOAuthLoginUrl,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Export the context for direct use
export default AuthContext;
