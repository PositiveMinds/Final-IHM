# Chat Schema Enhancement Summary

## Overview
Your existing chat system has a solid foundation with tables for `chats`, `chat_participants`, `messages`, and `file_attachments`. The enhancement script adds **health-specific columns and new tables** for health worker-patient communication features.

---

## What You Already Have ✅

### Current Tables
1. **chats** - Chat rooms (private/group)
2. **chat_participants** - Who's in each chat
3. **messages** - Individual messages
4. **file_attachments** - Files shared in messages
5. **audit_log** - General audit trail

### Current Capabilities
- Private and group messaging
- File attachments (PDF, PNG, JPG, etc)
- Basic timestamps and tracking
- Facility isolation via `fid`
- Soft deletes for messages

---

## What's Being Added 📋

### 1. CHATS Table Enhancements

| Column | Type | Purpose |
|--------|------|---------|
| `patient_pid` | INT | Links chat to specific patient (references patients.pid) |
| `purpose` | TEXT | Type of consultation (appointment, prescription, referral, etc) |
| `chat_status` | TEXT | active / resolved / pending_action / on_hold / archived |
| `related_appointment_id` | INT | Links to appointment if appointment-related |
| `priority` | TEXT | urgent / high / normal / low |
| `is_flagged` | BOOLEAN | Mark important chats |
| `flag_reason` | TEXT | Why chat is flagged |
| `health_notes` | TEXT | Health worker observations |

**Example:**
```sql
-- Health worker chat with patient about hypertension
INSERT INTO chats (type, name, created_by, fid, patient_pid, purpose, priority)
VALUES ('private', 'James Mwale', 1, 'facility-uuid', 101, 'appointment_followup', 'normal');
```

---

### 2. CHAT_PARTICIPANTS Table Enhancements

| Column | Type | Purpose |
|--------|------|---------|
| `participant_role` | TEXT | creator / admin / member / observer |
| `can_send_prescriptions` | BOOLEAN | Can this person send prescriptions? |
| `can_schedule_appointments` | BOOLEAN | Can schedule appointments? |
| `can_access_patient_records` | BOOLEAN | Access patient full records? |
| `can_request_consultation` | BOOLEAN | Request specialist opinion? |
| `notifications_enabled` | BOOLEAN | Receive notifications |
| `mute_until` | TIMESTAMP | Mute until specific time |
| `left_at` | TIMESTAMP | When participant left group |

**Example:**
```sql
-- Add health worker to patient chat with prescription permission
INSERT INTO chat_participants (chat_id, user_id, participant_role, can_send_prescriptions)
VALUES (1, 5, 'member', true);
```

---

### 3. MESSAGES Table Enhancements

#### New Message Types (beyond text/file/system)
- `appointment` - Appointment scheduling
- `prescription` - Prescription sharing
- `medical_note` - Clinical notes
- `referral` - Specialist referral
- `lab_result` - Lab test results
- `health_update` - Health status
- `alert` - Urgent alerts
- `template` - Using pre-made template
- `consultation_request` - Request specialist opinion

| Column | Type | Purpose |
|--------|------|---------|
| `template_type` | TEXT | appointment_reminder, medication_reminder, etc |
| `clinical_context` | JSONB | Structured health data (symptoms, severity, etc) |
| `delivery_status` | TEXT | sent / delivered / read / failed / pending |
| `read_at` | TIMESTAMP | When message was read |
| `edited_at` | TIMESTAMP | When message was last edited |
| `edit_count` | INT | How many times edited |
| `is_pinned` | BOOLEAN | Important message? |
| `pin_reason` | TEXT | Why pinned |
| `pinned_at` | TIMESTAMP | When pinned |
| `related_patient_pid` | INT | Quick patient reference (references patients.pid) |
| `message_priority` | TEXT | urgent / high / normal / low |

**Example:**
```sql
-- Send appointment reminder using template
INSERT INTO messages 
(chat_id, sender_id, content, message_type, template_type, delivery_status)
VALUES (1, 5, 'Hi James, reminder of appointment on 2/3...', 'appointment', 'appointment_reminder', 'delivered');
```

---

### 4. NEW TABLE: health_message_templates

Pre-made professional health messages for quick use.

| Column | Purpose |
|--------|---------|
| `template_key` | Unique identifier (appointment_reminder, etc) |
| `template_name` | Display name |
| `template_text` | Message with {variables} |
| `message_type` | Type of message |
| `category` | appointment / medication / prescription / etc |
| `variables` | JSON array of {placeholders} |
| `created_by` | Who created template |
| `fid` | Facility |
| `is_system_template` | Pre-built by system |
| `is_active` | Currently usable |

**8 System Templates Pre-Loaded:**
1. Appointment Reminder
2. Medication Reminder
3. Symptom Assessment
4. Prescription Message
5. Follow-up Check-in
6. Lab Result Notification
7. Referral Message
8. Emergency Alert

