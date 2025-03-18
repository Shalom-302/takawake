'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import authService from '@/lib/api/auth-service';

/**
 * Cette page traite directement le callback OAuth
 */
export default function OAuthCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function processCallback() {
      try {
        console.log("Processing OAuth callback");
        
        // Get code from query params
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('No authentication code provided');
        }
        console.log("Auth code received:", code);

        // Get state from query params
        const state = searchParams.get('state') || 'state';
        console.log("State parameter:", state);
        
        // For Google OAuth, the provider is not in the URL
        // We have to determine it from localStorage
        const provider = localStorage.getItem('oauth_provider') || 'google';
        console.log("Using provider:", provider);
        
        // Create the redirect URI that matches what was sent during initialization
        const redirectUri = `${window.location.origin}/oauth/callback`;
        console.log("Redirect URI:", redirectUri);

        // Process the OAuth callback
        console.log("Calling backend with:", { provider, code, redirectUri, state });
        const response = await authService.processOAuthCallback(provider, code, redirectUri, state);
        console.log("Response from backend:", response);
        
        // Store token
        if (response.token && response.token.access_token) {
          localStorage.setItem('auth_token', response.token.access_token);
          if (response.token.refresh_token) {
            localStorage.setItem('refresh_token', response.token.refresh_token);
          }
          
          // Store user info if available
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          
          toast.success('Authentication successful');
          console.log("Authentication successful, redirecting to dashboard");
          
          // Clear oauth_provider from localStorage
          localStorage.removeItem('oauth_provider');
          
          router.push('/dashboard');
        } else {
          console.error("Invalid response format:", response);
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-neutral-900"></div>
          <p className="text-sm text-neutral-500">Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-4 rounded-lg border border-red-100 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Authentication Error</h2>
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          <a 
            href="/auth/login" 
            className="mx-auto rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return null;
}
