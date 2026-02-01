# Appointment Notifications System

## Overview

The Appointment Notifications System provides automated alerts for due and missed appointments on the HealthFlow dashboard. It supports multiple notification channels and customizable notification preferences.

## Features

### Notification Types

1. **Due Appointments** - Proactive reminders 1 day before
   - Fires 23-25 hours before scheduled appointment time
   - Includes appointment date and time details
   - Allows users to prepare and confirm attendance

2. **Missed Appointments** - Alert 1 day after appointment time
   - Fires 24-48 hours after the scheduled appointment time
   - Only for appointments not marked as completed or cancelled
   - Highlighted in red for urgency and follow-up action

### Notification Channels

1. **Browser Push Notifications**
   - Native OS notifications via Service Worker
   - Requires browser notification permission
   - Works even when dashboard is not in focus

2. **In-App Toast Notifications**
   - Floating alerts within the dashboard
   - Immediate visual feedback
   - Auto-dismiss after 8 seconds

3. **Sound Alerts**
   - Audio beep using Web Audio API
   - Different tones for missed (800Hz) vs. due (600Hz) appointments
   - Non-intrusive notification indicator

## Implementation Details

### Core Files

- **appointment-notifications.js** - Main notification manager class
- **dashboard.html** - UI integration and settings modal
- **service-worker.js** - Service Worker for push notifications

### Class: AppointmentNotificationManager

#### Methods

```javascript
// Initialize the notification system
init()

// Start checking for appointments (every minute)
startAppointmentChecks()

// Stop appointment checks
stopAppointmentChecks()

// Check for due and missed appointments
checkAppointments()

// Get appointments from various sources
getAppointments()

// Send notifications
sendDueAppointmentNotification(appointment, minutesBefore)
sendMissedAppointmentNotification(appointment)

// Show notifications
showNotification(title, body, tag, type)
showInAppNotification(title, body, type)
playNotificationSound(type)

// Preference management
loadNotificationPreferences()
getNotificationPreferences()
saveNotificationPreferences(prefs)
getNotificationHistory()
clearNotificationHistory()
```

### Expected Appointment Data Structure

The system expects appointments to have these properties:

```javascript
{
  id: string,                           // Unique appointment ID
  patient_name: string,                 // Patient full name
  appointment_time: Date | string,      // ISO 8601 or valid date string
  status: 'scheduled' | 'completed' | 'cancelled' | string,
  doctor_name: string,                  // Healthcare provider name
  notes?: string                        // Additional notes
}
```

### Data Sources

The system automatically retrieves appointments from:

1. **Global Variable** - `window.dashboardAppointments`
2. **localStorage** - `dashboardAppointments` key
3. **DOM Parsing** - Table rows and `.appointment-item` elements with data attributes

### Data Attributes for DOM Parsing

For table rows or appointment elements, use these data attributes:

```html
<tr 
  data-appointment-id="appt-123"
  data-appointment-time="2024-01-15T14:30:00Z"
  data-patient-name="John Doe"
  data-doctor-name="Dr. Smith"
  data-status="scheduled"
>
  <!-- Table cells -->
</tr>
```

## Configuration

### Notification Preferences

Users can configure via the settings modal:

```javascript
{
  enableBrowserNotifications: true,  // Push notifications
  enableInAppNotifications: true,    // Toast alerts
  enableSoundAlerts: true,           // Audio beeps
  notifyMissed: true,                // Missed appointment alerts (1 day after)
  notifyDue1day: true                // Due appointment alerts (1 day before)
}
```

Preferences are stored in localStorage under `appointmentNotificationPrefs`.

## Usage

### Automatic Initialization

The notification manager initializes automatically when the page loads:

```javascript
// Automatically called on page load
initializeAppointmentNotifications()

// Access global manager instance
appointmentNotificationManager
```

### Manual Operations

```javascript
// Get current preferences
const prefs = appointmentNotificationManager.getNotificationPreferences();

// Update preferences
appointmentNotificationManager.saveNotificationPreferences({
  enableBrowserNotifications: false,
  notifyDue1day: true,
  notifyMissed: true
});

// Get notification history
const history = appointmentNotificationManager.getNotificationHistory();

// Clear history
appointmentNotificationManager.clearNotificationHistory();

// Trigger manual check
appointmentNotificationManager.checkAppointments();
```

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Push Notifications | ✓ | ✓ | ✓ | ✓ |
| Service Worker | ✓ | ✓ | ✓ | ✓ |
| Web Audio API | ✓ | ✓ | ✓ | ✓ |
| Notification API | ✓ | ✓ | ✓ | ✓ |

