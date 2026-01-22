# HealthFlow Chatbot - Advanced Features

## Overview
The HealthFlow AI-powered chatbot now includes advanced appointment management capabilities with reminders, status updates, bulk operations, and statistical export functionality.

## Quick Start

### 1. Retrieve Appointments
Ask the chatbot about appointments with date filters:
```
"Show me appointments next week"
"Show missed appointments"
"Appointments between Jan 1 and Jan 31"
```

### 2. Set Reminders
After results appear, click **🔔 Reminders** button:
```
Options:
- 📧 Email (24 hours before)
- 📧 Email (1 hour before)
- 🔔 Notification (24 hours before)
```

### 3. Update Status (Bulk)
Click **⚙️ Bulk** button to:
```
- ✓ Mark as Completed
- ✗ Mark as Missed
- ⊘ Cancel All
- 🔔 Set Reminders for All
```

### 4. Export with Statistics
Click **📊 Stats** button:
```
Choose format:
- Excel (.xls) - Formatted with colors and statistics
- PDF - Print-friendly with summary
```

## Feature Details

### Appointment Reminders

#### Creating Reminders
```javascript
// Single reminder
healthFlowChatbot.createAppointmentReminder(
  appointmentId,
  'email',        // 'email', 'sms', 'notification'
  1440            // minutes before (1440 = 24 hours)
);

// Bulk reminders (via UI)
chatbotUI.setReminderForAll('email', 1440);
```

#### Reminder Storage
- Stored in chatbot memory with unique reminders
- Structure: `{ appointmentId, reminderType, minutesBefore, createdAt, status }`
- Status: 'active' or 'cancelled'

#### Reminder Scheduling
- Uses JavaScript `setTimeout()` for timing
- Calculates delay from now until scheduled reminder time
- Automatically triggers at specified time before appointment

#### Production Integration Notes
To send actual reminders, implement email/SMS service in `sendReminder()`:
```javascript
// Example implementation
if (reminderType === 'email') {
    await emailService.send(patient.email, {
        subject: `Appointment Reminder`,
        body: `You have an appointment on ${appointmentDate}`
    });
}
```

### Appointment Status Updates

#### Single Update
```javascript
await healthFlowChatbot.updateAppointmentStatus(appointmentId, 'Completed');
```

#### Bulk Update
```javascript
await healthFlowChatbot.bulkUpdateAppointmentStatus(
  [id1, id2, id3],
  'Missed'
);
```

#### Status Values
- `Scheduled` - Appointment is scheduled
- `Completed` - Appointment was completed
- `Missed` - Appointment was missed/not attended
- `Cancelled` - Appointment was cancelled

#### Database Synchronization
- Uses Supabase `update()` for single records
- Uses Supabase `upsert()` for bulk operations
- Changes reflected in database immediately

### Bulk Operations

#### Bulk Update Status
1. Click **⚙️ Bulk** after retrieving appointments
2. Select action (Mark as Completed, Mark as Missed, etc.)
3. Confirm in dialog box
4. System updates all selected appointments

#### Bulk Set Reminders
1. Click **⚙️ Bulk** → **🔔 Set Reminders for All**
2. Choose reminder type and timing
3. Reminders created for all appointments

#### Processing
- Max 50 appointments per operation
- Confirmation required to prevent accidents
- Real-time feedback after completion

### Statistical Exports

#### Statistics Calculated
```javascript
{
  total: 25,                    // Total appointments
  completed: 20,                // Completed count
  scheduled: 3,                 // Scheduled count
  missed: 2,                    // Missed count
  cancelled: 0,                 // Cancelled count
  completionRate: "80.0",       // Percentage (1-100)
  missedRate: "8.0",            // Percentage (1-100)
  byStatus: {
    "Completed": 20,
    "Scheduled": 3,
    "Missed": 2
  },
  byType: {
    "Clinical": 15,
    "Lab": 8,
    "Counseling": 2
  },
  dateRange: {
    earliest: Date,
    latest: Date
  }
}
```

#### Excel Export Format
```
┌─────────────────────────────────────────────────┐
│  APPOINTMENTS REPORT - 1/22/2026                │
├─────────────────────────────────────────────────┤
│  Total: 25 | Completed: 20 | Scheduled: 3      │
│  Missed: 2 | Completion Rate: 80%              │
├──────────┬─────────┬──────────┬────────┬────────┤
│ Date     │ Patient │ Name     │ Status │ Type   │
├──────────┼─────────┼──────────┼────────┼────────┤
│ 1/15/26  │ PAT001  │ John Doe │ ✓      │ Clinic │
│ 1/16/26  │ PAT002  │ Jane S.  │ Sched  │ Lab    │
│ ...      │ ...     │ ...      │ ...    │ ...    │
├──────────┴─────────┴──────────┴────────┴────────┤
│ Completion Rate: 80.0%                         │
│ Missed Rate: 8.0%                              │
└────────────────────────────────────────────────┘
```

#### PDF Export Format
- Professional header with title and timestamp
- Summary statistics box
- Color-coded appointment table
- Detailed statistics section
- Print-friendly styling

### Color Coding

