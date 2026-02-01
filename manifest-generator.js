/**
 * Dynamic Manifest Generator
 * Generates manifest.json with correct base path for both local dev and GitHub Pages
 */

function generateManifest() {
  const isGitHubPages = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1';
  
  const basePath = isGitHubPages ? '/Final-IHM/' : '/';
  
  const manifest = {
    "name": "HealthFlow - Healthcare Automation Platform",
    "short_name": "HealthFlow",
    "description": "Healthcare automation platform for African facilities. Automate data entry, patient monitoring, and compliance reports with offline support.",
    "start_url": basePath + "index.html",
    "scope": basePath,
    "display": "standalone",
    "orientation": "portrait-primary",
    "background_color": "#ffffff",
    "theme_color": "#15696B",
    "dir": "ltr",
    "lang": "en-US",
    "icons": [
      {
        "src": basePath + "assets/images/healthflow-icon-72x72.png",
        "sizes": "72x72",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": basePath + "assets/images/healthflow-icon-96x96.png",
        "sizes": "96x96",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": basePath + "assets/images/healthflow-icon-128x128.png",
        "sizes": "128x128",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": basePath + "assets/images/healthflow-icon-144x144.png",
        "sizes": "144x144",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": basePath + "assets/images/healthflow-icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": basePath + "assets/images/healthflow-icon-256x256.png",
        "sizes": "256x256",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": basePath + "assets/images/healthflow-icon-384x384.png",
        "sizes": "384x384",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": basePath + "assets/images/healthflow-icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": basePath + "assets/images/healthflow-icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable"
      },
      {
        "src": basePath + "assets/images/healthflow-icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
      }
    ],
    "categories": ["healthcare", "medical", "productivity"],
    "screenshots": [
      {
        "src": basePath + "assets/images/healthflow-icon-512x512.png",
        "sizes": "540x720",
        "type": "image/png",
        "form_factor": "narrow"
      },
      {
        "src": basePath + "assets/images/healthflow-icon-512x512.png",
        "sizes": "1280x720",
        "type": "image/png",
        "form_factor": "wide"
      }
    ],
    "splash_pages": [
      {
        "src": basePath + "splash-screen.html",
        "sizes": "540x720",
        "form_factor": "narrow"
      },
      {
        "src": basePath + "splash-screen.html",
        "sizes": "1280x720",
        "form_factor": "wide"
      }
    ],
    "shortcuts": [
      {
        "name": "Dashboard",
        "short_name": "Dashboard",
        "description": "Access your healthcare dashboard",
        "url": basePath + "dashboard.html",
        "icons": [
          {
            "src": basePath + "assets/images/healthflow-icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          }
        ]
      },
      {
        "name": "Login",
        "short_name": "Login",
        "description": "Login to your account",
        "url": basePath + "login.html",
        "icons": [
          {
            "src": basePath + "assets/images/healthflow-icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          }
        ]
      },
      {
        "name": "Patient Portal",
        "short_name": "Patients",
        "description": "Manage patient records",
        "url": basePath + "patient-portal.html",
        "icons": [
          {
            "src": basePath + "assets/images/healthflow-icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          }
        ]
      }
    ],
    "share_target": {
      "action": basePath + "forms.html",
      "method": "POST",
      "enctype": "multipart/form-data",
      "params": {
        "title": "title",
        "text": "text",
        "url": "url"
      }
    },
    "prefer_related_applications": false
  };
  
  return manifest;
}

// Create dynamic manifest link if not present
function injectDynamicManifest() {
  // Check if manifest link exists
  let manifestLink = document.querySelector('link[rel="manifest"]');
  
  if (!manifestLink) {
    // Create manifest link
    manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = 'manifest.json';
    document.head.appendChild(manifestLink);
    console.log('[Manifest] Dynamic manifest link added');
  }
  
  console.log('[Manifest] Manifest href:', manifestLink.href);
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectDynamicManifest);
} else {
  injectDynamicManifest();
}

// Export for debugging
window.generateManifest = generateManifest;

console.log('[Manifest] Generator module loaded');
