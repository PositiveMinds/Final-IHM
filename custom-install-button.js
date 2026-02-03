/**
 * Custom PWA Install Button
 * Provides multiple install button styles (floating, banner, modal)
 * Automatically hides when app is already installed
 */

let deferredPrompt = null;
let installButtonElement = null;

// Configuration
const BUTTON_STYLES = {
  FLOATING: 'floating',     // Bottom-right floating button
  BANNER: 'banner',         // Top banner style
  MODAL: 'modal'            // Modal dialog
};

const CURRENT_STYLE = BUTTON_STYLES.MODAL; // Change this to switch styles

/**
 * Check if running as installed PWA
 */
function isRunningAsPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if app is already installed
 */
async function isAppInstalled() {
  try {
    if ('getInstalledRelatedApps' in navigator) {
      const apps = await navigator.getInstalledRelatedApps();
      return apps && apps.length > 0;
    }
  } catch (error) {
    console.log('[Custom Install] Could not check installed apps:', error);
  }
  return false;
}

/**
 * Create floating button HTML
 */
function createFloatingButton() {
  const basePath = window.APP_BASE_PATH || './';
  const button = document.createElement('div');
  button.className = 'custom-install-button';
  button.id = 'custom-install-button';
  button.innerHTML = `
    <div class="install-tooltip">Click to install HealthFlow</div>
    <button class="custom-install-button-content" aria-label="Install HealthFlow App">
      <i class="fas fa-download custom-install-button-icon"></i>
      <span class="install-button-text">Install App</span>
    </button>
  `;
  document.body.appendChild(button);
  return button;
}

/**
 * Create banner install prompt
 */
function createBannerButton() {
  const banner = document.createElement('div');
  banner.className = 'install-banner hidden';
  banner.id = 'custom-install-button';
  banner.innerHTML = `
    <div class="install-banner-content">
      <div class="install-banner-icon">
        <i class="fas fa-mobile-alt"></i>
      </div>
      <div class="install-banner-text">
        <strong>Install HealthFlow</strong>
        <span>Get access offline and on your home screen</span>
      </div>
    </div>
    <div class="install-banner-actions">
      <button class="install-banner-btn install-banner-btn-install" id="banner-install-btn">Install</button>
      <button class="install-banner-btn install-banner-btn-close" id="banner-close-btn">Later</button>
    </div>
  `;
  
  // Insert at top of main content
  const mainContent = document.body.firstElementChild;
  if (mainContent) {
    mainContent.parentNode.insertBefore(banner, mainContent);
  } else {
    document.body.prepend(banner);
  }
  
  return banner;
}

/**
 * Create modal install prompt
 */
