import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMatomoConfig } from '@/hooks/use-matomo-config';

/**
 * MatomoTracker component
 * Injects the Matomo tracking script and initializes tracking for the application.
 * Handles user identity, page views, and custom events.
 */
export const MatomoTracker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const { config, isLoading } = useMatomoConfig();
  const [initialized, setInitialized] = useState(false);

  // Initialize Matomo tracking
  useEffect(() => {
    if (isLoading || initialized || !config || !config.enabled) {
      return;
    }

    // Skip tracking for admin users if that setting is disabled
    if (session?.user?.role === 'admin' && !config.track_admin_users) {
      return;
    }

    // Create Matomo script
    const script = document.createElement('script');
    script.innerHTML = `
      var _paq = window._paq = window._paq || [];
      _paq.push(['disableCookies']);
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      ${config.heartbeat_timer > 0 ? `_paq.push(["enableHeartBeatTimer", ${config.heartbeat_timer}]);` : ''}
      (function() {
        var u="${config.matomo_url}/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '${config.site_id}']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
      })();
    `;
    document.head.appendChild(script);
    
    // Set user ID if available
    if (session?.user?.id) {
      window._paq?.push(['setUserId', session.user.id]);
    }

    // Set initialized flag
    setInitialized(true);
    
    // Cleanup function
    return () => {
      document.head.removeChild(script);
    };
  }, [config, isLoading, session, initialized]);

  // Track route changes for SPA
  useEffect(() => {
    if (!initialized || !window._paq) {
      return;
    }

    // Create a function to track page views
    const handleRouteChange = (url: string) => {
      const trackerUrl = url.replace(/^https?:\/\/[^/]+/, '');
      window._paq?.push(['setCustomUrl', trackerUrl]);
      window._paq?.push(['setDocumentTitle', document.title]);
      window._paq?.push(['trackPageView']);
    };

    // Listen for route changes
    const originalPushState = history.pushState;
    history.pushState = function(state, title, url) {
      originalPushState.apply(this, [state, title, url]);
      if (url) {
        handleRouteChange(url.toString());
      }
    };

    // Handle popstate events
    window.addEventListener('popstate', () => {
      handleRouteChange(window.location.href);
    });

    // Track initial page view
    handleRouteChange(window.location.href);

    // Cleanup
    return () => {
      history.pushState = originalPushState;
      window.removeEventListener('popstate', () => {
        handleRouteChange(window.location.href);
      });
    };
  }, [initialized]);

  // Additional utility functions
  useEffect(() => {
    if (!initialized) {
      return;
    }

    // Add utility functions to window object
    window.trackEvent = (category: string, action: string, name?: string, value?: number) => {
      window._paq?.push(['trackEvent', category, action, name, value]);
    };

    window.trackSearch = (keyword: string, category?: string, resultsCount?: number) => {
      window._paq?.push(['trackSiteSearch', keyword, category, resultsCount]);
    };

    // Cleanup
    return () => {
      delete window.trackEvent;
      delete window.trackSearch;
    };
  }, [initialized]);

  return <>{children}</>;
};

// Declare global extensions
declare global {
  interface Window {
    _paq?: any[];
    trackEvent?: (category: string, action: string, name?: string, value?: number) => void;
    trackSearch?: (keyword: string, category?: string, resultsCount?: number) => void;
  }
}

export default MatomoTracker;
