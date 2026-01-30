// PWA Install CTA Modal
// Displays a call-to-action modal encouraging app installation

class PWAInstallCTA {
  constructor(options = {}) {
    this.options = {
      showAfterSeconds: options.showAfterSeconds || 5,
      hideAfterInstall: options.hideAfterInstall !== false,
      showOnlyOnce: options.showOnlyOnce !== false,
      storageKey: options.storageKey || 'pwa-install-cta-dismissed',
      ...options
    };
    
    this.deferredPrompt = null;
    this.modal = null;
    this.hasShown = this.checkIfShownBefore();
    
    this.init();
  }
  
  // Check if CTA was shown before and dismissed
  checkIfShownBefore() {
    if (this.options.showOnlyOnce) {
      const dismissed = localStorage.getItem(this.options.storageKey);
      return dismissed === 'true';
    }
    return false;
  }
  
  // Mark CTA as dismissed
  markAsDismissed() {
    localStorage.setItem(this.options.storageKey, 'true');
  }
  
  // Check if app is installable
  async canInstall() {
    // Already running as PWA
    if (window.PWA?.isRunningAsPWA?.()) {
      return false;
    }
    
    // Already installed
    if (window.PWA?.isAppInstalled && await window.PWA.isAppInstalled()) {
      return false;
    }
    
    return !!this.deferredPrompt;
  }
  
  // Create modal HTML
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'pwa-install-cta-modal';
    modal.className = 'pwa-install-cta-modal';
    modal.innerHTML = `
      <div class="pwa-install-cta-backdrop"></div>
      <div class="pwa-install-cta-content">
        <button class="pwa-install-cta-close" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="pwa-install-cta-icon">
          <img src="assets/images/healthflow-icon-192x192.png" alt="HealthFlow Icon" />
        </div>
        
        <h2 class="pwa-install-cta-title">Install HealthFlow</h2>
        
        <p class="pwa-install-cta-description">
          Get instant access to healthcare management tools. Install HealthFlow on your device for quick access and offline support.
        </p>
        
        <div class="pwa-install-cta-features">
          <div class="pwa-install-cta-feature">
            <i class="fas fa-mobile-alt"></i>
            <span>Quick Access</span>
          </div>
          <div class="pwa-install-cta-feature">
            <i class="fas fa-wifi-off"></i>
            <span>Works Offline</span>
          </div>
          <div class="pwa-install-cta-feature">
            <i class="fas fa-bell"></i>
            <span>Notifications</span>
          </div>
        </div>
        
        <div class="pwa-install-cta-buttons">
          <button class="pwa-install-cta-btn pwa-install-cta-install-btn">
            <i class="fas fa-download me-2"></i>Install Now
          </button>
          <button class="pwa-install-cta-btn pwa-install-cta-cancel-btn">
            Maybe Later
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modal = modal;
    this.attachEventListeners();
  }
  
  // Attach event listeners to modal buttons
  attachEventListeners() {
    const closeBtn = this.modal.querySelector('.pwa-install-cta-close');
    const cancelBtn = this.modal.querySelector('.pwa-install-cta-cancel-btn');
    const installBtn = this.modal.querySelector('.pwa-install-cta-install-btn');
    const backdrop = this.modal.querySelector('.pwa-install-cta-backdrop');
    
    // Close button
    closeBtn?.addEventListener('click', () => this.hideModal());
    
    // Backdrop click
    backdrop?.addEventListener('click', () => this.hideModal());
    
    // Cancel button
    cancelBtn?.addEventListener('click', () => {
      this.hideModal();
      this.markAsDismissed();
    });
    
    // Install button
    installBtn?.addEventListener('click', () => this.promptInstall());
  }
  
  // Show modal
  showModal() {
    if (!this.modal) {
      this.createModal();
    }
    
    this.modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    console.log('[PWA CTA] Modal shown');
  }
  
  // Hide modal
  hideModal() {
    if (this.modal) {
      this.modal.classList.remove('show');
      document.body.style.overflow = 'auto';
      
      console.log('[PWA CTA] Modal hidden');
    }
  }
  
  // Trigger install prompt
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('[PWA CTA] Install prompt not available');
      return;
    }
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA CTA] App installed successfully');
      this.hideModal();
      this.markAsDismissed();
    } else {
      console.log('[PWA CTA] Installation dismissed by user');
    }
    
    this.deferredPrompt = null;
  }
  
  // Initialize
  init() {
    // Don't show if already dismissed
    if (this.hasShown) {
      console.log('[PWA CTA] Already shown once - not displaying');
      return;
    }
    
    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      
      console.log('[PWA CTA] beforeinstallprompt event received');
      
      // Show modal after configured delay
      setTimeout(() => {
        this.showModalIfNeeded();
      }, this.options.showAfterSeconds * 1000);
    });
    
    // Hide if app gets installed
    window.addEventListener('appinstalled', () => {
      console.log('[PWA CTA] App installed via browser UI');
      this.hideModal();
      this.markAsDismissed();
    });
    
    console.log('[PWA CTA] Initialized');
  }
  
  // Show modal if conditions are met
  async showModalIfNeeded() {
    if (await this.canInstall()) {
      this.showModal();
    }
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if page has opted in to CTA modal
  const enableCTA = document.documentElement.getAttribute('data-pwa-install-cta') !== 'false';
  
  if (enableCTA && !window.PWA?.isRunningAsPWA?.()) {
    window.PWAInstallCTA = new PWAInstallCTA({
      showAfterSeconds: 5
    });
    
    console.log('[PWA CTA] Auto-initialized');
  }
});

// Export for manual use
window.PWAInstallCTA = PWAInstallCTA;
