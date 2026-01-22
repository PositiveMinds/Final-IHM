# Advanced Chatbot Features - Integration Guide

## Overview
This guide walks you through integrating the 6 advanced chatbot features into your HealthFlow application.

**Files Required:**
- `assets/js/chatbot-advanced-features.js` ✅ Created
- `assets/js/chatbot-integration.js` ✅ Created

**Status:** Ready to integrate

---

## Step-by-Step Integration

### Step 1: Add Scripts to index.html

Find your `index.html` file and locate the chatbot scripts section.

**Current (before):**
```html
<script src="/assets/js/chatbot-ai.js"></script>
<script src="/assets/js/chatbot-ui.js"></script>
</body>
</html>
```

**Updated (after):**
```html
<script src="/assets/js/chatbot-ai.js"></script>
<script src="/assets/js/chatbot-ui.js"></script>
<!-- Advanced Features -->
<script src="/assets/js/chatbot-advanced-features.js"></script>
<script src="/assets/js/chatbot-integration.js"></script>
</body>
</html>
```

**Important:** Scripts must be in this order:
1. chatbot-ai.js (existing)
2. chatbot-ui.js (existing)
3. chatbot-advanced-features.js (NEW)
4. chatbot-integration.js (NEW)

---

### Step 2: Auto-Initialization

Features automatically initialize when the DOM loads. No additional code needed.

**To verify initialization:**
Open browser console and run:
```javascript
console.log(typeof advancedChatbotFeatures); // Should output: "object"
console.log(typeof recurringManager);        // Should output: "object"
console.log(typeof conflictDetector);        // Should output: "object"
```

---

### Step 3: Configure Email Service (Optional)

Email service requires configuration before use.

**In browser console:**
```javascript
// Configure email service
advancedChatbotFeatures.emailService.configure(
    'sendgrid',              // Provider: 'sendgrid', 'ses', or 'smtp'
    'SG.your-api-key-here',  // Your API key
    'noreply@healthflow.local' // From email address
);
```

**Or in your initialization code:**
```javascript
// After page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        advancedChatbotFeatures.emailService.configure(
            'sendgrid',
            process.env.SENDGRID_API_KEY,
            'noreply@healthflow.local'
        );
    }, 2000);
});
```

**Supported Providers:**
- `'sendgrid'` - SendGrid REST API
- `'ses'` - AWS SES
- `'smtp'` - Direct SMTP

---

### Step 4: Enable Notifications (Optional)

Request browser notification permission:

**In browser console:**
```javascript
// Request permission
await advancedChatbotFeatures.pushNotificationService.requestPermission();
```

**Or in initialization:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        await advancedChatbotFeatures.pushNotificationService.requestPermission();
    }, 2000);
});
```

**Note:** User must grant permission for notifications to work.

---

### Step 5: Test the Integration

#### Test 1: Load Chatbot
1. Open your HealthFlow application
2. Click the chatbot FAB button (💬)
3. Retrieve some appointments using the chatbot

#### Test 2: Advanced Features Button
1. After appointments are retrieved
2. Look for "✨ Show Advanced Features" button
3. Click it to see the advanced options menu

#### Test 3: Each Feature
- **Recurring:** Click "🔄 Recurring Appointments"
- **Conflicts:** Click "⚠️ Check Conflicts"
- **Follow-ups:** Click "📋 Follow-ups"
- **Email:** Click "📧 Email Settings"
- **Notifications:** Click "🔔 Notifications"
- **Export:** Click "📊 Advanced Export"

---

## Usage in Application

### Using Advanced Features Programmatically

Once integrated, use features directly in your JavaScript:

#### Create Recurring Appointments
```javascript
// Get an appointment from chatbot results
const appointment = healthFlowChatbot.lastQueryResults[0];

// Create monthly recurring series
const result = healthFlowChatbot.createRecurringAppointments(
    appointment.id,
    appointment.patient_no,
    'monthly',
    new Date(appointment.appointment_date)
);

console.log(`Created ${result.appointmentCount} appointments`);
```

#### Send Email Reminder
```javascript
// Send reminder email
const result = await healthFlowChatbot.sendReminderWithEmail(appointmentId);

console.log('Email sent:', result.email);
console.log('Notification sent:', result.notification);
```

#### Check for Conflicts
```javascript
// Check new appointment for conflicts
const checkResult = healthFlowChatbot.checkAppointmentConflicts(newAppointment);

if (checkResult.hasConflicts) {
    console.log(`Found ${checkResult.conflictCount} conflicts`);
    checkResult.conflicts.forEach(c => console.log(c.message));
}
```

#### Schedule Follow-ups
```javascript
// Schedule automatic follow-ups
healthFlowChatbot.scheduleFollowUps(
    appointmentId,
    patientId,
    'post_appointment',
    appointmentDate
);
```

#### Export with Formatting
```javascript
// Export appointments with colors and formatting
healthFlowChatbot.exportWithAdvancedFormatting(
    healthFlowChatbot.lastQueryResults
);
```

#### Get Statistics
```javascript
// Get comprehensive statistics
const stats = healthFlowChatbot.getAdvancedStats();

