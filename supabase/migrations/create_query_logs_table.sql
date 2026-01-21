-- Create query_logs table for chatbot query tracking
CREATE TABLE IF NOT EXISTS query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id TEXT NOT NULL,
  query TEXT NOT NULL,
  handler TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_query_logs_facility_id ON query_logs(facility_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_timestamp ON query_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_query_logs_handler ON query_logs(handler);

-- Add comment for documentation
COMMENT ON TABLE query_logs IS 'Tracks all chatbot queries for analytics and pattern detection';
