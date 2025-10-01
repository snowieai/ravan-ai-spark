-- Add video generation tracking columns to content_calendar
ALTER TABLE content_calendar 
ADD COLUMN IF NOT EXISTS video_status TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_job_id TEXT,
ADD COLUMN IF NOT EXISTS video_cost_estimate NUMERIC,
ADD COLUMN IF NOT EXISTS word_count INTEGER;