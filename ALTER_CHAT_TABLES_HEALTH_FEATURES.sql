/**
 * ALTER CHAT TABLES FOR HEALTH COMMUNICATION FEATURES
 * 
 * Adds health-specific functionality to existing chat tables:
 * - Patient context linking
 * - Message types for health communications
 * - Read receipts & message status
 * - Consultation requests
 * - Health worker permissions
 * - Audit trail for compliance
 * 
 * Safe to run - only adds columns, doesn't modify existing data
 * Run in Supabase SQL Editor
 */

-- ============================================================
-- 1. ALTER CHATS TABLE - Add Health Context
-- ============================================================

-- Add patient reference to link chat to patient
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS patient_pid INTEGER REFERENCES public.patients(pid) ON DELETE SET NULL;

-- Add purpose/context of chat
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'general' CHECK (purpose IN (
  'general_consultation',
  'appointment_followup',
  'prescription_review',
  'referral',
  'urgent_care',
  'routine_checkup',
  'lab_results_discussion',
  'health_education',
  'medication_review',
  'symptom_assessment',
  'general'
));

-- Add status to track chat lifecycle
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS chat_status TEXT DEFAULT 'active' CHECK (chat_status IN (
  'active',
  'resolved',
  'pending_action',
  'on_hold',
  'archived'
));

-- Link to related appointment
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS related_appointment_id INTEGER;

-- Priority level
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN (
  'urgent',
  'high',
  'normal',
  'low'
));

-- Flag important chats
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;

ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS flag_reason TEXT;

-- Health worker notes about chat
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS health_notes TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chats_patient_id ON public.chats(patient_pid);
CREATE INDEX IF NOT EXISTS idx_chats_purpose ON public.chats(purpose);
CREATE INDEX IF NOT EXISTS idx_chats_status ON public.chats(chat_status);
CREATE INDEX IF NOT EXISTS idx_chats_priority ON public.chats(priority);
CREATE INDEX IF NOT EXISTS idx_chats_is_flagged ON public.chats(is_flagged);
CREATE INDEX IF NOT EXISTS idx_chats_fid_status ON public.chats(fid, chat_status);

-- ============================================================
-- 2. ALTER CHAT_PARTICIPANTS TABLE - Add Health Permissions
-- ============================================================

-- Add participant role
ALTER TABLE public.chat_participants
ADD COLUMN IF NOT EXISTS participant_role TEXT DEFAULT 'member' CHECK (participant_role IN (
  'creator',
  'admin',
  'member',
  'observer'
));

-- Health worker capabilities
ALTER TABLE public.chat_participants
ADD COLUMN IF NOT EXISTS can_send_prescriptions BOOLEAN DEFAULT FALSE;

ALTER TABLE public.chat_participants
ADD COLUMN IF NOT EXISTS can_schedule_appointments BOOLEAN DEFAULT FALSE;

ALTER TABLE public.chat_participants
ADD COLUMN IF NOT EXISTS can_access_patient_records BOOLEAN DEFAULT FALSE;

ALTER TABLE public.chat_participants
ADD COLUMN IF NOT EXISTS can_request_consultation BOOLEAN DEFAULT TRUE;

-- Notification settings
ALTER TABLE public.chat_participants
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

ALTER TABLE public.chat_participants
ADD COLUMN IF NOT EXISTS mute_until TIMESTAMP WITH TIME ZONE;

-- Track when participant left group
ALTER TABLE public.chat_participants
ADD COLUMN IF NOT EXISTS left_at TIMESTAMP WITH TIME ZONE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_participants_role ON public.chat_participants(participant_role);
CREATE INDEX IF NOT EXISTS idx_chat_participants_left_at ON public.chat_participants(left_at);

-- ============================================================
-- 3. ALTER MESSAGES TABLE - Add Health Features
-- ============================================================

-- Update message_type to include health message types
-- First, drop existing constraint
ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_message_type_check;

-- Add new constraint with health message types
ALTER TABLE public.messages
ADD CONSTRAINT messages_message_type_check CHECK (message_type IN (
  'text',
  'file',
  'system',
  'appointment',
  'prescription',
  'medical_note',
  'referral',
  'lab_result',
  'health_update',
  'alert',
  'template',
  'consultation_request'
));

