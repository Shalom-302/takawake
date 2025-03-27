/**
 * Service for managing PWA features
 */

// Register a push subscription
export async function registerPushSubscription(subscription: PushSubscriptionJSON, metadata: any = {}) {
  try {
    const response = await fetch('/pwa/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        metadata
      }),
    });

    if (!response.ok) {
      throw new Error('Error during push subscription registration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error during push subscription registration:', error);
    throw error;
  }
}

// Get the public VAPID keys from the server
export async function getVapidPublicKey(): Promise<string> {
  try {
    const response = await fetch('/pwa/push/keys');
    
    if (!response.ok) {
      throw new Error('Error during VAPID key retrieval');
    }
    
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error('Error during VAPID key retrieval:', error);
    throw error;
  }
}

// Unregister a push subscription
export async function unregisterPushSubscription(subscriptionId: string) {
  try {
    const response = await fetch(`/pwa/push/unsubscribe/${subscriptionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error during push subscription unregistration');
    }

    return true;
  } catch (error) {
    console.error('Error during push subscription unregistration:', error);
    throw error;
  }
}

// Check if the browser supports PWA
export function isPwaSupported() {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
}

// Convert a VAPID key to Uint8Array
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
}

// Types for push subscriptions
export interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Get the Service Worker status
export async function getServiceWorkerStatus(): Promise<{
  registered: boolean;
  active: boolean;
}> {
  if (!('serviceWorker' in navigator)) {
    return { registered: false, active: false };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      registered: !!registration,
      active: !!registration && !!registration.active,
    };
  } catch (error) {
    console.error('Error during Service Worker status verification:', error);
    return { registered: false, active: false };
  }
}

// Register a click event on a notification
export async function recordNotificationClick(receiptId: string) {
  try {
    const response = await fetch(`/pwa/push/receipt/${receiptId}/clicked`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Error during notification click registration');
    }

    return true;
  } catch (error) {
    console.error('Error during notification click registration:', error);
    return false;
  }
}

// Get recent notifications
export async function getRecentNotifications(limit: number = 10) {
  try {
    const response = await fetch(`/pwa/push/notifications/recent?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Error during recent notifications retrieval');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error during recent notifications retrieval:', error);
    throw error;
  }
}
