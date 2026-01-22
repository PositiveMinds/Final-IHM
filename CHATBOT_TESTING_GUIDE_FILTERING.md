# Chatbot Testing Guide - Provider Filtering & 1-Min Reminders

## Quick Start

### Feature 1: Provider/Staff Filtering

#### Test Query Examples:
```
1. "Show me appointments with doctor John"
2. "Appointments by nurse Mary"
3. "List appointments with Dr. Smith"
4. "Show all appointments with staff James"
5. "Appointments with clinician Sarah"
```

#### Expected Results:
- Chatbot returns appointments filtered by provider name
- "Provider/Staff" column appears in results table
- Column displays provider/staff names or "—" if not available
- Partial name matching works (e.g., "John" matches "Dr. John Smith")

---

### Feature 2: 1-Minute Test Reminders

#### Setup:
1. Open Dashboard at `/dashboard.html`
2. Click chatbot button (💬) to open HealthFlow AI Assistant
3. Query appointments: "Show me appointments next week"

#### Testing Steps:

**Step 1: Retrieve Appointments**
```
Query: "Show appointments next week"
Result: See table with appointments
```

**Step 2: Set Test Reminders**
Option A: Click button in results
- Click "🔔 Set 1-Min Reminders (Test)" button below appointment table

Option B: Use reminder menu
- Click "🔔 Reminders" quick action button
- Click "⏱️ Test (1 minute before)" button

**Step 3: Wait for Notification**
- Wait exactly 1 minute (60 seconds)
- Two types of notifications should appear:

**Browser Notification (Top-Right):**
```
HealthFlow Appointment Reminder
├─ Reminder: Appointment for [Patient Name] scheduled on [Date]
└─ Requires: Notification permission granted
```

**Chatbot Notification:**
```
🔔 Reminder: Appointment for [Patient Name] scheduled on [Date]
```

---

## Detailed Testing Checklist

### Provider Filtering Tests

- [ ] Test basic provider name extraction
  ```
  Query: "doctor John"
  Expected: Extract "John" as provider_name
  ```

- [ ] Test with titles
  ```
  Query: "Dr. Smith's appointments"
  Expected: Extract "Smith" as provider_name
  ```

- [ ] Test with "nurse" keyword
  ```
  Query: "nurse Mary"
  Expected: Extract "Mary" as provider_name
  ```

- [ ] Test case insensitivity
  ```
  Query: "DOCTOR john"
  Expected: Works same as "doctor john"
  ```

- [ ] Test partial matching
  ```
  Query: "appointments with Jo"
  Expected: Matches "John", "Joseph", "Joan", etc.
  ```

- [ ] Test with other filters
  ```
  Query: "appointments with dr. john and hiv positive"
  Expected: Filters by provider AND HIV status
  ```

### 1-Minute Reminder Tests

- [ ] Test reminder trigger timing
  ```
  Set time: T=0
  Trigger time: T=60 seconds (±2 seconds acceptable)
  Expected: Notification appears around 60 seconds
  ```

- [ ] Test notification content
  ```
  Check content includes:
  - Patient name
  - Appointment date
  - "Reminder" label
  ```

- [ ] Test browser notification permission
  ```
  If permission granted:
    Expected: OS notification appears (desktop/mobile)
  If permission denied:
    Expected: Only chatbot notification appears
  ```

- [ ] Test multiple reminders
  ```
  Set reminders for 3 appointments
  Expected: All 3 trigger after 1 minute
  ```

- [ ] Test reminder storage
  ```
  Check: healthFlowChatbot.appointmentReminders
  Expected: Contains reminder objects with:
    - appointmentId
    - patientName
    - appointmentDate
    - reminderType
    - minutesBefore: 1
    - createdAt
  ```

### Integration Tests

- [ ] Provider filtering + test reminders
  ```
  1. Query: "appointments with Dr. Smith"
  2. Click "Set 1-Min Reminders"
  3. Wait 1 minute
  4. Verify reminder shows Dr. Smith's appointment
  ```

- [ ] Multiple buttons work
  ```
  - Test "Set 1-Min Reminders (Test)" from results
  - Test "🔔 Reminders" → "⏱️ Test" from actions
  - Both should work identically
  ```

- [ ] Reminder doesn't interfere with other features
  ```
  - Export still works
  - Bulk actions still work
  - Other reminders still work (24h, 1h)
  ```

---

## Browser Console Testing

Open DevTools (F12) and run these commands:

### Check Last Query Results
```javascript
console.log(healthFlowChatbot.lastQueryResults);
// Should show array of appointments
```

### Check Appointment Reminders
```javascript
console.log(healthFlowChatbot.appointmentReminders);
// Should show reminder objects
```

### Manually Trigger Reminder (for testing)
```javascript
const reminder = Object.values(healthFlowChatbot.appointmentReminders)[0];
chatbotUI.triggerReminderNotification(reminder);
```

### Check Extracted Filters
```javascript
const filters = healthFlowChatbot.extractFilters("appointments with Dr. John");
console.log(filters);
// Should show: { provider_name: "John", ... }
```

---

## Troubleshooting

### Reminders Not Triggering

**Check 1: Verify JavaScript Execution**
```javascript
// In console:
window.healthFlowChatbot !== undefined
// Should be: true
```

**Check 2: Verify Timeout Set**
```javascript
// Set reminder and immediately check console
healthFlowChatbot.appointmentReminders
// Should show reminder objects
```

**Check 3: Browser Notification Permission**
```javascript
Notification.permission
// Should be: "granted" or "default" (not "denied")
```

**Check 4: Wait Time**
- Ensure you're actually waiting 60 seconds
- Timer starts when you click reminder button
- Check browser time synchronization

### Provider Names Not Filtering

**Check 1: Verify Filter Extraction**
```javascript
healthFlowChatbot.extractFilters("appointments with Dr. John")
// Should show: { provider_name: "John" }
```

**Check 2: Check Database Field Names**
- Verify your appointments table has `provider_name` or `staff_name` column
- Data must be populated for filtering to work

**Check 3: Case Sensitivity**
- Query is case-insensitive
- Database field is case-insensitive (ilike used)

---

## Expected Behavior Summary

| Feature | Input | Expected Output |
|---------|-------|-----------------|
| **Provider Filter** | "appointments with Dr. John" | Table with provider column showing "John" |
| **Test Reminder Button** | Click "Set 1-Min Reminders" | Message: "✓ Set 🔔 Notification reminders for X appointments (1 minute before (TEST))" |
| **Reminder Trigger** | Wait 60 seconds | Browser notification + Chatbot message appears |
| **Multiple Reminders** | Set for 3 appointments | 3 notifications trigger after 60 seconds each |

---

## Session Recording

For demonstration:
1. Open dashboard.html
2. Open chatbot
3. Query: "Show appointments next week with doctor"
4. Click "Set 1-Min Reminders (Test)"
5. Wait 60 seconds and record notification
6. Show appointment table with provider column
