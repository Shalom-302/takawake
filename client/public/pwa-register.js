// Service Worker registration script
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Service Worker registered successfully
      console.log('Service Worker registered successfully on:', registration.scope);
      
      // Check if the browser supports push notifications
      if ('PushManager' in window) {
        initializePushNotifications(registration);
      }
    }).catch(function(error) {
      // Failed to register Service Worker
      console.error('Error registering Service Worker:', error);
    });
  });
}

// Function to initialize push notifications
async function initializePushNotifications(registration) {
  try {
    // Check if the user is already subscribed
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('User already subscribed to push notifications');
      // Send the subscription to the server for update if necessary
      sendSubscriptionToServer(subscription);
      return;
    }
    
    // Retrieve the VAPID public key from the server
    const response = await fetch('/pwa/push/keys');
    if (!response.ok) {
      throw new Error('Unable to retrieve VAPID keys');
    }
    
    const data = await response.json();
    const vapidPublicKey = data.publicKey;
    
    // Convert VAPID public key to Uint8Array
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
    
    // Subscribe to push notifications
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });
    
    console.log('User subscribed to push notifications');
    
    // Send the subscription to the server
    sendSubscriptionToServer(newSubscription);
    
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
}

// Function to send subscription to server
async function sendSubscriptionToServer(subscription) {
  try {
    // Collect device metadata
    const metadata = {
      userAgent: navigator.userAgent,
      language: navigator.language || 'fr',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform
    };
    
    // Send the subscription to the server
    const response = await fetch('/pwa/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription: subscription,
        metadata: metadata
      })
    });
    
    if (!response.ok) {
      throw new Error('Unable to register subscription');
    }
    
    console.log('Subscription registered successfully');
  } catch (error) {
    console.error('Error sending subscription to server:', error);
  }
}

// Utility function to convert VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String) {
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

// Event listener for messages from the Service Worker
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
    // Register the click on the notification
    const receiptId = event.data.receiptId;
    if (receiptId) {
      fetch(`/pwa/push/receipt/${receiptId}/clicked`, {
        method: 'POST'
      }).catch(error => {
        console.error('Error registering click:', error);
      });
    }
  }
});
