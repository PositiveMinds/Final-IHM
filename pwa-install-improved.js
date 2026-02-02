/**
 * Improved PWA Installation Handler
 * Handles PWA installation prompts and manages app installation state
 */

class PWAInstallationManager {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = null;
    this.isInstallable = false;
    this.isRunningAsApp = false;
    this.buttonSearchAttempts = 0;
    this.maxButtonSearchAttempts = 5;
    
    this.init();
  }

  /**
   * Initialize PWA installation system
   */
  init() {
    console.log('[PWA Install] Initializing PWA installation manager');
    
    // Try to find the install button (may not be in DOM yet)
    this.findInstallButton();
    
    // Check if already running as PWA
    this.checkIfRunningAsApp();
    
    // Register service worker
    this.registerServiceWorker();
    
    // Listen for install prompt
    this.setupInstallPromptListener();
    
    // Setup install button
    this.setupInstallButton();
    
    // Check installation status
    this.checkInstallationStatus();
    
    // Log environment
    this.logEnvironment();
  }

  /**
   * Find the install button with retry logic
   */
  findInstallButton() {
    const button = document.getElementById('pwa-install-button');
    if (button) {
      this.installButton = button;
      console.log('[PWA Install] Install button found in DOM');
      return true;
    }
    
    // Retry if not found
    if (this.buttonSearchAttempts < this.maxButtonSearchAttempts) {
      this.buttonSearchAttempts++;
      setTimeout(() => this.findInstallButton(), 500);
    } else {
      console.warn('[PWA Install] Install button not found after multiple attempts');
    }
    return false;
  }

  /**
   * Check if app is running as installed PWA
   */
  checkIfRunningAsApp() {
    this.isRunningAsApp = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
    
    console.log('[PWA Install] Running as app:', this.isRunningAsApp);
    
    if (this.isRunningAsApp && this.installButton) {
      this.installButton.style.display = 'none';
      console.log('[PWA Install] App already installed - hiding install button');
    }
  }

  /**
   * Register service worker
   */
  registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA Install] Service Worker not supported');
      return;
    }

    const basePath = this.getBasePath();
    const swPath = basePath + 'service-worker.js';

    window.addEventListener('load', () => {
      navigator.serviceWorker.register(swPath, { scope: basePath })
        .then(registration => {
          console.log('[PWA Install] Service Worker registered successfully', registration);
          
          // Check for updates every minute
          setInterval(() => {
            registration.update();
          }, 60000);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  this.showUpdateNotification();
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('[PWA Install] Service Worker registration failed:', error);
        });

      // Handle service worker controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA Install] Service Worker controller changed');
      });
    });
  }

  /**
   * Get base path for assets
   */
  getBasePath() {
    return window.APP_BASE_PATH || 
           (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? '/' 
            : '/Final-IHM/');
  }

  /**
   * Setup beforeinstallprompt listener
   */
  setupInstallPromptListener() {
    let beforeInstallPromptFired = false;

    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA Install] beforeinstallprompt event fired (HTTPS/Production)');
      beforeInstallPromptFired = true;
      
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      
      // Store the event
      this.deferredPrompt = e;
      this.isInstallable = true;
      
      // Show install button if not already running as app
      if (!this.isRunningAsApp && this.installButton) {
        this.installButton.style.display = 'flex';
        console.log('[PWA Install] Install prompt available - showing button');
      }
      
      // Show CTA modal if available
      this.showInstallCTA();
    });

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA Install] App installed successfully');
      
      // Hide install button
      if (this.installButton) {
        this.installButton.style.display = 'none';
      }
      
      // Clear deferred prompt
      this.deferredPrompt = null;
      this.isInstallable = false;
      
      // Show success notification
      this.showInstallSuccessNotification();
    });

    // Fallback for localhost/HTTP development
    // beforeinstallprompt doesn't fire on HTTP, but PWA is still functional
    setTimeout(() => {
      if (!beforeInstallPromptFired && !this.isInstallable && !this.isRunningAsApp && 
          this.installButton && ('serviceWorker' in navigator)) {
        
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
          console.log('[PWA Install] HTTP Localhost detected - enabling development install mode');
          this.installButton.style.display = 'flex';
          
          // Create a mock deferred prompt for development testing
          this.deferredPrompt = {
            prompt: () => {
              console.log('[PWA Install] Mock install prompt (development mode)');
              return Promise.resolve();
            },
            userChoice: Promise.resolve({ outcome: 'accepted' })
          };
        }
      }
    }, 1500);
  }

  /**
   * Setup install button event listener
   */
  setupInstallButton() {
    // If button not found yet, retry setup later
    if (!this.installButton) {
      setTimeout(() => this.setupInstallButton(), 500);
      return;
    }

    // Avoid duplicate listeners
    if (this.installButton.hasAttribute('data-install-listener-attached')) {
      return;
    }

    this.installButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.handleInstallClick();
    });

    this.installButton.setAttribute('data-install-listener-attached', 'true');
    console.log('[PWA Install] Install button setup complete');
  }

  /**
   * Handle install button click
   */
  async handleInstallClick() {
    console.log('[PWA Install] Install button clicked');
    
    if (!this.deferredPrompt) {
      console.log('[PWA Install] No install prompt available');
      this.showNotification('Installation Not Available', {
        body: 'Your browser does not support app installation. Please use HTTPS or a supported browser.'
      });
      return;
    }

    try {
      // Show loading state
      const originalHTML = this.installButton.innerHTML;
      this.installButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Installing...';
      this.installButton.disabled = true;

      // Show install prompt
      console.log('[PWA Install] Showing install prompt');
      
      if (this.deferredPrompt.prompt) {
        await this.deferredPrompt.prompt();
      }

      // Wait for user response
      let outcome = 'accepted';
      if (this.deferredPrompt.userChoice) {
        const result = await this.deferredPrompt.userChoice;
        outcome = result?.outcome || 'accepted';
      }
      
      console.log('[PWA Install] User response:', outcome);

      if (outcome === 'accepted') {
        console.log('[PWA Install] Installation accepted');
        this.deferredPrompt = null;
        this.isInstallable = false;
        
        // Hide button
        this.installButton.style.display = 'none';
        
        // Show success
        this.showInstallSuccessNotification();
      } else {
        console.log('[PWA Install] Installation dismissed');
        
        // Restore button
        this.installButton.innerHTML = originalHTML;
        this.installButton.disabled = false;
      }
    } catch (error) {
      console.error('[PWA Install] Installation error:', error);
      
      // Restore button state
      if (this.installButton) {
        this.installButton.disabled = false;
        this.installButton.innerHTML = '<i class="fas fa-download me-2"></i><span class="d-none d-sm-inline">Install App</span>';
      }
      
      this.showNotification('Installation Error', {
        body: 'Could not complete installation. Please try again.'
      });
    }
  }

  /**
   * Show install CTA modal
   */
  showInstallCTA() {
    // Check if CTA class is available
    if (window.PWAInstallCTA) {
      console.log('[PWA Install] Triggering CTA modal');
      if (window.pwaInstallCTAInstance) {
        window.pwaInstallCTAInstance.deferredPrompt = this.deferredPrompt;
        window.pwaInstallCTAInstance.showModalIfNeeded();
      }
    }
  }

  /**
   * Show installation success notification
   */
  showInstallSuccessNotification() {
    this.showNotification('HealthFlow Installed!', {
      body: 'You can now use HealthFlow offline. Look for it in your apps!',
      icon: this.getBasePath() + 'assets/images/healthflow-icon-192x192.png',
      badge: this.getBasePath() + 'assets/images/healthflow-icon-192x192.png',
      requireInteraction: true
    });
  }

  /**
   * Show update notification
   */
  showUpdateNotification() {
    this.showNotification('HealthFlow Update Available', {
      body: 'A new version is ready. Reload to update.',
      requireInteraction: true
    });
  }

  /**
   * Show notification using Notification API
   */
  showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.log('[PWA Install] Notifications not supported');
      return;
    }

    // Request permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.createNotification(title, options);
        }
      });
    } else if (Notification.permission === 'granted') {
      this.createNotification(title, options);
    }
  }

  /**
   * Create and show notification
   */
  createNotification(title, options = {}) {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Use service worker for notifications
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            icon: this.getBasePath() + 'assets/images/favicon.png',
            badge: this.getBasePath() + 'assets/images/favicon.png',
            ...options
          });
        });
      } else {
        // Fallback to native notification
        new Notification(title, {
          icon: this.getBasePath() + 'assets/images/favicon.png',
          ...options
        });
      }
    } catch (error) {
      console.error('[PWA Install] Notification error:', error);
    }
  }

  /**
   * Check installation status
   */
  async checkInstallationStatus() {
    try {
      if ('getInstalledRelatedApps' in navigator) {
        const apps = await navigator.getInstalledRelatedApps();
        if (apps && apps.length > 0) {
          console.log('[PWA Install] App is installed');
          if (this.installButton) {
            this.installButton.style.display = 'none';
          }
        }
      }
    } catch (error) {
      console.log('[PWA Install] Could not check installed apps:', error);
    }
  }

  /**
   * Log environment information for debugging
   */
  logEnvironment() {
    console.log('[PWA Install] Environment Info:');
    console.log('  - Base Path:', this.getBasePath());
    console.log('  - Running as App:', this.isRunningAsApp);
    console.log('  - Service Worker Support:', 'serviceWorker' in navigator);
    console.log('  - Notification Support:', 'Notification' in window);
    console.log('  - Installation Support:', 'beforeinstallprompt' in window);
    console.log('  - Protocol:', window.location.protocol);
    console.log('  - Hostname:', window.location.hostname);
    console.log('  - User Agent:', navigator.userAgent);
  }

  /**
   * Request notification permission
   */
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('[PWA Install] Notification permission:', permission);
      });
    }
  }

  /**
   * Request persistent storage
   */
  requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(persistent => {
        console.log('[PWA Install] Persistent storage:', persistent);
      });
    }
  }
}

// Initialize on DOM ready
let pwaInstallManager = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    pwaInstallManager = new PWAInstallationManager();
  });
} else {
  pwaInstallManager = new PWAInstallationManager();
}

// Export for global access
window.PWAInstallManager = PWAInstallationManager;
window.pwaInstallManager = pwaInstallManager;

console.log('[PWA Install] Module loaded and ready');
