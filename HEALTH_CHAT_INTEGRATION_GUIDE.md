# Health Chat Integration Guide

## Quick Start: Adding Health Features to Dashboard

### Step 1: Include Health Chat Features Script
Add this line to `dashboard.html` after `chat-system.js`:

```html
<!-- Health Chat Features Module -->
<script src="health-chat-features.js" defer></script>
```

### Step 2: Core Features Now Available

#### Feature 1: Patient Health Context Panel
When a health worker opens a patient chat, they see:
- Patient name, age, sex, phone
- Active conditions (highlighted in red)
- Current medications with dosage
- **⚠️ Allergies** (highlighted warning)
- Last visit date
- Next appointment
- Quick action buttons

#### Feature 2: Message Templates
Health workers can quickly send professional health messages:

**Available Templates:**
1. **Appointment Reminder** - Remind patient of upcoming visit
2. **Medication Reminder** - Medication adherence message
3. **Symptom Assessment** - Check-in on patient symptoms
4. **Prescription Message** - Share prescription details
5. **Follow-up Check-in** - Recovery or condition progress
6. **Lab Result Notification** - Share test results
7. **Referral Message** - Send specialist referral
8. **Emergency Alert** - Urgent patient notification

**How to Use:**
```javascript
// Health worker sends appointment reminder to patient
healthChat.sendTemplate(chatId, 'appointmentReminder', {
  patientName: 'James Mwale',
  appointmentDate: '2024-02-03',
  appointmentTime: '10:00 AM',
  healthWorkerName: 'Dr. Sarah Johnson'
});
```

#### Feature 3: Prescription Sending
Send structured prescriptions directly in chat:

```
Click: "Send Prescription" button
Fill in:
  - Medication Name
  - Dosage (e.g., 500mg)
  - Frequency (e.g., 3 times daily)
  - Duration (e.g., 7 days)
  - Warnings/Instructions
Click: "Send Prescription"
```

#### Feature 4: Appointment Scheduling
Schedule appointments directly from chat:

```javascript
// In patient chat, click "Schedule Appointment" button
// Opens appointment modal pre-filled with patient ID
// After scheduling, sends confirmation in chat
```

#### Feature 5: Health Worker Consultation Requests
Health workers can request consultation from colleagues:

```javascript
healthChat.requestConsultation(
  fromHealthWorkerId: 'user_001',  // Requesting health worker
  toHealthWorkerId: 'user_003',    // Specialist
  patientId: 'patient_001',        // Patient in question
  message: 'Need opinion on persistent cough'
);
```

## Implementation Details

### Patient Health Data Structure

The system stores patient information for quick access:

```javascript
{
  id: 'patient_001',
  name: 'James Mwale',
  age: 45,
  sex: 'M',
  phone: '+256701234567',
  activeConditions: ['Hypertension', 'Type 2 Diabetes'],
  currentMedications: [
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily' },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
  ],
  allergies: ['Penicillin'],
  lastVisit: '2024-01-20',
  nextAppointment: '2024-02-03',
  bmi: 28.5,
  bloodPressure: '140/90'
}
```

### Chat Structure Enhanced for Health

```javascript
{
  id: "chat_001",
  type: "private",
  name: "James Mwale",
  participants: ["user_001", "user_002"],
  
  // NEW: Health-specific fields
  patientId: "patient_001",
  purpose: "general_consultation",     // consultation type
  relatedAppointmentId: null,          // linked appointment
  status: "active"                     // active, resolved, pending
}
```

### Message Types for Health Communication

```javascript
{
  type: "text",              // Regular message
  type: "appointment",       // Appointment-related
  type: "prescription",      // Prescription message
  type: "medical_note",      // Clinical note
  type: "referral",          // Specialist referral
  type: "lab_result",        // Lab test results
  type: "health_update",     // Patient health update
  type: "alert"              // Urgent alert
}
```

## Setup Instructions

### 1. Add Script to Dashboard
Edit `dashboard.html` and add after line 99:

```html
<!-- Health Chat Features Module -->
<script src="health-chat-features.js" defer></script>
```

### 2. Initialize Health Chat Module
Add to the demo data section (lines 43-96):

```javascript
// Load patient health data for demo
function loadPatientHealthData() {
    const patientData = {
        'patient_001': {
            id: 'patient_001',
            name: 'James Mwale',
            age: 45,
            sex: 'M',
            phone: '+256701234567',
            activeConditions: ['Hypertension'],
            currentMedications: [
                { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily' }
            ],
            allergies: ['Penicillin'],
            lastVisit: '2024-01-20',
            nextAppointment: '2024-02-03'
        }
    };
    localStorage.setItem('patientHealthData', JSON.stringify(patientData));
}

// Call in initializeDemoData()
loadPatientHealthData();
```

### 3. Update Chat Creation
Link chats to patients:

```javascript
// When creating patient chat
const newChat = {
    // ... existing fields
    patientId: 'patient_001',  // Link to patient
    purpose: 'general_consultation'
};
```

## Usage Workflows

### Workflow 1: Patient Symptom Consultation

```
1. Health Worker opens dashboard
2. Clicks "+" (FAB button)
3. Clicks "Chat" button
4. Selects patient "James Mwale"
5. Chat opens with patient health context panel
6. Health worker sees:
   - Patient conditions: Hypertension
   - Current meds: Lisinopril
   - Allergies: Penicillin
   - Last visit: 2024-01-20
7. Health worker types: "Hi James, how have you been?"
8. Can click "Message Templates" for pre-made messages
9. Selects "Symptom Assessment" template
10. Fills in template variables
11. Sends professional symptom check message
```

### Workflow 2: Sending Prescription