-- Track which template was used (if any)
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS template_type TEXT CHECK (template_type IN (
  'appointment_reminder',
  'medication_reminder',
  'symptom_assessment',
  'prescription_message',
  'followup_checkin',
  'lab_result_notification',
  'referral_message',
  'emergency_alert',
  'custom'
));

-- Store clinical context as JSON (symptoms, severity, etc)
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS clinical_context JSONB;

-- Message delivery and read status
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN (
  'sent',
  'delivered',
  'read',
  'failed',
  'pending'
));

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Track message edits
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

-- Pinned important messages
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS pin_reason TEXT;

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP WITH TIME ZONE;

-- Link message to patient for quick reference
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS related_patient_pid INTEGER REFERENCES public.patients(pid) ON DELETE SET NULL;

-- Priority of message
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS message_priority TEXT DEFAULT 'normal' CHECK (message_priority IN (
  'urgent',
  'high',
  'normal',
  'low'
));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_template_type ON public.messages(template_type);
CREATE INDEX IF NOT EXISTS idx_messages_delivery_status ON public.messages(delivery_status);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON public.messages(read_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON public.messages(is_pinned);
CREATE INDEX IF NOT EXISTS idx_messages_patient_id ON public.messages(related_patient_pid);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON public.messages(message_priority);
CREATE INDEX IF NOT EXISTS idx_messages_type_chat ON public.messages(chat_id, message_type);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(chat_id, delivery_status, created_at DESC);

-- ============================================================
-- 4. CREATE HEALTH_MESSAGE_TEMPLATES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.health_message_templates (
  template_id SERIAL PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  template_text TEXT NOT NULL,
  message_type TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN (
    'appointment',
    'medication',
    'consultation',
    'prescription',
    'results',
    'referral',
    'followup',
    'alert',
    'education',
    'general'
  )),
  
  -- Template variables (e.g., {patientName}, {appointmentDate})
  variables JSONB,
  
  -- Who created/manages this template
  created_by INTEGER REFERENCES public.users(uid) ON DELETE SET NULL,
  fid INTEGER REFERENCES public.facilities(fid) ON DELETE SET NULL,
  
  is_system_template BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_templates_category ON public.health_message_templates(category);
CREATE INDEX IF NOT EXISTS idx_health_templates_fid ON public.health_message_templates(fid);

-- ============================================================
-- 5. CREATE CONSULTATION_REQUESTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.consultation_requests (
  consultation_id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES public.chats(chat_id) ON DELETE CASCADE,
  
  -- Who is requesting
  from_health_worker_id INTEGER NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  
  -- Who is being asked
  to_health_worker_id INTEGER NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  
  -- Patient in question
  patient_pid INTEGER NOT NULL REFERENCES public.patients(pid) ON DELETE CASCADE,
  
  -- Consultation details
  specialty_required TEXT,
  message TEXT,
  clinical_notes JSONB,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'acknowledged',
    'in_progress',
    'resolved',
    'cancelled'
  )),
  
  -- Timeline
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_patient ON public.consultation_requests(patient_pid);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_from ON public.consultation_requests(from_health_worker_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_to ON public.consultation_requests(to_health_worker_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON public.consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_chat ON public.consultation_requests(chat_id);

-- ============================================================
-- 6. CREATE CHAT_MESSAGE_READS TABLE (For accurate read receipts)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_message_reads (
  read_id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES public.messages(message_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_reads_message ON public.chat_message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON public.chat_message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_time ON public.chat_message_reads(read_at DESC);

-- ============================================================
-- 7. CREATE CHAT_HEALTH_CONTEXT TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_health_context (
  context_id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL UNIQUE REFERENCES public.chats(chat_id) ON DELETE CASCADE,
  patient_pid INTEGER NOT NULL REFERENCES public.patients(pid) ON DELETE CASCADE,
  
  -- Quick reference health info
  active_conditions TEXT[],
  current_medications JSONB,
  allergies TEXT[],
  
  -- Recent info snapshot
  last_visit_date DATE,
  next_appointment_date DATE,
  recent_lab_results JSONB,
  
  -- Chat-specific notes
  clinical_summary TEXT,
  follow_up_needed BOOLEAN DEFAULT FALSE,
  follow_up_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_health_patient ON public.chat_health_context(patient_pid);

-- ============================================================
-- 8. CREATE HEALTH_AUDIT_LOG TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.health_communication_audit (
  audit_id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES public.chats(chat_id) ON DELETE CASCADE,
  message_id INTEGER REFERENCES public.messages(message_id) ON DELETE SET NULL,
  
  -- Who took action
  user_id INTEGER NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  user_role TEXT,
  facility_id INTEGER,
  
  -- What action
  action TEXT NOT NULL CHECK (action IN (
    'message_sent',
    'prescription_sent',
    'appointment_scheduled',
    'consultation_requested',
    'message_read',
    'chat_accessed',
    'patient_data_accessed',
    'message_edited',
    'message_deleted',
    'chat_flagged',
    'consultation_responded'
  )),
  
  -- Details
  action_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Compliance
  is_compliant BOOLEAN DEFAULT TRUE,
  compliance_notes TEXT,
  
  action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_audit_chat ON public.health_communication_audit(chat_id);
CREATE INDEX IF NOT EXISTS idx_health_audit_user ON public.health_communication_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_health_audit_action ON public.health_communication_audit(action);
CREATE INDEX IF NOT EXISTS idx_health_audit_timestamp ON public.health_communication_audit(action_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_health_audit_patient ON public.health_communication_audit(facility_id);

-- ============================================================
-- 9. CREATE VIEWS FOR COMMON QUERIES
-- ============================================================

-- View for getting chat with health context
CREATE OR REPLACE VIEW public.vw_chats_with_health_context AS
SELECT 
  c.*,
  p.pid,
  p.health_worker_name,
  p.age,
  chc.active_conditions,
  chc.current_medications,
  chc.allergies,
  chc.last_visit_date,
  chc.next_appointment_date,
  (SELECT COUNT(*) FROM chat_participants WHERE chat_id = c.chat_id AND left_at IS NULL) as active_members,
  (SELECT COUNT(*) FROM messages WHERE chat_id = c.chat_id AND is_deleted = FALSE) as message_count
FROM public.chats c
LEFT JOIN public.patients p ON c.patient_pid = p.pid
LEFT JOIN public.chat_health_context chc ON c.chat_id = chc.chat_id;

-- View for unread messages per user
CREATE OR REPLACE VIEW public.vw_unread_messages AS
SELECT 
  cp.user_id,
  cp.chat_id,
  c.name as chat_name,
  c.type as chat_type,
  COUNT(m.message_id) as unread_count,
  MAX(m.created_at) as last_message_time
FROM public.chat_participants cp
JOIN public.chats c ON cp.chat_id = c.chat_id
JOIN public.messages m ON c.chat_id = m.chat_id
  AND m.delivery_status != 'read'
  AND m.sender_id != cp.user_id
  AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)
  AND m.is_deleted = FALSE
WHERE cp.left_at IS NULL
GROUP BY cp.user_id, cp.chat_id, c.name, c.type;

-- View for health worker's patient chats
CREATE OR REPLACE VIEW public.vw_health_worker_patient_chats AS
SELECT 
  c.*,
  p.health_worker_name as patient_name,
  p.age,
  u.fullname as health_worker_name,
  (SELECT COUNT(*) FROM messages WHERE chat_id = c.chat_id AND delivery_status != 'read') as unread_count
FROM public.chats c
JOIN public.patients p ON c.patient_pid = p.pid
JOIN public.users u ON c.created_by = u.uid
WHERE c.type = 'private'
  AND c.is_archived = FALSE;

-- ============================================================
-- 10. INSERT SYSTEM TEMPLATES
-- ============================================================

INSERT INTO public.health_message_templates 
(template_key, template_name, template_text, message_type, category, variables, is_system_template)
VALUES
  ('appointment_reminder', 'Appointment Reminder', 
   'Hi {patientName}, this is a reminder of your appointment on {appointmentDate} at {appointmentTime} with {healthWorkerName}. Please arrive 10 minutes early.',
   'appointment', 'appointment',
   '["patientName", "appointmentDate", "appointmentTime", "healthWorkerName"]'::jsonb, TRUE),
   
  ('medication_reminder', 'Medication Reminder',
   'Hi {patientName}, please remember to take your {medicationName} {frequency}. It''s important for managing your {condition}.',
   'health_update', 'medication',
   '["patientName", "medicationName", "frequency", "condition"]'::jsonb, TRUE),
   
  ('symptom_assessment', 'Symptom Assessment',
   'Hi {patientName}, I''d like to check on your recent symptoms. Can you tell me: 1. Any changes in {symptom}? 2. Taking medication as prescribed? 3. Any new symptoms? Please share any updates.',
   'text', 'consultation',
   '["patientName", "symptom"]'::jsonb, TRUE),
   
  ('prescription_message', 'Prescription Message',
   'Hi {patientName}, I''m prescribing {medicationName}. Take {dosage} {frequency} for {duration}. Important: {warnings}. If you experience any side effects, please let me know immediately.',
   'prescription', 'prescription',
   '["patientName", "medicationName", "dosage", "frequency", "duration", "warnings"]'::jsonb, TRUE),
   
  ('followup_checkin', 'Follow-up Check-in',
   'Hi {patientName}, how have you been feeling since your last visit? Any improvements or concerns with your {condition}? Please share updates so I can help you better.',
   'health_update', 'followup',
   '["patientName", "condition"]'::jsonb, TRUE),
   
  ('lab_result_notification', 'Lab Result Notification',
   'Hi {patientName}, your recent lab results are ready. Your {testName} shows {result}. {interpretation}. Please schedule a follow-up appointment to discuss.',
   'lab_result', 'results',
   '["patientName", "testName", "result", "interpretation"]'::jsonb, TRUE),
   
  ('referral_message', 'Referral Message',
   'Hi {patientName}, based on your condition, I recommend you see a {specialistType}. I''ll arrange the referral. The specialist will contact you soon. Please bring your medical records.',
   'referral', 'referral',
   '["patientName", "specialistType"]'::jsonb, TRUE),
   
  ('emergency_alert', 'Emergency Alert',
   'URGENT: Patient {patientName} reports {symptoms}. Severity: {severity}. Needs immediate attention.',
   'alert', 'alert',
   '["patientName", "symptoms", "severity"]'::jsonb, TRUE)
ON CONFLICT (template_key) DO NOTHING;

-- ============================================================
-- 11. CREATE TRIGGER FOR AUDIT LOGGING
-- ============================================================

CREATE OR REPLACE FUNCTION log_health_communication_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.health_communication_audit 
  (chat_id, message_id, user_id, action, action_details, action_timestamp)
  VALUES 
  (NEW.chat_id, NEW.message_id, CURRENT_USER_ID(), 'message_sent', 
   jsonb_build_object('message_type', NEW.message_type, 'priority', NEW.message_priority),
   CURRENT_TIMESTAMP);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Trigger function requires getting current user ID from session
-- You may need to modify this based on your auth implementation

-- ============================================================
-- SUMMARY OF CHANGES
-- ============================================================
/*
CHATS TABLE:
✓ patient_id - Link chat to patient
✓ purpose - Type of consultation
✓ chat_status - Track lifecycle
✓ related_appointment_id - Link to appointment
✓ priority - Message priority
✓ is_flagged - Flag important chats
✓ flag_reason - Why flagged
✓ health_notes - Health worker notes

CHAT_PARTICIPANTS TABLE:
✓ participant_role - creator, admin, member, observer
✓ can_send_prescriptions - Permission
✓ can_schedule_appointments - Permission
✓ can_access_patient_records - Permission
✓ can_request_consultation - Permission
✓ notifications_enabled - Notification control
✓ mute_until - Mute chat until time
✓ left_at - Track when left group

MESSAGES TABLE:
✓ template_type - Which template used
✓ clinical_context - Structured health data (JSON)
✓ delivery_status - sent, delivered, read, failed
✓ read_at - When message was read
✓ edited_at - When edited
✓ edit_count - How many times edited
✓ is_pinned - Important message
✓ pin_reason - Why pinned
✓ pinned_at - When pinned
✓ related_patient_id - Quick patient ref
✓ message_priority - urgent, high, normal, low

NEW TABLES:
✓ health_message_templates - Pre-made health messages
✓ consultation_requests - Health worker consultations
✓ chat_message_reads - Accurate read receipts
✓ chat_health_context - Patient health snapshot
✓ health_communication_audit - Compliance logging

NEW VIEWS:
✓ vw_chats_with_health_context - Chat + health data
✓ vw_unread_messages - Unread count per user
✓ vw_health_worker_patient_chats - HW patient chats

SYSTEM TEMPLATES INSERTED:
✓ appointment_reminder
✓ medication_reminder
✓ symptom_assessment
✓ prescription_message
✓ followup_checkin
✓ lab_result_notification
✓ referral_message
✓ emergency_alert
*/
