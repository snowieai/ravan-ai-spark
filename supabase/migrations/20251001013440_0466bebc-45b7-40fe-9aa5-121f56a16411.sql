-- Add approval workflow columns to content_calendar
ALTER TABLE content_calendar
ADD COLUMN approval_status TEXT DEFAULT 'not_required' CHECK (approval_status IN ('not_required', 'pending', 'approved', 'rejected')),
ADD COLUMN submitted_for_approval_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN admin_remarks TEXT,
ADD COLUMN reminder_count INTEGER DEFAULT 0,
ADD COLUMN last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN resubmission_count INTEGER DEFAULT 0;

-- Create indexes for better query performance
CREATE INDEX idx_approval_status ON content_calendar(approval_status);
CREATE INDEX idx_submitted_for_approval ON content_calendar(submitted_for_approval_at);

-- Update RLS policy to allow admins to update approval fields
CREATE POLICY "Admins can update approval status"
ON content_calendar
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to view all content for approval
CREATE POLICY "Admins can view all content"
ON content_calendar
FOR SELECT
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  ))
);