## Permission Requirements

### Browser Notification Permission

When first loading the dashboard, users will be prompted to allow notifications:

```
Allow "HealthFlow" to send you notifications?
[Allow] [Block]
```

This is required for browser push notifications to work.

### Service Worker Registration

The system requires the service-worker.js to be active. Ensure:

1. Service Worker is registered in your HTML
2. `/service-worker.js` is accessible from root
3. HTTPS is used in production

## Testing

### Test with Demo Appointments

Add test appointments to localStorage:

```javascript
const now = new Date();

// Test: Appointment due 1 day from now
const dueTomorrow = new Date(now.getTime() + 24 * 3600000);

// Test: Missed appointment (1 day ago)
const missedYesterday = new Date(now.getTime() - 24 * 3600000);

const testAppointments = [
  {
    id: 'test-due-1',
    patient_name: 'John Doe',
    appointment_time: dueTomorrow,
    status: 'scheduled',
    doctor_name: 'Dr. Smith'
  },
  {
    id: 'test-missed-1',
    patient_name: 'Jane Smith',
    appointment_time: missedYesterday,
    status: 'scheduled',
    doctor_name: 'Dr. Johnson'
  }
];

localStorage.setItem('dashboardAppointments', JSON.stringify(testAppointments));
appointmentNotificationManager.checkAppointments();
```

### View Notification History

```javascript
console.log(appointmentNotificationManager.getNotificationHistory());
```

### Disable Notifications Temporarily

```javascript
appointmentNotificationManager.stopAppointmentChecks();
// ... do something ...
appointmentNotificationManager.startAppointmentChecks();
```

## Settings Modal

Access via the 🔔 button in the FAB menu (floating action button):

1. **Notification Channels** - Toggle notifications delivery methods
2. **Notification Types** - Select which appointment events to notify
3. **Recent Notifications** - View last 10 notifications
4. **Clear History** - Remove all stored notifications
5. **Save Preferences** - Persist user settings

## Troubleshooting

### Notifications Not Showing

1. **Check permissions** - Ensure browser notification permission is granted
2. **Check preferences** - Open settings modal and verify channels are enabled
3. **Check appointment data** - Ensure appointments have required fields
4. **Check console** - Look for error messages starting with `[Appointments]` or `[Notifications]`

### Sound Not Playing

1. Browser audio context may be blocked
2. Check browser audio settings
3. Disable other sound alerts to test

### Service Worker Issues

```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service workers:', regs);
});

// Manually register if needed
navigator.serviceWorker.register('service-worker.js');
```

## Integration with Existing Systems

### Adding Appointments from API

```javascript
// When fetching appointments from API
const response = await fetch('/api/appointments');
const appointments = await response.json();

// Store globally
window.dashboardAppointments = appointments;

// Trigger immediate check
if (appointmentNotificationManager) {
  appointmentNotificationManager.checkAppointments();
}
```

### Integrating with Supabase

```javascript
// Subscribe to appointment changes
const subscription = supabase
  .from('appointments')
  .on('*', payload => {
    // Update local appointments
    window.dashboardAppointments = payload.new;
    appointmentNotificationManager.checkAppointments();
  })
  .subscribe();
```

## Performance Considerations

- Checks run every 60 seconds (configurable via `checkInterval`)
- Notifications are deduplicated to prevent duplicates
- In-app toast notifications auto-dismiss after 8 seconds
- Notification history is limited to 50 most recent
- Uses Web Audio API (efficient) instead of audio files

## Security

- No sensitive data stored in notification bodies
- Notifications use patient names only (no sensitive medical info)
- Service Worker validates notification sources
- Browser notification permission required for security
- LocalStorage used for user preferences only

## Future Enhancements

- [ ] SMS notifications integration
- [ ] Email appointment reminders
- [ ] Recurring appointment reminders
- [ ] Appointment confirmation via notification
- [ ] Custom notification intervals
- [ ] Multi-language support
- [ ] Appointment reschedule via notification
