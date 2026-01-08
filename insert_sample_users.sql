-- Insert Sample Users for HealthFlow
-- Note: Passwords should be hashed in production. These are bcrypt hashes of the plain text passwords.

INSERT INTO users (email, password_hash, facility_name, facility_id, user_role, is_active)
VALUES
  -- Demo facility (password: Demo123!)
  ('demo@facility.com', '$2a$10$YourHashedPasswordHere', 'Demo Facility', 'facility-001', 'Administrator', true),
  
  -- Sample facility 1 (password: Password123!)
  ('admin@kampala.ug', '$2a$10$YourHashedPasswordHere', 'Kampala Medical Centre', 'facility-kampala-001', 'Administrator', true),
  
  -- Sample facility 2 (password: Password123!)
  ('manager@mbarara.ug', '$2a$10$YourHashedPasswordHere', 'Mbarara Regional Hospital', 'facility-mbarara-001', 'Manager', true),
  
  -- Sample facility 3 (password: Password123!)
  ('staff@gulu.ug', '$2a$10$YourHashedPasswordHere', 'Gulu Health Center', 'facility-gulu-001', 'Staff', true),
  
  -- Sample facility 4 (password: Password123!)
  ('director@jinja.ug', '$2a$10$YourHashedPasswordHere', 'Jinja District Hospital', 'facility-jinja-001', 'Administrator', true)
ON CONFLICT (email) DO NOTHING;
