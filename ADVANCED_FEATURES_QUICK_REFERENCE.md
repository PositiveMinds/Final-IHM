# Advanced Chatbot Features - Quick Reference Card

## 🎯 Quick Start (30 seconds)

1. **Query appointments:** "Show appointments next week"
2. **Click action button** (🔔 Reminders, ⚙️ Bulk, or 📊 Stats)
3. **Confirm action** when prompted
4. **Done!** Changes saved to database

---

## 🔔 Reminders Feature

### How to Use
```
1. Retrieve appointments: "Show appointments next week"
2. Click: 🔔 Reminders
3. Select reminder type:
   - 📧 Email (24 hours before)
   - 📧 Email (1 hour before)
   - 🔔 Notification (24 hours before)
4. Result: Reminders scheduled ✓
```

### What It Does
- Creates reminders for all retrieved appointments
- Schedules automatic triggers at specified time
- Stores reminder history in chatbot
- Can be cancelled anytime

### Supported Reminder Types
| Type | Timing | Use Case |
|------|--------|----------|
| Email | 24h before | Advanced notice |
| Email | 1h before | Last-minute reminder |
| Notification | 24h before | In-app notification |

### Commands
```javascript
// Create single reminder
chatbotUI.setReminderForAll('email', 1440);

// View reminders
healthFlowChatbot.getAppointmentReminders();

// Cancel reminder
healthFlowChatbot.cancelAppointmentReminder(reminderId);
```

---

## ⚙️ Bulk Operations Feature

### How to Use
```
1. Retrieve appointments: "Show missed appointments"
2. Click: ⚙️ Bulk
3. Select action:
   ✓ Mark as Completed
   ✗ Mark as Missed
   ⊘ Cancel All
   🔔 Set Reminders for All
4. Confirm in dialog
5. Done! Database updated ✓
```

### Actions Available
| Action | Updates To | Use Case |
|--------|-----------|----------|
| Mark as Completed | Completed | After visit |
| Mark as Missed | Missed | No-show |
| Cancel All | Cancelled | Cancellation |
| Set Reminders | Active | Bulk notify |

### Limits
- Max 50 appointments per operation
- All changes are permanent (after confirmation)
- Confirmation required to prevent accidents

### Commands
```javascript
// Mark 5 appointments as completed
chatbotUI.bulkUpdateStatus('Completed');

// Bulk update (low-level)
healthFlowChatbot.bulkUpdateAppointmentStatus([id1, id2], 'Completed');

// Bulk reminder
chatbotUI.setReminderForAll('email', 1440);
```

---

## 📊 Statistics & Export Feature

### How to Use
```
1. Retrieve appointments: "Show appointments this month"
2. Click: 📊 Stats
3. Choose format:
   - Excel (.xls) → Color-coded with stats
   - PDF → Print-friendly format
4. Download starts automatically ✓
```

### What's Included in Export

**Excel File Contains:**
- ✅ Color-coded headers and status fields
- ✅ Alternating row colors for readability
- ✅ Summary statistics box at top
- ✅ Detailed breakdown at bottom
- ✅ Completion rate and missed rate

**Statistics Calculated:**
| Metric | Shows |
|--------|-------|
| Total | Count of all appointments |
| Completed | Count & percentage |
| Scheduled | Count & percentage |
| Missed | Count & percentage |
| Cancelled | Count & percentage |
| Completion Rate | (Completed/Total)×100% |
| Missed Rate | (Missed/Total)×100% |
| By Type | Count of each type |
| Date Range | Earliest to latest |

### Color Coding
```
Status Colors:
🟢 Green   = Completed ✓
🔴 Red     = Missed ✗
🔵 Blue    = Scheduled 📅
🟠 Orange  = Other

Excel Format:
🔵 Header  = Blue background
⚪ Row 1   = White background
⚫ Row 2   = Light gray background
🟣 Summary = Light blue background
```

### Commands
```javascript
// Export with stats (Excel or PDF)
chatbotUI.exportWithStats();

// Generate stats only
healthFlowChatbot.generateAppointmentStatistics(appointments);

// Export to specific format
healthFlowChatbot.exportAppointmentsWithStats('excel');
healthFlowChatbot.exportAppointmentsWithStats('pdf');
```

---

## ✅ Status Update Feature

### Supported Statuses
```
Scheduled  → Appointment is planned
Completed  → Appointment happened
Missed     → Patient didn't show
Cancelled  → Appointment was cancelled
```

### How to Update Single Appointment
```javascript
// Update one appointment
await healthFlowChatbot.updateAppointmentStatus(appointmentId, 'Completed');
```

### Workflow for Bulk Updates
```
1. Query appointments: "Show appointments next week"
2. Click: ⚙️ Bulk
3. Select: ✓ Mark as Completed (or other action)
4. Confirm: "Mark 5 appointments as Completed?"
5. Click: OK
6. Result: ✓ Successfully updated 5 appointments
```

---

## 📋 Usage Examples

