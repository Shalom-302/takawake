/**
 * Service pour gérer les fonctionnalités PWA
 */

// Enregistrer une souscription aux notifications push
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
      throw new Error('Erreur lors de l\'enregistrement de la souscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la souscription push:', error);
    throw error;
  }
}

// Récupérer les clés VAPID publiques du serveur
export async function getVapidPublicKey(): Promise<string> {
  try {
    const response = await fetch('/pwa/push/keys');
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des clés VAPID');
    }
    
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé VAPID publique:', error);
    throw error;
  }
}

// Désinscrire une souscription aux notifications push
export async function unregisterPushSubscription(subscriptionId: string) {
  try {
    const response = await fetch(`/pwa/push/unsubscribe/${subscriptionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la désinscription');
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la désinscription des notifications push:', error);
    throw error;
  }
}

// Vérifier si le navigateur prend en charge les PWA
export function isPwaSupported() {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
}

// Convertir une clé VAPID en Uint8Array
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

// Types pour les souscriptions push
export interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Récupérer le statut du Service Worker
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
    console.error('Erreur lors de la vérification du statut du Service Worker:', error);
    return { registered: false, active: false };
  }
}

// Enregistrer un évènement de clic sur une notification
export async function recordNotificationClick(receiptId: string) {
  try {
    const response = await fetch(`/pwa/push/receipt/${receiptId}/clicked`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'enregistrement du clic sur la notification');
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du clic sur la notification:', error);
    return false;
  }
}

// Récupérer les notifications récentes
export async function getRecentNotifications(limit: number = 10) {
  try {
    const response = await fetch(`/pwa/push/notifications/recent?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des notifications récentes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications récentes:', error);
    throw error;
  }
}
