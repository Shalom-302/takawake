"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NetworkInformation {
  downlink: number;
  effectiveType: string;
  saveData: boolean;
  rtt: number;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

// Type pour l'événement BeforeInstallPrompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // Trust navigator.onLine initially, but verify when needed
  // This approach is more reliable as it doesn't make potentially failing network requests
  // on startup that might erroneously indicate offline status
  const checkOnlineStatus = useCallback(async (): Promise<boolean> => {
    // Start with the browser's built-in online status
    const browserOnlineStatus = navigator.onLine;
    
    // If browser says we're offline, trust it and don't make network requests
    if (!browserOnlineStatus) {
      if (isOnline) {
        setIsOnline(false);
        toast.error('You are offline. Some features may be limited.');
      }
      return false;
    }

    // Only perform fetch test when browser reports online but we want to confirm
    try {
      // Use a static file on the server that's guaranteed to exist
      // The timestamp prevents caching issues
      const timestamp = Date.now();
      const response = await fetch(`/favicon.ico?t=${timestamp}`, {
        method: 'HEAD',
        cache: 'no-store',
        // Keep the timeout short to avoid hanging the UI
        signal: AbortSignal.timeout(2000)
      });
      
      const online = response.ok;
      
      // Only update and notify if the status has changed
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
      // Network request failed, assume we're offline
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
      
      // Start with navigator.onLine - it's usually accurate for initial state
      setIsOnline(navigator.onLine);
      
      // For browsers that support the connection API, use it for more accurate readings
      const navigatorWithConnection = navigator as NavigatorWithConnection;
      const connection = navigatorWithConnection.connection;
      
      let connectionChangeHandler: EventListener;
      if (connection) {
        connectionChangeHandler = () => {
          if (connection.downlink === 0 || connection.effectiveType === 'slow-2g') {
            // Poor or no connection
            if (isOnline) {
              setIsOnline(false);
              toast.error('Poor or no connection. Some features may be limited.');
            }
          } else if (!isOnline) {
            // Connection seems fine but state says offline, verify
            checkOnlineStatus();
          }
        };
        
        // Listen for connection changes if supported
        connection.addEventListener('change', connectionChangeHandler);
      }

      // These event handlers are reliable for catching OS-level connectivity changes
      const handleOnlineEvent = () => {
        // When browser says we're back online, verify with an active check
        checkOnlineStatus();
      };

      const handleOfflineEvent = () => {
        // Browser reports offline, update immediately as this is reliable
        setIsOnline(false);
        toast.error('You are offline. Some features may be limited.');
      };

      // Check when user focuses the page after being away
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          // Only check when becoming visible AND browser reports online
          checkOnlineStatus();
        }
      };
      
      // Use handleFocus for focus events to avoid creating a new function on each render
      const handleFocus = () => {
        if (navigator.onLine) {
          checkOnlineStatus();
        }
      };

      window.addEventListener('online', handleOnlineEvent);
      window.addEventListener('offline', handleOfflineEvent);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);

      // Initial verification happens after a small delay
      // This prevents false offline states during initial page load when network
      // may not be fully established yet
      const initialCheckTimeout = setTimeout(() => {
        if (navigator.onLine) {
          checkOnlineStatus();
        }
      }, 2000);

      // Listen for the beforeinstallprompt event to detect if the app is installable
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Store the event so it can be triggered later
        setDeferredPrompt(e as BeforeInstallPromptEvent);
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
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        clearTimeout(initialCheckTimeout);
        
        if (connection && connectionChangeHandler) {
          connection.removeEventListener('change', connectionChangeHandler);
        }
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
      await deferredPrompt.prompt();
      
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