### Example 1: Set Reminders
```
User: "Show appointments next week"
System: [Lists 5 appointments for next week]

User clicks: 🔔 Reminders
System: "Reminder options for 5 appointments"

User clicks: 📧 Email (24 hours before)
System: ✓ Set Email reminders for 5 appointments (1440 minutes before)
```

### Example 2: Bulk Complete Visits
```
User: "Show completed appointments"
System: [Lists 8 completed appointments]

User clicks: ⚙️ Bulk
System: "Bulk actions for 8 appointments"

User clicks: ✓ Mark as Completed
System: "Mark 8 appointments as Completed? This cannot be undone."

User clicks: OK
System: ✓ Successfully updated 8 appointments to Completed
```

### Example 3: Export with Statistics
```
User: "Show January appointments"
System: [Lists 25 appointments]

User clicks: 📊 Stats
System: "Export as Excel? (OK=Excel, Cancel=PDF)"

User clicks: OK
System: Starts download → appointments_report_1674356400000.xls

Excel file shows:
- Header: "APPOINTMENTS REPORT - 1/22/2026"
- Summary: Total=25, Completed=20, Missed=2, Completion Rate=80%
- Detailed table with color-coded statuses
- Statistics section at bottom
```

---

## 🛠️ Advanced Commands

### JavaScript Console Commands
Open browser console (F12) and use these:

```javascript
// View all reminders
healthFlowChatbot.appointmentReminders

// View specific appointment's reminders
healthFlowChatbot.getAppointmentReminders(appointmentId)

// View all query results
healthFlowChatbot.lastQueryResults

// View chat history
healthFlowChatbot.getHistory()

// Generate stats from current results
healthFlowChatbot.generateAppointmentStatistics(healthFlowChatbot.lastQueryResults)

// Manual status update
healthFlowChatbot.updateAppointmentStatus(appointmentId, 'Completed');

// Manual bulk update
healthFlowChatbot.bulkUpdateAppointmentStatus([id1, id2, id3], 'Completed');

// Manual reminder creation
healthFlowChatbot.createAppointmentReminder(appointmentId, 'email', 1440);

// Manual reminder cancellation
healthFlowChatbot.cancelAppointmentReminder(reminderId);
```

---

## ⚠️ Important Notes

### Reminders
- ⏰ Based on browser timers - page must stay open
- 💾 Stored in browser memory - lost on page reload
- 🔄 For persistent reminders, integrate email/SMS service
- ❌ Cannot edit reminders - create new or cancel old

### Bulk Operations
- ⚠️ Permanent changes - confirmation required
- 🔒 All appointments modified at once
- 📊 Check statistics before updating
- 🚫 Cannot undo - use carefully

### Exports
- 📥 Downloaded to default downloads folder
- 📄 Excel file opens in Excel, Sheets, or LibreOffice
- 🖨️ PDF opens in browser or Adobe Reader
- ⏱️ Filename includes timestamp to prevent overwriting

---

## 🔧 Troubleshooting

### "No data to export"
- **Cause:** No appointments retrieved
- **Fix:** Run a search query first: "Show appointments next week"

### Reminders not triggering
- **Cause:** Page closed or browser offline
- **Fix:** Keep page open, check internet connection

### Bulk update fails
- **Cause:** Database error or permission issue
- **Fix:** Check Supabase connection, verify login

### Export file doesn't download
- **Cause:** Pop-ups blocked or download settings
- **Fix:** Check browser settings, try incognito mode

### "Database connection not available"
- **Cause:** Supabase not loaded
- **Fix:** Reload page, check network connection

---

## 📞 Help & Support

### Common Questions

**Q: Can I set different reminder times?**
A: Yes, use: `chatbotUI.setReminderForAll('email', 60)` for 1 hour, `1440` for 24 hours, or custom minutes.

**Q: What happens if I reload the page?**
A: Scheduled reminders are cancelled (stored in browser memory). Bulk operations persist in database.

**Q: Can I recover deleted reminders?**
A: No, cancel reminders before they trigger or use manual methods.

**Q: How many appointments can I bulk update?**
A: Up to 50 per operation (configurable in code).

**Q: What export format should I use?**
A: Excel for detailed stats, PDF for sharing/printing.

---

## 🚀 Quick Tips

1. **Always check statistics before bulk update** - Verify you're modifying the right appointments
2. **Set reminders immediately after retrieving** - Don't wait, or appointments may pass
3. **Use bulk operations for many appointments** - More efficient than updating one by one
4. **Export monthly reports** - Track completion rates and statistics
5. **Keep browser open for reminders** - Timers run in active browser only

---

## 📊 Statistics at a Glance

```
Your Appointments This Month:
├─ Total: 25
├─ Completed: 20 (80%) ✓
├─ Scheduled: 3 (12%) 📅
├─ Missed: 2 (8%) ✗
└─ Cancelled: 0 (0%)

Completion Rate: 80.0%
Missed Rate: 8.0%

You're doing great! 🎉
```

---

**Last Updated:** January 22, 2026
**Version:** 2.0 (Advanced Features)
**Status:** ✅ Active
