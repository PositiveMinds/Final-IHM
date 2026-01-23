-- Alter appointment_type column to varchar(20) instead of enum
ALTER TABLE patients 
ALTER COLUMN appointment_type TYPE varchar(20);
