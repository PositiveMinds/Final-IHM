/**
 * Appointment Notifications System
 * Handles push notifications for due and missed appointments
 */

class AppointmentNotificationManager {
  constructor() {
    this.checkInterval = null;
    this.notifiedAppointments = new Set();
    this.loadNotificationPreferences();
  }

  /**
   * Initialize notification system
   */
  async init() {
    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('[Notifications] Permission:', permission);
    }

    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.ready;
        console.log('[Appointments] Service worker ready for notifications');
      } catch (error) {
        console.error('[Appointments] Service worker error:', error);
      }
    }

    // Start checking for due appointments
    this.startAppointmentChecks();
  }

  /**
   * Start periodic checks for appointments
   */
  startAppointmentChecks() {
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkAppointments();
    }, 60000);

    // Initial check on load
    this.checkAppointments();
  }

  /**
   * Stop appointment checks
   */
  stopAppointmentChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check for due and missed appointments
   */
  checkAppointments() {
    const appointments = this.getAppointments();
    const now = new Date();

    appointments.forEach(appointment => {
      const appointmentTime = new Date(appointment.appointment_time || appointment.time);
      const appointmentId = appointment.id || `${appointment.patient_name}-${appointmentTime.getTime()}`;

      // Skip if already notified
      if (this.notifiedAppointments.has(appointmentId)) {
        return;
      }

      const timeDiff = appointmentTime.getTime() - now.getTime();
      const daysDiff = Math.floor(timeDiff / 86400000);
      const hoursDiff = Math.floor(timeDiff / 3600000);

      // MISSED APPOINTMENTS: Fire notification 1 day (24 hours) after appointment time
      if (timeDiff < 0) {
        const missedTimeDiff = Math.abs(timeDiff);
        const missedDaysDiff = Math.floor(missedTimeDiff / 86400000);
        const missedHoursDiff = Math.floor(missedTimeDiff / 3600000);

        // Check if exactly 1 day has passed (between 24-48 hours ago)
        if (missedHoursDiff >= 24 && missedHoursDiff < 48) {
          if (
            appointment.status !== 'completed' &&
            appointment.status !== 'cancelled'
          ) {
            this.sendMissedAppointmentNotification(appointment);
            this.notifiedAppointments.add(appointmentId);
            console.log(`[Appointments] Missed appointment notification sent for ${appointment.patient_name}`);
          }
        }
      }

      // DUE APPOINTMENTS: Fire notification 1 day before appointment
      if (timeDiff > 0) {
        // Check if appointment is approximately 1 day away (23-25 hours)
        if (hoursDiff >= 23 && hoursDiff <= 25) {
          this.sendDueAppointmentNotification(appointment, '1 day');
          this.notifiedAppointments.add(`${appointmentId}-1day`);
          console.log(`[Appointments] 1-day reminder notification sent for ${appointment.patient_name}`);
        }
      }
    });
  }

  /**
   * Get appointments from dashboard
   */
  getAppointments() {
    try {
      // Try to get from global variable first
      if (window.dashboardAppointments && Array.isArray(window.dashboardAppointments)) {
        return window.dashboardAppointments;
      }

      // Try to get from localStorage
      const stored = localStorage.getItem('dashboardAppointments');
      if (stored) {
        return JSON.parse(stored);
      }

      // Try to get from DOM
      const appointmentRows = document.querySelectorAll('table tbody tr, .appointment-item');
      const appointments = [];

      appointmentRows.forEach(row => {
        const appointment = this.parseAppointmentFromRow(row);
        if (appointment) {
          appointments.push(appointment);
        }
      });

      return appointments;
    } catch (error) {
      console.error('[Appointments] Error getting appointments:', error);
      return [];
    }
  }

  /**
   * Parse appointment data from table row or card element
   */
  parseAppointmentFromRow(row) {
    try {
      // Try to extract from data attributes
      const appointmentTime =
        row.getAttribute('data-appointment-time') ||
        row.getAttribute('data-time') ||
        row.querySelector('[data-field="time"]')?.textContent;

      const patientName =
        row.getAttribute('data-patient-name') ||
        row.getAttribute('data-name') ||
        row.querySelector('[data-field="patient_name"]')?.textContent ||
        row.querySelector('.patient-name')?.textContent;

      const status =
        row.getAttribute('data-status') ||
        row.querySelector('[data-field="status"]')?.textContent ||
        'scheduled';

      if (!appointmentTime || !patientName) {
        return null;
      }

      return {
        id: row.getAttribute('data-appointment-id') || `appt-${Date.now()}`,
        patient_name: patientName.trim(),
        appointment_time: appointmentTime.trim(),
        status: status.trim().toLowerCase(),
        doctor_name:
          row.getAttribute('data-doctor-name') ||
          row.querySelector('[data-field="doctor_name"]')?.textContent ||
          'Unknown',
        notes:
          row.getAttribute('data-notes') ||
          row.querySelector('[data-field="notes"]')?.textContent ||
          ''
      };
    } catch (error) {
      console.error('[Appointments] Error parsing appointment row:', error);
      return null;
    }
  }

  /**
   * Send notification for due appointment
   */
  sendDueAppointmentNotification(appointment, timeFrame) {
    const appointmentTime = new Date(appointment.appointment_time || appointment.time);
    const dateStr = appointmentTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = appointmentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const title = `Appointment Reminder - Tomorrow`;
    const body = `${appointment.patient_name} with Dr. ${appointment.doctor_name} on ${dateStr} at ${timeStr}`;
    const tag = `due-appointment-${appointment.id}`;

    this.showNotification(title, body, tag, 'due');
  }

  /**
   * Send notification for missed appointment
   */
  sendMissedAppointmentNotification(appointment) {
    const appointmentTime = new Date(appointment.appointment_time);
    const timeStr = appointmentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const title = 'Missed Appointment';
    const body = `${appointment.patient_name} missed appointment at ${timeStr} with Dr. ${appointment.doctor_name}`;
    const tag = `missed-appointment-${appointment.id}`;

    this.showNotification(title, body, tag, 'missed');
  }

  /**
   * Show notification using Notification API or in-app alert
   */
  async showNotification(title, body, tag, type = 'appointment') {
    const prefs = this.getNotificationPreferences();

    // Browser notification
    if (prefs.enableBrowserNotifications && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            registration.showNotification(title, {
              body: body,
              icon: 'assets/images/favicon.png',
              badge: 'assets/images/favicon.png',
              tag: tag,
              requireInteraction: type === 'missed',
              actions: [
                { action: 'view', title: 'View' },
                { action: 'dismiss', title: 'Dismiss' }
              ],
              data: { type: type }
            });
          } else {
            new Notification(title, { body: body, tag: tag });
          }
        }
      } catch (error) {
        console.error('[Notifications] Error showing browser notification:', error);
      }
    }

    // In-app notification (toast)
    if (prefs.enableInAppNotifications) {
      this.showInAppNotification(title, body, type);
    }

    // Sound alert
    if (prefs.enableSoundAlerts) {
      this.playNotificationSound(type);
    }

    // Store notification
    this.storeNotification({
      title,
      body,
      type,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Show in-app toast notification
   */
  showInAppNotification(title, body, type = 'appointment') {
    // Check if toast container exists
    let container = document.getElementById('appointment-notifications-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'appointment-notifications-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
      `;
      document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    const bgColor = type === 'missed' ? '#dc3545' : '#ffc107';
    const textColor = type === 'missed' ? '#fff' : '#000';

    toast.style.cssText = `
      background: ${bgColor};
      color: ${textColor};
      padding: 16px;
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;

    toast.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 14px; opacity: 0.9;">${body}</div>
      <button style="
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: inherit;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    `;

    // Add close functionality
    toast.querySelector('button').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    // Auto remove after 8 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => toast.remove(), 300);
    }, 8000);
  }

  /**
   * Play notification sound
   */
  playNotificationSound(type = 'appointment') {
    try {
      // Use Web Audio API to generate a simple beep
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = type === 'missed' ? 800 : 600;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('[Notifications] Error playing sound:', error);
    }
  }

  /**
   * Store notification in localStorage
   */
  storeNotification(notification) {
    try {
      let notifications = JSON.parse(
        localStorage.getItem('appointmentNotifications') || '[]'
      );

      // Keep only last 50 notifications
      notifications.push(notification);
      if (notifications.length > 50) {
        notifications = notifications.slice(-50);
      }

      localStorage.setItem('appointmentNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('[Notifications] Error storing notification:', error);
    }
  }

  /**
   * Load notification preferences
   */
  loadNotificationPreferences() {
    const defaults = {
      enableBrowserNotifications: true,
      enableInAppNotifications: true,
      enableSoundAlerts: true,
      notifyMissed: true,
      notifyDue1day: true
    };

    try {
      const stored = localStorage.getItem('appointmentNotificationPrefs');
      if (stored) {
        Object.assign(defaults, JSON.parse(stored));
      }
    } catch (error) {
      console.error('[Notifications] Error loading preferences:', error);
    }

    this.preferences = defaults;
    return defaults;
  }

  /**
   * Get notification preferences
   */
  getNotificationPreferences() {
    return this.preferences || this.loadNotificationPreferences();
  }

  /**
   * Update notification preferences
   */
  saveNotificationPreferences(prefs) {
    this.preferences = { ...this.preferences, ...prefs };
    localStorage.setItem('appointmentNotificationPrefs', JSON.stringify(this.preferences));
    return this.preferences;
  }

  /**
   * Get notification history
   */
  getNotificationHistory() {
    try {
      return JSON.parse(localStorage.getItem('appointmentNotifications') || '[]');
    } catch (error) {
      console.error('[Notifications] Error getting history:', error);
      return [];
    }
  }

  /**
   * Clear notification history
   */
  clearNotificationHistory() {
    localStorage.removeItem('appointmentNotifications');
  }
}

// Initialize notification manager
let appointmentNotificationManager = null;

function initializeAppointmentNotifications() {
  if (!appointmentNotificationManager) {
    appointmentNotificationManager = new AppointmentNotificationManager();
    appointmentNotificationManager.init().catch(error => {
      console.error('[Appointments] Initialization error:', error);
    });
  }
  return appointmentNotificationManager;
}

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAppointmentNotifications);
} else {
  initializeAppointmentNotifications();
}

// Add styles for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  #appointment-notifications-container {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
`;
document.head.appendChild(style);

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppointmentNotificationManager;
}
