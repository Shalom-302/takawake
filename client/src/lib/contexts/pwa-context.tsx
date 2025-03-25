"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface PWAContextType {
  // Whether the app is running as a PWA
  isPWA: boolean;
  // Whether the service worker is registered
  isServiceWorkerRegistered: boolean;
  // Whether push notifications are supported
  isPushSupported: boolean;
  // Whether push notifications are subscribed
  isPushSubscribed: boolean;
  // Request permission for push notifications
  requestPushPermission: () => Promise<boolean>;
  // Handle app installation
  installApp: () => Promise<void>;
  // Check if the app is installed
  isAppInstalled: boolean;
  // Whether the app can be installed
  isInstallable: boolean;
  // Whether the user is online
  isOnline: boolean;
  // Check online status manually
  checkOnlineStatus: () => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPWA, setIsPWA] = useState<boolean>(false);
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState<boolean>(false);
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(false);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Active check for online status by pinging the server
  const checkOnlineStatus = useCallback(async (): Promise<boolean> => {
    // Add a timestamp parameter to prevent caching
    const timestamp = new Date().getTime();
    try {
      // Try to fetch a small resource from our server
      const response = await fetch(`/api/health-check?t=${timestamp}`, { 
        method: 'HEAD',
        // Short timeout to avoid long waits
        signal: AbortSignal.timeout(3000),
        // Don't use the cache
        cache: 'no-store'
      });
      
      const online = response.ok;
      // Only update if status has changed to avoid unnecessary renders
      if (online !== isOnline) {
        setIsOnline(online);
        if (online && !isOnline) {
          toast.success('Connection restored');
        } else if (!online && isOnline) {
          toast.error('You are offline. Some features may be limited.');
        }
      }
      return online;
    } catch {
      // If fetch fails, we're offline (ignore specific error)
      if (isOnline) {
        setIsOnline(false);
        toast.error('You are offline. Some features may be limited.');
      }
      return false;
    }
  }, [isOnline]);

  // Check if the app is running as a PWA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if the app is running in standalone mode or was launched from the homescreen
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                                (window.navigator as any).standalone || 
                                document.referrer.includes('android-app://');
      
      setIsPWA(isInStandaloneMode);
      
      // Initial check using navigator.onLine - will be verified by active check
      setIsOnline(navigator.onLine);

      // Immediate active check on mount
      checkOnlineStatus();

      // Listen for online/offline events
      const handleOnlineEvent = () => {
        // When browser reports online, verify with an active check
        if (navigator.onLine) {
          checkOnlineStatus();
        }
      };

      const handleOfflineEvent = () => {
        // When browser reports offline, update immediately
        if (isOnline) {
          setIsOnline(false);
          toast.error('You are offline. Some features may be limited.');
        }
      };

      // Set up periodic online status checks (every 30 seconds)
      const onlineCheckInterval = setInterval(() => {
        // Only check if the document is visible to save resources
        if (document.visibilityState === 'visible') {
          checkOnlineStatus();
        }
      }, 30000);

      // Event handlers for focus and visibility checks
      const handleFocus = () => {
        checkOnlineStatus();
      };
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          checkOnlineStatus();
        }
      };

      window.addEventListener('online', handleOnlineEvent);
      window.addEventListener('offline', handleOfflineEvent);
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Listen for the beforeinstallprompt event to detect if the app is installable
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Store the event so it can be triggered later
        setDeferredPrompt(e);
        setIsInstallable(true);
      });

      // Listen for the appinstalled event to detect when the app is installed
      window.addEventListener('appinstalled', () => {
        setIsAppInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        // Log install to analytics
        console.log('PWA was installed');
      });

      return () => {
        window.removeEventListener('online', handleOnlineEvent);
        window.removeEventListener('offline', handleOfflineEvent);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(onlineCheckInterval);
      };
    }
  }, [checkOnlineStatus, isOnline]);

  // Check if service worker and push notifications are supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if service worker is supported
      const isServiceWorkerSupported = 'serviceWorker' in navigator;
      
      // Check if push notifications are supported
      const isPushSupported = 'PushManager' in window && 'Notification' in window;
      
      setIsPushSupported(isPushSupported);

      // Check if service worker is registered
      if (isServiceWorkerSupported) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          setIsServiceWorkerRegistered(!!registration);
          
          // Check if push notifications are subscribed
          if (registration && isPushSupported) {
            registration.pushManager.getSubscription().then((subscription) => {
              setIsPushSubscribed(!!subscription);
            });
          }
        });
      }
    }
  }, []);

  // Request permission for push notifications
  const requestPushPermission = async (): Promise<boolean> => {
    if (!isPushSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      if (granted) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // The subscription should be automatically created by the service worker script
          // but we check here just to be safe
          const subscription = await registration.pushManager.getSubscription();
          setIsPushSubscribed(!!subscription);
          return true;
        }
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
    }
    
    return false;
  };

  // Handle app installation
  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) {
      console.log('Installation not available');
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsAppInstalled(true);
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // We no longer need the prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error installing app:', error);
    }
  };

  const value = {
    isPWA,
    isServiceWorkerRegistered,
    isPushSupported,
    isPushSubscribed,
    requestPushPermission,
    installApp,
    isAppInstalled,
    isInstallable,
    isOnline,
    checkOnlineStatus
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};