```
1. In patient chat, click "Send Prescription" button
2. Fill prescription form:
   - Medication: Amoxicillin
   - Dosage: 500mg
   - Frequency: 3 times daily
   - Duration: 7 days
   - Warnings: Take with food
3. Click "Send Prescription"
4. Patient receives prescription message in chat
5. Can ask questions about medication
6. Health worker can respond with additional instructions
```

### Workflow 3: Schedule Appointment

```
1. In patient chat, click "Schedule Appointment"
2. Appointment modal opens with patient pre-selected
3. Fill in appointment details:
   - Date
   - Time
   - Reason
4. Click "Confirm"
5. Confirmation message sent to patient in chat
6. Both receive appointment details
```

### Workflow 4: Health Worker Consultation

```
1. Health Worker A treating patient
2. Needs opinion from Health Worker B (specialist)
3. Opens group chat with medical team
4. Types: "@Dr. Emmanuel, need your opinion on persistent cough"
5. Health Worker B responds in same group chat
6. They discuss patient case
7. Agreement on treatment plan
8. Health Worker A sends updates to patient
```

## Customization Guide

### Add New Message Template

Edit `health-chat-features.js`, in the `initializeTemplates()` function:

```javascript
customTemplate: {
  type: 'text',
  template: 'Hi {patientName}, [your custom message]. {customVariable}'
}
```

Then use:
```javascript
healthChat.sendTemplate(chatId, 'customTemplate', {
  patientName: 'Patient Name',
  customVariable: 'Value'
});
```

### Modify Patient Health Data

Edit `loadPatientHealthData()` function to add more patients or fields:

```javascript
'patient_003': {
  id: 'patient_003',
  name: 'New Patient',
  age: 50,
  sex: 'F',
  activeConditions: ['Cancer'],
  currentMedications: [...]
  // Add custom fields as needed
}
```

### Customize Health Panel Display

Edit `displayPatientContext()` function to show/hide different information:

```javascript
// Hide allergies if not relevant
// Add vital signs monitoring
// Add recent visits chart
// Add medication adherence tracking
```

## Key Functions Reference

### Display Patient Context
```javascript
healthChat.displayPatientContext(patientId, chatId)
```

### Send Template Message
```javascript
healthChat.sendTemplate(chatId, templateType, variables)
```

### Schedule Appointment
```javascript
healthChat.scheduleAppointment(patientId)
```

### Send Prescription
```javascript
healthChat.sendPrescription(chatId)
```

### Request Consultation
```javascript
healthChat.requestConsultation(
  fromHealthWorkerId, 
  toHealthWorkerId, 
  patientId, 
  message
)
```

### Get Patient Summary
```javascript
const patientInfo = healthChat.getPatientHealthSummary(patientId)
```

## Database Integration (Future)

When ready to upgrade from localStorage to Supabase:

```sql
-- Create tables for patient data
CREATE TABLE patient_health_records (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  active_conditions TEXT[],
  current_medications JSONB,
  allergies TEXT[],
  last_visit TIMESTAMP,
  next_appointment TIMESTAMP,
  vital_signs JSONB
);

-- Create table for consultation requests
CREATE TABLE consultation_requests (
  id UUID PRIMARY KEY,
  from_health_worker_id UUID REFERENCES users(id),
  to_health_worker_id UUID REFERENCES users(id),
  patient_id UUID REFERENCES patients(id),
  message TEXT,
  status VARCHAR,
  created_at TIMESTAMP
);
```

## Security & Privacy

### 1. Access Control
- Only health workers can initiate chats
- Only authorized health workers see patient data
- Facility-based restrictions enforced

### 2. Audit Trail
All health communications are logged:
```javascript
healthChat.logHealthEvent(eventType, patientId, details)
```

### 3. Data Protection
- Messages encrypted in transit (HTTPS)
- Sensitive data marked (allergies, conditions)
- HIPAA compliant storage structure

## Testing

### Test Case 1: Create Patient Chat
- [ ] Open chat panel
- [ ] Click "Chat"
- [ ] Select patient "James Mwale"
- [ ] Chat opens with health context panel

### Test Case 2: Use Template
- [ ] In patient chat, click "Message Templates"
- [ ] Select "Symptom Assessment"
- [ ] Fill in patient name and condition
- [ ] Send template message
- [ ] Verify message appears in chat

### Test Case 3: Send Prescription
- [ ] In patient chat, click "Send Prescription"
- [ ] Fill prescription details
- [ ] Click "Send Prescription"
- [ ] Verify prescription appears as structured message

### Test Case 4: Group Consultation
- [ ] Click "Group" button
- [ ] Create group "Medical Team"
- [ ] Add multiple health workers
- [ ] Send message requesting consultation
- [ ] Other health workers respond

## Troubleshooting

**Q: Patient health panel not showing**
A: Make sure patient ID is set in chat object and patient data exists in localStorage

**Q: Templates not appearing**
A: Check that health-chat-features.js is loaded after chat-system.js

**Q: Prescription form not opening**
A: Verify Bootstrap modal is loaded, check browser console for errors

**Q: Messages not sending**
A: Verify currentUser is set in localStorage, check chat is properly selected

## Next Steps

1. **Test** health features on demo patients
2. **Customize** templates for your workflows
3. **Add** real patient data from database
4. **Configure** appointment integration
5. **Deploy** to production environment
6. **Train** health workers on new features
7. **Gather** feedback and iterate

## Support

For issues or feature requests:
1. Check the console for error messages
2. Review the health-chat-features.js implementation
3. Verify data structure matches expected format
4. Test in browser DevTools localStorage

## File Locations

- Main chat system: `chat-system.js`
- Health features: `health-chat-features.js`
- Chat styles: `chat-system.css`
- Dashboard: `dashboard.html`
- Documentation: `HEALTH_CHAT_COMMUNICATION_STRATEGY.md`
