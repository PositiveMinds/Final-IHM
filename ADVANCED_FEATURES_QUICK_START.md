# Advanced Chatbot Features - Quick Start Guide

## 5-Minute Setup

### Step 1: Add Scripts to index.html

Add these two lines after your existing chatbot scripts:

```html
<script src="/assets/js/chatbot-advanced-features.js"></script>
<script src="/assets/js/chatbot-integration.js"></script>
```

### Step 2: Initialize Advanced Features

The integration automatically initializes on page load. To manually initialize:

```javascript
// In browser console
await advancedChatbotFeatures.initializeAdvancedFeatures();
```

### Step 3: Configure Email Service (Optional)

```javascript
// In browser console
advancedChatbotFeatures.emailService.configure(
    'sendgrid',              // Provider
    'your-api-key-here',     // API Key
    'noreply@health.local'   // From email
);
```

### Step 4: Enable Notifications

```javascript
// Request permission
await advancedChatbotFeatures.pushNotificationService.requestPermission();
```

## Usage in Chatbot UI

After retrieving appointments, you'll see a button: **"✨ Show Advanced Features"**

Click it to access:
- 🔄 Recurring Appointments
- ⚠️ Check Conflicts
- 📋 Follow-ups
- 📧 Email Settings
- 🔔 Notifications
- 📊 Advanced Export

---

## Common Tasks

### Create Monthly Recurring Appointments

```javascript
// Get appointment from chatbot
const appt = healthFlowChatbot.lastQueryResults[0];

// Create monthly pattern
recurringManager.createRecurringPattern(
    appt.id,
    appt.patient_no,
    'monthly',
    new Date(appt.appointment_date),
    null,  // no end date
    12     // 12 occurrences
);
```

### Send Email Reminders

```javascript
// Configure first
advancedChatbotFeatures.emailService.configure('sendgrid', 'key', 'email@health.local');

// Send reminder
const appt = healthFlowChatbot.lastQueryResults[0];
await advancedChatbotFeatures.emailService.sendReminderEmail(
    { email: 'patient@example.com', patient_no: appt.patient_no, patient_name: appt.patient_name },
    appt
);
```

### Check for Appointment Conflicts

```javascript
const newAppt = {
    id: 'new_001',
    patient_no: 'PAT0025',
    appointment_date: '2024-02-15T10:00:00',
    facility: 'Clinic A',
    duration: 60
};

const result = conflictDetector.checkConflicts(
    newAppt,
    healthFlowChatbot.lastQueryResults
);

if (result.hasConflicts) {
    console.log('Conflicts found:', result.conflicts);
}
```

### Schedule Automatic Follow-ups

```javascript
const appt = healthFlowChatbot.lastQueryResults[0];

// Post-appointment follow-up (24 hours)
followUpScheduler.scheduleFollowUp(appt.id, appt.patient_no, 'post_appointment', appt.appointment_date);

// Treatment review (7 days)
followUpScheduler.scheduleFollowUp(appt.id, appt.patient_no, 'treatment_review', appt.appointment_date);
```

### Export with Colors

```javascript
advancedChatbotFeatures.excelExporter.exportAppointmentsWithFormatting(
    healthFlowChatbot.lastQueryResults
);
// Downloads colored Excel file
```

### Send Push Notification

```javascript
// Permission must be granted first
await advancedChatbotFeatures.pushNotificationService.sendPushNotification(
    'Appointment Reminder',
    {
        body: 'Your appointment is coming up in 24 hours',
        icon: '/assets/icons/icon.png'
    }
);
```

---

## Available Patterns (Recurring)

- `'weekly'` - Every week
- `'bi-weekly'` - Every 2 weeks
- `'monthly'` - Every month
- `'quarterly'` - Every 3 months
- `'semi-annual'` - Every 6 months
- `'annual'` - Every year

## Follow-up Types

- `'post_appointment'` - 1 day after (email)
- `'medication_reminder'` - 12 hours after (notification)
- `'lab_results'` - 3 days after (email)
- `'treatment_review'` - 7 days after (email)
- `'quarterly_checkup'` - 90 days after (email)

## Conflict Types

- **patient_double_booking** - Patient has overlapping appointments (HIGH)
- **provider_conflict** - Provider/facility double-booked (MEDIUM)
- **proximity_conflict** - Appointments too close together (LOW)

---

## Getting Statistics

```javascript
// All statistics
const stats = healthFlowChatbot.getAdvancedStats();

// Recurring stats
const recurring = recurringManager.getRecurringStats();

// Follow-up stats
const followUps = followUpScheduler.getFollowUpStats();

// Notification status
const notifStatus = advancedChatbotFeatures.pushNotificationService.getNotificationStatus();

// Email logs
const emails = advancedChatbotFeatures.emailService.getSentEmailsLog();
```

---

## Example: Complete Workflow

```javascript
// 1. Retrieve appointments
// (Use chatbot to search)

// 2. Check for conflicts
const conflicts = conflictDetector.checkConflicts(newAppt, healthFlowChatbot.lastQueryResults);

if (!conflicts.hasConflicts) {
    // 3. Create recurring pattern
    recurringManager.createRecurringPattern(
        appt.id, appt.patient_no, 'monthly', new Date()
    );

    // 4. Schedule follow-ups
    followUpScheduler.scheduleFollowUp(
        appt.id, appt.patient_no, 'post_appointment', appt.appointment_date
    );

    // 5. Send reminders
    await advancedChatbotFeatures.emailService.sendReminderEmail(
        { email: 'patient@example.com', ...appt },
        appt
    );

    // 6. Enable notification
    await advancedChatbotFeatures.pushNotificationService.sendAppointmentReminder(
        { patient_name: appt.patient_name }, appt, 1440
    );

    // 7. Export
    advancedChatbotFeatures.excelExporter.exportAppointmentsWithFormatting(
        healthFlowChatbot.lastQueryResults
    );
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Scripts not loading | Check file paths in HTML |
| Functions undefined | Ensure scripts loaded in correct order |
| Notifications blocked | Check browser permissions |
| Email not sending | Configure API key first |
| Recurring not creating | Check date format and pattern name |

---

**Need more details?** See `ADVANCED_CHATBOT_FEATURES_COMPLETE.md`

**Ready to use!** ✅
