# Chatbot Appointment Filtering & Reminders Update

## Summary
Updated the HealthFlow chatbot on dashboard.html to include:
1. **Provider/Staff Filtering** - Filter appointments by provider or staff name
2. **Provider Column Display** - Show provider/staff name in appointment tables
3. **1-Minute Test Reminders** - Set test reminders that trigger after 1 minute

## Changes Made

### 1. Provider/Staff Extraction (chatbot-ai.js)
**Location:** `extractFilters()` function, lines 183-191

Added pattern matching to extract provider/staff names from natural language queries:
```javascript
// Extract provider/staff name
// Match patterns like: "with doctor John", "by nurse Mary", "provider Sarah", "staff James"
const providerMatch = query.match(
    /(?:with|by|provider|staff|doctor|nurse|clinician|dr\.?|dr\s|nurse\s)\s+([A-Za-z\s]+?)(?:\s|$|,|\.)/i
);
if (providerMatch) {
    filters.provider_name = providerMatch[1].trim();
    console.log("Extracted provider/staff name:", filters.provider_name);
}
```

**Supported Query Patterns:**
- "show appointments with doctor John"
- "appointments by nurse Mary"
- "provider Sarah's appointments"
- "appointments with clinician James"
- "staff Dr. Brown's schedule"

### 2. Provider Filtering in Queries (chatbot-ai.js)
**Location:** `queryAppointments()` function, lines 481-483

Added filtering logic to filter appointments by provider name:
```javascript
if (filters.provider_name) {
    // Filter by provider/staff name in appointments
    query = query.ilike("provider_name", `%${filters.provider_name}%`);
}
```

### 3. Appointment Table Display Update (chatbot-ai.js)
**Location:** `formatAppointmentResponse()` function, lines 739-778

**Changes:**
- Added "Provider/Staff" column to appointment table header
- Display provider/staff name for each appointment
- Added "Set 1-Min Reminders (Test)" button for quick testing

**New Table Structure:**
```
| Date | Patient | Provider/Staff | Status | Type | Next Appt | Notes |
```

**Display Logic:**
```javascript
const providerName = appt.provider_name || appt.staff_name || "—";
```
Falls back to "—" if provider name not available.

### 4. Test Reminder Functionality (chatbot-ui.js)
**Location:** `setReminderForAll()` function, lines 458-500

Added special handling for 1-minute test reminders:
```javascript
// For 1-minute test reminders, use immediate scheduling
if (minutesBefore === 1) {
    // Store reminder object
    // Schedule notification after 60 seconds (60000ms)
    setTimeout(() => {
        this.triggerReminderNotification(reminder);
    }, 60000);
}
```

### 5. Reminder Notification Trigger (chatbot-ui.js)
**Location:** New function `triggerReminderNotification()`, lines 501-519

Handles both browser notifications and chatbot notifications:
```javascript
triggerReminderNotification(reminder) {
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('HealthFlow Appointment Reminder', {
            body: message,
            icon: 'assets/images/favicon.svg',
            tag: `reminder-${reminder.appointmentId}`
        });
    }
    
    // Also show in chatbot
    this.addMessage(`🔔 <strong>Reminder:</strong> ${message}`, 'bot', false);
}
```

### 6. Enhanced Reminder Options UI (chatbot-ui.js)
**Location:** `showReminderOptions()` function, lines 428-456

Added new test reminder button:
```html
<button onclick="chatbotUI.setReminderForAll('notification', 1)" 
        class="btn btn-sm btn-warning" style="margin: 5px;">
    ⏱️ Test (1 minute before)
</button>
```

## Usage Examples

### Query Appointments by Provider
```
"Show me appointments with Dr. Johnson"
"Appointments by nurse Sarah"
"List all appointments with Doctor Smith"
"Show appointments with provider John"
```

### Set Test Reminders
1. Query appointments (e.g., "show appointments next week")
2. Click "🔔 Set 1-Min Reminders (Test)" button below results
3. Wait 1 minute - notification will appear
4. Test triggers both:
   - Browser notification (if permissions granted)
   - In-chatbot message notification

## Database Requirements

The `patients` or `appointments` table should include:
- `provider_name` - Staff/provider name (string)
- `staff_name` - Alternative staff name field (string)

If these columns don't exist, the chatbot will display "—" for provider names but filtering will still work if data exists.

## Testing Checklist

- [ ] Query appointments by provider name
- [ ] Verify provider column displays in results table
- [ ] Click "Set 1-Min Reminders (Test)" button
- [ ] Wait 1 minute for test notification
- [ ] Verify notification appears both in browser and chatbot
- [ ] Test with different provider names
- [ ] Test with queries like "Dr. John", "nurse Mary", "staff Smith"

## Files Modified
1. `assets/js/chatbot-ai.js`
   - Lines 183-191: Provider extraction
   - Lines 481-483: Provider filtering
   - Lines 739-778: Appointment formatting with provider column

2. `assets/js/chatbot-ui.js`
   - Lines 428-456: Enhanced reminder options
   - Lines 458-500: Updated setReminderForAll function
   - Lines 501-519: New triggerReminderNotification function

## Notes
- 1-minute reminders are for testing only - use 60+ minutes for production
- Browser notifications require user permission
- Provider names are case-insensitive in queries
- Partial matches are supported (e.g., "John" matches "Dr. John Smith")
