"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import axiosClient from '@/lib/api/axios-client';

// Ajouter une variable pour contrôler l'activation de la PWA
const ENABLE_PWA = process.env.NEXT_PUBLIC_ENABLE_PWA !== 'false';
// Désactiver automatiquement en développement sauf si explicitement activé
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const PWA_ENABLED = ENABLE_PWA && (!IS_DEVELOPMENT || process.env.NEXT_PUBLIC_PWA_DEV === 'true');

console.log(`PWA status: ${PWA_ENABLED ? 'Enabled' : 'Disabled'} (Dev: ${IS_DEVELOPMENT})`);

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

  // Helper function to register service worker
  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | undefined> => {
    if (!('serviceWorker' in navigator) || !PWA_ENABLED) {
      console.error('Service Worker not supported in this browser or PWA is disabled');
      return undefined;
    }
    
    try {
      console.log('Registering service worker...');
      
      // Vérifiez d'abord s'il existe déjà un Service Worker actif
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      if (existingRegistration?.active) {
        console.log('Service Worker already active:', existingRegistration);
        return existingRegistration;
      }

      // Si aucun Service Worker actif n'est trouvé, enregistrez-en un nouveau
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Assurez-vous que le Service Worker est activé
      if (registration.installing) {
        console.log('Service Worker is installing...');
        
        // Attendez que l'installation soit terminée
        await new Promise<void>((resolve) => {
          registration.installing?.addEventListener('statechange', (e) => {
            const sw = e.target as ServiceWorker;
            console.log('Service Worker state changed to:', sw.state);
            if (sw.state === 'activated') {
              console.log('Service Worker successfully activated');
              resolve();
            }
          });
        });
      } else if (registration.waiting) {
        console.log('Service Worker is waiting...');
        // Force activation if waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else if (registration.active) {
        console.log('Service Worker is already active');
      }
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return undefined;
    }
  };

  useEffect(() => {
    // Initialize PWA and check installation status
    if (typeof window !== 'undefined' && PWA_ENABLED) {
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

      // Register service worker
      registerServiceWorker().then(registration => {
        if (registration) {
          setIsServiceWorkerRegistered(true);
          // Check if push notifications are supported
          setIsPushSupported('PushManager' in window);
          
          // Check if push notifications are subscribed
          if (registration && isPushSupported) {
            registration.pushManager.getSubscription().then((subscription) => {
              setIsPushSubscribed(!!subscription);
            });
          }
        }
      });

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
  }, [checkOnlineStatus, isOnline, isPushSupported]);

  // Request permission for push notifications
  const requestPushPermission = async (): Promise<boolean> => {
    if (!isPushSupported) {
      toast.error('Push notifications are not supported in your browser');
      return false;
    }

    try {
      // Check if notifications are blocked in browser settings
      if (Notification.permission === 'denied') {
        console.log('Notifications are blocked by browser settings');
        toast.error('Notifications are blocked. Please enable them in your browser settings.');
        return false;
      }
      
      // Demande de permission
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      console.log('Permission granted:', granted);
      
      if (granted) {
        // Enregistrer ou obtenir le Service Worker existant
        console.log('Checking for service worker registration...');
        const registration = await registerServiceWorker();
        console.log('Service worker registration object:', registration);
        
        if (registration) {
          // Get Push subscription or create a new one if it doesn't exist
          let subscription = await registration.pushManager.getSubscription();
          console.log('Existing subscription:', subscription);
          
          if (!subscription) {
            try {
              console.log('No existing subscription, creating a new one...');
              // VAPID public key should be set in your environment
              console.log('Fetching VAPID public key...');
              const { data } = await axiosClient.get(`/push/vapid-public-key`);
              const { publicKey } = data;
              console.log('Received public key:', publicKey);
                
              // Create a new subscription
              console.log('Creating push subscription...');
              subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
              });
              console.log('Push subscription created:', subscription);
            } catch (err) {
              console.error('Error subscribing to push:', err);
              
              // Détection spécifique du mode incognito
              const errorMessage = err instanceof Error ? err.message : String(err);
              console.error('Error details:', errorMessage);
              
              // Vérifie si l'erreur est liée au mode incognito
              if (
                (err instanceof Error && 
                  (err.name === 'AbortError' && errorMessage.includes('permission denied')) ||
                  errorMessage.includes('Permission denied') ||
                  errorMessage.toLowerCase().includes('incognito')
                ) || 
                // Vérification supplémentaire pour Chrome en mode incognito
                navigator.userAgent.includes('Chrome') && 
                (typeof window !== 'undefined' && !window.indexedDB.open('test').onupgradeneeded)
              ) {
                console.warn('Detected incognito mode or permission issue');
                toast.error('Les notifications push ne sont pas disponibles en mode navigation privée/incognito');
                return false;
              }
              
              toast.error(`Échec de l'abonnement: ${errorMessage}`);
              return false;
            }
          }
          
          if (subscription) {
            // Send the subscription to the server
            console.log('Saving subscription to server...');
            const result = await saveSubscriptionToServer(subscription);
            console.log('Subscription saved to server:', result);
            setIsPushSubscribed(result);
            if (result) {
              toast.success('Notifications enabled successfully!');
            }
            return result;
          }
        } else {
          console.error('Failed to get service worker registration');
          toast.error('Failed to register service worker');
        }
      } else {
        console.warn(`Permission not granted: ${permission}`);
        toast.warning('Notification permission was not granted');
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        toast.error(`Failed to enable notifications: ${error.message}`);
      } else {
        toast.error('Could not enable notifications due to an unknown error');
      }
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