**Example:**
```sql
-- Query a template
SELECT * FROM health_message_templates 
WHERE template_key = 'appointment_reminder';

-- Use template with variables
-- Template: "Hi {patientName}, reminder of {appointmentDate}..."
-- Replace: patientName='James', appointmentDate='2024-02-03'
-- Result: "Hi James, reminder of 2024-02-03..."
```

---

### 5. NEW TABLE: consultation_requests

Track health worker consultation requests to specialists.

| Column | Purpose |
|--------|---------|
| `chat_id` | Discussion happens in this chat |
| `from_health_worker_id` | Who's asking |
| `to_health_worker_id` | Who's being asked |
| `patient_id` | Patient in question |
| `specialty_required` | What specialty needed |
| `message` | Consultation request message |
| `clinical_notes` | JSONB with clinical details |
| `status` | pending / acknowledged / in_progress / resolved / cancelled |
| `requested_at` | When requested |
| `first_response_at` | When specialist first responded |
| `resolved_at` | When consultation resolved |
| `priority` | urgent / high / normal / low |

**Example:**
```sql
-- Health Worker A asks for specialist opinion
INSERT INTO consultation_requests 
(chat_id, from_health_worker_id, to_health_worker_id, patient_id, specialty_required, message, priority)
VALUES (5, 2, 3, 101, 'Cardiology', 'Patient has persistent chest pain', 'urgent');
```

---

### 6. NEW TABLE: chat_message_reads

Accurate tracking of who read which messages (separate from messages.read_at).

| Column | Purpose |
|--------|---------|
| `message_id` | Which message |
| `user_id` | Who read it |
| `read_at` | When they read it |

**Example:**
```sql
-- See who has read a message
SELECT u.full_name, cmr.read_at 
FROM chat_message_reads cmr
JOIN users u ON cmr.user_id = u.uid
WHERE cmr.message_id = 42
ORDER BY cmr.read_at;
```

---

### 7. NEW TABLE: chat_health_context

Health snapshot for quick reference in patient chats.

| Column | Purpose |
|--------|---------|
| `chat_id` | Which chat |
| `patient_pid` | Which patient (references patients.pid) |
| `active_conditions` | TEXT[] array of current conditions |
| `current_medications` | JSONB with meds & dosages |
| `allergies` | TEXT[] array of allergies |
| `last_visit_date` | When last visited |
| `next_appointment_date` | Upcoming appointment |
| `recent_lab_results` | JSONB with results |
| `clinical_summary` | Text summary |
| `follow_up_needed` | Boolean flag |
| `follow_up_notes` | Follow-up instructions |

**Example:**
```sql
-- Quick lookup of patient health in a chat
SELECT * FROM chat_health_context WHERE chat_id = 1;

-- Result shows patient's conditions, meds, allergies, etc without extra queries
```

---

### 8. NEW TABLE: health_communication_audit

HIPAA/compliance logging of all health communication actions.

| Column | Purpose |
|--------|---------|
| `chat_id` | Which chat |
| `message_id` | Which message |
| `user_id` | Who did the action |
| `user_role` | Their role (health_worker, patient, etc) |
| `facility_id` | Which facility |
| `action` | message_sent / prescription_sent / appointment_scheduled / chat_accessed / etc |
| `action_details` | JSONB with details |
| `ip_address` | For security |
| `user_agent` | Device/browser info |
| `is_compliant` | Meets compliance rules |
| `compliance_notes` | Any issues |
| `action_timestamp` | When it happened |

**Example:**
```sql
-- Audit trail of all actions in a chat (HIPAA compliant)
SELECT action, user_id, action_timestamp, compliance_notes
FROM health_communication_audit
WHERE chat_id = 1
ORDER BY action_timestamp DESC;
```

---

### 9. NEW VIEWS (Helpful Queries)

#### vw_chats_with_health_context
Combines chat + patient health info in one query.

```sql
SELECT * FROM vw_chats_with_health_context 
WHERE patient_id = 101;

-- Returns: chat_id, type, name, patient_name, age, conditions, medications, allergies, etc
```

#### vw_unread_messages
Shows unread message count per user per chat.

```sql
SELECT * FROM vw_unread_messages 
WHERE user_id = 5;

-- Returns: chat_id, chat_name, unread_count, last_message_time
```

#### vw_health_worker_patient_chats
Lists all of a health worker's patient chats.

```sql
SELECT * FROM vw_health_worker_patient_chats 
WHERE health_worker_name = 'Dr. Sarah Johnson';

-- Returns: All patient chats with unread counts
```

---

## How to Apply Changes

### Step 1: Run the SQL Script
Copy and run `ALTER_CHAT_TABLES_HEALTH_FEATURES.sql` in Supabase SQL Editor.

**Time:** ~5 minutes
**Risk:** Low - only adds columns/tables, doesn't modify existing data
**Data Impact:** Zero - existing chats/messages unchanged

