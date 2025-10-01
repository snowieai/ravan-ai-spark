-- Add influencer_name column to content_calendar table
ALTER TABLE content_calendar 
ADD COLUMN IF NOT EXISTS influencer_name TEXT NOT NULL DEFAULT 'kaira';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_content_calendar_influencer_name 
ON content_calendar(influencer_name);

-- Update RLS policies to include influencer_name filter (policies remain user-scoped)
-- No changes needed to RLS as we still want user_id to be the primary security boundary