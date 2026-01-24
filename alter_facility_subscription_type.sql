-- Add subscription_type column to facilities table
-- Subscription types: starter, Advanced, Standard

ALTER TABLE facilities 
ADD COLUMN subscription_type VARCHAR(50) DEFAULT 'starter' 
CHECK (subscription_type IN ('starter', 'Advanced', 'Standard'));

-- Optional: Add index for better query performance if filtering by subscription type
CREATE INDEX idx_facilities_subscription_type ON facilities(subscription_type);

-- Update existing records (if needed)
-- UPDATE facilities SET subscription_type = 'starter' WHERE subscription_type IS NULL;

-- Set subscription type for Kitwe HCIV
UPDATE facilities SET subscription_type = 'Advanced' WHERE facility_name = 'Kitwe HCIV';