function createModalButton() {
  const overlay = document.createElement('div');
  overlay.className = 'install-modal-overlay';
  overlay.id = 'custom-install-button';
  overlay.innerHTML = `
    <div class="install-modal-content">
      <div class="install-modal-icon">
        <i class="fas fa-download"></i>
      </div>
      <h2 class="install-modal-title">Install HealthFlow</h2>
      <p class="install-modal-description">
        Get instant access to healthcare automation tools offline, right on your device.
      </p>
      
      <div class="install-modal-features">
        <div class="install-modal-feature">
          <i class="fas fa-wifi-slash"></i>
          <span>Works offline</span>
        </div>
        <div class="install-modal-feature">
          <i class="fas fa-bell"></i>
          <span>Push notifications</span>
        </div>
        <div class="install-modal-feature">
          <i class="fas fa-bolt"></i>
          <span>Lightning fast</span>
        </div>
        <div class="install-modal-feature">
          <i class="fas fa-shield-alt"></i>
          <span>Secure & private</span>
        </div>
      </div>

      <div class="install-modal-buttons">
        <button class="install-modal-btn install-modal-btn-install" id="modal-install-btn">
          Install Now
        </button>
        <button class="install-modal-btn install-modal-btn-cancel" id="modal-cancel-btn">
          Not Now
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  return overlay;
}

/**
 * Show install button
 */
function showInstallButton() {
  if (!installButtonElement) return;
  
  if (CURRENT_STYLE === BUTTON_STYLES.FLOATING) {
    installButtonElement.classList.add('show');
    installButtonElement.classList.remove('hide');
  } else if (CURRENT_STYLE === BUTTON_STYLES.BANNER) {
    installButtonElement.classList.remove('hidden');
  } else if (CURRENT_STYLE === BUTTON_STYLES.MODAL) {
    installButtonElement.classList.add('show');
  }
  
  console.log('[Custom Install] Button shown');
}

/**
 * Hide install button
 */
function hideInstallButton() {
  if (!installButtonElement) return;
  
  if (CURRENT_STYLE === BUTTON_STYLES.FLOATING) {
    installButtonElement.classList.remove('show');
    installButtonElement.classList.add('hide');
    // Remove from DOM after animation
    setTimeout(() => {
      installButtonElement.style.display = 'none';
    }, 300);
  } else if (CURRENT_STYLE === BUTTON_STYLES.BANNER) {
    installButtonElement.classList.add('hidden');
  } else if (CURRENT_STYLE === BUTTON_STYLES.MODAL) {
    installButtonElement.classList.remove('show');
  }
  
  console.log('[Custom Install] Button hidden');
}

/**
 * Set loading state
 */
function setLoadingState(isLoading = true) {
  if (!installButtonElement) return;
  
  const buttonContent = installButtonElement.querySelector('button');
  if (!buttonContent) return;
  
  if (isLoading) {
    installButtonElement.classList.add('loading');
    if (CURRENT_STYLE === BUTTON_STYLES.FLOATING) {
      buttonContent.innerHTML = '<i class="fas fa-spinner fa-spin custom-install-button-icon"></i>';
    } else if (CURRENT_STYLE === BUTTON_STYLES.BANNER) {
      const installBtn = installButtonElement.querySelector('.install-banner-btn-install');
      if (installBtn) {
        installBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Installing...';
        installBtn.disabled = true;
      }
    } else if (CURRENT_STYLE === BUTTON_STYLES.MODAL) {
      const modalBtn = installButtonElement.querySelector('#modal-install-btn');
      if (modalBtn) {
        modalBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Installing...';
        modalBtn.disabled = true;
      }
    }
  } else {
    installButtonElement.classList.remove('loading');
  }
}

/**
 * Set success state
 */
function setSuccessState() {
  if (!installButtonElement) return;
  
  installButtonElement.classList.add('success');
  
  const buttonContent = installButtonElement.querySelector('button');
  if (!buttonContent) return;
  
  if (CURRENT_STYLE === BUTTON_STYLES.FLOATING) {
    buttonContent.innerHTML = '<i class="fas fa-check custom-install-button-icon"></i>';
  } else if (CURRENT_STYLE === BUTTON_STYLES.BANNER) {
    const installBtn = installButtonElement.querySelector('.install-banner-btn-install');
    if (installBtn) {
      installBtn.innerHTML = '<i class="fas fa-check"></i> Installed!';
    }
  } else if (CURRENT_STYLE === BUTTON_STYLES.MODAL) {
    const modalBtn = installButtonElement.querySelector('#modal-install-btn');
    if (modalBtn) {
      modalBtn.innerHTML = '<i class="fas fa-check"></i> Installed!';
    }
  }
  
  // Hide after 2 seconds
  setTimeout(() => {
    hideInstallButton();
  }, 2000);
}

/**
 * Handle install button click
 */
async function handleInstallClick() {
  console.log('[Custom Install] Install clicked');
  
  if (!deferredPrompt) {
    console.log('[Custom Install] Install prompt not available');
    showNotification('Not Available', {
      body: 'Your browser does not support app installation.'
    });
    return;
  }
  
  try {
    setLoadingState(true);
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[Custom Install] Install outcome:', outcome);
    
    if (outcome === 'accepted') {
      deferredPrompt = null;
      setSuccessState();
      
      showNotification('HealthFlow Installed!', {
        body: 'You can now use HealthFlow offline.',
        icon: (window.APP_BASE_PATH || './') + 'assets/images/healthflow-icon-192x192.png'
      });
      
      console.log('[Custom Install] ✅ HealthFlow installed successfully');
    } else if (outcome === 'dismissed') {
      console.log('[Custom Install] Installation cancelled');
      setLoadingState(false);
    }
  } catch (error) {
    console.error('[Custom Install] Installation error:', error);
    setLoadingState(false);
    
    showNotification('Installation Error', {
      body: 'Could not complete installation. Please try again.'
    });
  }
}

/**
 * Show notification
 */
function showNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const defaultOptions = {
      icon: (window.APP_BASE_PATH || './') + 'assets/images/favicon.png',
      badge: (window.APP_BASE_PATH || './') + 'assets/images/favicon.png',
      ...options
    };
    
    return new Notification(title, defaultOptions);
  }
}

/**
 * Check if app is already installed and hide button if so
 */
async function checkAndHideButton() {
  // Check if running as standalone PWA
  if (isRunningAsPWA()) {
    console.log('[Custom Install] App running as standalone - hiding button');
    hideInstallButton();
    return;
  }
  
  // Check if app is installed
  const installed = await isAppInstalled();
  if (installed) {
    console.log('[Custom Install] App already installed - hiding button');
    hideInstallButton();
    return;
  }
  
  // Show button if deferredPrompt available
  if (!deferredPrompt) {
    console.log('[Custom Install] Install prompt not yet available - keeping hidden');
  }
}

/**
 * Listen for beforeinstallprompt event
 */
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  console.log('[Custom Install] beforeinstallprompt fired - showing button');
  console.log('[Custom Install] Prompt object:', deferredPrompt);
  
  if (!isRunningAsPWA()) {
    // Small delay to ensure button is rendered
    setTimeout(() => {
      showInstallButton();
    }, 100);
  }
});

/**
 * Listen for app installed event
 */
window.addEventListener('appinstalled', () => {
  console.log('[Custom Install] App installed');
  deferredPrompt = null;
  hideInstallButton();
  
  showNotification('HealthFlow Installed!', {
    body: 'You can now use HealthFlow offline.'
  });
});

/**
 * Attach click handlers to button
 */
function attachClickHandlers() {
  if (!installButtonElement) return;
  
  if (CURRENT_STYLE === BUTTON_STYLES.FLOATING) {
    const button = installButtonElement.querySelector('button');
    if (button) {
      button.addEventListener('click', handleInstallClick);
    }
  } else if (CURRENT_STYLE === BUTTON_STYLES.BANNER) {
    const installBtn = installButtonElement.querySelector('#banner-install-btn');
    const closeBtn = installButtonElement.querySelector('#banner-close-btn');
    
    if (installBtn) {
      installBtn.addEventListener('click', handleInstallClick);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', hideInstallButton);
    }
  } else if (CURRENT_STYLE === BUTTON_STYLES.MODAL) {
    const installBtn = installButtonElement.querySelector('#modal-install-btn');
    const cancelBtn = installButtonElement.querySelector('#modal-cancel-btn');
    const overlay = installButtonElement;
    
    if (installBtn) {
      installBtn.addEventListener('click', handleInstallClick);
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', hideInstallButton);
    }
    
    // Close modal when clicking overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        hideInstallButton();
      }
    });
  }
  
  console.log('[Custom Install] Click handlers attached');
}

/**
 * Initialize custom install button
 */
function initCustomInstallButton() {
  console.log('[Custom Install] Initializing with style:', CURRENT_STYLE);
  
  // Create button based on style
  if (CURRENT_STYLE === BUTTON_STYLES.FLOATING) {
    installButtonElement = createFloatingButton();
  } else if (CURRENT_STYLE === BUTTON_STYLES.BANNER) {
    installButtonElement = createBannerButton();
  } else if (CURRENT_STYLE === BUTTON_STYLES.MODAL) {
    installButtonElement = createModalButton();
  }
  
  // Attach click handlers
  attachClickHandlers();
  
  // Check if already installed
  checkAndHideButton();
}

/**
 * Request notification permission on user interaction
 */
function requestNotificationPermissionOnInteraction() {
  const handler = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        Notification.requestPermission();
      } catch (err) {
        console.error('[Custom Install] Notification permission error:', err);
      }
    }
    document.removeEventListener('click', handler);
    document.removeEventListener('touchstart', handler);
  };
  
  document.addEventListener('click', handler, { once: true });
  document.addEventListener('touchstart', handler, { once: true });
}

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initCustomInstallButton();
  requestNotificationPermissionOnInteraction();
  console.log('[Custom Install] Initialized');
});

/**
 * Export for external use
 */
window.CustomInstallButton = {
  show: showInstallButton,
  hide: hideInstallButton,
  handleInstall: handleInstallClick,
  setStyle: (style) => {
    console.log('[Custom Install] Style can only be changed before initialization');
  },
  getButton: () => installButtonElement,
  getDeferredPrompt: () => deferredPrompt,
  isInstalled: isAppInstalled,
  isRunningAsPWA: isRunningAsPWA
};

console.log('[Custom Install] Module loaded - Style:', CURRENT_STYLE);
