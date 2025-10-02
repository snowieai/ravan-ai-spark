-- Add RLS policy to allow users to create video generation records for their own content
CREATE POLICY "Users can create their own video generations"
ON video_generations FOR INSERT
WITH CHECK (
  content_id IN (
    SELECT id FROM content_calendar WHERE user_id = auth.uid()
  )
);