### Step 2: Verify Changes
```sql
-- Check new columns exist
\d public.chats;
\d public.messages;
\d public.chat_participants;

-- Check new tables exist
\dt public.health_*;
\dt public.consultation_*;
```

### Step 3: Verify Templates Loaded
```sql
SELECT COUNT(*) FROM health_message_templates;
-- Should return: 8
```

---

## Integration with Health Chat Features Module

Your JavaScript files (`chat-system.js`, `health-chat-features.js`) work with this schema:

### Message Sending
```javascript
// Old way (still works)
sendMessage(text) { 
  // Just stores text
}

// New way with health features
sendTemplate('appointment_reminder', {
  patientName: 'James',
  appointmentDate: '2024-02-03'
})
// Queries health_message_templates
// Stores with message_type='appointment', template_type='appointment_reminder'
```

### Getting Patient Context
```javascript
// Query the new view
const chatWithContext = await supabase
  .from('vw_chats_with_health_context')
  .select('*')
  .eq('chat_id', chatId)
  .single();

// Returns: chat data + patient conditions, meds, allergies, etc
```

### Tracking Reads
```javascript
// Update delivery status
UPDATE messages 
SET delivery_status = 'read', read_at = NOW() 
WHERE message_id = 123;

// Log in read receipts table
INSERT INTO chat_message_reads (message_id, user_id, read_at)
VALUES (123, 5, NOW());
```

### Audit Logging
```javascript
// Every health action gets logged
INSERT INTO health_communication_audit
(chat_id, message_id, user_id, action, action_details)
VALUES (1, 42, 5, 'prescription_sent', '{"medicine":"Amoxicillin"}');
```

---

## Before & After Comparison

### Before (Current)
```sql
-- Send message
INSERT INTO messages (chat_id, sender_id, content, message_type)
VALUES (1, 5, 'Take your medicine', 'text');

-- No context about what it's for
-- No delivery status tracking
-- No audit trail
-- No template usage
```

### After (Enhanced)
```sql
-- Send health message using template
INSERT INTO messages 
(chat_id, sender_id, content, message_type, template_type, 
 delivery_status, message_priority, related_patient_id)
VALUES (1, 5, 'Hi James, remember to take Lisinopril daily for hypertension', 
        'health_update', 'medication_reminder', 'sent', 'normal', 101);

-- Automatically logs audit
INSERT INTO health_communication_audit
(chat_id, message_id, user_id, action, action_details)
VALUES (1, LAST_INSERT_ID(), 5, 'message_sent', '{"type":"medication_reminder"}');

-- Can query read status
SELECT * FROM chat_message_reads WHERE message_id = LAST_INSERT_ID();

-- Can see full patient context
SELECT * FROM vw_chats_with_health_context WHERE chat_id = 1;
```

---

## Data Types & Constraints

### Safe Upgrades
All new columns:
- Have DEFAULT values (existing rows get sensible defaults)
- Are NULLABLE (except NOT NULL where sensible)
- Don't affect existing queries
- Are indexed for performance

### Existing Compatibility
- All existing code continues to work unchanged
- New features are opt-in
- Can migrate gradually
- No data migration needed

---

## Performance Impact

### Indexes Added
- `idx_chats_patient_id` - Fast lookups by patient
- `idx_messages_delivery_status` - Fast unread queries
- `idx_chat_health_context` - Fast context lookup
- And 15 more for comprehensive coverage

### Query Optimization
- New views pre-join common data
- Indexes on frequently filtered columns
- Proper foreign key constraints
- No N+1 query problems

---

## Next Steps

1. **Review the SQL script** - `ALTER_CHAT_TABLES_HEALTH_FEATURES.sql`
2. **Run in Supabase** - Copy and execute in SQL Editor
3. **Verify with test queries** - Run the examples above
4. **Update JavaScript** - Use new columns when sending messages
5. **Train health workers** - Use template system for consistent messaging

---

## Questions & Answers

**Q: Will this break existing chats?**
A: No. All new columns are optional (NULL). Existing data is untouched.

**Q: Do I need to migrate data?**
A: No. The script is additive only. No data transformation needed.

**Q: Can I customize templates?**
A: Yes. `health_message_templates` has `is_system_template` flag. You can add custom ones.

**Q: What about patient privacy?**
A: All changes support HIPAA with `health_communication_audit` table for compliance logging.

**Q: Can I use this with my current stack?**
A: Yes. Works with your existing chat system. Just adds capabilities on top.

**Q: How long until I see the new features?**
A: After running SQL (~5 min), features are available immediately via the JavaScript modules.

---

## File References

- **SQL Script**: `ALTER_CHAT_TABLES_HEALTH_FEATURES.sql`
- **JavaScript Module**: `health-chat-features.js`
- **Integration Guide**: `HEALTH_CHAT_INTEGRATION_GUIDE.md`
- **Communication Strategy**: `HEALTH_CHAT_COMMUNICATION_STRATEGY.md`
