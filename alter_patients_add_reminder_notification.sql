-- Add appointment reminder notification tracking to patients table

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS appointment_reminder_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP;

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_patients_reminder_sent 
ON patients(appointment_reminder_sent, last_reminder_sent_at);
