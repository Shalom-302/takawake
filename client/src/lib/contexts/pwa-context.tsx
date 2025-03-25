"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import axiosClient from '@/lib/api/axios-client';

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
  // Unsubscribe from push notifications
  unsubscribeFromPush: () => Promise<boolean>;
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

const PWAContext = createContext<PWAContextType | null>(null);

// axiosClient utilise déjà NEXT_PUBLIC_API_URL || 'http://localhost:8000/api' comme baseURL
// donc nous n'avons pas besoin de définir une constante séparée

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === null) {
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
  
  // Check online status with network request
  const checkOnlineStatus = useCallback(async (): Promise<boolean> => {
    // Get browser's opinion on connectivity
    const browserOnlineStatus = navigator.onLine;
    
    if (!browserOnlineStatus) {
      if (isOnline) {
        setIsOnline(false);
      }
      return false;
    }

    // Only perform fetch test when browser reports online but we want to confirm
    try {
      // Utiliser l'endpoint health-check
      // axiosClient ajoute déjà le préfixe /api à toutes les requêtes
      const response = await axiosClient.get(`/health-check`, {
        // Keep the timeout short to avoid hanging the UI
        timeout: 2000
      });
      
      const online = response.status === 200;
      
      // Only update and notify if the status has changed
      if (online !== isOnline) {
        setIsOnline(online);
      }
      
      return online;
    } catch {
      // Network request failed, assume we're offline
      if (isOnline) {
        setIsOnline(false);
      }
      return false;
    }
  }, [isOnline]);

  // Check if the app is running as a PWA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if the app is running in standalone mode or was launched from the homescreen
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                                (window.navigator as Navigator & { standalone?: boolean }).standalone || 
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
      }, 3000); // Augmenté à 3 secondes pour donner plus de temps au réseau

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
          // Obtenir la subscription Push ou en créer une nouvelle si elle n'existe pas
          let subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            try {
              // VAPID public key should be set in your environment
              const { data } = await axiosClient.get(`/push/vapid-public-key`);
              const { publicKey } = data;
              
              // Créer une nouvelle subscription
              subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
              });
            } catch (err) {
              console.error('Error subscribing to push:', err);
              return false;
            }
          }
          
          if (subscription) {
            // Envoyer la subscription au serveur
            const result = await saveSubscriptionToServer(subscription);
            setIsPushSubscribed(result);
            return result;
          }
        }
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
      toast.error('Could not enable notifications');
    }
    
    return false;
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!isPushSupported) return false;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Remove from server first
          await deleteSubscriptionFromServer();
          
          // Then unsubscribe locally
          const unsubscribed = await subscription.unsubscribe();
          
          if (unsubscribed) {
            setIsPushSubscribed(false);
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast.error('Could not disable notifications');
    }
    
    return false;
  };

  // Helper function to save subscription to server
  const saveSubscriptionToServer = async (subscription: PushSubscription): Promise<boolean> => {
    try {
      const { data } = await axiosClient.post(`/push/subscribe`, {
        subscription: subscription.toJSON(),
      });

      if (data && data.isSubscribed) {
        toast.success('Notifications enabled successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save subscription to server:', error);
      return false;
    }
  };

  // Helper function to delete subscription from server
  const deleteSubscriptionFromServer = async (): Promise<boolean> => {
    try {
      const { data } = await axiosClient.post(`/push/unsubscribe`);
      return data && !data.isSubscribed;
    } catch (error) {
      console.error('Failed to delete subscription from server:', error);
      return false;
    }
  };

  // Helper function to convert base64 to Uint8Array for VAPID key
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
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

  // Check online status periodically (every 30 seconds)
  useEffect(() => {
    const periodicCheck = setInterval(() => {
      if (navigator.onLine) {
        checkOnlineStatus();
      }
    }, 30000); // 30 secondes entre chaque vérification

    return () => {
      clearInterval(periodicCheck);
    };
  }, [checkOnlineStatus]);

  const value = {
    isPWA,
    isServiceWorkerRegistered,
    isPushSupported,
    isPushSubscribed,
    requestPushPermission,
    unsubscribeFromPush,
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
