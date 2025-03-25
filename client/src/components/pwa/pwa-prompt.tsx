import React, { useState, useEffect } from 'react';
import { usePWA } from '@/lib/contexts/pwa-context';
import { Button } from '@/components/ui/button';
import { Bell, Download, WifiOff } from 'lucide-react';
import axiosClient from '@/lib/api/axios-client';
import axios from 'axios';
import { toast } from 'sonner';

// Étendre l'interface Window pour inclure les méthodes expérimentales
declare global {
  interface Window {
    TEMPORARY?: number;
    // Définir un type plus précis pour la fonction webkitRequestFileSystem
    webkitRequestFileSystem?: (
      type: number, 
      size: number, 
      successCallback: () => void, 
      errorCallback: () => void
    ) => void;
  }
}

export function PWAPrompt() {
  const { 
    isInstallable, 
    installApp, 
    isPushSupported, 
    isPushSubscribed, 
    requestPushPermission, 
    unsubscribeFromPush,
    isOnline 
  } = usePWA();

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  const [serverNotificationStatus, setServerNotificationStatus] = useState<boolean | null>(null);
  const [showManageNotifications, setShowManageNotifications] = useState(false);

  // Vérifier le statut d'abonnement aux notifications sur le serveur
  useEffect(() => {
    const checkServerSubscriptionStatus = async () => {
      if (!isPushSupported) return;
      
      try {
        const { data } = await axiosClient.get(`/push/status`);
        setServerNotificationStatus(data.isSubscribed);
        
        // Si le statut du serveur est différent de notre état local, mettre à jour
        if (data.isSubscribed !== isPushSubscribed) {
          console.log('Synchronizing push status with server');
        }
      } catch (error) {
        // En cas d'erreur 401, l'utilisateur n'est pas connecté
        // Dans ce cas, on définit simplement le statut comme non abonné
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setServerNotificationStatus(false);
          // Pas besoin de logger cette erreur car c'est un cas attendu
        } else {
          console.error('Failed to check server subscription status:', error);
        }
      }
    };
    
    checkServerSubscriptionStatus();
  }, [isPushSupported, isPushSubscribed]);

  // Manage installation prompt display
  useEffect(() => {
    if (isInstallable) {
      // Wait a bit before showing the prompt
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowInstallPrompt(false);
    }
  }, [isInstallable]);

  // Manage notification prompt display
  useEffect(() => {
    console.log('Notification prompt conditions:', { 
      isPushSupported, 
      isPushSubscribed, 
      serverNotificationStatus
    });
    
    if (isPushSupported && !isPushSubscribed && (serverNotificationStatus === false || serverNotificationStatus === null)) {
      console.log('All conditions met to show notification prompt, will show in 10 seconds');
      // Wait a bit longer before asking for notifications
      const timer = setTimeout(() => {
        console.log('Now showing notification prompt');
        setShowNotificationPrompt(true);
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      console.log('Not showing notification prompt due to conditions not met');
      setShowNotificationPrompt(false);
    }
  }, [isPushSupported, isPushSubscribed, serverNotificationStatus]);

  // Montrer l'option de gérer les notifications si déjà abonnées
  useEffect(() => {
    // Si les notifications sont activées, montrer occasionnellement l'option de gestion
    if (isPushSupported && isPushSubscribed && serverNotificationStatus === true) {
      // Vérifie si l'utilisateur n'a pas vu cette option récemment (stocké dans localStorage)
      const lastShown = localStorage.getItem('notificationManageLastShown');
      const now = new Date().getTime();
      
      // Ne montrer l'option que tous les 7 jours
      if (!lastShown || (now - parseInt(lastShown)) > 7 * 24 * 60 * 60 * 1000) {
        const timer = setTimeout(() => {
          setShowManageNotifications(true);
          localStorage.setItem('notificationManageLastShown', now.toString());
        }, 15000);
        
        return () => clearTimeout(timer);
      }
    } else {
      setShowManageNotifications(false);
    }
  }, [isPushSupported, isPushSubscribed, serverNotificationStatus]);

  // Manage offline status indicator
  useEffect(() => {
    setShowOfflineIndicator(!isOnline);
  }, [isOnline]);

  // Fonction de détection du mode incognito
  const isInIncognitoMode = async (): Promise<boolean> => {
    // Détection par IndexedDB (la méthode la plus fiable)
    return new Promise((resolve) => {
      const db = indexedDB.open('test_incognito_detect');
      db.onerror = () => {
        console.log('Incognito mode detected (IndexedDB)');
        resolve(true);
      };
      db.onsuccess = () => {
        console.log('Not in incognito mode (IndexedDB)');
        resolve(false);
      };
      
      // Timeout pour être sûr d'avoir une réponse
      setTimeout(() => {
        resolve(false);
      }, 1000);
    });
  };

  // Handler for app installation
  const handleInstall = async () => {
    await installApp();
    setShowInstallPrompt(false);
  };

  // Handler for notification activation
  const handleEnableNotifications = async () => {
    // Vérifier si en mode incognito
    const incognito = await isInIncognitoMode();
    
    if (incognito) {
      toast.error('Les notifications push ne sont pas disponibles en mode navigation privée/incognito');
      return;
    }
    
    // Continuer avec la demande de permission
    const success = await requestPushPermission();
    if (success) {
      setShowNotificationPrompt(false);
    }
  };
  
  // Handler pour désactiver les notifications
  const handleDisableNotifications = async () => {
    const success = await unsubscribeFromPush();
    if (success) {
      setShowManageNotifications(false);
      // Mettre à jour immédiatement le statut sans attendre le prochain effet
      setServerNotificationStatus(false);
    }
  };

  // If no prompt is displayed, do nothing
  if (!showInstallPrompt && !showNotificationPrompt && !showOfflineIndicator && !showManageNotifications) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {/* Installation prompt */}
      {showInstallPrompt && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-2">
            <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm">Install the app</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use Kaapi even offline
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInstallPrompt(false)}
            >
              Later
            </Button>
            <Button size="sm" onClick={handleInstall}>
              Install
            </Button>
          </div>
        </div>
      )}

      {/* Notification prompt */}
      {showNotificationPrompt && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md border border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-2">
            <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm">Enable notifications</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Stay informed of new messages
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNotificationPrompt(false)}
            >
              Refuse
            </Button>
            <Button size="sm" onClick={handleEnableNotifications}>
              Accept
            </Button>
          </div>
        </div>
      )}

      {/* Manage notifications prompt */}
      {showManageNotifications && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md border border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="bg-gray-100 dark:bg-gray-900 rounded-full p-2">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm">Notifications activated</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You will receive notifications for new messages
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowManageNotifications(false)}
            >
              Keep
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDisableNotifications}>
              Disable
            </Button>
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {showOfflineIndicator && (
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg shadow-lg p-3 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
          <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
            You are offline
          </span>
        </div>
      )}
    </div>
  );
}
