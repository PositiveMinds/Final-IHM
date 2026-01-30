// PWA Install Handler
if (typeof deferredPrompt === 'undefined') {
    var deferredPrompt;
}
const installButton = document.getElementById('pwa-install-button');

// Check if running as PWA
function isRunningAsPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Check if app is already installed
async function isAppInstalled() {
  try {
    if ('getInstalledRelatedApps' in navigator) {
      const apps = await navigator.getInstalledRelatedApps();
      return apps && apps.length > 0;
    }
  } catch (error) {
    console.log('[PWA] Could not check installed apps:', error);
  }
  return false;
}

// Hide install button on page load if app is installed
async function checkAndHideInstallButton() {
  // Check if running as standalone app
  if (isRunningAsPWA()) {
    if (installButton) {
      installButton.style.display = 'none';
      console.log('[PWA] App already running as standalone - hiding install button');
    }
    return;
  }
  
  // Check if app is installed using getInstalledRelatedApps
  const installed = await isAppInstalled();
  if (installed) {
    if (installButton) {
      installButton.style.display = 'none';
      console.log('[PWA] App already installed - hiding install button');
    }
    return;
  }
  
  // If not installed and beforeinstallprompt hasn't fired yet, hide button
  // (it will be shown when beforeinstallprompt event fires)
  if (installButton && !deferredPrompt) {
    installButton.style.display = 'none';
  }
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing
  e.preventDefault();
  
  // Store the event for later use
  deferredPrompt = e;
  
  // Show the install button only if app is not already running as PWA
  if (!isRunningAsPWA() && installButton) {
    installButton.style.display = 'flex';
    console.log('[PWA] Install prompt ready - showing install button');
  } else {
    console.log('[PWA] Install prompt fired but app already running as PWA');
  }
});

// Handle install button click
if (installButton) {
  installButton.addEventListener('click', async (e) => {
    e.preventDefault();
    
    console.log('[PWA] Install button clicked');
    
    if (!deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      showNotification('Installation Not Available', {
        body: 'Your browser does not support app installation yet.'
      });
      return;
    }
    
    try {
      // Show loading state
      const originalText = installButton.innerHTML;
      installButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Installing...';
      installButton.disabled = true;
      
      // Show the install prompt
      console.log('[PWA] Showing install prompt');
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA] Install outcome:', outcome);
      
      if (outcome === 'accepted') {
        deferredPrompt = null;
        
        // Hide the install button after successful installation
        installButton.style.display = 'none';
        
        console.log('[PWA] App installed successfully!');
        showNotification('HealthFlow Installed!', {
          body: 'You can now use HealthFlow offline. Look for it in your apps!',
          icon: '/Final-IHM/assets/images/healthflow-icon-192x192.png',
          badge: '/Final-IHM/assets/images/healthflow-icon-192x192.png'
        });
        
        // Also log to console
        console.log('[PWA] ✅ HealthFlow is now installed on your device');
        
      } else if (outcome === 'dismissed') {
        console.log('[PWA] App installation cancelled by user');
        
        // Restore button state
        installButton.innerHTML = originalText;
        installButton.disabled = false;
        
        // Optional: Show a subtle message
        console.log('[PWA] You can install HealthFlow anytime by clicking the Install button');
      }
    } catch (error) {
      console.error('[PWA] Installation error:', error);
      
      // Restore button state
      installButton.innerHTML = originalText;
      installButton.disabled = false;
      
      showNotification('Installation Error', {
        body: 'Could not complete installation. Please try again.'
      });
    }
  });
}

// Hide install button if app is already installed
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed as standalone');
  if (installButton) {
    installButton.style.display = 'none';
  }
  deferredPrompt = null;
});

// Register service worker with periodic updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Final-IHM/service-worker.js', { scope: '/Final-IHM/' })
      .then(registration => {
        console.log('[PWA] Service Worker registered:', registration);
        
        // Check for updates every minute
        setInterval(() => {
          registration.update();
        }, 60000);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              showUpdatePrompt();
            }
          });
        });
      })
      .catch(error => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
    
    // Handle service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Service Worker updated');
    });
  });
}

