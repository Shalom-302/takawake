import React, { useState, useEffect } from 'react';
import { usePWA } from '@/lib/contexts/pwa-context';
import { Button } from '../ui/button';
import { Bell, Download, WifiOff } from 'lucide-react';

export function PWAPrompt() {
  const { 
    isInstallable, 
    installApp, 
    isPushSupported, 
    isPushSubscribed, 
    requestPushPermission, 
    isOnline 
  } = usePWA();

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);

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
    if (isPushSupported && !isPushSubscribed) {
      // Wait a bit longer before asking for notifications
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      setShowNotificationPrompt(false);
    }
  }, [isPushSupported, isPushSubscribed]);

  // Manage offline status indicator
  useEffect(() => {
    setShowOfflineIndicator(!isOnline);
  }, [isOnline]);

  // Handler for app installation
  const handleInstall = async () => {
    await installApp();
    setShowInstallPrompt(false);
  };

  // Handler for notification activation
  const handleEnableNotifications = async () => {
    const success = await requestPushPermission();
    if (success) {
      setShowNotificationPrompt(false);
    }
  };

  // If no prompt is displayed, do nothing
  if (!showInstallPrompt && !showNotificationPrompt && !showOfflineIndicator) {
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
