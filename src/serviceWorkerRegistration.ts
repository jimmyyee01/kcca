// Service Worker Registration and Lifecycle Manager for Kampala Pothole Tracker

export function registerServiceWorker(onSyncTriggered?: () => void) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker] Registered successfully with scope:', registration.scope);

          // Listen for update found
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[Service Worker] New content available; please refresh.');
                  } else {
                    console.log('[Service Worker] Content cached for offline use.');
                  }
                }
              };
            }
          };

          // Register Background Sync if supported
          if ('sync' in registration) {
            (registration as any).sync.register('sync-potholes').catch((err: any) => {
              console.log('[Service Worker] Background sync registration skipped:', err);
            });
          }
        })
        .catch((error) => {
          console.warn('[Service Worker] Registration failed (dev mode fallback active):', error);
        });

      // Listen for messages from Service Worker (e.g. background sync triggers)
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC_TRIGGERED') {
          console.log('[Service Worker] Received BACKGROUND_SYNC_TRIGGERED message');
          if (onSyncTriggered) {
            onSyncTriggered();
          }
        }
      });
    });
  }
}

export function requestBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((reg: any) => {
      if (reg.sync) {
        return reg.sync.register('sync-potholes');
      }
    }).catch((err) => {
      console.log('[SyncManager] Background sync request error:', err);
    });
  }
}