// Request notification permission
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('[PWA] Notification permission granted');
      }
    });
  }
}

// Request persistent storage
function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(persistent => {
      if (persistent) {
        console.log('[PWA] Persistent storage granted');
      } else {
        console.log('[PWA] Persistent storage denied');
      }
    });
  }
}

// Show notification
function showNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const defaultOptions = {
      icon: '/Final-IHM/assets/images/favicon.png',
      badge: '/Final-IHM/assets/images/favicon.png',
      ...options
    };
    
    return new Notification(title, defaultOptions);
  }
}

// Show update prompt
function showUpdatePrompt() {
  if ('Notification' in window && Notification.permission === 'granted') {
    showNotification('HealthFlow Update Available', {
      body: 'A new version is ready. Reload to update.',
      tag: 'update-notification',
      requireInteraction: true,
      actions: [
        { action: 'reload', title: 'Reload Now' },
        { action: 'later', title: 'Later' }
      ]
    });
  } else {
    // Fallback to alert if notifications not available
    const shouldUpdate = confirm('A new version of HealthFlow is available. Reload now?');
    if (shouldUpdate) {
      window.location.reload();
    }
  }
}

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('[PWA] Back online');
  showNotification('Back Online', {
    body: 'HealthFlow is syncing your changes...'
  });
  syncOfflineData();
});

window.addEventListener('offline', () => {
  console.log('[PWA] Going offline');
  showNotification('Offline Mode', {
    body: 'You are now offline. Changes will sync when online.'
  });
});

// Sync offline data when connection returns
function syncOfflineData() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register('sync-offline-data');
    }).catch(err => {
      console.error('[PWA] Sync registration failed:', err);
    });
  }
}

// Back to Top Button functionality
function initBackToTopButton() {
  const backToTopButton = document.getElementById('backToTopButton');
  
  if (!backToTopButton) return;
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }
  });
  
  // Scroll to top when button is clicked
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Cache priority URLs
function preCacheImportantAssets() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      // Pre-cache dashboard and other important pages
      const importantAssets = [
        '/Final-IHM/dashboard.html',
        '/Final-IHM/patient-portal.html',
        '/Final-IHM/forms.html'
      ];
      
      navigator.serviceWorker.controller?.postMessage({
        type: 'CACHE_URLS',
        urls: importantAssets
      });
    });
  }
}

// Clear old caches
function clearOldCaches() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      const messageChannel = new MessageChannel();
      navigator.serviceWorker.controller?.postMessage({
        type: 'CLEAR_CACHE'
      }, [messageChannel.port2]);
    });
  }
}

// Request notification permission on user interaction
function requestNotificationPermissionOnInteraction() {
  const interactionHandler = () => {
    requestNotificationPermission();
    requestPersistentStorage();
    document.removeEventListener('click', interactionHandler);
    document.removeEventListener('touchstart', interactionHandler);
  };
  
  document.addEventListener('click', interactionHandler, { once: true });
  document.addEventListener('touchstart', interactionHandler, { once: true });
}

// Initialize PWA features
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[PWA] Initializing...');
  
  // Check and hide install button if app is already installed
  await checkAndHideInstallButton();
  
  // Initialize back to top button
  initBackToTopButton();
  
  // Log PWA status
  if (isRunningAsPWA()) {
    console.log('[PWA] Running as standalone app');
  }
  
  // Request permissions only on user interaction
  requestNotificationPermissionOnInteraction();
  
  // Pre-cache important assets
  preCacheImportantAssets();
  
  // Log online status
  console.log('[PWA] Online:', navigator.onLine);
});

// Export functions for use in other scripts
window.PWA = {
  isRunningAsPWA,
  isAppInstalled,
  checkAndHideInstallButton,
  showNotification,
  syncOfflineData,
  clearOldCaches,
  preCacheImportantAssets
};

console.log('[PWA] Module loaded');