console.log('Recurring appointments:', stats.recurring);
console.log('Follow-ups pending:', stats.followUps.scheduled);
console.log('Emails sent:', stats.emails.sent);
```

---

## Configuration Files

### Environment Variables (Optional)
Create a `.env` file:
```
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.your-key-here
EMAIL_FROM=noreply@healthflow.local
SENDGRID_API_KEY=SG.your-key-here
AWS_SES_REGION=us-east-1
```

Load in your app:
```javascript
advancedChatbotFeatures.emailService.configure(
    process.env.EMAIL_PROVIDER,
    process.env.EMAIL_API_KEY,
    process.env.EMAIL_FROM
);
```

---

## Database Integration (Optional)

For production, save data to Supabase:

### Create Tables
```sql
-- Recurring appointments
CREATE TABLE recurring_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_appointment_id TEXT,
    patient_id TEXT,
    pattern TEXT,
    start_date TIMESTAMP,
    appointments JSONB,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Follow-up schedules
CREATE TABLE follow_up_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id TEXT,
    patient_id TEXT,
    follow_up_type TEXT,
    scheduled_date TIMESTAMP,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Appointment conflicts
CREATE TABLE appointment_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id TEXT,
    conflict_type TEXT,
    severity TEXT,
    message TEXT,
    detected_at TIMESTAMP DEFAULT NOW()
);
```

### Save Recurring Appointment
```javascript
async function saveRecurring(recurringData) {
    const { data, error } = await window.supabaseClient
        .from('recurring_appointments')
        .insert([{
            base_appointment_id: recurringData.baseAppointmentId,
            patient_id: recurringData.patientId,
            pattern: recurringData.pattern,
            start_date: recurringData.startDate,
            appointments: recurringData.appointments,
            status: 'active'
        }]);
    
    return { success: !error, data, error };
}
```

---

## Troubleshooting

### Issue: Scripts not loading
**Solution:**
1. Check file paths are correct
2. Open browser console (F12)
3. Check for 404 errors
4. Verify scripts are in correct order

### Issue: Functions undefined
**Solution:**
1. Ensure scripts loaded in correct order
2. Wait for DOM ready
3. Verify both files exist:
   - `assets/js/chatbot-advanced-features.js`
   - `assets/js/chatbot-integration.js`

### Issue: Email not sending
**Solution:**
1. Configure email service with valid API key
2. Check email provider credentials
3. Verify provider account is active
4. Check browser console for errors

### Issue: Notifications blocked
**Solution:**
1. Check browser notification permission
2. Request permission explicitly
3. Use HTTPS (required for some browsers)
4. Check browser notification settings

### Issue: Advanced Features button not appearing
**Solution:**
1. Retrieve appointments first
2. Wait for chatbot response
3. Check browser console for errors
4. Verify integration.js is loaded

---

## Performance Tips

1. **Email Configuration:** Cache API credentials in localStorage
2. **Notifications:** Use scheduled notifications for future appointments
3. **Recurring:** Limit max occurrences to avoid memory issues
4. **Conflicts:** Check conflicts for new appointments only
5. **Follow-ups:** Run cleanup periodically to remove old records

---

## Security Considerations

1. **API Keys:** Store in environment variables, never in code
2. **Email Data:** Sanitize patient data before sending
3. **Notifications:** Validate user permissions before sending
4. **Database:** Use RLS policies on Supabase tables
5. **CORS:** Configure properly for email API calls

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|:------:|:-------:|:------:|:----:|
| Email Service | ✓ | ✓ | ✓ | ✓ |
| Push Notifications | ✓ | ✓ | ⚠ | ✓ |
| Service Worker | ✓ | ✓ | ⚠ | ✓ |
| All Other Features | ✓ | ✓ | ✓ | ✓ |

**⚠** = Limited support, consider fallback

---

## Verification Checklist

- [ ] Scripts added to index.html
- [ ] Scripts in correct order
- [ ] Functions accessible in console
- [ ] Chatbot loads without errors
- [ ] Email configured (if using)
- [ ] Notifications permitted (if using)
- [ ] Advanced features button appears
- [ ] Each feature tested
- [ ] Database tables created (if using)
- [ ] Monitoring enabled

---

## Next Steps

1. ✅ Add scripts to HTML
2. ✅ Test basic functionality
3. ⬜ Configure email service
4. ⬜ Enable notifications
5. ⬜ Set up database (optional)
6. ⬜ Deploy to production
7. ⬜ Monitor usage and errors
8. ⬜ Add more customizations

---

## Support Documentation

- **Full Guide:** `ADVANCED_CHATBOT_FEATURES_COMPLETE.md`
- **Quick Start:** `ADVANCED_FEATURES_QUICK_START.md`
- **Checklist:** `FEATURES_IMPLEMENTATION_CHECKLIST.md`
- **Demo Page:** `advanced-features-demo.html`
- **Summary:** `IMPLEMENTATION_SUMMARY_ADVANCED_FEATURES.md`

---

## Questions?

Check the documentation guides above for:
- API reference
- Code examples
- Troubleshooting
- Feature details
- Testing procedures

---

**Last Updated:** January 22, 2024  
**Version:** 1.0  
**Status:** Ready for Integration
