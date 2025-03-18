"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService, { UserData, AuthProvider as AuthProviderType } from '../api/auth-service';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  providers: AuthProviderType[];
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getOAuthLoginUrl: (provider: string) => string;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  providers: [],
  login: async () => false,
  register: async () => false,
  logout: () => {},
  getOAuthLoginUrl: () => '',
});

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<AuthProviderType[]>([]);
  const router = useRouter();

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already logged in
        const userData = await authService.getCurrentUser();
        setUser(userData);

        // Get available auth providers
        const authProviders = await authService.getActiveProviders();
        setProviders(authProviders);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.login(username, password);
      
      // Store the token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.access_token);
      }
      
      setUser(response.user);
      toast.success('Logged in successfully');
      return true;
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Login failed';
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
      if (response.access_token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.access_token);
      }
      
      setUser(response.user);
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
    providers,
    login,
    register,
    logout,
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
