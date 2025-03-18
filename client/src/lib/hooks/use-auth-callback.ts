"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import authService from '../api/auth-service';

/**
 * Hook for handling OAuth callback URLs
 * Processes the callback code and redirects the user
 */
export function useAuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function processCallback() {
      try {
        // Get provider from query params
        const provider = searchParams.get('provider');
        // State can be used for security validation if needed
        searchParams.get('state');
        
        if (!provider) {
          throw new Error('Invalid callback URL');
        }

        // Get code from query params
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('No authentication code provided');
        }

        // Process the OAuth callback
        const response = await authService.processOAuthCallback(provider, code);
        
        // Store token
        if (response.access_token) {
          localStorage.setItem('auth_token', response.access_token);
          toast.success('Authentication successful');
          router.push('/dashboard');
        } else {
          throw new Error('No token received from server');
        }
      } catch (err: unknown) {
        console.error('OAuth callback error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to process authentication';
        setError(errorMessage);
        toast.error(errorMessage || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    }

    processCallback();
  }, [router, searchParams]);

  return { loading, error };
}
