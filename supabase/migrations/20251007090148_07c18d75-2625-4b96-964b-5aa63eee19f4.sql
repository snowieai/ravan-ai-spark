-- Drop existing restrictive policies on content_calendar
DROP POLICY IF EXISTS "Users can view their own content calendar" ON content_calendar;
DROP POLICY IF EXISTS "Users can create their own content calendar entries" ON content_calendar;
DROP POLICY IF EXISTS "Users can update their own content calendar entries" ON content_calendar;
DROP POLICY IF EXISTS "Users can delete their own content calendar entries" ON content_calendar;
DROP POLICY IF EXISTS "Admins can view all content" ON content_calendar;
DROP POLICY IF EXISTS "Admins can update approval status" ON content_calendar;
DROP POLICY IF EXISTS "Admins can delete content" ON content_calendar;

-- Create new open policies for content_calendar
CREATE POLICY "All users can view all content"
  ON content_calendar FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All users can create content"
  ON content_calendar FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All users can update content"
  ON content_calendar FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "All users can delete content"
  ON content_calendar FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing restrictive policies on video_generations
DROP POLICY IF EXISTS "Users can view their own video generations" ON video_generations;
DROP POLICY IF EXISTS "Admins can view all video generations" ON video_generations;
DROP POLICY IF EXISTS "Users can create their own video generations" ON video_generations;

-- Create new open policies for video_generations
CREATE POLICY "All users can view all videos"
  ON video_generations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All users can create videos"
  ON video_generations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All users can update videos"
  ON video_generations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "All users can delete videos"
  ON video_generations FOR DELETE
  TO authenticated
  USING (true);