#### Status Colors
- **Green** - Completed ✓
- **Red** - Missed ✗
- **Blue** - Scheduled 📅
- **Orange** - Other status

#### Excel Sheet Formatting
- Blue header row with white text
- Alternating row colors (white/light gray)
- Color-coded status cells
- Summary section with blue background

## Command Examples

### Appointment Queries
```
"Show appointments next week"
"What missed appointments are there?"
"List all appointments for February"
"Show appointments from Jan 15 to Jan 30"
"Appointments between 2024-01-01 and 2024-01-31"
```

### Reminder Commands
```
"Set email reminders for these appointments"
(Click 📧 Email (24 hours before))
Result: ✓ Set Email reminders for 5 appointments
```

### Status Update Commands
```
"Mark these as completed"
(Click ⚙️ Bulk → ✓ Mark as Completed)
Result: ✓ Successfully updated 3 appointments to Completed
```

### Export Commands
```
"Export these appointments"
(Click 📊 Stats → Choose format)
Result: File downloaded with statistics
```

## Technical Implementation

### File Changes
- **assets/js/chatbot-ai.js** - Core logic for reminders, status updates, bulk ops, stats
- **assets/js/chatbot-ui.js** - UI components for new features
- **README.md** - Updated documentation
- **CHATBOT_ADVANCED_FEATURES.md** - This document

### Key Classes & Methods

#### HealthFlowChatbot Class
```javascript
// Reminders
createAppointmentReminder(appointmentId, reminderType, minutesBefore)
scheduleReminder(appointmentId, minutesBefore)
getAppointmentReminders(appointmentId)
cancelAppointmentReminder(reminderId)

// Status Updates
updateAppointmentStatus(appointmentId, newStatus)
bulkUpdateAppointmentStatus(appointmentIds, newStatus)

// Statistics & Export
generateAppointmentStatistics(appointments)
exportAppointmentsWithStats(format)
exportToExcelWithStats(appointments, stats)
exportToPDFWithStats(appointments, stats)

// Bulk Operations
processBulkAppointmentCommand(command, filters)
```

#### ChatbotUI Class
```javascript
// Export
exportWithStats()

// Reminders
showReminderOptions()
setReminderForAll(reminderType, minutesBefore)

// Bulk Operations
showBulkActions()
bulkUpdateStatus(status)
bulkSetReminders()
```

## Database Schema Requirements

### Appointments Table
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  appointment_date TIMESTAMP,
  status VARCHAR(50),
  appointment_type VARCHAR(100),
  notes TEXT,
  patient_id UUID REFERENCES patients(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Supported Fields
- `id` - Unique identifier
- `appointment_date` - Date/time of appointment
- `status` - Current status (Scheduled, Completed, Missed, Cancelled)
- `appointment_type` - Type of appointment (Clinical, Lab, Counseling, etc.)
- `notes` - Additional notes
- `patient_id` - Reference to patient
- Other custom fields

## Error Handling

### Common Errors & Solutions

**"No facility ID found"**
- User not logged in
- Session data missing from localStorage
- Solution: Log in again with correct credentials

**"Database connection not available"**
- Supabase client not loaded
- Network connectivity issue
- Solution: Check internet connection and reload page

**"Failed to update appointment status"**
- Database error or permission issue
- Solution: Check Supabase RLS policies

**"No data to export"**
- No appointments retrieved
- Solution: Run a search query first

## Performance Considerations

- Max 50 appointments per query (configurable)
- Bulk operations use efficient Supabase upsert
- Reminders scheduled with JavaScript timers (not persistent across page reload)
- Statistics calculated in-memory (acceptable for <10,000 appointments)

## Security Notes

⚠️ Important:
- Reminders stored in browser memory (not persistent)
- Production implementation should store reminders in database
- Validate all user inputs server-side
- Implement proper Row-Level Security (RLS) policies
- Audit bulk operations in production
- Encrypt sensitive appointment data

## Future Enhancements

- [ ] Persistent reminder storage in database
- [ ] Email service integration (SendGrid, SES, etc.)
- [ ] SMS reminders (Twilio, Africa's Talking, etc.)
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Appointment conflict detection
- [ ] Automated follow-up scheduling
- [ ] Provider/staff filtering
- [ ] Recurring appointment patterns
- [ ] Advanced analytics dashboard
- [ ] Mobile app support

## Support & Troubleshooting

### Enable Debug Logging
Open browser console (F12) to see detailed logs:
```javascript
// View all reminders
console.log(healthFlowChatbot.appointmentReminders);

// View last query results
console.log(healthFlowChatbot.lastQueryResults);

// View conversation history
console.log(healthFlowChatbot.getHistory());
```

### Common Issues

**Reminders not triggering**
- Page must stay open (timers are browser-based)
- Check browser console for errors
- Verify appointment times are in the future

**Bulk updates not working**
- Check Supabase connection
- Verify appointment IDs are valid
- Check RLS policies allow updates

**Export file not downloading**
- Check browser download settings
- Ensure pop-ups aren't blocked
- Try incognito/private mode

## Support

For issues or questions:
1. Check browser console (F12) for errors
2. Review this documentation
3. Check APPOINTMENT_EXPORT_IMPLEMENTATION.md
4. Open issue on GitHub repository
