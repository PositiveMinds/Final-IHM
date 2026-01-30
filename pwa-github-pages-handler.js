/**
 * GitHub Pages PWA Handler
 * Automatically detects deployment environment and configures PWA paths
 * Must be loaded BEFORE other PWA scripts
 */

(function initGitHubPagesPWA() {
  // Detect environment and set base paths
  const detectEnvironment = () => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const protocol = window.location.protocol;

    // GitHub Pages detection
    if (hostname === 'positiveminds.github.io' || hostname.endsWith('.github.io')) {
      console.log('[PWA Config] GitHub Pages detected');

      // Determine if it's a project repo or user/org pages
      // Project repos have URL like: https://positiveminds.github.io/HealthFlow/
      // User/org repos have URL like: https://positiveminds.github.io/

      const pathParts = pathname.split('/').filter(p => p);

      if (pathParts.length > 0 && pathParts[0] !== '') {
        // Project repository (e.g., /HealthFlow/)
        const repoName = pathParts[0];
        console.log('[PWA Config] GitHub Pages - github-project');
        console.log('[PWA Config] Repository:', repoName);
        console.log('[PWA Config] Base path:', `/${repoName}/`);
        return {
          type: 'github-project',
          basePath: `/${repoName}/`,
          isDevelopment: false,
          isGitHubPages: true,
          repoName: repoName
        };
      } else {
        // User or organization pages
        return {
          type: 'github-user-org',
          basePath: '/',
          isDevelopment: false,
          isGitHubPages: true,
          repoName: null
        };
      }
    }

    // Local development detection
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      console.log('[PWA Config] Local development detected');
      return {
        type: 'local',
        basePath: '/',
        isDevelopment: true,
        isGitHubPages: false,
        repoName: null
      };
    }

    // Custom domain or other hosting
    console.log('[PWA Config] Custom deployment detected');
    return {
      type: 'custom',
      basePath: '/',
      isDevelopment: false,
      isGitHubPages: false,
      repoName: null
    };
  };

  // Initialize configuration
  const config = detectEnvironment();

  // Create path builder utility
  const pathBuilder = {
    // Get absolute path to a resource
    resource: (relativePath) => {
      const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
      return `${config.basePath}${cleanPath}`;
    },

    // Get service worker path
    serviceWorker: () => {
      return pathBuilder.resource('service-worker.js');
    },

    // Get manifest path
    manifest: () => {
      return pathBuilder.resource('manifest.json');
    },

    // Get page path
    page: (page) => {
      return pathBuilder.resource(page);
    }
  };

  // Store in global scope for other scripts
  window.PWA_ENV = config;
  window.PWA_PATHS = pathBuilder;

  // Log configuration for debugging
  if (config.isDevelopment) {
    console.log('[PWA Config] Development mode');
  } else if (config.isGitHubPages) {
    console.log(`[PWA Config] GitHub Pages - ${config.type}`);
    if (config.repoName) {
      console.log(`[PWA Config] Repository: ${config.repoName}`);
    }
  } else {
    console.log('[PWA Config] Custom deployment');
  }

  console.log('[PWA Config] Base path:', config.basePath);
  console.log('[PWA Config] Service Worker path:', pathBuilder.serviceWorker());
  console.log('[PWA Config] Manifest path:', pathBuilder.manifest());

  // Auto-update manifest link if needed (for GitHub Pages)
  if (config.isGitHubPages && config.basePath !== '/') {
    document.addEventListener('DOMContentLoaded', () => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        manifestLink.href = pathBuilder.manifest();
        console.log('[PWA Config] Manifest link updated for GitHub Pages');
      }
    });
  }
})();

/**
 * Enhanced PWA Install Handler - Uses GitHub Pages config
 */

let deferredPrompt;
const installButton = document.getElementById('pwa-install-button');

// Check if running as PWA
function isRunningAsPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (installButton) {
    installButton.style.display = 'flex';
  }

  console.log('[PWA] Install prompt ready');
});

// Handle install button click
if (installButton) {
  installButton.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      deferredPrompt = null;
      if (installButton) {
        installButton.style.display = 'none';
      }
      console.log('[PWA] App installed successfully!');
      showNotification('HealthFlow installed!', 'You can now use the app offline');
    } else {
      console.log('[PWA] App installation cancelled');
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

// Register service worker with GitHub Pages support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use PWA_PATHS for service worker registration if available
    const swPath = window.PWA_PATHS ? window.PWA_PATHS.serviceWorker() : './service-worker.js';

    console.log('[PWA] Registering service worker at:', swPath);
    console.log('[PWA] Environment:', window.PWA_ENV?.type || 'unknown');

    navigator.serviceWorker.register(swPath, {
      scope: window.PWA_ENV?.basePath || './'
    })
      .then(registration => {
        console.log('[PWA] Service Worker registered:', registration);
        console.log('[PWA] Service Worker scope:', registration.scope);

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
        console.error('[PWA] Failed path:', swPath);

        // Provide helpful debugging info
        if (window.PWA_ENV?.isGitHubPages) {
          console.error('[PWA] Hint: Verify .nojekyll file exists in GitHub Pages repository root');
          console.error('[PWA] Hint: Check that service-worker.js path is correct for your deployment');
        }
      });

    // Handle service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Service Worker updated');
    });
  });
}

// Show update prompt
function showUpdatePrompt() {
  if (window.Swal) {
    Swal.fire({
      title: 'Update Available',
      text: 'A new version of HealthFlow is available. Reload to update.',
      icon: 'info',
      confirmButtonText: 'Reload Now',
      cancelButtonText: 'Later',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
  }
}

// Notification utility
function showNotification(title, message) {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: window.PWA_PATHS ? window.PWA_PATHS.resource('assets/images/favicon.png') : './assets/images/favicon.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: window.PWA_PATHS ? window.PWA_PATHS.resource('assets/images/favicon.png') : './assets/images/favicon.png'
          });
        }
      });
    }
  }
}

// Initialize PWA features
class PWAManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.init();
  }

  init() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    console.log('[PWA] Manager initialized. Online:', this.isOnline);
  }

  handleOnline() {
    this.isOnline = true;
    console.log('[PWA] Online: true');
    document.body.classList.remove('offline-mode');

    // Trigger sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-offline-data').catch(err => {
          console.log('[PWA] Background sync not available:', err);
        });
      });
    }
  }

  handleOffline() {
    this.isOnline = false;
    console.log('[PWA] Online: false');
    document.body.classList.add('offline-mode');
  }

  // Request persistent storage
  async requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persist();
        console.log(`[PWA] Persistent storage ${isPersisted ? 'granted' : 'denied'}`);
        return isPersisted;
      } catch (err) {
        console.error('[PWA] Persistent storage request failed:', err);
        return false;
      }
    }
    return false;
  }
}

// Initialize PWA Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.pwaManager = new PWAManager();

  // Request persistent storage
  window.pwaManager.requestPersistentStorage();
});

// Export for other scripts
window.PWA = {
  env: window.PWA_ENV,
  paths: window.PWA_PATHS,
  manager: null // Will be set when PWAManager initializes
};

console.log('[PWA] GitHub Pages Handler loaded');
